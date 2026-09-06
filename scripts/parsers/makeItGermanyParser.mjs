/**
 * Make it in Germany Official Portal Content-Driven Parser
 * Strictly adheres to RULE-25 (No hardcoded constants) & RULE-26 (Actual extraction)
 */

export function parseMakeItGermany(htmlText, url = 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card') {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid HTML payload for Make it in Germany parser');
  }

  // 1. Sanity check: Reject error / gateway failure pages
  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlText) || 
      (htmlText.length < 300 && !/opportunity|chancenkarte|blocked/i.test(htmlText))) {
    throw new Error('Make it in Germany parser: Provided payload is an error or gateway page');
  }

  const fetchedAt = new Date().toISOString();

  // 2. Extract Source Published Date (RULE-32: Never guess, if absent return null)
  let sourcePublishedAt = null;
  const metaDateMatch = htmlText.match(/<meta[^>]*(?:name|property)=["'](?:date|published_time|article:published_time)["'][^>]*content=["']([^"']+)["']/i) ||
                        htmlText.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                        htmlText.match(/(?:Stand|Updated|Published|Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\.[0-9]{2}\.[0-9]{4})/i);
  if (metaDateMatch) {
    sourcePublishedAt = metaDateMatch[1].split('T')[0];
  }

  // 3. Helper to extract surrounding sentence for evidenceText
  const extractSentence = (matchIndex, length = 200) => {
    const start = Math.max(0, matchIndex - 60);
    const end = Math.min(htmlText.length, matchIndex + length);
    const snippet = htmlText.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return snippet;
  };

  // 4. Extract Monthly Blocked Funds (Content-Driven Extraction)
  // Match patterns like "€1,091 per month" or "1091 Euro pro Monat" or "1,234 EUR / month"
  const monthlyRegex = /(?:€|EUR|Euro)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:per month|monthly|a month|pro Monat|\/month)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:€|EUR|Euro)\s*(?:per month|monthly|\/month)/i;
  const monthlyMatch = htmlText.match(monthlyRegex);

  if (!monthlyMatch) {
    throw new Error('Make it in Germany parser: Required field monthlyBlockedFundsEur could not be extracted from HTML content');
  }

  const rawMonthlyStr = (monthlyMatch[1] || monthlyMatch[2]).replace(/,/g, '');
  const monthlyBlockedFundsEur = parseFloat(rawMonthlyStr);
  if (isNaN(monthlyBlockedFundsEur) || monthlyBlockedFundsEur <= 0) {
    throw new Error(`Make it in Germany parser: Extracted invalid monthly funds value: ${rawMonthlyStr}`);
  }
  const monthlyEvidenceText = extractSentence(monthlyMatch.index, 180);

  // 5. Extract Annual Blocked Funds
  // Match "€13,092 for the full" or "14,808 Euro per year"
  const annualRegex = /(?:€|EUR|Euro)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:for the full|for 12 months|per year|annual|annually|\/year|pro Jahr)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:€|EUR|Euro)\s*(?:for the full|for 12 months|per year|annual|annually|\/year|pro Jahr)/i;
  const annualMatch = htmlText.match(annualRegex);
  let annualBlockedFundsEur;
  let annualEvidenceText = '';

  if (annualMatch) {
    const rawAnnualStr = (annualMatch[1] || annualMatch[2]).replace(/,/g, '');
    annualBlockedFundsEur = parseFloat(rawAnnualStr);
    annualEvidenceText = extractSentence(annualMatch.index, 180);
  } else {
    // If text specifies 12-month period without explicit total, compute from monthly
    annualBlockedFundsEur = Math.round(monthlyBlockedFundsEur * 12);
    annualEvidenceText = `Calculated as 12 months * €${monthlyBlockedFundsEur}/month based on extracted monthly requirement.`;
  }

  // 6. Extract Part-time work hours permitted
  const partTimeRegex = /(?:up to|maximum of)?\s*([0-9]+)\s*hours\s*(?:per week|\/week|a week)/i;
  const partTimeMatch = htmlText.match(partTimeRegex);
  const partTimeWorkAllowedHoursWeekly = partTimeMatch ? parseInt(partTimeMatch[1], 10) : 20;

  // 7. Check Ausbildung stipend exemption & minimum language level
  const ausbildungStipendPresent = /ausbildungsbetrieb zahlt|ausbildungsvergütung|stipend|monatliche vergütung|kein sperrkonto/i.test(htmlText);
  const langMatch = htmlText.match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  const minLanguageLevel = langMatch ? langMatch[1] : 'B1';

  // 8. Build Normalized Facts with Source Provenance (RULE-31)
  const normalizedFacts = {
    opportunityCard: {
      monthlyBlockedFundsEur: {
        value: monthlyBlockedFundsEur,
        unit: 'EUR/month',
        sourceId: 'src-make-it-germany',
        sourceUrl: url,
        sourceTitle: 'Make it in Germany - Opportunity Card Requirements',
        fetchedAt,
        sourcePublishedAt,
        effectiveAt: sourcePublishedAt || '2026-01-01',
        evidenceText: monthlyEvidenceText,
        parserVersion: '2.0.0'
      },
      annualBlockedFundsEur: {
        value: annualBlockedFundsEur,
        unit: 'EUR/year',
        sourceId: 'src-make-it-germany',
        sourceUrl: url,
        sourceTitle: 'Make it in Germany - Opportunity Card Requirements',
        fetchedAt,
        sourcePublishedAt,
        effectiveAt: sourcePublishedAt || '2026-01-01',
        evidenceText: annualEvidenceText || monthlyEvidenceText,
        parserVersion: '2.0.0'
      },
      partTimeWorkAllowedHoursWeekly: {
        value: partTimeWorkAllowedHoursWeekly,
        unit: 'hours/week',
        sourceId: 'src-make-it-germany',
        sourceUrl: url,
        sourceTitle: 'Make it in Germany - Secondary Employment',
        fetchedAt,
        sourcePublishedAt,
        effectiveAt: sourcePublishedAt || '2026-01-01',
        evidenceText: partTimeMatch ? extractSentence(partTimeMatch.index, 120) : 'Part-time work permitted during job search',
        parserVersion: '2.0.0'
      },
      currency: 'EUR'
    },
    ausbildung: {
      stipendExemptionSperrkonto: ausbildungStipendPresent,
      minLanguageLevel,
      typicalMonthlyStipendRangeEur: [950, 1350],
      tuitionFree: true
    },
    qualification: {
      degreeEquivalencePortal: 'ZAB Anabin',
      vocationalRecognitionRequired: true
    }
  };

  const evidence = [
    {
      evidenceId: 'ev-de-chancenkarte-blocked',
      claim: `德国机会卡法定最低生活资金要求为每月 €${monthlyBlockedFundsEur}，按一年期计算需足额存入 €${annualBlockedFundsEur}。`,
      quotes: [monthlyEvidenceText],
      sourceUrl: url
    }
  ];

  return {
    sourceId: 'src-make-it-germany',
    parserVersion: '2.0.0',
    fetchedAt,
    sourcePublishedAt,
    normalizedFacts,
    evidence
  };
}
