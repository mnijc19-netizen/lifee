/**
 * Germany Opportunity Card (Chancenkarte) Official Content Parser
 * RULE-25, RULE-26, RULE-77, RULE-78, RULE-79, RULE-82, RULE-83
 */

export function parseDeOpportunityCard(htmlText, url = 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card') {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid payload for Germany Opportunity Card parser');
  }

  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlText) ||
      (htmlText.length < 250 && !/opportunity|chancenkarte|blocked/i.test(htmlText))) {
    throw new Error('DE Opportunity Card parser: Provided payload is an error or gateway page');
  }

  const fetchedAt = new Date().toISOString();

  // Extract Source Published Date (RULE-32 / RULE-82: if unstated return null)
  let sourcePublishedAt = null;
  const metaDateMatch = htmlText.match(/<meta[^>]*(?:name|property)=["'](?:date|published_time|article:published_time)["'][^>]*content=["']([^"']+)["']/i) ||
                        htmlText.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                        htmlText.match(/(?:Stand|Updated|Published|Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\.[0-9]{2}\.[0-9]{4})/i);
  if (metaDateMatch) {
    sourcePublishedAt = metaDateMatch[1].split('T')[0];
  }

  // Extract Effective Date (RULE-82)
  let effectiveAt = null;
  const effectiveMatch = htmlText.match(/(?:effective(?:\s+from)?|ab|valid\s+from|starting|as\s+of)\s*:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+[0-9]{1,2},\s*[0-9]{4}|[0-9]{4})/i);
  if (effectiveMatch) {
    effectiveAt = effectiveMatch[1];
  }

  const extractSentence = (matchIndex, length = 220) => {
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(htmlText.length, matchIndex + length);
    return htmlText.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Extract Monthly Blocked Funds
  const monthlyRegex = /(?:€|EUR|Euro)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:per month|monthly|a month|pro Monat|\/month)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:€|EUR|Euro)\s*(?:per month|monthly|\/month)/i;
  const monthlyMatch = htmlText.match(monthlyRegex);

  if (!monthlyMatch) {
    throw new Error('DE Opportunity Card parser: Required field monthlyBlockedFundsEur could not be extracted');
  }

  const rawMonthlyStr = (monthlyMatch[1] || monthlyMatch[2]).replace(/,/g, '');
  const monthlyBlockedFundsEur = parseFloat(rawMonthlyStr);
  if (isNaN(monthlyBlockedFundsEur) || monthlyBlockedFundsEur <= 0) {
    throw new Error(`DE Opportunity Card parser: Invalid monthly funds value: ${rawMonthlyStr}`);
  }
  const monthlyEvidenceText = extractSentence(monthlyMatch.index, 180);

  // Extract or dynamically derive Annual Blocked Funds (RULE-83: derivationType='CALCULATED')
  const annualRegex = /(?:€|EUR|Euro)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:for the full|for 12 months|per year|annual|annually|\/year|pro Jahr)|([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(?:€|EUR|Euro)\s*(?:for the full|for 12 months|per year|annual|annually|\/year|pro Jahr)/i;
  const annualMatch = htmlText.match(annualRegex);
  let annualBlockedFundsEur;
  let annualEvidenceText = '';
  let annualDerivationType = null;

  if (annualMatch) {
    const rawAnnualStr = (annualMatch[1] || annualMatch[2]).replace(/,/g, '');
    annualBlockedFundsEur = parseFloat(rawAnnualStr);
    annualEvidenceText = extractSentence(annualMatch.index, 180);
  } else {
    annualBlockedFundsEur = Math.round(monthlyBlockedFundsEur * 12);
    annualDerivationType = 'CALCULATED';
    annualEvidenceText = `Calculated dynamically as 12 months * €${monthlyBlockedFundsEur}/month based on extracted monthly requirement.`;
  }

  // Extract Part-time work hours permitted
  const partTimeRegex = /(?:up to|maximum of)?\s*([0-9]+)\s*hours\s*(?:per week|\/week|a week)/i;
  const partTimeMatch = htmlText.match(partTimeRegex);
  if (!partTimeMatch) {
    throw new Error('DE Opportunity Card parser: Required field partTimeWorkAllowedHoursWeekly could not be extracted');
  }
  const partTimeWorkAllowedHoursWeekly = parseInt(partTimeMatch[1], 10);
  if (isNaN(partTimeWorkAllowedHoursWeekly) || partTimeWorkAllowedHoursWeekly <= 0) {
    throw new Error(`DE Opportunity Card parser: Invalid part time hours: ${partTimeMatch[1]}`);
  }
  const partTimeEvidenceText = extractSentence(partTimeMatch.index, 140);

  const normalizedFacts = {
    monthlyBlockedFundsEur: {
      value: monthlyBlockedFundsEur,
      unit: 'EUR/month',
      sourceId: 'src-de-opportunity-card',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt,
      evidenceText: monthlyEvidenceText
    },
    annualBlockedFundsEur: {
      value: annualBlockedFundsEur,
      unit: 'EUR/year',
      sourceId: 'src-de-opportunity-card',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt,
      derivationType: annualDerivationType,
      evidenceText: annualEvidenceText
    },
    partTimeWorkAllowedHoursWeekly: {
      value: partTimeWorkAllowedHoursWeekly,
      unit: 'hours/week',
      sourceId: 'src-de-opportunity-card',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt,
      evidenceText: partTimeEvidenceText
    },
    currency: 'EUR'
  };

  const evidence = [
    {
      evidenceId: 'ev-de-chancenkarte-blocked',
      claim: `德国机会卡法定最低自保金要求为每月 €${monthlyBlockedFundsEur}（按12个月计算为 €${annualBlockedFundsEur}），兼职打工许可为每周 ${partTimeWorkAllowedHoursWeekly} 小时。`,
      quotes: [monthlyEvidenceText, partTimeEvidenceText],
      sourceUrl: url
    }
  ];

  return {
    sourceId: 'src-de-opportunity-card',
    parserVersion: '3.1.0',
    fetchedAt,
    sourcePublishedAt,
    effectiveAt,
    normalizedFacts,
    evidence
  };
}
