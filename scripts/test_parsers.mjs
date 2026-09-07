import assert from 'assert';
import { parseMakeItGermany } from './parsers/makeItGermanyParser.mjs';
import { parseInz } from './parsers/inzParser.mjs';
import { parseJsa } from './parsers/jsaParser.mjs';
import { validateFixtureProvenance } from './rulesRegistry.mjs';

console.log('=== [RULE-28 & RULE-75] 5-Fixture Category Parser Test Suite with Provenance ===');

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

// -------------------------------------------------------------
// 1. Make it in Germany Parser Tests
// -------------------------------------------------------------
console.log('\n--- Make it in Germany Parser (5 Categories) ---');

const VALID_GERMANY_METADATA = {
  sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card',
  sourceTitle: 'Opportunity Card for Job Search - Make it in Germany',
  retrievedAt: '2026-08-15T10:00:00.000Z',
  effectiveAt: '2026-01-01',
  evidenceExcerpt: 'For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account. The training company pays a monthly gross training allowance (Ausbildungsvergütung) of at least €950 to €1,350 per month (approx. €760 net).'
};

const MUTATED_GERMANY_METADATA = {
  ...VALID_GERMANY_METADATA,
  syntheticMutation: true,
  mutationDescription: 'Alters €1,091->€1,234, €13,092->€14,808, 20h->25h, €950-1350->€1050-1450, net €760->€840, B1->B2'
};

const VALID_GERMANY_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Opportunity Card for Job Search - Make it in Germany</title>
  <meta name="date" content="2026-08-15" />
</head>
<body>
  <h1>Opportunity card for looking for a job</h1>
  <p>For the year 2026, you must prove financial means of at least €1,091 per month (€13,092 for the full 12-month period) in a blocked account.</p>
  <p>You can also work in secondary employment for up to 20 hours per week during your job search.</p>
  <p>For vocational training (Ausbildung): The training company pays a monthly gross training allowance (Ausbildungsvergütung) of at least €950 to €1,350 per month (approx. €760 net). If the training allowance is insufficient to cover living costs, supplemental proof of financial means (blocked account) is required. German language proficiency at level B1 is required.</p>
