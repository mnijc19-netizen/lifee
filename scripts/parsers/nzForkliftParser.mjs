/**
 * New Zealand Forklift Driver Monitored Occupation Parser
 * RULE-25, RULE-26, RULE-41, RULE-74, RULE-77, RULE-78, RULE-79
 * Ground truth: Official ANZSCO 721311 (Level 4, stay 3 years, IELTS 4.0).
 * Conditional Level 3 under AEWV requires 3 years experience OR NZQCF Level 4 qualification.
 * Obsolete ANZSCO 721211 MUST be rejected with REG-NZ-FORKLIFT-721311.
 */

export function parseNzForklift(htmlText, url = 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa') {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid payload for New Zealand Forklift Driver parser');
  }

  if (/<title>[^<]*(?:502|500|404|403|Bad Gateway|Error|Access Denied)[^<]*<\/title>/i.test(htmlText) ||
      (htmlText.length < 200 && !/forklift|anzsco|721311|721211/i.test(htmlText))) {
    throw new Error('NZ Forklift parser: Provided payload is an error or gateway page');
  }

  // Obsolete ANZSCO code rejection (RULE-74 / REG-NZ-FORKLIFT-721311)
  const obsoleteMatch = htmlText.match(/(?:ANZSCO\s*)?721211/i);
  if (obsoleteMatch) {
    throw new Error('NZ Forklift parser: Obsolete/incorrect ANZSCO code 721211 rejected. Official INZ code is 721311 (REG-NZ-FORKLIFT-721311)');
  }

  const fetchedAt = new Date().toISOString();

  let sourcePublishedAt = null;
  const metaDateMatch = htmlText.match(/<meta[^>]*(?:name|property)=["'](?:date|published_time|article:published_time)["'][^>]*content=["']([^"']+)["']/i) ||
                        htmlText.match(/<time[^>]*datetime=["']([^"']+)["']/i);
  if (metaDateMatch) {
    sourcePublishedAt = metaDateMatch[1].split('T')[0];
  }

  const extractSentence = (matchIndex, length = 200) => {
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(htmlText.length, matchIndex + length);
    return htmlText.slice(start, end).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Official code check
  const codeMatch = htmlText.match(/(?:ANZSCO\s*)?721311/i);
  if (!codeMatch) {
    throw new Error('NZ Forklift parser: Required ANZSCO code 721311 for Forklift Driver not found in text');
  }
  const codeEvidenceText = extractSentence(codeMatch.index, 160);

  // Maximum continuous stay for Level 4
  const stayMatch = htmlText.match(/(?:maximum continuous stay|stay is limited to|limited to)\s*([0-9]+)\s*years?/i);
  const maxContinuousStayYears = stayMatch ? parseInt(stayMatch[1], 10) : null;

  // English requirement
  const ieltsMatch = htmlText.match(/IELTS\s*(?:of\s+at\s+least|score\s+of|minimum\s+of)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  const minEnglishIelts = ieltsMatch ? parseFloat(ieltsMatch[1]) : null;

  const normalizedFacts = {
    occupationName: 'Forklift Driver',
    officialAnzscoCode: '721311',
    baselineSkillLevel: 4,
    classificationVersion: 'ANZSCO Version 1.3 / 2022-2023 Standard',
    maxContinuousStayYears,
    minEnglishIelts,
    isGreenListEligible: false,
    skillLevel3ConditionalRule: {
      condition: 'Can ONLY be treated as skill level 3 under AEWV if the employer Job Check specifies at least 3 years relevant work experience OR relevant NZQCF Level 4 qualification',
      isAutomaticVisaGrant: false,
      isAutomaticResidenceGrant: false,
      disclaimer: 'Treatment as skill level 3 for AEWV rules does NOT grant automatic work visa or permanent residence'
    },
    statusSummary: 'ANZSCO 721311 Forklift Driver: Baseline skill level 4. Subject to continuous stay limit and IELTS requirement. May be treated as skill level 3 under AEWV only if Job Check requires 3+ years experience or NZQCF Level 4 qualification. Does NOT grant automatic AEWV or residence.'
  };

  const evidence = [
    {
      evidenceId: 'ev-nz-forklift-721311',
      claim: 'Forklift Driver 官方代码为 ANZSCO 721311，基准评级 Skill Level 4；仅当雇主 Job Check 要求 3 年经验或 NZQCF Level 4 时方可按 Level 3 审理，绝不等于自动获签或永居。',
      quotes: [codeEvidenceText],
      sourceUrl: url
    }
  ];

  return {
    sourceId: 'src-inz-forklift',
    parserVersion: '3.1.0',
    fetchedAt,
    sourcePublishedAt,
    normalizedFacts,
    evidence
  };
}
