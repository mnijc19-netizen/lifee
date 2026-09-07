import crypto from 'crypto';

/**
 * Lifee Permanent Engineering Constitution & Rules Registry
 * Includes RULE-01 through RULE-85
 */

export const RULES_REGISTRY = {
  'RULE-73': {
    name: 'Prompt Completeness Gate',
    description: 'All long engineering instruction prompts must include PROMPT_ID, VERSION, START marker, and END marker. Missing any marker must immediately halt execution with INCOMPLETE_PROMPT.',
    enforcedSince: '2026-09-07'
  },
  'RULE-74': {
    name: 'Previously Corrected Facts Must Be Regression-Locked',
    description: 'Once an independent reviewer confirms a factual error and establishes the verified truth, fixing it must not re-introduce the old misconception. The fact must be locked by an explicit regression test.',
    enforcedSince: '2026-09-07'
  },
  'RULE-75': {
    name: 'Passing Tests Do Not Prove Factual Correctness',
    description: 'A passing test only proves code satisfies test assertions; it does not prove fixture facts are true. All high-impact policy fixtures must carry complete source provenance (sourceUrl, sourceTitle, retrievedAt, effectiveAt, evidenceExcerpt). Artificial variants must be marked syntheticMutation: true.',
    enforcedSince: '2026-09-07'
  },
  'RULE-76': {
    name: 'Builder Classification Is Not Independent Approval',
    description: 'Labels like SAFE_TO_KEEP, PASS, and VALIDATED in builder reports are self-assessments only. They cannot be treated as final acceptance without independent reviewer approval.',
    enforcedSince: '2026-09-07'
  },
  'RULE-77': {
    name: 'Provenance Excerpt Verifiability',
    description: 'Provenance must prove that evidenceExcerpt genuinely exists in the fetched raw source payload. Simply providing a sourceUrl does not constitute valid Provenance.',
    enforcedSince: '2026-09-07'
  },
  'RULE-78': {
    name: 'Missing Evidence Yields UNKNOWN/null',
    description: 'Unfound evidence must evaluate strictly to UNKNOWN or null. A parser must never deduce true from absent negations, nor false from absent affirmations.',
    enforcedSince: '2026-09-07'
  },
  'RULE-79': {
    name: 'Single Source Domain Boundary & Dedicated Adapters',
    description: 'A single official source page can only prove the facts it actually contains. Different policy domains must be collected via dedicated adapters and then aggregated.',
    enforcedSince: '2026-09-07'
  },
  'RULE-80': {
    name: 'Explicit Demarcation of Synthetic Fixtures',
    description: 'Manually written or mutated fixtures must be marked syntheticMutation: true and must never masquerade as CAPTURED_OFFICIAL.',
    enforcedSince: '2026-09-07'
  },
  'RULE-81': {
    name: 'Official Source Supremacy Over Outdated Fixtures',
    description: 'When a fixture conflicts with current official statutory sources, the current official source takes precedence and the fixture must be updated.',
    enforcedSince: '2026-09-07'
  },
  'RULE-82': {
    name: 'Zero Parallel Hardcoded Policy Constants in Pipelines',
    description: 'Once LIVE_DATA enters the system, the Collector, scoring, and UI must consume dynamic extracted facts rather than maintaining parallel hardcoded benchmarks.',
    enforcedSince: '2026-09-07'
  },
  'RULE-83': {
    name: 'Release Authenticity Gate',
    description: 'Any dataset report name, year, or release version must verify that the official agency has genuinely published it. Fabricating future/unreleased versions is strictly prohibited.',
    enforcedSince: '2026-09-07'
  },
  'RULE-84': {
    name: 'Multi-Source Aggregation Preserves Atomic Fact Provenance',
    description: 'Facts collected across multiple official pages must be ingested separately, preserving individual sourceUrl, retrievedAt, and evidenceExcerpt per fact, before being combined in an Aggregator.',
    enforcedSince: '2026-09-07'
  },
  'RULE-85': {
    name: 'Zero Business Default Constants on Missing Fields',
    description: 'When an expected or optional field cannot be extracted from the source content, the parser must return null, UNKNOWN, or PARTIAL. Defaulting to business assumptions is strictly prohibited.',
    enforcedSince: '2026-09-07'
  }
};

/**
 * Gate function to validate prompt completeness according to RULE-73
 */
export function validatePromptCompleteness(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    return { valid: false, reason: 'Empty or invalid prompt payload' };
  }

  const hasStartMarker = /===\s*[A-Za-z0-9_]+_START\s*===/.test(promptText);
  const hasEndMarker = /===\s*[A-Za-z0-9_]+_END\s*===/.test(promptText);
  const hasPromptId = /PROMPT_ID:\s*[A-Za-z0-9_]+/.test(promptText);
  const hasVersion = /VERSION:\s*[0-9.]+/.test(promptText);

  if (hasStartMarker && hasEndMarker && hasPromptId && hasVersion) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: 'INCOMPLETE_PROMPT',
    details: { hasStartMarker, hasEndMarker, hasPromptId, hasVersion }
  };
}

