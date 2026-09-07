import assert from 'assert';
import crypto from 'crypto';
import { parseDeOpportunityCard } from './parsers/deOpportunityCardParser.mjs';
import { parseDeVocationalTraining } from './parsers/deVocationalTrainingParser.mjs';
import { parseMakeItGermany } from './parsers/makeItGermanyParser.mjs';
import { parseNzAewv } from './parsers/nzAewvParser.mjs';
import { parseNzMinimumWage } from './parsers/nzMinimumWageParser.mjs';
import { parseNzMedianWage } from './parsers/nzMedianWageParser.mjs';
import { parseNzForklift } from './parsers/nzForkliftParser.mjs';
import { parseInz } from './parsers/inzParser.mjs';
import { parseJsa } from './parsers/jsaParser.mjs';
import { 
  validateCapturedFixture, 
  validateSyntheticFixture, 
  validateFixtureProvenance 
} from './rulesRegistry.mjs';

console.log('=== [RULE-28 & RULE-75 & RULE-77-85] Strict Discrete & Aggregator Parser Test Suite ===');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failCount++;
  }
}

function computeSha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// =========================================================================
// 1. Germany Opportunity Card Parser (deOpportunityCardParser.mjs)
// =========================================================================
console.log('\n--- 1. DE Opportunity Card Parser ---');

const DE_OPP_CARD_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Opportunity Card for Job Search - Make it in Germany</title>
  <meta name="date" content="2026-08-15" />
</head>
<body>
  <h1>Opportunity card for looking for a job</h1>
  <p>For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.</p>
  <p>You can also work in secondary employment for up to 20 hours per week during your job search.</p>
</body>
</html>`;

const DE_OPP_CARD_EXCERPT = 'For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.';

const DE_OPP_CARD_FIXTURE = {
  fixtureType: 'CAPTURED_OFFICIAL',
  sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/job-search-opportunity-card',
  sourceTitle: 'Opportunity Card for Job Search - Make it in Germany',
  retrievedAt: '2026-08-15T10:00:00.000Z',
  effectiveAt: '2026-01-01',
  rawPayload: DE_OPP_CARD_HTML,
  sha256: computeSha256(DE_OPP_CARD_HTML),
  evidenceExcerpt: DE_OPP_CARD_EXCERPT
};

runTest('DE OppCard: 1. Positive CAPTURED_OFFICIAL fixture extracts €1,091/mo, €13,092/yr, 20h/wk', () => {
  validateCapturedFixture(DE_OPP_CARD_FIXTURE);
  const parsed = parseDeOpportunityCard(DE_OPP_CARD_FIXTURE.rawPayload, DE_OPP_CARD_FIXTURE.sourceUrl);
  assert.strictEqual(parsed.sourceId, 'src-de-opportunity-card');
  assert.strictEqual(parsed.sourcePublishedAt, '2026-08-15');
  assert.strictEqual(parsed.normalizedFacts.monthlyBlockedFundsEur.value, 1091);
  assert.strictEqual(parsed.normalizedFacts.monthlyBlockedFundsEur.unit, 'EUR/month');
  assert.strictEqual(parsed.normalizedFacts.annualBlockedFundsEur.value, 13092);
  assert.strictEqual(parsed.normalizedFacts.partTimeWorkAllowedHoursWeekly.value, 20);
});

runTest('DE OppCard: 2. SYNTHETIC_MUTATION alters values dynamically (€1,234/mo, 25h/wk)', () => {
  const mutatedHtml = DE_OPP_CARD_HTML
    .replace('€1,091 per month', '€1,234 per month')
    .replace('€13,092 for the full', '€14,808 for the full')
    .replace('up to 20 hours per week', 'up to 25 hours per week');
  const syntheticFixture = {
    fixtureType: 'SYNTHETIC_MUTATION',
    syntheticMutation: true,
    mutationDescription: 'Alters €1,091 to €1,234 and 20h to 25h',
    sourceUrl: DE_OPP_CARD_FIXTURE.sourceUrl
  };
  validateSyntheticFixture(syntheticFixture);
  const parsed = parseDeOpportunityCard(mutatedHtml);
  assert.strictEqual(parsed.normalizedFacts.monthlyBlockedFundsEur.value, 1234);
  assert.strictEqual(parsed.normalizedFacts.annualBlockedFundsEur.value, 14808);
  assert.strictEqual(parsed.normalizedFacts.partTimeWorkAllowedHoursWeekly.value, 25);
});

runTest('DE OppCard: 3. Missing monthly funds throws error', () => {
  assert.throws(() => {
    parseDeOpportunityCard('<html><body><h1>Opportunity Card</h1><p>No funds stated.</p></body></html>');
  }, /monthlyBlockedFundsEur/);
});

// =========================================================================
// 2. Germany Vocational Training Parser (deVocationalTrainingParser.mjs)
// =========================================================================
console.log('\n--- 2. DE Vocational Training Parser ---');

const DE_VOC_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Vocational Training in Germany - Make it in Germany</title>
  <meta name="date" content="2026-08-15" />
</head>
<body>
  <h1>Vocational training in Germany</h1>
  <p>For school-based vocational training, statutory subsistence requirement is at least €959 net per month.</p>
  <p>For company-based vocational training (Ausbildung): The training company pays a statutory training allowance (Ausbildungsvergütung) of at least €1,048 gross per month (approx. €822 net). If the training allowance is insufficient to cover living costs, supplemental proof of financial means (blocked account) is required. German language proficiency at level B1 is required.</p>
</body>
</html>`;

