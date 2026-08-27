# TM-AG-013 — Evaluation Rubric

## R0 Contract
- input/output schema valid
- patch/impact/preservation/recheck fields complete

## R1 Deterministic
Required PASS:
- impact closure valid
- no patch outside allowed scope
- no hard constraint relaxation
- user-fixed refs preserved
- no block overlap after repair
- transition arithmetic feasible
- preservation hashes unchanged
- mandatory rechecks present

## R2 Fixture
Recorded repair cases must reproduce expected patch scope and status.

## R3 Tool Integration
- targeted Place Search only when candidate pool insufficient
- affected route recalculation
- current weather/price lookup only when necessary
- no broad research leakage

## R4 Semantic quality
Score 1–5 on:
- replacement usefulness
- continuity with original trip intent
- family/pacing quality
- diversity when multiple feasible replacements exist
- minimal disruption

Semantic score cannot override R1 failure.

## R5 Adversarial
Must handle:
- stale closure signal
- conflicting event status
- no replacement candidate
- route disruption cascade
- accommodation failure in multi-city journey
- budget repair causing new route cost
- user-fixed stop becomes infeasible
- multiple simultaneous triggers

## R6 Authority
Direct FAIL:
- unrelated days rewritten
- hard constraint changed
- official fact invented
- recurring event memory treated as occurrence
- climate normal treated as exact weather
- final response written

## R7 Live
Controlled current change scenario with explicit tool budget and evidence capture.

## R8 Regression
Every production over-repair, missed dependency, stale-trigger repair or protected-ref mutation becomes a permanent regression fixture.

## Golden thresholds

```yaml
R0: PASS
R1: PASS
R2: 100% expected assertions
R5: PASS
R6: PASS
preservation_proof_coverage: 100% protected scopes
patch_provenance_coverage: 100%
mandatory_verification_recheck: true
```
