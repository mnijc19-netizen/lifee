import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveSnapshot, ensureSnapshotsDir } from './snapshotManager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== Seeding Versioned Baseline Snapshots ===');

// 1. Germany Make it in Germany: v1 (2025 previous baseline) -> v2 (2026 current baseline)
const deDir = ensureSnapshotsDir('src-make-it-germany');
// Clean up any old test snapshots
if (fs.existsSync(deDir)) {
  fs.rmSync(deDir, { recursive: true, force: true });
}
ensureSnapshotsDir('src-make-it-germany');

// Save DE v1 (Old: €12,324)
saveSnapshot('src-make-it-germany', {
  parserVersion: '1.0.0',
  normalizedFacts: {
    opportunityCard: {
      monthlyBlockedFundsEur: 1027,
      annualBlockedFundsEur: 12324,
      partTimeWorkAllowedHoursWeekly: 20,
      currency: 'EUR'
    },
    ausbildung: {
      stipendExemptionSperrkonto: true,
      minLanguageLevel: 'B1',
      typicalMonthlyStipendRangeEur: [900, 1250],
      tuitionFree: true
    }
  },
  evidence: [
    {
      evidenceId: 'ev-de-chancenkarte-blocked',
      claim: '2025 年度德国机会卡求职签证自保金标准为每月 1,027 欧元，年 12,324 欧元。',
      quotes: ['Previous standard in 2025 was €1,027/mo (€12,324/yr).'],
      sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card'
    }
  ]
}, {
  fetchedAt: '2025-12-15T00:00:00.000Z',
  sourcePublishedAt: '2025-12-01',
  url: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
  summary: '2025 Statutory baseline'
});

// Save DE v2 (Current: €13,092)
saveSnapshot('src-make-it-germany', {
  parserVersion: '1.0.0',
  normalizedFacts: {
    opportunityCard: {
      monthlyBlockedFundsEur: 1091,
      annualBlockedFundsEur: 13092,
      partTimeWorkAllowedHoursWeekly: 20,
      currency: 'EUR'
    },
    ausbildung: {
      stipendExemptionSperrkonto: true,
      minLanguageLevel: 'B1',
      typicalMonthlyStipendRangeEur: [950, 1350],
      tuitionFree: true
    }
  },
  evidence: [
    {
      evidenceId: 'ev-de-chancenkarte-blocked',
      claim: '2026 年度德国机会卡求职签证要求限制性账户每月 1,091 欧元，全年 13,092 欧元。',
      quotes: ['For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.'],
      sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card'
    },
    {
      evidenceId: 'ev-de-ausbildung-stipend',
      claim: '德国双元制职业培训由企业全额资助免学费，按月领取培训津贴（950~1350欧），免除自保金要求。',
      quotes: ['Ausbildungsbetrieb zahlt eine monatliche Vergütung. Bei ausreichender Ausbildungsvergütung ist kein Sperrkonto erforderlich.'],
      sourceUrl: 'https://www.arbeitsagentur.de/bildung/ausbildung'
    }
  ]
}, {
  fetchedAt: '2026-09-06T19:00:00.000Z',
  sourcePublishedAt: '2026-08-15',
  url: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
  summary: '2026 Statutory increase update'
});

// 2. Immigration New Zealand (INZ): v1 (Old wage: $29.66) -> v2 (Current wage: $31.61)
const nzDir = ensureSnapshotsDir('src-inz-gov');
if (fs.existsSync(nzDir)) {
  fs.rmSync(nzDir, { recursive: true, force: true });
}
ensureSnapshotsDir('src-inz-gov');

saveSnapshot('src-inz-gov', {
  parserVersion: '1.0.0',
  normalizedFacts: {
    aewv: {
      medianWageHourlyNzd: 29.66,
      minGuaranteedHoursWeekly: 30,
      currency: 'NZD'
    },
    anzscoLevel45Restrictions: {
      maxContinuousStayYears: 5,
      minEnglishIelts: 0,
      directGreenListPathway: false
    }
  },
  evidence: []
}, {
  fetchedAt: '2025-10-01T00:00:00.000Z',
  sourcePublishedAt: '2025-09-15',
  url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
  summary: 'Pre-reform AEWV threshold'
});

saveSnapshot('src-inz-gov', {
  parserVersion: '1.0.0',
  normalizedFacts: {
    aewv: {
      medianWageHourlyNzd: 31.61,
      minGuaranteedHoursWeekly: 30,
      currency: 'NZD'
    },
    anzscoLevel45Restrictions: {
      maxContinuousStayYears: 3,
      minEnglishIelts: 4.0,
      directGreenListPathway: false
    }
  },
  evidence: [
    {
      evidenceId: 'ev-nz-forklift-anzsco',
      claim: '新西兰 AEWV 政策规定：ANZSCO Skill Level 4 与 5 的岗位（如叉车驾驶员 721211）要求具备至少雅思 4.0 英语，工签压缩至 2~3 年，无直接技术永居通道。',
      quotes: ['ANZSCO level 4 and 5 roles now require an English language requirement of at least IELTS 4.0 or equivalent.'],
      sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa'
    }
  ]
}, {
  fetchedAt: '2026-09-06T19:00:00.000Z',
  sourcePublishedAt: '2026-07-28',
  url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
  summary: '2026 AEWV Wage Threshold and Low Skill restrictions update'
});

// 3. Jobs and Skills Australia (JSA): v1 & v2 (Stable baseline)
const jsaDir = ensureSnapshotsDir('src-jsa-au');
if (fs.existsSync(jsaDir)) {
  fs.rmSync(jsaDir, { recursive: true, force: true });
}
ensureSnapshotsDir('src-jsa-au');

saveSnapshot('src-jsa-au', {
  parserVersion: '1.0.0',
  normalizedFacts: {
    monitoredShortages: {
      electrician_341111: {
        anzscoCode: '341111',
        title: 'Electrician (General)',
        nationalShortage: true,
        assessingAuthority: 'Trades Recognition Australia (TRA)'
      },
      software_engineer_261313: {
        anzscoCode: '261313',
        title: 'Software Engineer',
        nationalShortage: true,
        assessingAuthority: 'Australian Computer Society (ACS)'
      }
    },
    legalBoundaryDisclaimer: {
      domesticShortageVsVisaGrant: 'Domestic shortage does not equal automatic visa grant.'
    }
  },
  evidence: [
    {
      evidenceId: 'ev-acs-rpl-barrier',
      claim: '澳大利亚计算机协会 (ACS) 规定：非对口专科需通过 RPL 认定并扣除 5~6 年全职工作经验。',
      quotes: ['Non-ICT Diploma qualifications require 6 years of full-time professional ICT work experience plus an RPL project report.'],
      sourceUrl: 'https://www.acs.org.au/msa.html'
    }
  ]
}, {
  fetchedAt: '2026-09-06T19:00:00.000Z',
  sourcePublishedAt: '2026-08-01',
  url: 'https://www.jobsandskills.gov.au/data/skills-shortage-som',
  summary: '2026 JSA Skills Priority List'
});

console.log('=== Finished Seeding Snapshots Successfully ===');