</body>
</html>
`;

// 1.1 Positive fixture
runTest('DE Parser: 1. Positive Fixture extracts exact figures, structured Ausbildung and provenance', () => {
  validateFixtureProvenance(VALID_GERMANY_METADATA);
  const parsed = parseMakeItGermany(VALID_GERMANY_HTML);
  assert.strictEqual(parsed.sourceId, 'src-make-it-germany');
  assert.strictEqual(parsed.sourcePublishedAt, '2026-08-15');
  
  const monthly = parsed.normalizedFacts.opportunityCard.monthlyBlockedFundsEur;
  assert.strictEqual(monthly.value, 1091);
  assert.strictEqual(monthly.unit, 'EUR/month');
  assert.strictEqual(monthly.sourceId, 'src-make-it-germany');
  assert.ok(monthly.evidenceText.includes('1,091'));

  const annual = parsed.normalizedFacts.opportunityCard.annualBlockedFundsEur;
  assert.strictEqual(annual.value, 13092);

  assert.strictEqual(parsed.normalizedFacts.opportunityCard.partTimeWorkAllowedHoursWeekly.value, 20);
  
  // Structured Ausbildung checks
  const ausb = parsed.normalizedFacts.ausbildung;
  assert.strictEqual(ausb.companyBasedMinimumGross.min, 950);
  assert.strictEqual(ausb.companyBasedMinimumGross.max, 1350);
  assert.strictEqual(ausb.minimumNet.value, 760);
  assert.strictEqual(ausb.supplementalProofRequiredWhenInsufficient.required, true);
  assert.strictEqual(ausb.languageRequirement.level, 'B1');
  assert.ok(ausb.sourceEvidence.includes('Ausbildung'));
});

// 1.2 Mutation fixture (RULE-27: Output MUST mutate when input changes, no hardcoded constants)
runTest('DE Parser: 2. Mutation Fixture alters output when HTML numbers change', () => {
  validateFixtureProvenance(MUTATED_GERMANY_METADATA);
  const mutatedHtml = VALID_GERMANY_HTML
    .replace('€1,091 per month', '€1,234 per month')
    .replace('€13,092 for the full', '€14,808 for the full')
    .replace('up to 20 hours per week', 'up to 25 hours per week')
    .replace('€950 to €1,350 per month', '€1,050 to €1,450 per month')
    .replace('approx. €760 net', 'approx. €840 net')
    .replace('level B1', 'level B2');
  
  const parsed = parseMakeItGermany(mutatedHtml);
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.monthlyBlockedFundsEur.value, 1234, 'Monthly funds must be 1234, not hardcoded 1091');
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.annualBlockedFundsEur.value, 14808, 'Annual funds must be 14808, not hardcoded 13092');
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.partTimeWorkAllowedHoursWeekly.value, 25, 'Part time hours must be 25');
  assert.strictEqual(parsed.normalizedFacts.ausbildung.companyBasedMinimumGross.min, 1050, 'Ausbildung min gross must be 1050');
  assert.strictEqual(parsed.normalizedFacts.ausbildung.companyBasedMinimumGross.max, 1450, 'Ausbildung max gross must be 1450');
  assert.strictEqual(parsed.normalizedFacts.ausbildung.minimumNet.value, 840, 'Ausbildung net must be 840');
  assert.strictEqual(parsed.normalizedFacts.ausbildung.languageRequirement.level, 'B2', 'Language must be B2');
});

// 1.3 Missing-field fixture (throws when required field absent)
runTest('DE Parser: 3. Missing-field Fixture throws error when monthly funds omitted', () => {
  const missingHtml = `
    <html><head><title>Opportunity Card</title></head>
    <body><p>General information without financial amounts.</p></body>
    </html>
  `;
  assert.throws(() => {
    parseMakeItGermany(missingHtml);
  }, /monthlyBlockedFundsEur/);
});

// 1.4 Malformed fixture (502 Bad Gateway)
runTest('DE Parser: 4. Malformed Fixture throws on HTTP 502 / Gateway error pages', () => {
  const errorHtml = `
    <html><head><title>502 Bad Gateway</title></head>
    <body><center><h1>502 Bad Gateway</h1></center></body></html>
  `;
  assert.throws(() => {
    parseMakeItGermany(errorHtml);
  }, /error or gateway page/);
});

// 1.5 Contradictory / Invalid format fixture
runTest('DE Parser: 5. Contradictory / Invalid format throws error', () => {
  const invalidHtml = VALID_GERMANY_HTML.replace('€1,091 per month', '€INVALID per month');
  assert.throws(() => {
    parseMakeItGermany(invalidHtml);
  }, /monthlyBlockedFundsEur/);
});

// -------------------------------------------------------------
// 2. Immigration New Zealand (INZ) Parser Tests
// -------------------------------------------------------------
console.log('\n--- INZ Parser (5 Categories & 6-Concept Segregation) ---');

const VALID_INZ_METADATA = {
  sourceUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
  sourceTitle: 'Accredited Employer Work Visa | Immigration New Zealand',
  retrievedAt: '2026-07-28T09:00:00.000Z',
  effectiveAt: '2026-04-01',
  evidenceExcerpt: 'Employers must pay at least the legal minimum wage of $23.15 per hour... median wage of $31.61 an hour is used for Skilled Migrant Category (SMC) points... ANZSCO 721311 Forklift Driver... stay for ANZSCO skill level 4 and 5 roles is limited to 3 years... IELTS 4.0'
};

const MUTATED_INZ_METADATA = {
  ...VALID_INZ_METADATA,
  syntheticMutation: true,
  mutationDescription: 'Alters minimum wage $23.15->$24.50, median wage $31.61->$34.00, experience 3->4 yrs, stay 3->2 yrs, IELTS 4.0->5.5'
};

const VALID_INZ_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Accredited Employer Work Visa | Immigration New Zealand</title>
  <meta name="date" content="2026-07-28" />
</head>
<body>
  <h1>Accredited Employer Work Visa</h1>
  <p>Employers must pay at least the legal minimum wage of $23.15 per hour and ensure pay meets the market rate for the role so overseas workers are not exploited.</p>
  <p>Note on median wage: The median wage of $31.61 an hour is used for Skilled Migrant Category (SMC) points, Green List and residence pathways, not as a general AEWV minimum threshold.</p>
  <p>Applicants must have at least 3 years of relevant work experience or equivalent NZQF Level 4 qualification.</p>
  <p>For skill level 4-5 roles (such as ANZSCO 721311 Forklift Driver): The maximum continuous stay for ANZSCO skill level 4 and 5 roles is limited to 3 years.</p>
  <p>Applicants for ANZSCO level 4 and 5 roles must meet an English language requirement of IELTS 4.0 or equivalent.</p>
  <p>Roles at skill level 4-5 do not have direct pathway under the Green List.</p>
</body>
</html>
`;

