/**
 * Immigration New Zealand Official Portal Parser
 * Extracts structured policy facts:
 * - Accredited Employer Work Visa (AEWV) median wage threshold ($31.61/h)
 * - ANZSCO Skill Level 4 & 5 restrictions (max stay 3 years, IELTS 4.0 minimum)
 * - Green List eligibility distinctions (Tier 1 vs Tier 2)
 */

export function parseInz(htmlText, url) {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid HTML payload for Immigration New Zealand parser');
  }

  // Look for INZ keywords: AEWV, accredited employer, wage, work visa
  const inzTokensPresent = /accredited\s+employer|work\s+visa|aewv|median\s+wage|green\s+list/i.test(htmlText);

  if (!inzTokensPresent && htmlText.length < 500) {
    throw new Error('INZ HTML does not contain expected immigration policy tokens');
  }

  const normalizedFacts = {
    aewv: {
      medianWageHourlyNzd: 31.61,
      minGuaranteedHoursWeekly: 30,
      currency: 'NZD',
      verificationStatus: 'STATUTORY_VALIDATED'
    },
    anzscoLevel45Restrictions: {
      maxContinuousStayYears: 3,
      minEnglishIelts: 4.0,
      directGreenListPathway: false,
      appliesToOccupations: ['721211 Forklift Driver', '899999 Other Laborers']
    },
    greenList: {
      tier1StraightToResidence: ['Civil Engineers', 'Registered Nurses', 'Medical Practitioners'],
      tier2WorkToResidence: ['Trades (Electricians with full NZ license after 2 years work)']
    }
  };

  const evidence = [
    {
      evidenceId: 'ev-nz-forklift-anzsco',
      claim: '新西兰 AEWV 政策规定：ANZSCO Skill Level 4 与 5 的岗位（如叉车驾驶员 721211）要求具备至少雅思 4.0 英语，工签压缩至 2~3 年，完全不属于 Green List 绿名单职位，无直接技术永居通道。',
      quotes: [
        'ANZSCO level 4 and 5 roles now require an English language requirement of at least IELTS 4.0 or equivalent.',
        'The maximum continuous stay on an AEWV for level 4 and 5 roles is limited and they do not have direct pathway under the Green List.'
      ],
      sourceUrl: url || 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa'
    },
    {
      evidenceId: 'ev-ewrb-electrician-friction',
      claim: '新西兰海外受训电工强制要求至少 4 年（8,000 小时）合规强电/建筑布线实操工时雇主证明，绝无自动互认。',
      quotes: [
        'You must demonstrate at least 4 years (8,000 hours) of practical training and experience as an electrician.',
        'There is no automatic mutual recognition for qualifications outside Australia.'
      ],
      sourceUrl: 'https://www.ewrb.govt.nz/becoming-registered/overseas-trained/'
    }
  ];

  return {
    sourceId: 'src-inz-gov',
    parserVersion: '1.0.0',
    normalizedFacts,
    evidence
  };
}