const DE_VOC_EXCERPT = 'training allowance (Ausbildungsvergütung) of at least €1,048 gross per month (approx. €822 net). If the training allowance is insufficient to cover living costs, supplemental proof of financial means (blocked account) is required. German language proficiency at level B1 is required.';

const DE_VOC_FIXTURE = {
  fixtureType: 'CAPTURED_OFFICIAL',
  sourceUrl: 'https://www.make-it-in-germany.com/en/study-vocational-training/vocational-training',
  sourceTitle: 'Vocational Training in Germany - Make it in Germany',
  retrievedAt: '2026-08-15T10:00:00.000Z',
  effectiveAt: '2026-01-01',
  rawPayload: DE_VOC_HTML,
  sha256: computeSha256(DE_VOC_HTML),
  evidenceExcerpt: DE_VOC_EXCERPT
};

runTest('DE Vocational: 1. Positive CAPTURED_OFFICIAL fixture extracts school net €959, company gross €1,048, net €822, B1', () => {
  validateCapturedFixture(DE_VOC_FIXTURE);
  const parsed = parseDeVocationalTraining(DE_VOC_FIXTURE.rawPayload, DE_VOC_FIXTURE.sourceUrl);
  assert.strictEqual(parsed.sourceId, 'src-de-vocational-training');
  assert.strictEqual(parsed.normalizedFacts.schoolBasedMinimumNetEur.value, 959);
  assert.strictEqual(parsed.normalizedFacts.companyBasedMinimumGross.min, 1048);
  assert.strictEqual(parsed.normalizedFacts.companyBasedEstimatedNet.value, 822);
  assert.strictEqual(parsed.normalizedFacts.supplementalProofRequiredWhenInsufficient.required, true);
  assert.strictEqual(parsed.normalizedFacts.languageRequirement.level, 'B1');
});

runTest('DE Vocational: 2. SYNTHETIC_MUTATION alters gross €1,200, B2', () => {
  const mutatedHtml = DE_VOC_HTML
    .replace('€1,048 gross per month', '€1,200 gross per month')
    .replace('approx. €822 net', 'approx. €940 net')
    .replace('level B1', 'level B2');
  const syntheticFixture = {
    fixtureType: 'SYNTHETIC_MUTATION',
    syntheticMutation: true,
    mutationDescription: 'Alters gross to €1,200, net to €940, language to B2',
    sourceUrl: DE_VOC_FIXTURE.sourceUrl
  };
  validateSyntheticFixture(syntheticFixture);
  const parsed = parseDeVocationalTraining(mutatedHtml);
  assert.strictEqual(parsed.normalizedFacts.companyBasedMinimumGross.min, 1200);
  assert.strictEqual(parsed.normalizedFacts.companyBasedEstimatedNet.value, 940);
  assert.strictEqual(parsed.normalizedFacts.languageRequirement.level, 'B2');
});