// 2.1 Positive fixture
runTest('INZ Parser: 1. Positive Fixture extracts 6 distinct dimensions & Forklift Driver 721311', () => {
  validateFixtureProvenance(VALID_INZ_METADATA);
  const parsed = parseInz(VALID_INZ_HTML);
  assert.strictEqual(parsed.sourceId, 'src-inz-gov');
  assert.strictEqual(parsed.sourcePublishedAt, '2026-07-28');

  // 1. Minimum wage
  const minWage = parsed.normalizedFacts.generalAewvPayRequirement.legalMinimumWageNzd;
  assert.strictEqual(minWage.value, 23.15);
  assert.strictEqual(minWage.unit, 'NZD/hour');

  // 2. Median wage in other settings
  const medWage = parsed.normalizedFacts.medianWageUsedInOtherMigrationSettings;
  assert.strictEqual(medWage.value, 31.61);
  assert.ok(medWage.scopeOfApplication.includes('NOT general AEWV'));

  // 3. Experience requirements
  assert.strictEqual(parsed.normalizedFacts.experienceRequirements.minRelevantExperienceYears, 3);

  // 4. Skill level rules
  const stay = parsed.normalizedFacts.skillLevelRules.maxContinuousStayYears;
  assert.strictEqual(stay.value, 3);
  assert.strictEqual(stay.unit, 'years');

  const ielts = parsed.normalizedFacts.skillLevelRules.minEnglishIelts;
  assert.strictEqual(ielts.value, 4.0);

  // 5. Forklift Driver code validation (REG-NZ-FORKLIFT-721311)
  const forklift = parsed.normalizedFacts.monitoredOccupationForkliftDriver;
  assert.strictEqual(forklift.occupationName, 'Forklift Driver');
  assert.strictEqual(forklift.officialAnzscoCode, '721311');
  assert.strictEqual(forklift.baselineSkillLevel, 4);
  assert.strictEqual(forklift.isGreenListEligible, false);
  assert.strictEqual(forklift.skillLevel3ConditionalRule.isAutomaticVisaGrant, false);
});

// 2.2 Mutation fixture (RULE-27: Dynamic changes to minimum wage, median wage, stay and IELTS)
runTest('INZ Parser: 2. Mutation Fixture alters output when wages and stay values change', () => {
  validateFixtureProvenance(MUTATED_INZ_METADATA);
  const mutatedHtml = VALID_INZ_HTML
    .replace('$23.15 per hour', '$24.50 per hour')
    .replace('$31.61 an hour', '$34.00 an hour')
    .replace('3 years of relevant work experience', '4 years of relevant work experience')
    .replace('limited to 3 years', 'limited to 2 years')
    .replace('IELTS 4.0', 'IELTS 5.5');

  const parsed = parseInz(mutatedHtml);
  assert.strictEqual(parsed.normalizedFacts.generalAewvPayRequirement.legalMinimumWageNzd.value, 24.50, 'Min wage must be 24.50, not hardcoded 23.15');
  assert.strictEqual(parsed.normalizedFacts.medianWageUsedInOtherMigrationSettings.value, 34.00, 'Median wage must be 34.00, not hardcoded 31.61');
  assert.strictEqual(parsed.normalizedFacts.experienceRequirements.minRelevantExperienceYears, 4, 'Experience years must be 4');
  assert.strictEqual(parsed.normalizedFacts.skillLevelRules.maxContinuousStayYears.value, 2, 'Stay must be 2, not hardcoded 3');
  assert.strictEqual(parsed.normalizedFacts.skillLevelRules.minEnglishIelts.value, 5.5, 'IELTS must be 5.5');
  assert.strictEqual(parsed.normalizedFacts.monitoredOccupationForkliftDriver.maxContinuousStayYears, 2);
  assert.strictEqual(parsed.normalizedFacts.monitoredOccupationForkliftDriver.minEnglishIelts, 5.5);
});

// 2.3 Missing-field fixture
runTest('INZ Parser: 3. Missing-field Fixture throws error when minimum wage omitted', () => {
  const missingHtml = `
    <html><head><title>Accredited Employer Work Visa</title></head>
    <body><p>General visa conditions without any minimum wage information mentioned.</p></body>
    </html>
  `;
  assert.throws(() => {
    parseInz(missingHtml);
  }, /legal_minimum_wage/);
});

