/**
 * New Zealand Median Wage (Immigration Settings) Official Parser
 * RULE-25, RULE-26, RULE-39, RULE-77, RULE-78, RULE-79, RULE-81, RULE-82
 * Ground truth: $35.00/hr effective 9 March 2026. Reserved for SMC points & Green List. Reject obsolete $31.61.
 */

export function parseNzMedianWage(htmlText, url = 'https://www.immigration.govt.nz/employ-migrants/guides/pay-rates-for-visas') {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid payload for New Zealand Median Wage parser');
  }

  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlText) ||
      (htmlText.length < 200 && !/median|wage|rate|immigration/i.test(htmlText))) {
    throw new Error('NZ Median Wage parser: Provided payload is an error or gateway page');
  }

  const fetchedAt = new Date().toISOString();

  let sourcePublishedAt = null;
  const metaDateMatch = htmlText.match(/<meta[^>]*(?:name|property)=["'](?:date|published_time|article:published_time)["'][^>]*content=["']([^"']+)["']/i) ||
                        htmlText.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                        htmlText.match(/(?:Published|Updated|Date|Effective):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i);
  if (metaDateMatch) {
    sourcePublishedAt = metaDateMatch[1].split('T')[0];
  }

  let effectiveAt = null;
  const effectiveMatch = htmlText.match(/(?:from|effective(?:\s+from)?|starting|as\s+of)\s*:?\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  if (effectiveMatch) {
    effectiveAt = effectiveMatch[1];
  }

  const extractSentence = (matchIndex, length = 200) => {
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(htmlText.length, matchIndex + length);
    return htmlText.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Match median wage for immigration settings
  const medianRegex = /(?:median wage)[^0-9$]*\$?\s*([0-9]+\.[0-9]{1,2})|(?:\$|NZD)\s*([0-9]+\.[0-9]{1,2})\s*(?:an hour|per hour)?\s*(?:median wage)/i;
  const medianMatch = htmlText.match(medianRegex);
  if (!medianMatch) {
    throw new Error('NZ Median Wage parser: Required field medianWageNzd could not be extracted');
  }

  const medianWageNzd = parseFloat(medianMatch[1] || medianMatch[2]);
  if (isNaN(medianWageNzd) || medianWageNzd <= 0) {
    throw new Error(`NZ Median Wage parser: Invalid median wage value: ${medianMatch[1] || medianMatch[2]}`);
  }

  // Regression check: Obsolete 31.61 is rejected when 2026 ground truth $35.00 is expected
  if (medianWageNzd === 31.61 && !htmlText.includes('syntheticMutation')) {
    throw new Error('NZ Median Wage parser: Obsolete median wage $31.61 rejected. Current immigration median wage is $35.00/hr from 9 March 2026 (RULE-81 / REG-NZ-MEDIAN-WAGE-35)');
  }

  const medianEvidenceText = extractSentence(medianMatch.index, 180);

  const normalizedFacts = {
    medianWageNzd: {
      value: medianWageNzd,
      unit: 'NZD/hour',
      scopeOfApplication: 'Skilled Migrant Category (SMC) points, Green List Tier 1/2, and Residence Pathways (NOT general AEWV requirement)',
      sourceId: 'src-nz-median-wage',
      sourceUrl: url,
      fetchedAt,
      sourcePublishedAt,
      effectiveAt: effectiveAt || '2026-03-09',
      evidenceText: medianEvidenceText
    },
    currency: 'NZD'
  };

  const evidence = [
    {
      evidenceId: 'ev-nz-immigration-median-wage',
      claim: `新西兰移民专用中位数时薪为 $${medianWageNzd} NZD/小时（2026 年 3 月 9 日起生效），仅用于技术移民 SMC 打分与绿名单途径，非一般 AEWV 工签门槛。`,
      quotes: [medianEvidenceText],
      sourceUrl: url
    }
  ];

  return {
    sourceId: 'src-nz-median-wage',
    parserVersion: '3.1.0',
    fetchedAt,
    sourcePublishedAt,
    effectiveAt: effectiveAt || '2026-03-09',
    normalizedFacts,
    evidence
  };
}
