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
