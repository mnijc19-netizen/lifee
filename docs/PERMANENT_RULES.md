# Lifee Permanent Engineering Constitution (RULE-73 ~ RULE-76)

## RULE-73 Prompt Completeness Gate
All long engineering instruction prompts must include:
* `PROMPT_ID`
* `VERSION`
* `START marker` (e.g. `=== LIFEE_RECOVERY_R1_START ===`)
* `END marker` (e.g. `=== LIFEE_RECOVERY_R1_END ===`)

If any of these 4 elements are missing, the agent/system must immediately halt execution and return `INCOMPLETE_PROMPT` without guessing or extrapolating missing text.

## RULE-74 Previously Corrected Facts Must Be Regression-Locked
Once an independent reviewer confirms a factual error and establishes verified ground truth:
* The fix must strictly prevent regression to the old misconception.
* The verified ground truth must be locked with a dedicated automated regression test (`REG-NZ-FORKLIFT-721311` etc.).
* Attempting to re-ingest the incorrect fact (e.g. Forklift Driver code `721211`) must explicitly throw or fail tests.

## RULE-75 Passing Tests Do Not Prove Factual Correctness
A passing test suite only proves that the code matches the assertions inside the test; it does NOT prove the test fixture itself is truthful or accurate.
Therefore:
* All high-impact policy fixtures must carry complete source provenance metadata:
  * `sourceUrl`
  * `sourceTitle`
  * `retrievedAt`
  * `effectiveAt`
  * `evidenceExcerpt`
* If a fixture is an artificially altered mutation variant, it must be explicitly marked:
  * `syntheticMutation: true`
  * `mutationDescription: "..."`
  to prevent future builders or reviewers from mistaking test variants for real statutory law.

## RULE-76 Builder Classification Is Not Independent Approval
Labels in builder reports such as `SAFE_TO_KEEP`, `PASS`, and `VALIDATED` represent the builder's self-assessment only. They cannot be used to declare a batch "approved" or "completed". Only an explicit `APPROVED` ruling from an independent reviewer fulfills the gate.

## RULE-77 Provenance Excerpt Verifiability
Provenance metadata must prove that `evidenceExcerpt` genuinely exists in the fetched raw source payload. Simply providing a `sourceUrl` does not constitute valid Provenance. The excerpt must be an exact verbatim substring of the raw payload.

## RULE-78 Missing Evidence Yields UNKNOWN/null (No Binary Speculation)
When evidence is not found in the payload, the field must strictly be set to `UNKNOWN` or `null`. A parser must NEVER deduce `true` because "no negation sentence was found", nor deduce `false` because "no affirmative sentence was found".

## RULE-79 Single Source Domain Boundary & Dedicated Adapters
A single official source page can only prove the facts it actually contains. Different policy domains (e.g. Opportunity Card vs Vocational Training, AEWV vs Minimum Wage vs Median Wage vs Forklift rules) must be collected via dedicated adapters and then unified via an Aggregator.

## RULE-80 Explicit Demarcation of Synthetic Fixtures
Manually written or altered test fixtures must be explicitly flagged with `fixtureType: 'SYNTHETIC_MUTATION'` and `syntheticMutation: true`. They must never masquerade as `CAPTURED_OFFICIAL` fixtures.

## RULE-81 Official Source Supremacy Over Outdated Fixtures
When a test fixture conflicts with current official statutory sources, the current official source takes absolute priority and the fixture must be refreshed to reflect current law.

## RULE-82 Zero Parallel Hardcoded Policy Constants in Pipelines
Once `LIVE_DATA` enters the system, the Collector, scoring engine, and UI must consume dynamic extracted facts rather than maintaining parallel hardcoded benchmarks (e.g. obsolete 23.15, 31.61, 1150).

## RULE-83 Release Authenticity Gate
Any report name, release year, or dataset version must verify that the official agency has genuinely published it. Fabricating future or non-existent releases (e.g. fabricating 2026 releases when only 2025 exists) is strictly prohibited.

## RULE-84 Multi-Source Aggregation Preserves Atomic Fact Provenance
Facts collected across multiple official pages must be ingested separately, preserving individual `sourceUrl`, `retrievedAt`, `sourcePublishedAt`/`effectiveAt`, and `evidenceExcerpt` per fact, before being combined in an Aggregator.

## RULE-85 Zero Business Default Constants on Missing Fields
When a required or optional field cannot be extracted from the source content, the parser must return `null`, `UNKNOWN`, or `PARTIAL`. Defaulting to business assumptions (e.g. defaulting experience to 3 years) is strictly prohibited.
