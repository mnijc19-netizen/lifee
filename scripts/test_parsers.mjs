import assert from 'assert';
import { parseMakeItGermany } from './parsers/makeItGermanyParser.mjs';
import { parseInz } from './parsers/inzParser.mjs';
import { parseJsa } from './parsers/jsaParser.mjs';

console.log('=== [RULE-28] 5-Fixture Category Parser Test Suite ===');

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
  <p>For vocational training (Ausbildung): Ausbildungsbetrieb zahlt eine monatliche Vergütung. Bei ausreichender Ausbildungsvergütung ist kein Sperrkonto erforderlich.</p>
  <p>German language proficiency at level B1 is required.</p>
</body>
</html>
`;

// 1.1 Positive fixture
runTest('DE Parser: 1. Positive Fixture extracts exact figures and provenance', () => {
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
  assert.strictEqual(parsed.normalizedFacts.ausbildung.stipendExemptionSperrkonto, true);
  assert.strictEqual(parsed.normalizedFacts.ausbildung.minLanguageLevel, 'B1');
});

// 1.2 Mutation fixture (RULE-27: Output MUST mutate when input changes)
runTest('DE Parser: 2. Mutation Fixture alters output when HTML numbers change', () => {
  const mutatedHtml = VALID_GERMANY_HTML
    .replace('€1,091 per month', '€1,234 per month')
    .replace('€13,092 for the full', '€14,808 for the full')
    .replace('up to 20 hours per week', 'up to 25 hours per week');
  
  const parsed = parseMakeItGermany(mutatedHtml);
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.monthlyBlockedFundsEur.value, 1234, 'Monthly funds must be 1234, not hardcoded 1091');
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.annualBlockedFundsEur.value, 14808, 'Annual funds must be 14808, not hardcoded 13092');
  assert.strictEqual(parsed.normalizedFacts.opportunityCard.partTimeWorkAllowedHoursWeekly.value, 25, 'Part time hours must be 25');
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
console.log('\n--- INZ Parser (5 Categories) ---');

const VALID_INZ_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Accredited Employer Work Visa | Immigration New Zealand</title>
  <meta name="date" content="2026-07-28" />
</head>
<body>
  <h1>Accredited Employer Work Visa</h1>
  <p>You must be paid at least the median wage of $31.61 an hour unless your role is on an exempt list.</p>
  <p>For skill level 4-5 roles: The maximum continuous stay for ANZSCO skill level 4 and 5 roles is limited to 3 years.</p>
  <p>Applicants for ANZSCO level 4 and 5 roles must meet an English language requirement of IELTS 4.0 or equivalent.</p>
  <p>Most level 4 and 5 roles do not have direct pathway under the Green List.</p>
</body>
</html>
`;

// 2.1 Positive fixture
runTest('INZ Parser: 1. Positive Fixture extracts wage threshold, stay limit and IELTS', () => {
  const parsed = parseInz(VALID_INZ_HTML);
  assert.strictEqual(parsed.sourceId, 'src-inz-gov');
  assert.strictEqual(parsed.sourcePublishedAt, '2026-07-28');

  const wage = parsed.normalizedFacts.aewv.aewv_general_median_wage_requirement;
  assert.strictEqual(wage.value, 31.61);
  assert.strictEqual(wage.unit, 'NZD/hour');
  assert.ok(wage.evidenceText.includes('31.61'));

  const stay = parsed.normalizedFacts.anzscoLevel45Restrictions.maxContinuousStayYears;
  assert.strictEqual(stay.value, 3);
  assert.strictEqual(stay.unit, 'years');

  const ielts = parsed.normalizedFacts.anzscoLevel45Restrictions.minEnglishIelts;
  assert.strictEqual(ielts.value, 4.0);
});

// 2.2 Mutation fixture (RULE-27)
runTest('INZ Parser: 2. Mutation Fixture alters output when wage and stay values change', () => {
  const mutatedHtml = VALID_INZ_HTML
    .replace('$31.61 an hour', '$35.50 an hour')
    .replace('limited to 3 years', 'limited to 4 years')
    .replace('IELTS 4.0', 'IELTS 5.0');

  const parsed = parseInz(mutatedHtml);
  assert.strictEqual(parsed.normalizedFacts.aewv.aewv_general_median_wage_requirement.value, 35.50, 'Wage must be 35.50, not hardcoded 31.61');
  assert.strictEqual(parsed.normalizedFacts.anzscoLevel45Restrictions.maxContinuousStayYears.value, 4, 'Stay must be 4, not hardcoded 3');
  assert.strictEqual(parsed.normalizedFacts.anzscoLevel45Restrictions.minEnglishIelts.value, 5.0, 'IELTS must be 5.0');
});

// 2.3 Missing-field fixture
runTest('INZ Parser: 3. Missing-field Fixture throws error when wage threshold omitted', () => {
  const missingHtml = `
    <html><head><title>Accredited Employer Work Visa</title></head>
    <body><p>General visa conditions without any wage information mentioned.</p></body>
    </html>
  `;
  assert.throws(() => {
    parseInz(missingHtml);
  }, /aewv_general_median_wage_requirement/);
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
  const invalidHtml = VALID_INZ_HTML.replace('$31.61 an hour', '$FREE an hour');
  assert.throws(() => {
    parseInz(invalidHtml);
  }, /aewv_general_median_wage_requirement/);
});

// -------------------------------------------------------------
// 3. Jobs and Skills Australia (JSA) Parser Tests
// -------------------------------------------------------------
console.log('\n--- JSA Parser (5 Categories & Rules 40-41) ---');

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

// 3.2 Mutation fixture (RULE-27)
runTest('JSA Parser: 2. Mutation Fixture toggles shortage when rating changes to No Shortage', () => {
  const mutatedData = VALID_JSA_DATASET
    .replace('Software Engineer - National Shortage (S)', 'Software Engineer - No Shortage (NS)');

  const parsed = parseJsa(mutatedData);
  const soft = parsed.normalizedFacts.monitoredShortages.software_engineer_261313;
  assert.strictEqual(soft.labour_market_status.nationalShortage, false, 'Software engineer shortage must be FALSE on NS');
  assert.strictEqual(soft.nationalShortage, false);

  // Electrician should still be true
  const elec = parsed.normalizedFacts.monitoredShortages.electrician_341111;
  assert.strictEqual(elec.nationalShortage, true);
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
// Summary
// -------------------------------------------------------------
console.log('\n=== Parser Test Summary ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL 15 PARSER FIXTURE TESTS PASSED (100% OK)');
}
