/**
 * Lifee Permanent Engineering Constitution & Rules Registry
 * Includes RULE-01 through RULE-76
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
 * Validator function for High-Impact Fixture Provenance according to RULE-75
 */
export function validateFixtureProvenance(fixtureMetadata) {
  if (!fixtureMetadata || typeof fixtureMetadata !== 'object') {
    throw new Error('RULE-75 Violation: Fixture metadata is missing or not an object');
  }

  const requiredFields = ['sourceUrl', 'sourceTitle', 'retrievedAt', 'effectiveAt', 'evidenceExcerpt'];
  for (const field of requiredFields) {
    if (!fixtureMetadata[field] || typeof fixtureMetadata[field] !== 'string' || fixtureMetadata[field].trim() === '') {
      throw new Error(`RULE-75 Violation: High-impact fixture is missing required provenance field "${field}"`);
    }
  }

  if (fixtureMetadata.syntheticMutation === true) {
    if (!fixtureMetadata.mutationDescription) {
      throw new Error('RULE-75 Violation: Synthetic mutation fixture must document mutationDescription');
    }
  }

  return true;
}