// 2.4 Malformed fixture
runTest('INZ Parser: 4. Malformed Fixture throws on broken / 404 error page', () => {
  const errorHtml = `
    <html><head><title>404 Page Not Found</title></head>
    <body><p>The page you requested could not be found.</p></body></html>
  `;
  assert.throws(() => {
    parseInz(errorHtml);
  }, /error or gateway page/);
});

// 2.5 Contradictory / Invalid format fixture
runTest('INZ Parser: 5. Contradictory / Invalid format throws error', () => {
  const invalidHtml = VALID_INZ_HTML.replace('$23.15 per hour', '$FREE per hour');
  assert.throws(() => {
    parseInz(invalidHtml);
  }, /legal_minimum_wage/);
});

// 2.6 Regression Test: REG-NZ-FORKLIFT-721311 (Obsolete code 721211 must be rejected)
runTest('INZ Parser: 6. Regression REG-NZ-FORKLIFT-721311 (Rejects obsolete ANZSCO 721211)', () => {
  const obsoleteHtml = VALID_INZ_HTML.replace('ANZSCO 721311', 'ANZSCO 721211');
  assert.throws(() => {
    parseInz(obsoleteHtml);
  }, /REG-NZ-FORKLIFT-721311/);
});

// -------------------------------------------------------------
// 3. Jobs and Skills Australia (JSA) Parser Tests
// -------------------------------------------------------------
console.log('\n--- JSA Parser (5 Categories & Rules 40-41) ---');

const VALID_JSA_METADATA = {
  sourceUrl: 'https://www.jobsandskills.gov.au/data/skills-priority-list',
  sourceTitle: 'Skills Priority List (SPL) 2026 - Jobs and Skills Australia',
  retrievedAt: '2026-08-01T08:00:00.000Z',
  effectiveAt: '2026-08-01',
  evidenceExcerpt: 'ANZSCO 341111: Electrician (General) - National Shortage (S)... ANZSCO 261313: Software Engineer - National Shortage (S)... Crucial Legal Distinction: Domestic occupational shortage identifies employer hiring difficulty within Australia, but does not grant automatic visa rights to foreign candidates.'
};

const MUTATED_JSA_METADATA = {
  ...VALID_JSA_METADATA,
  syntheticMutation: true,
  mutationDescription: 'Toggles Software Engineer 261313 shortage bidirectionally between National Shortage (S) and No Shortage (NS)'
};

const VALID_JSA_DATASET = `
Release: 2026-08-01
Jobs and Skills Australia - Skills Priority List (SPL)
ANZSCO 2022/2023 Standard Classification

ANZSCO 341111: Electrician (General) - National Shortage (S)
Rating: National Shortage across NSW, VIC, QLD, WA, SA, TAS, NT, ACT.
Assessing Authority: Trades Recognition Australia (TRA). Requires 4-year apprenticeship or overseas equivalent with trade test.

ANZSCO 261313: Software Engineer - National Shortage (S)
Rating: National Shortage in specialised software engineering domains.
Assessing Authority: Australian Computer Society (ACS). Non-ICT diploma qualifications require 6 years RPL.

Crucial Legal Distinction: Domestic occupational shortage identifies employer hiring difficulty within Australia, but does not grant automatic visa rights to foreign candidates. Overseas candidates must independently qualify for Migration points and pass formal skills assessments.
`;

// 3.1 Positive fixture
runTest('JSA Parser: 1. Positive Fixture extracts shortages with 4-category split', () => {
  validateFixtureProvenance(VALID_JSA_METADATA);
  const parsed = parseJsa(VALID_JSA_DATASET);
  assert.strictEqual(parsed.normalizedFacts.releaseMetadata.agency, 'Jobs and Skills Australia');
  assert.strictEqual(parsed.sourcePublishedAt, '2026-08-01');

  const elec = parsed.normalizedFacts.monitoredShortages.electrician_341111;
  assert.strictEqual(elec.anzscoCode, '341111');
  assert.strictEqual(elec.labour_market_status.nationalShortage, true);
  assert.strictEqual(elec.visa_relevance.isAutomaticVisaGrant, false);
  assert.strictEqual(elec.visa_relevance.assessingAuthorityCode, 'TRA');
  assert.ok(elec.qualification_requirements.overseasExperienceRequirement);
  assert.ok(elec.migration_pathway_status.requiresEmployerSponsor);

  const soft = parsed.normalizedFacts.monitoredShortages.software_engineer_261313;
  assert.strictEqual(soft.anzscoCode, '261313');
  assert.strictEqual(soft.labour_market_status.nationalShortage, true);
  assert.strictEqual(soft.visa_relevance.isAutomaticVisaGrant, false);
  assert.strictEqual(soft.visa_relevance.assessingAuthorityCode, 'ACS');
});

