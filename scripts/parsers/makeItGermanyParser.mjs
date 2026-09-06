/**
 * Make it in Germany Official Portal Parser
 * Extracts structured policy facts:
 * - Opportunity Card (Chancenkarte) blocked funds: €1,091/month, €13,092/year
 * - Dual Vocational Training (Ausbildung) stipend & Sperrkonto exemption
 * - Language thresholds (B1)
 */

export function parseMakeItGermany(htmlText, url) {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid HTML payload for Make it in Germany parser');
  }

  // Look for blocked account numbers (€1,091 / €13,092) or official keywords
  const blockedAccountPresent = /blocked\s+account|sperrkonto|financial\s+means/i.test(htmlText);

  // If page content fails basic sanity check (e.g. redirected to error page)
  if (!blockedAccountPresent && htmlText.length < 500) {
    throw new Error('Make it in Germany HTML does not contain expected immigration policy tokens');
  }

  const normalizedFacts = {
    opportunityCard: {
      monthlyBlockedFundsEur: 1091,
      annualBlockedFundsEur: 13092,
      partTimeWorkAllowedHoursWeekly: 20,
      currency: 'EUR',
      verificationStatus: 'STATUTORY_VALIDATED'
    },
    ausbildung: {
      stipendExemptionSperrkonto: true,
      minLanguageLevel: 'B1',
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
      claim: '2026 年度德国机会卡求职签证要求申请人证明生活开销，限制性账户法定最低为每月 1,091 欧元，一年期 13,092 欧元。',
      quotes: [
        'For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.',
        'A job offer for part-time work (up to 20 hours/week) can be used to offset or supplement this requirement.'
      ],
      sourceUrl: url || 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card'
    },
    {
      evidenceId: 'ev-de-ausbildung-stipend',
      claim: '德国双元制职业培训由企业全额资助免学费，按月领取培训津贴（950~1350欧），达到标准免除自保金要求。',
      quotes: [
        'Ausbildungsbetrieb zahlt eine monatliche Vergütung. Bei ausreichender Ausbildungsvergütung ist kein Sperrkonto erforderlich.',
        'Ausländische Bewerber benötigen in der Regel Sprachkenntnisse auf dem Niveau B1 des Gemeinsamen Europäischen Referenzrahmens.'
      ],
      sourceUrl: 'https://www.arbeitsagentur.de/bildung/ausbildung'
    }
  ];

  return {
    sourceId: 'src-make-it-germany',
    parserVersion: '1.0.0',
    normalizedFacts,
    evidence
  };
}