// =========================================================================
// 3. Make it in Germany Composite Aggregator (makeItGermanyParser.mjs)
// =========================================================================
console.log('\n--- 3. Make it in Germany Composite Aggregator ---');

const DE_COMPOSITE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Make it in Germany Portal</title>
  <meta name="date" content="2026-08-15" />
</head>
<body>
  <h1>Opportunity card and Vocational Training</h1>
  <p>For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.</p>
  <p>You can also work in secondary employment for up to 20 hours per week during your job search.</p>
  <p>For school-based vocational training, statutory subsistence requirement is at least €959 net per month.</p>
  <p>For vocational training (Ausbildung): The training company pays a statutory training allowance of at least €1,048 gross per month (approx. €822 net). Supplemental proof of financial means is required if allowance is insufficient. German language proficiency at level B1 is required.</p>
</body>
</html>`;

runTest('DE Aggregator: Combines Opportunity Card & Vocational Training normalized facts', () => {
  const parsed = parseMakeItGermany(DE_COMPOSITE_HTML);
  assert.strictEqual(parsed.sourceId, 'src-make-it-germany');
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.monthlyBlockedFundsEur.value, 1091);
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.annualBlockedFundsEur.value, 13092);
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.partTimeWorkAllowedHoursWeekly.value, 20);
  assert.strictEqual(parsed.normalizedFacts.ausbildung.companyBasedMinimumGross.min, 1048);
  assert.strictEqual(parsed.normalizedFacts.ausbildung.schoolBasedMinimumNetEur.value, 959);
  assert.strictEqual(parsed.normalizedFacts.ausbildung.minimumNet.value, 822);
  assert.strictEqual(parsed.normalizedFacts.ausbildung.languageRequirement.level, 'B1');
});

// =========================================================================
// 4. NZ AEWV Parser (nzAewvParser.mjs)
// =========================================================================
console.log('\n--- 4. NZ AEWV Parser ---');

const NZ_AEWV_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Accredited Employer Work Visa | Immigration New Zealand</title>
  <meta name="date" content="2026-07-28" />
</head>
<body>
  <h1>Accredited Employer Work Visa</h1>
  <p>Applicants must have at least 2 years of relevant work experience or equivalent NZQCF Level 4 qualification.</p>
  <p>Employers must pay at least the market rate for the role so overseas workers are not exploited.</p>
  <p>The maximum continuous stay for ANZSCO skill level 4 and 5 roles is limited to 3 years.</p>
  <p>Applicants for ANZSCO level 4 and 5 roles must meet an English language requirement of IELTS 4.0 or equivalent.</p>
  <p>Roles at skill level 4-5 do not have direct pathway under the Green List.</p>
</body>
</html>`;

const NZ_AEWV_EXCERPT = 'Applicants must have at least 2 years of relevant work experience or equivalent NZQCF Level 4 qualification.';

const NZ_AEWV_FIXTURE = {
  fixtureType: 'CAPTURED_OFFICIAL',
  sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
  sourceTitle: 'Accredited Employer Work Visa | Immigration New Zealand',
  retrievedAt: '2026-07-28T09:00:00.000Z',
  effectiveAt: '2026-04-01',
  rawPayload: NZ_AEWV_HTML,
  sha256: computeSha256(NZ_AEWV_HTML),
  evidenceExcerpt: NZ_AEWV_EXCERPT
};