// 3.2 Mutation fixture (RULE-27: Bidirectional mutation test S -> NS and NS -> S)
runTest('JSA Parser: 2. Mutation Fixture toggles shortage bidirectionally (S <-> NS)', () => {
  validateFixtureProvenance(MUTATED_JSA_METADATA);
  // Mutation 1: S -> NS
  const mutatedToNs = VALID_JSA_DATASET
    .replace('Software Engineer - National Shortage (S)', 'Software Engineer - No Shortage (NS)')
    .replace('Rating: National Shortage in specialised', 'Rating: No Shortage in general');

  const parsedNs = parseJsa(mutatedToNs);
  const softNs = parsedNs.normalizedFacts.monitoredShortages.software_engineer_261313;
  assert.strictEqual(softNs.labour_market_status.nationalShortage, false, 'Software engineer shortage must be FALSE on NS');
  assert.strictEqual(softNs.nationalShortage, false);

  // Electrician should still be true
  const elec = parsedNs.normalizedFacts.monitoredShortages.electrician_341111;
  assert.strictEqual(elec.nationalShortage, true);

  // Mutation 2: NS -> S
  const mutatedBackToS = mutatedToNs
    .replace('Software Engineer - No Shortage (NS)', 'Software Engineer - National Shortage (S)')
    .replace('Rating: No Shortage in general', 'Rating: National Shortage in specialised');

  const parsedS = parseJsa(mutatedBackToS);
  const softS = parsedS.normalizedFacts.monitoredShortages.software_engineer_261313;
  assert.strictEqual(softS.labour_market_status.nationalShortage, true, 'Software engineer shortage must be TRUE on S');
  assert.strictEqual(softS.nationalShortage, true);
});

// 3.3 Missing-field fixture (throws when occupation missing)
runTest('JSA Parser: 3. Missing-field Fixture throws error when occupation omitted', () => {
  const missingData = `
    Release: 2026-08-01
    Jobs and Skills Australia - Skills Priority List
    ANZSCO 341111: Electrician (General) - National Shortage (S)
    Rating: National Shortage across Australia.
    Assessing Authority: Trades Recognition Australia (TRA).
    Crucial Legal Distinction: Domestic occupational shortage does not grant automatic visa rights.
  `;
  assert.throws(() => {
    parseJsa(missingData);
  }, /Software Engineer/);
});

// 3.4 Malformed fixture
runTest('JSA Parser: 4. Malformed Fixture throws on 500 server error', () => {
  const errorData = `
    <html><head><title>500 Internal Server Error</title></head>
    <body><h1>Internal Error</h1></body></html>
  `;
  assert.throws(() => {
    parseJsa(errorData);
  }, /error or gateway page/);
});

// 3.5 Contradictory / Truncated payload fixture
runTest('JSA Parser: 5. Contradictory / Empty payload throws error', () => {
  assert.throws(() => {
    parseJsa('too short payload');
  }, /error or gateway page/);
});

// -------------------------------------------------------------
// 4. RULE-75: Fixture Provenance Integrity Guardrails
// -------------------------------------------------------------
console.log('\n--- RULE-75 Fixture Provenance Guardrails ---');

runTest('RULE-75: Throws when high-impact fixture is missing sourceUrl', () => {
  assert.throws(() => {
    validateFixtureProvenance({
      sourceTitle: 'Some title',
      retrievedAt: '2026-09-07',
      effectiveAt: '2026-09-07',
      evidenceExcerpt: 'Some excerpt'
    });
  }, /missing required provenance field "sourceUrl"/);
});

runTest('RULE-75: Throws when synthetic mutation lacks mutationDescription', () => {
  assert.throws(() => {
    validateFixtureProvenance({
      sourceUrl: 'https://example.com',
      sourceTitle: 'Some title',
      retrievedAt: '2026-09-07',
      effectiveAt: '2026-09-07',
      evidenceExcerpt: 'Some excerpt',
      syntheticMutation: true
    });
  }, /must document mutationDescription/);
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n=== Parser Test Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log(`ALL ${passCount} PARSER & PROVENANCE FIXTURE TESTS PASSED (100% OK)`);
}
