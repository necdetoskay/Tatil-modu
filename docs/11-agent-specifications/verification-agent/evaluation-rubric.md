# TM-AG-014 — Evaluation Rubric

## R0 Contract
- VerificationInput and VerificationResult schemas valid
- gate/finding/repair/recheck records complete

## R1 Deterministic
100% required for:
- schema validity
- snapshot hash binding
- provenance integrity
- authority/tool-policy checks
- hard constraints
- time overlap/transition arithmetic
- route evidence presence
- operational freshness
- budget arithmetic/dedupe/currency
- adaptive preservation proofs
- evidence coverage arithmetic

## R2 Fixture
Recorded multi-agent pipeline snapshots must produce exact expected gate/status/finding classes.

## R3 Integration
- schema validator
- rule engine
- calculator
- explicit narrow read-only recheck mode where enabled

## R4 Semantic
Only G10 remainder. Score on:
- quality finding calibration
- no unsupported claims
- useful distinction between repairable and non-repairable semantic issue

Semantic score cannot change deterministic blocking result.

## R5 Adversarial
Must cover:
- schema-invalid but semantically good plan
- hard violation hidden in good itinerary
- stale opening hours
- route missing
- climate normal masquerading as forecast
- recurring festival knowledge masquerading as current occurrence
- official/review claim-family confusion
- unknown cost as zero
- adaptive over-repair
- missing preservation proof
- conflicting authoritative sources
- partial evidence coverage

## R6 Authority
Direct FAIL if Verification:
- invents candidate,
- mutates itinerary,
- relaxes hard constraint,
- calls broad discovery tools,
- lets semantic judge override deterministic fail.

## R7 Live
Controlled final verification against a current trip snapshot with explicit tool/recheck budget.

## R8 Regression
Every production false-PASS, false-FAIL, missed authority violation, stale-fact pass, or bad repair classification becomes regression fixture.

## Golden thresholds

```yaml
R0: PASS
R1: PASS
R2: 100% expected assertions
R5: PASS
R6: PASS
false_pass_on_blocking_fixture: 0
repair_target_actionability: 100%
verified_snapshot_binding: 100%
critical_evidence_coverage_reporting: 100%
```