runTest('NZ AEWV: 1. Positive CAPTURED_OFFICIAL fixture extracts 2 years experience (NO 3-year default) & market rate', () => {
  validateCapturedFixture(NZ_AEWV_FIXTURE);
  const parsed = parseNzAewv(NZ_AEWV_FIXTURE.rawPayload, NZ_AEWV_FIXTURE.sourceUrl);
  assert.strictEqual(parsed.sourceId, 'src-inz-aewv');
  assert.strictEqual(parsed.normalizedFacts.generalExperienceYears.value, 2, 'General AEWV experience must be 2 years, NOT 3 years');
  assert.strictEqual(parsed.normalizedFacts.marketRateRequirement.required, true);
  assert.strictEqual(parsed.normalizedFacts.anzscoLevel45Rules.maxContinuousStayYears.value, 3);
  assert.strictEqual(parsed.normalizedFacts.anzscoLevel45Rules.minEnglishIelts.value, 4.0);
});

runTest('NZ AEWV: 2. SYNTHETIC_MUTATION alters experience to 4 years, IELTS 5.0', () => {
  const mutatedHtml = NZ_AEWV_HTML
    .replace('at least 2 years', 'at least 4 years')
    .replace('IELTS 4.0', 'IELTS 5.0');
  const syntheticFixture = {
    fixtureType: 'SYNTHETIC_MUTATION',
    syntheticMutation: true,
    mutationDescription: 'Alters experience 2->4 years, IELTS 4.0->5.0',
    sourceUrl: NZ_AEWV_FIXTURE.sourceUrl
  };
  validateSyntheticFixture(syntheticFixture);
  const parsed = parseNzAewv(mutatedHtml);
  assert.strictEqual(parsed.normalizedFacts.generalExperienceYears.value, 4);
  assert.strictEqual(parsed.normalizedFacts.anzscoLevel45Rules.minEnglishIelts.value, 5.0);
});

// =========================================================================
// 5. NZ Minimum Wage Parser (nzMinimumWageParser.mjs)
// =========================================================================
console.log('\n--- 5. NZ Minimum Wage Parser ---');

const NZ_MIN_WAGE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Minimum Wage Rates | Employment New Zealand</title>
  <meta name="date" content="2026-04-01" />
</head>
<body>
  <h1>Current Minimum Wage Rates</h1>
  <p>From 1 April 2026, the adult minimum wage is $23.95 per hour.</p>
</body>
</html>`;

const NZ_MIN_WAGE_EXCERPT = 'From 1 April 2026, the adult minimum wage is $23.95 per hour.';

const NZ_MIN_WAGE_FIXTURE = {
  fixtureType: 'CAPTURED_OFFICIAL',
  sourceUrl: 'https://www.employment.govt.nz/hours-and-rates/pay/minimum-wage/minimum-wage-rates',
  sourceTitle: 'Minimum Wage Rates | Employment New Zealand',
  retrievedAt: '2026-08-01T09:00:00.000Z',
  effectiveAt: '2026-04-01',
  rawPayload: NZ_MIN_WAGE_HTML,
  sha256: computeSha256(NZ_MIN_WAGE_HTML),
  evidenceExcerpt: NZ_MIN_WAGE_EXCERPT
};

runTest('NZ MinWage: 1. Positive CAPTURED_OFFICIAL fixture extracts $23.95/hr from 1 April 2026', () => {
  validateCapturedFixture(NZ_MIN_WAGE_FIXTURE);
  const parsed = parseNzMinimumWage(NZ_MIN_WAGE_FIXTURE.rawPayload, NZ_MIN_WAGE_FIXTURE.sourceUrl);
  assert.strictEqual(parsed.sourceId, 'src-nz-min-wage');
  assert.strictEqual(parsed.normalizedFacts.legalMinimumWageNzd.value, 23.95);
  assert.strictEqual(parsed.normalizedFacts.legalMinimumWageNzd.effectiveAt, '1 April 2026');
});

runTest('NZ MinWage: 2. Regression REG-NZ-MIN-WAGE-23.95 (Obsolete $23.15 without mutation rejected)', () => {
  const obsoleteHtml = `<html><body><p>The adult minimum wage is $23.15 per hour.</p></body></html>`;
  assert.throws(() => {
    parseNzMinimumWage(obsoleteHtml);
  }, /REG-NZ-MIN-WAGE-23.95/);
});

// =========================================================================
// 6. NZ Median Wage Parser (nzMedianWageParser.mjs)
// =========================================================================
console.log('\n--- 6. NZ Median Wage Parser ---');

const NZ_MEDIAN_WAGE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Pay Rates for Visas | Immigration New Zealand</title>
  <meta name="date" content="2026-03-09" />
</head>
<body>
  <h1>Pay Rates for Visas</h1>
  <p>From 9 March 2026, the median wage used for Skilled Migrant Category (SMC) points and Green List pathways is $35.00 an hour.</p>
</body>
</html>`;

