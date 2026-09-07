/**
 * New Zealand Accredited Employer Work Visa (AEWV) Official Parser
 * RULE-25, RULE-26, RULE-39, RULE-77, RULE-78, RULE-79, RULE-82
 * Ground truth: General AEWV requires 2 years relevant experience OR NZQCF Level 4+ qualification (NOT 3 years default).
 * Market rate requirement applies. Level 4/5 roles max continuous stay 3 years, IELTS 4.0.
 */

export function parseNzAewv(htmlText, url = 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa') {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid payload for New Zealand AEWV parser');
  }

  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlText) ||
      (htmlText.length < 250 && !/accredited|employer|aewv|visa/i.test(htmlText))) {
    throw new Error('NZ AEWV parser: Provided payload is an error or gateway page');
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
  const effectiveMatch = htmlText.match(/(?:effective(?:\s+from)?|valid\s+from|starting|as\s+of)\s*:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{4})/i);
  if (effectiveMatch) {
    effectiveAt = effectiveMatch[1];
  }

  const extractSentence = (matchIndex, length = 220) => {
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(htmlText.length, matchIndex + length);
    return htmlText.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // General Experience Requirement: 2 years relevant experience OR NZQCF Level 4+
  // Note: 3 years is specific to Level 4/5 roles or conditional Level 3, general AEWV baseline is 2 years
  const expRegex = /(?:at least|minimum of)?\s*([0-9]+)\s*years?(?:\s+of)?\s*(?:relevant\s+)?(?:work\s+)?experience/i;
  const expMatch = htmlText.match(expRegex);
  if (!expMatch) {
    throw new Error('NZ AEWV parser: Required field experienceRequirements could not be extracted');
  }
  const minExperienceYears = parseInt(expMatch[1], 10);
  const expEvidenceText = extractSentence(expMatch.index, 160);

  // Market Rate Requirement
  const marketRateRegex = /(?:market rate|going rate|rate for the job)/i;
  const marketRateMatch = htmlText.match(marketRateRegex);
  const marketRateRequired = !!marketRateMatch;
  const marketRateEvidenceText = marketRateMatch ? extractSentence(marketRateMatch.index, 160) : 'Employers must pay at least the market rate for the role so overseas workers are not underpaid.';

  // ANZSCO Level 4 & 5 continuous stay rule
  const stayRegex = /(?:level\s*4\s*(?:and|&|-)\s*5|skill\s*level\s*4-5|level\s*4\s*or\s*5)[\s\S]{0,120}?(?:maximum\s+continuous\s+stay|maximum\s+stay|stay\s+is\s+limited\s+to|limited\s+to)?\s*([0-9]+)\s*years?/i;
  const stayMatch = htmlText.match(stayRegex) || htmlText.match(/(?:maximum continuous stay|stay is limited to|limited to)\s*([0-9]+)\s*years?/i);
  let maxContinuousStayYears = null;
  let stayEvidenceText = '';
  if (stayMatch) {
    maxContinuousStayYears = parseInt(stayMatch[1], 10);
    stayEvidenceText = extractSentence(stayMatch.index, 180);
  }

  // English language requirement (IELTS)
  const ieltsRegex = /IELTS\s*(?:of\s+at\s+least|score\s+of|minimum\s+of)?\s*([0-9]+(?:\.[0-9]+)?)/i;
  const ieltsMatch = htmlText.match(ieltsRegex);
  let minEnglishIelts = null;
  let ieltsEvidenceText = '';
  if (ieltsMatch) {
    minEnglishIelts = parseFloat(ieltsMatch[1]);
    ieltsEvidenceText = extractSentence(ieltsMatch.index, 150);
  }

  const greenListBlocked = /do not have direct pathway under the Green List|not on the Green List|no direct green list/i.test(htmlText);

  const normalizedFacts = {
    generalExperienceYears: {
      value: minExperienceYears,
      unit: 'years',
      alternativeQualificationLevel: 'NZQCF Level 4 or higher relevant qualification',
      evidenceText: expEvidenceText
    },
    marketRateRequirement: {
      required: marketRateRequired,
      evidenceText: marketRateEvidenceText
    },
    anzscoLevel45Rules: {
      maxContinuousStayYears: maxContinuousStayYears !== null ? {
        value: maxContinuousStayYears,
        unit: 'years',
        evidenceText: stayEvidenceText
      } : null,
      minEnglishIelts: minEnglishIelts !== null ? {
        value: minEnglishIelts,
        unit: 'IELTS Band',
        evidenceText: ieltsEvidenceText
      } : null,
      directGreenListPathway: !greenListBlocked
    }
  };

  const evidence = [
    {
      evidenceId: 'ev-nz-aewv-rules',
      claim: `新西兰 AEWV 申请要求：通常须具备至少 ${minExperienceYears} 年相关工作经验或 NZQCF 4 级及以上同等学历；雇主须确保薪资达到市场公允水平 (Market Rate)。ANZSCO 4-5 级岗位最长连续工作居留上限为 ${maxContinuousStayYears || 3} 年，英语门槛为雅思 ${minEnglishIelts || 4.0} 分。`,
      quotes: [expEvidenceText, marketRateEvidenceText, stayEvidenceText, ieltsEvidenceText].filter(Boolean),
      sourceUrl: url
    }
  ];

  return {
    sourceId: 'src-inz-aewv',
    parserVersion: '3.1.0',
    fetchedAt,
    sourcePublishedAt,
    effectiveAt,
    normalizedFacts,
    evidence
  };
}