/**
 * Validator for Captured Official Fixtures according to RULE-77 & RULE-80
 */
export function validateCapturedFixture(fixture) {
  if (!fixture || typeof fixture !== 'object') {
    throw new Error('RULE-77/80 Violation: Captured fixture must be an object');
  }

  if (fixture.fixtureType !== 'CAPTURED_OFFICIAL') {
    throw new Error(`RULE-80 Violation: Official fixture must have fixtureType 'CAPTURED_OFFICIAL', got '${fixture.fixtureType}'`);
  }

  if (fixture.syntheticMutation === true) {
    throw new Error('RULE-80 Violation: Fixture marked syntheticMutation: true cannot masquerade as CAPTURED_OFFICIAL');
  }

  const requiredFields = ['sourceUrl', 'retrievedAt', 'sha256', 'rawPayload', 'evidenceExcerpt'];
  for (const field of requiredFields) {
    if (!fixture[field] || typeof fixture[field] !== 'string' || fixture[field].trim() === '') {
      throw new Error(`RULE-77 Violation: Captured official fixture missing required field "${field}"`);
    }
  }

  // Validate sha256 integrity of raw payload
  const calculatedSha256 = crypto.createHash('sha256').update(fixture.rawPayload).digest('hex');
  if (calculatedSha256 !== fixture.sha256) {
    throw new Error(`RULE-77 Violation: sha256 mismatch for captured fixture. Expected ${fixture.sha256}, calculated ${calculatedSha256}`);
  }

  // Validate that evidenceExcerpt genuinely exists in the raw payload (RULE-77)
  if (!fixture.rawPayload.includes(fixture.evidenceExcerpt)) {
    throw new Error(`RULE-77 Violation: evidenceExcerpt does not exist in rawPayload for source "${fixture.sourceUrl}"`);
  }

  return true;
}

/**
 * Validator for Synthetic Mutation Fixtures according to RULE-80
 */
export function validateSyntheticFixture(fixture) {
  if (!fixture || typeof fixture !== 'object') {
    throw new Error('RULE-80 Violation: Synthetic fixture must be an object');
  }

  if (fixture.syntheticMutation !== true) {
    throw new Error('RULE-80 Violation: Synthetic fixture must explicitly declare syntheticMutation: true');
  }

  if (!fixture.mutationDescription || typeof fixture.mutationDescription !== 'string' || fixture.mutationDescription.trim() === '') {
    throw new Error('RULE-80 Violation: Synthetic fixture must document a clear mutationDescription');
  }

  if (fixture.fixtureType === 'CAPTURED_OFFICIAL' || fixture.isOfficial === true) {
    throw new Error('RULE-80 Violation: Synthetic fixture cannot be labeled as CAPTURED_OFFICIAL or Official');
  }

  return true;
}

/**
 * Validator function for High-Impact Fixture Provenance according to RULE-75 & RULE-77
 */
export function validateFixtureProvenance(fixtureMetadata, rawPayload = null) {
  if (!fixtureMetadata || typeof fixtureMetadata !== 'object') {
    throw new Error('RULE-75 Violation: Fixture metadata is missing or not an object');
  }

  const requiredFields = ['sourceUrl', 'sourceTitle', 'retrievedAt', 'evidenceExcerpt'];
  for (const field of requiredFields) {
    if (!fixtureMetadata[field] || typeof fixtureMetadata[field] !== 'string' || fixtureMetadata[field].trim() === '') {
      throw new Error(`RULE-75 Violation: High-impact fixture is missing required provenance field "${field}"`);
    }
  }

  // RULE-77: If rawPayload is available in fixtureMetadata or passed explicitly, check excerpt existence
  const payload = rawPayload || fixtureMetadata.rawPayload;
  if (payload && typeof payload === 'string') {
    if (!payload.includes(fixtureMetadata.evidenceExcerpt)) {
      throw new Error(`RULE-77 Violation: evidenceExcerpt does not exist in rawPayload for source "${fixtureMetadata.sourceUrl}"`);
    }
  }

  if (fixtureMetadata.syntheticMutation === true) {
    if (!fixtureMetadata.mutationDescription) {
      throw new Error('RULE-75 Violation: Synthetic mutation fixture must document mutationDescription');
    }
    if (fixtureMetadata.fixtureType === 'CAPTURED_OFFICIAL') {
      throw new Error('RULE-80 Violation: Synthetic mutation cannot be labeled CAPTURED_OFFICIAL');
    }
  }

  return true;
}