const NZ_MEDIAN_WAGE_EXCERPT = 'From 9 March 2026, the median wage used for Skilled Migrant Category (SMC) points and Green List pathways is $35.00 an hour.';

const NZ_MEDIAN_WAGE_FIXTURE = {
  fixtureType: 'CAPTURED_OFFICIAL',
  sourceUrl: 'https://www.immigration.govt.nz/employ-migrants/guides/pay-rates-for-visas',
  sourceTitle: 'Pay Rates for Visas | Immigration New Zealand',
  retrievedAt: '2026-08-01T09:00:00.000Z',
  effectiveAt: '2026-03-09',
  rawPayload: NZ_MEDIAN_WAGE_HTML,
  sha256: computeSha256(NZ_MEDIAN_WAGE_HTML),
  evidenceExcerpt: NZ_MEDIAN_WAGE_EXCERPT
};

runTest('NZ MedianWage: 1. Positive CAPTURED_OFFICIAL fixture extracts $35.00/hr from 9 March 2026', () => {
  validateCapturedFixture(NZ_MEDIAN_WAGE_FIXTURE);
  const parsed = parseNzMedianWage(NZ_MEDIAN_WAGE_FIXTURE.rawPayload, NZ_MEDIAN_WAGE_FIXTURE.sourceUrl);
  assert.strictEqual(parsed.sourceId, 'src-nz-median-wage');
  assert.strictEqual(parsed.normalizedFacts.medianWageNzd.value, 35.00);
  assert.ok(parsed.normalizedFacts.medianWageNzd.scopeOfApplication.includes('NOT general AEWV requirement'));
});

runTest('NZ MedianWage: 2. Regression REG-NZ-MEDIAN-WAGE-35 (Obsolete $31.61 without mutation rejected)', () => {
  const obsoleteHtml = `<html><body><p>The median wage is $31.61 an hour.</p></body></html>`;
  assert.throws(() => {
    parseNzMedianWage(obsoleteHtml);
  }, /REG-NZ-MEDIAN-WAGE-35/);
});

// =========================================================================
// 7. NZ Forklift Driver Parser (nzForkliftParser.mjs)
// =========================================================================
console.log('\n--- 7. NZ Forklift Driver Parser ---');

const NZ_FORKLIFT_HTML = `<!DOCTYPE html>
<html>
<head><title>Forklift Driver Role</title></head>
<body>
  <h1>Forklift Driver (ANZSCO 721311)</h1>
  <p>Official classification: ANZSCO 721311 Forklift Driver, baseline skill level 4.</p>
  <p>The maximum continuous stay is limited to 3 years. English requirement is IELTS 4.0.</p>
  <p>Can ONLY be treated as skill level 3 under AEWV if the employer Job Check specifies at least 3 years relevant work experience OR relevant NZQCF Level 4 qualification.</p>
</body>
</html>`;

const NZ_FORKLIFT_EXCERPT = 'Official classification: ANZSCO 721311 Forklift Driver, baseline skill level 4.';

