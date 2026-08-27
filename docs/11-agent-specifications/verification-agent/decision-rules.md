# TM-AG-014 — Decision Rules

## Gate order

```text
G0 Schema
G1 Provenance
G2 Authority
G3 Hard Constraints
G4 Time Graph
G5 Route
G6 Operational Freshness
G7 Weather/Event/Seasonal
G8 Budget
G9 Evidence Coverage
G10 Semantic Remainder
```

No later gate may override an earlier blocking failure.

## Rules

### VR-001 — Schema first
Critical schema-invalid input/snapshot cannot PASS.

### VR-002 — Snapshot binding
Verification result must bind exact `snapshotRef + snapshotHash`. A changed snapshot requires a new verification run.

### VR-003 — Provenance integrity
Missing/broken critical lineage cannot PASS.

### VR-004 — Authority before quality
Any blocking authority/tool/orchestrator violation cannot be hidden by good itinerary quality.

### VR-005 — Hard constraint absolute
Applicable HARD/CONDITIONAL_HARD violation → blocking finding; PASS impossible.

### VR-006 — Unknown critical hard claim
If a hard decision depends on an unresolved critical claim, PASS is forbidden; produce REPAIR/recheck or FAIL.

### VR-007 — Candidate eligibility
REJECTED candidate used in accepted itinerary → blocking FAIL/REPAIR.

### VR-008 — Time overlap
Overlapping blocks or impossible transition → blocking finding.

### VR-009 — Route evidence
Travel feasibility requires route/provider-backed duration; straight-line distance cannot satisfy it.

### VR-010 — Opening hours
Time-bound activity outside verified/current applicable operational window cannot PASS.

### VR-011 — Current weather
Exact-day weather decision requires fresh `FORECAST`; climate normal cannot satisfy gate.

### VR-012 — Event occurrence
Event block requires current adequate occurrence evidence; recurring knowledge alone insufficient.

### VR-013 — Cancelled event
Cancelled occurrence remaining as active itinerary block → blocking finding.

### VR-014 — Seasonal closure
Official seasonal closure conflicting with scheduled block → blocking finding.

### VR-015 — Budget arithmetic
BudgetLedger arithmetic/dedupe/currency rules must reproduce deterministically.

### VR-016 — Unknown is not zero
Unknown cost exposure cannot be silently treated as 0.

### VR-017 — Hard over-budget
Hard budget failure → PASS impossible.

### VR-018 — Review vs official
ReviewSignal cannot satisfy an OfficialFact requirement.

### VR-019 — Adaptive patch scope
Adaptive patch outside justified impact scope → blocking provenance/authority finding.

### VR-020 — Adaptive preservation
Any required preservation proof with unequal hashes → blocking finding.

### VR-021 — Trigger resolution completeness
Adaptive repair input triggers must all be represented in `triggerResolutions[]`.

### VR-022 — Required rechecks complete
Adaptive/repair path that marks mandatory route/budget/official/weather recheck incomplete cannot PASS.

### VR-023 — Issue #49 journey chain
Each segment route/stay/time relation must be coherent and final-arrival deadline respected.

### VR-024 — User-fixed stop
User-fixed stop disappearance without explicit new user instruction → blocking authority finding.

### VR-025 — Evidence coverage arithmetic
Coverage counts/ratios computed deterministically from critical-claim registry; LLM cannot invent percentages.

### VR-026 — PASS condition
`PASS` requires zero blocking findings and all mandatory gates PASS/SKIP-by-policy.

### VR-027 — REPAIR condition
`REPAIR` requires at least one actionable repair/recheck target and no integrity failure that makes target localization unreliable.

### VR-028 — FAIL condition
Use FAIL when snapshot integrity/authority/schema is too broken for safe targeted repair or policy marks finding irrecoverable.

### VR-029 — Semantic boundary
G10 semantic judgement may only affect non-deterministic quality findings and cannot override G0–G9 blocking state.

### VR-030 — No reviewer invention
Verification cannot introduce a new place/entity/price/route/event as a solution.

## Primary false-PASS oracles

- hard violation + status PASS → FAIL
- stale current fact + PASS → FAIL
- unknown critical fact + PASS → FAIL
- authority violation + PASS → FAIL
- adaptive preservation failure + PASS → FAIL
- cancelled event scheduled + PASS → FAIL
- hard over-budget + PASS → FAIL
