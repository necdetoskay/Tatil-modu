# TM-AG-016 — Evaluation Rubric

## R0 Contract
- FinalTravelPlan schema valid
- verification/snapshot/render refs present

## R1 Deterministic render integrity
Required PASS:
- Verification PASS input
- snapshot hashes match
- entity subset valid
- claim subset valid
- changedVerifiedValueCount=0
- missingMandatoryWarningCount=0
- unsupported entity/claim counts=0
- no fake alternatives
- uncertainty/claim-family semantics preserved

## R2 Fixture
Recorded verified packages render exact expected sections/bindings.

## R3 Integration
- schema validator
- render-binding/value-preservation validator

## R4 Semantic presentation quality
Score 1–5:
- readability
- information hierarchy
- useful day-by-day formatting
- concise but adequate warnings
- explanation placement

R4 cannot override R1.

## R5 Adversarial
- add attractive new POI
- fabricate missing third alternative
- drop mandatory warning
- alter verified time/price
- estimate→exact
- recurring event→confirmed
- climate→forecast
- review→official
- explanation snapshot mismatch

## R6 Authority
Any external-world tool call, new recommendation or planning decision → FAIL.

## R7 Live
Only as terminal stage of live E2E verified pipeline.

## R8 Regression
Every final-render hallucination, value drift, warning omission or snapshot mismatch becomes regression fixture.

## Golden thresholds

```yaml
R0: PASS
R1: PASS
R2: 100% expected assertions
R5: PASS
R6: PASS
unsupported_entity_refs: 0
unsupported_claim_refs: 0
changed_verified_values: 0
missing_mandatory_warnings: 0
snapshot_match: true
```