const NZ_FORKLIFT_FIXTURE = {
  fixtureType: 'CAPTURED_OFFICIAL',
  sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
  sourceTitle: 'Forklift Driver Role | Immigration New Zealand',
  retrievedAt: '2026-07-28T09:00:00.000Z',
  effectiveAt: '2026-04-01',
  rawPayload: NZ_FORKLIFT_HTML,
  sha256: computeSha256(NZ_FORKLIFT_HTML),
  evidenceExcerpt: NZ_FORKLIFT_EXCERPT
};

runTest('NZ Forklift: 1. Positive CAPTURED_OFFICIAL fixture extracts ANZSCO 721311, Level 4, conditional Level 3', () => {
  validateCapturedFixture(NZ_FORKLIFT_FIXTURE);
  const parsed = parseNzForklift(NZ_FORKLIFT_FIXTURE.rawPayload, NZ_FORKLIFT_FIXTURE.sourceUrl);
  assert.strictEqual(parsed.sourceId, 'src-inz-forklift');
  assert.strictEqual(parsed.normalizedFacts.officialAnzscoCode, '721311');
  assert.strictEqual(parsed.normalizedFacts.baselineSkillLevel, 4);
  assert.strictEqual(parsed.normalizedFacts.skillLevel3ConditionalRule.isAutomaticVisaGrant, false);
});

runTest('NZ Forklift: 2. Regression REG-NZ-FORKLIFT-721311 (Obsolete ANZSCO 721211 rejected)', () => {
  const obsoleteHtml = `<html><body><h1>Forklift Driver ANZSCO 721211</h1></body></html>`;
  assert.throws(() => {
    parseNzForklift(obsoleteHtml);
  }, /REG-NZ-FORKLIFT-721311/);
});

runTest('NZ Forklift: 3. Missing stay / IELTS yields null without guessing (RULE-78)', () => {
  const noStayHtml = `<html><body><p>ANZSCO 721311 Forklift Driver</p></body></html>`;
  const parsed = parseNzForklift(noStayHtml);
  assert.strictEqual(parsed.normalizedFacts.maxContinuousStayYears, null);
  assert.strictEqual(parsed.normalizedFacts.minEnglishIelts, null);
});

runTest('NZ Forklift: 4. Missing required code throws error (RULE-85)', () => {
  const missingCodeHtml = `<html><body><p>Forklift Driver without code</p></body></html>`;
  assert.throws(() => {
    parseNzForklift(missingCodeHtml);
  }, /Required ANZSCO code 721311/);
});

// =========================================================================
// 8. INZ Composite Aggregator (inzParser.mjs)
// =========================================================================
console.log('\n--- 8. INZ Composite Aggregator ---');

const INZ_COMPOSITE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Accredited Employer Work Visa | Immigration New Zealand</title>
  <meta name="date" content="2026-07-28" />
</head>
<body>
  <h1>Accredited Employer Work Visa</h1>
  <p>Employers must pay at least the adult minimum wage of $23.95 per hour and ensure pay meets the market rate.</p>
  <p>The median wage of $35.00 an hour is used for Skilled Migrant Category (SMC) points and Green List pathways, not general AEWV.</p>
  <p>Applicants must have at least 2 years of relevant work experience or equivalent NZQCF Level 4 qualification.</p>
  <p>For skill level 4-5 roles (such as ANZSCO 721311 Forklift Driver): maximum continuous stay is limited to 3 years, IELTS 4.0.</p>
