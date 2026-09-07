import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveSnapshot, ensureSnapshotsDir } from './snapshotManager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== Seeding Versioned Baseline Snapshots with SourceProvenance (RULE-31, 32, 36-41) ===');

// 1. Germany Make it in Germany: v1 (2025 previous baseline) -> v2 (2026 current baseline)
const deDir = ensureSnapshotsDir('src-make-it-germany');
if (fs.existsSync(deDir)) {
  fs.rmSync(deDir, { recursive: true, force: true });
}
ensureSnapshotsDir('src-make-it-germany');

// Save DE v1 (Old: €12,324)
saveSnapshot('src-make-it-germany', {
  parserVersion: '2.0.0',
  sourcePublishedAt: '2025-12-01',
  normalizedFacts: {
    opportunityCard: {
      monthlyBlockedFundsEur: {
        value: 1027,
        unit: 'EUR/month',
        sourceId: 'src-make-it-germany',
        sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
        sourceTitle: 'Make it in Germany - Opportunity Card Requirements',
        fetchedAt: '2025-12-15T00:00:00.000Z',
        sourcePublishedAt: '2025-12-01',
        effectiveAt: '2025-01-01',
        evidenceText: 'In 2025 the required minimum blocked account amount was €1,027 per month.',
        parserVersion: '2.0.0'
      },
      annualBlockedFundsEur: {
        value: 12324,
        unit: 'EUR/year',
        sourceId: 'src-make-it-germany',
        sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
        sourceTitle: 'Make it in Germany - Opportunity Card Requirements',
        fetchedAt: '2025-12-15T00:00:00.000Z',
        sourcePublishedAt: '2025-12-01',
        effectiveAt: '2025-01-01',
        evidenceText: 'In 2025 the required minimum blocked account amount was €12,324 per year.',
        parserVersion: '2.0.0'
      },
      partTimeWorkAllowedHoursWeekly: {
        value: 20,
        unit: 'hours/week',
        sourceId: 'src-make-it-germany',
        sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
        sourceTitle: 'Make it in Germany - Secondary Employment',
        fetchedAt: '2025-12-15T00:00:00.000Z',
        sourcePublishedAt: '2025-12-01',
        effectiveAt: '2025-01-01',
        evidenceText: 'Up to 20 hours per week of secondary employment allowed.',
        parserVersion: '2.0.0'
      },
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
  parserVersion: '2.0.0',
  sourcePublishedAt: '2026-08-15',
  normalizedFacts: {
    opportunityCard: {
      monthlyBlockedFundsEur: {
        value: 1091,
        unit: 'EUR/month',
        sourceId: 'src-make-it-germany',
        sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
        sourceTitle: 'Make it in Germany - Opportunity Card Requirements',
        fetchedAt: '2026-09-06T19:00:00.000Z',
        sourcePublishedAt: '2026-08-15',
        effectiveAt: '2026-01-01',
        evidenceText: 'For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.',
        parserVersion: '2.0.0'
      },
      annualBlockedFundsEur: {
        value: 13092,
        unit: 'EUR/year',
        sourceId: 'src-make-it-germany',
        sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
        sourceTitle: 'Make it in Germany - Opportunity Card Requirements',
        fetchedAt: '2026-09-06T19:00:00.000Z',
        sourcePublishedAt: '2026-08-15',
        effectiveAt: '2026-01-01',
        evidenceText: '€13,092 for the full 12-month period in a blocked account.',
        parserVersion: '2.0.0'
      },
      partTimeWorkAllowedHoursWeekly: {
        value: 20,
        unit: 'hours/week',
        sourceId: 'src-make-it-germany',
        sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
        sourceTitle: 'Make it in Germany - Secondary Employment',
        fetchedAt: '2026-09-06T19:00:00.000Z',
        sourcePublishedAt: '2026-08-15',
        effectiveAt: '2026-01-01',
        evidenceText: 'Up to 20 hours per week of trial employment or secondary work permitted.',
        parserVersion: '2.0.0'
      },
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
  parserVersion: '2.0.0',
  sourcePublishedAt: '2025-09-15',
  normalizedFacts: {
    aewv: {
      aewv_general_median_wage_requirement: {
        value: 29.66,
        unit: 'NZD/hour',
        sourceId: 'src-inz-gov',
        sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
        sourceTitle: 'Immigration New Zealand - AEWV Historical Baseline',
        fetchedAt: '2025-10-01T00:00:00.000Z',
        sourcePublishedAt: '2025-09-15',
        effectiveAt: '2025-02-28',
        evidenceText: 'Former wage rate required for AEWV roles was $29.66 NZD per hour.',
        parserVersion: '2.0.0'
      },
      medianWageHourlyNzd: 29.66,
      currency: 'NZD'
    },
    anzscoLevel45Restrictions: {
      maxContinuousStayYears: {
        value: 5,
        unit: 'years',
        sourceId: 'src-inz-gov',
        sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
        sourceTitle: 'Immigration New Zealand - AEWV Historical Baseline',
        fetchedAt: '2025-10-01T00:00:00.000Z',
        sourcePublishedAt: '2025-09-15',
        effectiveAt: '2025-02-28',
        evidenceText: 'Previous continuous stay period was up to 5 years for low skill roles.',
        parserVersion: '2.0.0'
      },
      minEnglishIelts: {
        value: 0,
        unit: 'IELTS Band',
        sourceId: 'src-inz-gov',
        sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
        sourceTitle: 'Immigration New Zealand - AEWV Historical Baseline',
        fetchedAt: '2025-10-01T00:00:00.000Z',
        sourcePublishedAt: '2025-09-15',
        effectiveAt: '2025-02-28',
        evidenceText: 'No minimum English language score previously mandated for level 4-5 roles.',
        parserVersion: '2.0.0'
      },
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
  parserVersion: '2.0.0',
  sourcePublishedAt: '2026-07-28',
  normalizedFacts: {
    aewv: {
      aewv_general_median_wage_requirement: {
        value: 31.61,
        unit: 'NZD/hour',
        sourceId: 'src-inz-gov',
        sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
        sourceTitle: 'Immigration New Zealand - AEWV 2026 Standards',
        fetchedAt: '2026-09-06T19:00:00.000Z',
        sourcePublishedAt: '2026-07-28',
        effectiveAt: '2026-02-28',
        evidenceText: 'You must be paid at least the median wage of $31.61 an hour unless your role is on an exempt list.',
        parserVersion: '2.0.0'
      },
      medianWageHourlyNzd: 31.61,
      currency: 'NZD'
    },
    anzscoLevel45Restrictions: {
      maxContinuousStayYears: {
        value: 3,
        unit: 'years',
        sourceId: 'src-inz-gov',
        sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
        sourceTitle: 'Immigration New Zealand - AEWV Length Requirements',
        fetchedAt: '2026-09-06T19:00:00.000Z',
        sourcePublishedAt: '2026-07-28',
        effectiveAt: '2026-04-01',
        evidenceText: 'The maximum continuous stay for ANZSCO skill level 4 and 5 roles has been reduced to 3 years.',
        parserVersion: '2.0.0'
      },
      minEnglishIelts: {
        value: 4.0,
        unit: 'IELTS Band',
        sourceId: 'src-inz-gov',
        sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
        sourceTitle: 'Immigration New Zealand - English Requirements',
        fetchedAt: '2026-09-06T19:00:00.000Z',
        sourcePublishedAt: '2026-07-28',
        effectiveAt: '2026-04-01',
        evidenceText: 'ANZSCO level 4 and 5 roles now require an English language requirement of at least IELTS 4.0 or equivalent.',
        parserVersion: '2.0.0'
      },
      directGreenListPathway: false
    }
  },
  evidence: [
    {
      evidenceId: 'ev-nz-forklift-anzsco',
      claim: '新西兰 AEWV 政策规定：ANZSCO 721311 叉车驾驶员（基准 Skill Level 4）要求具备至少雅思 4.0 英语，工签压缩至 3 年且无直接技术永居通道；仅在雇主 Job Check 要求 3 年经验或 NZQCF Level 4 资格时方可按 Level 3 审理。',
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

// 3. Jobs and Skills Australia (JSA): v1 (Stable baseline with 4-category split per RULE-40)
const jsaDir = ensureSnapshotsDir('src-jsa-au');
if (fs.existsSync(jsaDir)) {
  fs.rmSync(jsaDir, { recursive: true, force: true });
}
ensureSnapshotsDir('src-jsa-au');

saveSnapshot('src-jsa-au', {
  parserVersion: '2.0.0',
  sourcePublishedAt: '2026-08-01',
  normalizedFacts: {
    releaseMetadata: {
      agency: 'Jobs and Skills Australia',
      reportName: 'Skills Priority List (SPL) & Occupation Shortages',
      jurisdiction: 'Commonwealth of Australia',
      anzscoClassificationVersion: 'ANZSCO 2022/2023 Standard',
      sourcePublishedAt: '2026-08-01',
      sourceUrl: 'https://www.jobsandskills.gov.au/data/skills-shortage-som'
    },
    monitoredShortages: {
      electrician_341111: {
        anzscoCode: '341111',
        title: 'Electrician (General)',
        classificationVersion: 'ANZSCO 2022/2023',
        nationalShortage: true,
        labour_market_status: {
          nationalShortage: true,
          rating: 'National Shortage',
          evidenceText: 'Electricians are in national shortage across Australia.'
        },
        visa_relevance: {
          isAutomaticVisaGrant: false,
          assessingAuthority: 'Trades Recognition Australia (TRA)',
          assessingAuthorityCode: 'TRA',
          disclaimer: 'Domestic shortage does NOT grant automatic work or permanent residence visa.'
        },
        qualification_requirements: {
          standardApprenticeshipYears: 4,
          overseasExperienceRequirement: '4-year apprenticeship or 3+ years documented full-time post-qualification experience with technical interview/practical test',
          evidenceText: 'TRA migration skills assessment requires verified employment evidence and practical skills evaluation.'
        },
        migration_pathway_status: {
          pathwayType: 'General Skilled Migration (Points-tested) or Employer Sponsored (482/186)',
          requiresEmployerSponsor: true
        }
      },
      software_engineer_261313: {
        anzscoCode: '261313',
        title: 'Software Engineer',
        classificationVersion: 'ANZSCO 2022/2023',
        nationalShortage: true,
        labour_market_status: {
          nationalShortage: true,
          rating: 'National Shortage',
          evidenceText: 'Software engineers are in national shortage in select specialisations.'
        },
        visa_relevance: {
          isAutomaticVisaGrant: false,
          assessingAuthority: 'Australian Computer Society (ACS)',
          assessingAuthorityCode: 'ACS',
          disclaimer: 'Domestic shortage does NOT grant automatic work or permanent residence visa.'
        },
        qualification_requirements: {
          diplomaRplYearsRequired: 6,
          requirementNote: 'Non-ICT or Diploma qualifications require RPL pathway with 5-6 years relevant work experience',
          evidenceText: 'ACS skills assessment deducts 5-6 years of professional work experience for non-ICT diploma holders.'
        },
        migration_pathway_status: {
          pathwayType: 'Subclass 189/190/491 (High points pool, diploma applicants face heavy RPL experience deductions)',
          requiresEmployerSponsor: false
        }
      }
    },
    legalBoundaryDisclaimer: {
      domesticShortageVsVisaGrant: 'Crucial Legal Distinction: Domestic occupational shortage identifies employer hiring difficulty within Australia, but does NOT grant automatic visa rights to foreign candidates.'
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

