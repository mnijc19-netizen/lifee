# Lifee Known Issues & Defect Tracker

| ID | Severity | Category | Description | Root Cause | Status | Resolution |
|---|---|---|---|---|---|---|
| ISS-01 | P0 | Security | BYOK API Key claimed to be encrypted | Stored in plaintext localStorage | RESOLVED | Corrected UI label to '本地明文持久化存储 (BYOK)' |
| ISS-02 | P1 | Pipeline | Parallel constants in collector.mjs (23.15, 31.61, 1150) | Legacy fallback dictionary in collector | RESOLVED | Purged parallel constants; extractedFacts dynamically formatted from parser output |
| ISS-03 | P1 | Truth | Germany Ausbildung claimed to be completely free of blocked account | Misinterpretation of subsistence gap rule | RESOLVED | Enforced structured Ausbildung facts: company gross €1,048, net €822, school net €959, supplemental proof required if allowance is insufficient |
| ISS-04 | P1 | Truth | NZ AEWV defaulted to 3 years experience | Conflated general AEWV (2 yrs) with ANZSCO 4-5 roles | RESOLVED | General AEWV set to 2 years experience OR NZQCF Level 4; 3 years isolated to skill level rules |
| ISS-05 | P1 | Truth | NZ Minimum Wage and Median Wage outdated | Used obsolete $23.15 and $31.61 | RESOLVED | Updated to official $23.95 (effective 1 Apr 2026) and $35.00 (effective 9 Mar 2026); obsolete values rejected via regression tests |
| ISS-06 | P1 | Truth | NZ Forklift Driver used obsolete ANZSCO 721211 | Old ANZSCO version | RESOLVED | Updated to official ANZSCO 721311; obsolete 721211 rejected via REG-NZ-FORKLIFT-721311 |
| ISS-07 | P1 | Truth | JSA used fabricated 2026 release year | Anticipated release before official publication | RESOLVED | Standardized on official 2025 Occupation Shortage List (OSL); Electrician S, Software Engineer NS; fabricated 2026 rejected |
| ISS-08 | P2 | Architecture | Monolithic parsers conflated separate policy pages | Lack of discrete adapters | RESOLVED | Split into 6 discrete adapters + 2 composite aggregators + JSA 2025 OSL parser |
| ISS-09 | P2 | Testing | Fixtures lacked verbatim substring verification | RULE-77 missing in rulesRegistry | RESOLVED | Added validateCapturedFixture and validateSyntheticFixture enforcing verbatim excerpt substring and sha256 |
| ISS-10 | P0 | Truth | Obsolete NZ wage benchmarks in production pathways and bundled research engine | Incomplete purge of legacy constants outside collector | RESOLVED | Updated `pathways.ts` to $23.95 / $35.00 and `researchEngine.ts` to $35.00; obsolete values purged |
| ISS-11 | P0 | Truth | Unconditional "免自保金" claims in `intelligence.ts` and `aiAdvisor.ts` | Conflation of allowance sufficiency rule | RESOLVED | Clarified that blocked account is only waived if allowance covers subsistence threshold (€1,048 gross / €822 net), otherwise supplemental proof is mandatory |
| ISS-12 | P1 | Pipeline | nzForkliftParser silently defaulted missing stay/IELTS to 3 and 4.0 | Fallback ternary in parser | RESOLVED | Missing stay/IELTS now evaluate to null per RULE-78 |
| ISS-13 | P1 | Pipeline | inzParser aggregator used fallback defaults (?? 23.95, ?? 35.00) on child parser failure | Aggregator nullish coalescing defaults | RESOLVED | Removed fallback constants; missing child facts evaluate to null per RULE-84/85 |
| ISS-14 | P2 | Testing | REG-82 only audited collector.mjs, missing production src/ | Shallow regression test | RESOLVED | Expanded REG-82 in `test_system.mjs` to audit entire codebase across `src/` and `scripts/` |