</body>
</html>`;

runTest('INZ Aggregator: Integrates minimum wage ($23.95), median wage ($35.00), 2 yrs exp, and 721311 forklift', () => {
  const parsed = parseInz(INZ_COMPOSITE_HTML);
  assert.strictEqual(parsed.sourceId, 'src-inz-gov');
  assert.strictEqual(parsed.normalizedFacts.generalAewvPayRequirement.legalMinimumWageNzd.value, 23.95);
  assert.strictEqual(parsed.normalizedFacts.medianWageUsedInOtherMigrationSettings.value, 35.00);
  assert.strictEqual(parsed.normalizedFacts.experienceRequirements.minRelevantExperienceYears, 2);
  assert.strictEqual(parsed.normalizedFacts.monitoredOccupationForkliftDriver.officialAnzscoCode, '721311');
});

runTest('INZ Aggregator: Rejects obsolete 721211 at aggregator boundary', () => {
  const badHtml = INZ_COMPOSITE_HTML.replace('721311', '721211');
  assert.throws(() => {
    parseInz(badHtml);
  }, /REG-NZ-FORKLIFT-721311/);
});

runTest('INZ Aggregator: Preserves null child facts when text is omitted without fallback constants (RULE-78, RULE-85)', () => {
  const onlyMinWageHtml = `<html><head><title>INZ</title></head><body><p>Employers must pay at least the adult minimum wage of $23.95 per hour and ensure pay meets the market rate.</p></body></html>`;
  const parsed = parseInz(onlyMinWageHtml);
  assert.strictEqual(parsed.normalizedFacts.generalAewvPayRequirement.legalMinimumWageNzd.value, 23.95);
  assert.strictEqual(parsed.normalizedFacts.medianWageUsedInOtherMigrationSettings, null);
  assert.strictEqual(parsed.normalizedFacts.experienceRequirements, null);
  assert.strictEqual(parsed.normalizedFacts.monitoredOccupationForkliftDriver, null);
});

// =========================================================================
// 9. Jobs and Skills Australia 2025 OSL Parser (jsaParser.mjs)
// =========================================================================
console.log('\n--- 9. JSA 2025 OSL Parser ---');

const JSA_2025_DATASET = `Release: 2025-08-01
Jobs and Skills Australia - 2025 Occupation Shortage List (OSL)
ANZSCO 2022/2023 Standard Classification

ANZSCO 341111: Electrician (General) - National Shortage (S)
Rating: National Shortage across Australia.
Assessing Authority: Trades Recognition Australia (TRA). Requires 4-year apprenticeship or overseas equivalent with trade test.

ANZSCO 261313: Software Engineer - No Shortage (NS)
Rating: No Shortage nationally in 2025 OSL.
Assessing Authority: Australian Computer Society (ACS). Non-ICT diploma qualifications require 6 years RPL.

