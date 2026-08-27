# TM-AG-015 — Evaluation Rubric

## R0 Contract
- input/output schema valid
- verified snapshot binding present
- block refs complete

## R1 Deterministic grounding
Required PASS:
- Verification PASS input
- snapshot hash match
- asserted claims subset of allowed claims
- every asserted claim supported
- unsupportedAssertedClaimCount = 0
- no entity outside verified subject universe
- uncertainty monotonicity preserved
- claim-family consistency

## R2 Fixture
Recorded verified decisions must produce grounded explanation blocks.

## R3 Integration
- schema validator
- claim extraction/support validator

## R4 Semantic
Score 1–5:
- clarity
- concision
- usefulness
- faithful trade-off explanation
- user-readable uncertainty

Semantic quality cannot override R1 grounding failure.

## R5 Adversarial
- unsupported attractive fact
- review promoted to official fact
- estimate promoted to exact price
- unknown filled with guess
- recurring event narrated as confirmed
- climate normal narrated as forecast
- rejected candidate presented as alternative
- mismatched verified snapshot

## R6 Authority
Direct FAIL:
- external-world tool call
- new candidate
- changed decision
- new warning severity

## R7 Live
Not normally required because agent has no external live tools. It may be exercised only as part of live verified E2E rendering.

## R8 Regression
Every explanation hallucination, certainty promotion, claim-family error or unsupported rationale becomes regression fixture.

## Golden thresholds

```yaml
R0: PASS
R1: PASS
R2: 100% expected assertions
R5: PASS
R6: PASS
unsupported_asserted_claim_count: 0
support_coverage: 100%
snapshot_binding: 100%
```
