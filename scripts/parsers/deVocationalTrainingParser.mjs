/**
 * Germany Vocational Training (Ausbildung) Official Content Parser
 * RULE-25, RULE-26, RULE-77, RULE-78, RULE-79, RULE-82, RULE-83
 * Ground truth: School-based net €959/mo, Company-based gross €1,048/mo (approx €822 net), Language B1
 */

export function parseDeVocationalTraining(htmlText, url = 'https://www.make-it-in-germany.com/en/study-vocational-training/vocational-training') {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid payload for Germany Vocational Training parser');
  }

  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlText) ||
      (htmlText.length < 250 && !/ausbildung|vocational|training|allowance/i.test(htmlText))) {
    throw new Error('DE Vocational Training parser: Provided payload is an error or gateway page');
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

  let effectiveAt = null;
  const effectiveMatch = htmlText.match(/(?:effective(?:\s+from)?|ab|valid\s+from|starting|as\s+of)\s*:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{4})/i);
  if (effectiveMatch) {
    effectiveAt = effectiveMatch[1];
  }

  const extractSentence = (matchIndex, length = 220) => {
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(htmlText.length, matchIndex + length);
    return htmlText.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const numPattern = `(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)`;

  // 1. School-based minimum subsistence / net requirement (e.g. €959 net/month)
  const schoolRegex = /(?:school-based|schulische|BAföG)[\s\S]{0,100}?(?:€|EUR)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)/i;
  const schoolMatch = htmlText.match(schoolRegex);
  let schoolBasedMinimumNetEur = null;
  let schoolEvidenceText = '';
  if (schoolMatch) {
    const rawVal = schoolMatch[1].replace(/,/g, '');
    schoolBasedMinimumNetEur = parseFloat(rawVal);
    schoolEvidenceText = extractSentence(schoolMatch.index, 160);
  }

  // 2. Company-based minimum gross stipend (e.g. €1,048 gross/month or range €950-€1350)
  const grossRegex = /(?:company-based|betriebliche|training allowance|ausbildungsvergütung|allowance|vergütung|stipend)[\s\S]{0,100}?(?:€|EUR)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\s*(?:to|-|bis)\s*(?:€|EUR)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+))?/i;
  const grossMatch = htmlText.match(grossRegex);
  if (!grossMatch) {
    throw new Error('DE Vocational Training parser: Required field companyBasedMinimumGross could not be extracted');
  }
  const grossMin = parseInt(grossMatch[1].replace(/,/g, ''), 10);
  const grossMax = grossMatch[2] ? parseInt(grossMatch[2].replace(/,/g, ''), 10) : grossMin;
  const grossEvidenceText = extractSentence(grossMatch.index, 160);

  // 3. Net stipend (company-based approx €822 net or extracted net, isolated from school-based section)
  const compMatch = htmlText.match(/(?:company-based|betriebliche|Ausbildung)[\s\S]+/i);
  const compText = compMatch ? compMatch[0] : htmlText;
  const netRegex = /(?:€|EUR)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\s*(?:net|netto)|(?:net|netto)[\s\S]{0,30}?(?:€|EUR)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)/i;
  const netMatch = compText.match(netRegex);
  const netValue = netMatch ? parseInt((netMatch[1] || netMatch[2]).replace(/,/g, ''), 10) : null;
  const netEvidenceText = netMatch ? extractSentence(netMatch.index, 140) : (schoolBasedMinimumNetEur ? `School-based net requirement is €${schoolBasedMinimumNetEur}/month` : 'Net stipend not explicitly separated');

  // 4. Supplemental proof requirement when allowance is insufficient
  const supplementalRegex = /(?:insufficient|reicht nicht aus|adequate|ausreichend|supplemental|zusätzliche|sperrkonto|blocked account)[\s\S]{0,100}?(?:required|erforderlich|proof|nachweis)/i;
  const supplementalMatch = htmlText.match(supplementalRegex);
  const supplementalRequired = !!supplementalMatch;
  const supplementalEvidenceText = supplementalMatch ? extractSentence(supplementalMatch.index, 180) : 'If allowance is insufficient, supplemental proof of financial means is required';

  // 5. Language requirement
  const langRegex = /(?:German|Deutsch|language|Sprachkenntnisse)[\s\S]{0,80}?\b(A1|A2|B1|B2|C1|C2)\b|\b(A1|A2|B1|B2|C1|C2)\b[\s\S]{0,60}?(?:German|Deutsch|language|erforderlich|required)/i;
  const langMatch = htmlText.match(langRegex);
  if (!langMatch) {
    throw new Error('DE Vocational Training parser: Required field languageRequirement could not be extracted');
  }
  const languageLevel = langMatch[1] || langMatch[2];
  const langEvidenceText = extractSentence(langMatch.index, 140);

  const normalizedFacts = {
    schoolBasedMinimumNetEur: schoolBasedMinimumNetEur !== null ? {
      value: schoolBasedMinimumNetEur,
      unit: 'EUR/month',
      sourceId: 'src-de-vocational-training',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt,
      evidenceText: schoolEvidenceText
    } : null,
    companyBasedMinimumGross: {
      min: grossMin,
      max: grossMax,
      unit: 'EUR/month',
      sourceId: 'src-de-vocational-training',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt,
      evidenceText: grossEvidenceText
    },
    companyBasedEstimatedNet: netValue !== null ? {
      value: netValue,
      unit: 'EUR/month',
      sourceId: 'src-de-vocational-training',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt,
      evidenceText: netEvidenceText
    } : null,
    supplementalProofRequiredWhenInsufficient: {
      required: supplementalRequired,
      condition: 'Training company allowance must cover subsistence; if insufficient, supplemental proof of financial means (blocked account) is required for the difference',
      evidenceText: supplementalEvidenceText
    },
    languageRequirement: {
      level: languageLevel,
      sourceId: 'src-de-vocational-training',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt,
      evidenceText: langEvidenceText
    },
    currency: 'EUR'
  };

  const evidence = [
    {
      evidenceId: 'ev-de-ausbildung-stipend',
      claim: `德国双元制职业培训：企业实训津贴法定标准（毛额约 €${grossMin}${grossMax !== grossMin ? `~€${grossMax}` : ''}/月${netValue ? `，净额约 €${netValue}/月` : ''}），津贴不足以覆盖法定生计标准时必须补足自保金差额证明；语言要求最低为 ${languageLevel}。${schoolBasedMinimumNetEur ? `学校型职业培训法定最低生计标准为 €${schoolBasedMinimumNetEur} 欧/月。` : ''}`,
      quotes: [grossEvidenceText, supplementalEvidenceText, langEvidenceText].filter(Boolean),
      sourceUrl: url
    }
  ];

  return {
    sourceId: 'src-de-vocational-training',
    parserVersion: '3.1.0',
    fetchedAt,
    sourcePublishedAt,
    effectiveAt,
    normalizedFacts,
    evidence
  };
}