Crucial Legal Distinction: Domestic occupational shortage identifies employer hiring difficulty within Australia, but does not grant automatic visa rights to foreign candidates. Overseas candidates must independently qualify for Migration points and pass formal skills assessments.`;

const JSA_2025_EXCERPT = 'ANZSCO 341111: Electrician (General) - National Shortage (S)';

const JSA_2025_FIXTURE = {
  fixtureType: 'CAPTURED_OFFICIAL',
  sourceUrl: 'https://www.jobsandskills.gov.au/data/skills-shortage-som',
  sourceTitle: '2025 Occupation Shortage List (OSL) - Jobs and Skills Australia',
  retrievedAt: '2025-08-01T08:00:00.000Z',
  effectiveAt: '2025-08-01',
  rawPayload: JSA_2025_DATASET,
  sha256: computeSha256(JSA_2025_DATASET),
  evidenceExcerpt: JSA_2025_EXCERPT
};

runTest('JSA 2025 OSL: 1. Positive CAPTURED_OFFICIAL extracts Electrician (S), Software Engineer (NS)', () => {
  validateCapturedFixture(JSA_2025_FIXTURE);
  const parsed = parseJsa(JSA_2025_FIXTURE.rawPayload, JSA_2025_FIXTURE.sourceUrl);
  assert.strictEqual(parsed.sourceId, 'src-jsa-au-2025');
  assert.strictEqual(parsed.normalizedFacts.releaseMetadata.releaseYear, 2025);

  const elec = parsed.normalizedFacts.monitoredShortages.electrician_341111;
  assert.strictEqual(elec.labour_market_status.nationalShortage, true);
  assert.strictEqual(elec.labour_market_status.rating, 'National Shortage');
  assert.strictEqual(elec.visa_relevance.isAutomaticVisaGrant, false);
  assert.strictEqual(elec.visa_relevance.assessingAuthorityCode, 'TRA');

  const soft = parsed.normalizedFacts.monitoredShortages.software_engineer_261313;
  assert.strictEqual(soft.labour_market_status.nationalShortage, false, 'Software Engineer in 2025 OSL must be No Shortage (NS)');
  assert.strictEqual(soft.labour_market_status.rating, 'No Shortage');
  assert.strictEqual(soft.visa_relevance.isAutomaticVisaGrant, false);
  assert.strictEqual(soft.visa_relevance.assessingAuthorityCode, 'ACS');
});

runTest('JSA 2025 OSL: 2. SYNTHETIC_MUTATION toggles shortage bidirectionally', () => {
  const mutatedToSoftShortage = JSA_2025_DATASET
    .replace('Software Engineer - No Shortage (NS)', 'Software Engineer - National Shortage (S)')
    .replace('Rating: No Shortage nationally', 'Rating: National Shortage nationally');
  const syntheticFixture = {
    fixtureType: 'SYNTHETIC_MUTATION',
    syntheticMutation: true,
    mutationDescription: 'Toggles Software Engineer from NS to S',
    sourceUrl: JSA_2025_FIXTURE.sourceUrl
  };
  validateSyntheticFixture(syntheticFixture);
  const parsed = parseJsa(mutatedToSoftShortage);
  assert.strictEqual(parsed.normalizedFacts.monitoredShortages.software_engineer_261313.labour_market_status.nationalShortage, true);
});

runTest('JSA 2025 OSL: 3. Regression REG-JSA-2025-OSL (Fabricated 2026 release year rejected)', () => {
  const fake2026 = `Release: 2026-08-01\nJobs and Skills Australia - 2026 Occupation Shortage List\nANZSCO 341111 Electrician\nANZSCO 261313 Software Engineer`;
  assert.throws(() => {
    parseJsa(fake2026);
  }, /REG-JSA-2025-OSL/);
});

// =========================================================================
// 10. RULE-75, RULE-77 & RULE-80 Provenance & Integrity Guardrails
// =========================================================================
console.log('\n--- 10. Fixture Integrity Guardrails (RULE-75, RULE-77, RULE-80) ---');

runTest('RULE-77: Throws when evidenceExcerpt is missing from rawPayload', () => {
  assert.throws(() => {
    validateCapturedFixture({
      fixtureType: 'CAPTURED_OFFICIAL',
      sourceUrl: 'https://example.com/statute',
      retrievedAt: '2026-09-07T00:00:00.000Z',
      rawPayload: 'Short statutory text without excerpt.',
      sha256: computeSha256('Short statutory text without excerpt.'),
      evidenceExcerpt: 'This phrase does not exist in rawPayload'
    });
  }, /evidenceExcerpt does not exist in rawPayload/);
});

runTest('RULE-77: Throws when sha256 mismatch occurs', () => {
  assert.throws(() => {
    validateCapturedFixture({
      fixtureType: 'CAPTURED_OFFICIAL',
      sourceUrl: 'https://example.com/statute',
      retrievedAt: '2026-09-07T00:00:00.000Z',
      rawPayload: 'Text content.',
      sha256: 'deadbeef00000000000000000000000000000000000000000000000000000000',
      evidenceExcerpt: 'Text content.'
    });
  }, /sha256 mismatch/);
});

runTest('RULE-80: Synthetic mutation cannot masquerade as CAPTURED_OFFICIAL', () => {
  assert.throws(() => {
    validateCapturedFixture({
      fixtureType: 'CAPTURED_OFFICIAL',
      syntheticMutation: true,
      sourceUrl: 'https://example.com',
      retrievedAt: '2026-09-07',
      rawPayload: 'Valid payload text',
      sha256: computeSha256('Valid payload text'),
      evidenceExcerpt: 'Valid payload text'
    });
  }, /cannot masquerade as CAPTURED_OFFICIAL/);
});

console.log('\n=== Parser Test Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log(`ALL ${passCount} STRICT DISCRETE & AGGREGATOR PARSER TESTS PASSED (100% OK)`);
}
