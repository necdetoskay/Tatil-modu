# TM-AG-013 — Decision Rules

## Deterministic decision order

```text
1. Trigger validity / freshness
2. Direct impact refs
3. Dependency closure
4. Minimal repair scope
5. Protected user-fixed refs
6. Hard constraint feasibility
7. Time/route/stay feasibility
8. Replacement candidate eligibility/freshness
9. Patch generation
10. Preservation proof
11. Downstream rechecks
12. Semantic quality among feasible repairs
```

## Rules

### AR-001 — Invalid trigger cannot mutate
`verificationStatus=UNKNOWN/CONFLICTING` critical trigger cannot directly cause irreversible plan mutation unless policy explicitly permits caution-only repair.

### AR-002 — Direct impact first
Repair begins with `affectedRefHints` plus deterministic dependency expansion; whole day/itinerary is not default scope.

### AR-003 — Minimal scope
Choose the smallest scope that can restore all applicable invariants.

### AR-004 — Escalation provenance
If `finalScope > initialScope`, reason/evidence/dependency refs are mandatory.

### AR-005 — Protected user-fixed refs
Protected refs cannot be removed/replaced without explicit new user instruction. Infeasible protected ref → `BLOCKED/PARTIAL`.

### AR-006 — Hard constraints immutable
Repair cannot downgrade, delete or reinterpret hard/conditional-hard constraints.

### AR-007 — No unrelated mutation
Any changed ref outside final impact scope → FAIL unless newly justified dependency is recorded.

### AR-008 — Replacement eligibility
`REJECTED` candidate cannot be inserted. `NEEDS_VERIFICATION` hard-blocking candidate cannot be treated as accepted.

### AR-009 — Route feasibility
Replacement that changes location/order requires route fact/recheck; duration cannot be invented.

### AR-010 — Time feasibility
Patched blocks cannot overlap and must satisfy transition + buffer rules shared with TM-AG-009.

### AR-011 — Opening/operation window
Replacement activity/stay/event must be compatible with current applicable operational evidence.

### AR-012 — Weather trigger
Only fresh FORECAST/current weather evidence may cause exact-day weather repair. Climate normal alone cannot.

### AR-013 — Event trigger
RecurringEventKnowledge cannot establish exact occurrence cancellation/postponement/confirmation. EventOccurrence/OfficialFact evidence is required.

### AR-014 — Event SEEK
Cancelled event sought by user is replaced locally where feasible with same/related experience; broader date move requires explicit feasibility and scope escalation.

### AR-015 — Event AVOID
Current event/crowd signal may shift affected venue/window; unrelated destination days remain protected.

### AR-016 — Budget repair
Budget overflow repair targets cost-driving refs. Revised itinerary must request `BUDGET_RECHECK` and `VERIFICATION_RECHECK`.

### AR-017 — Accommodation failure
Unavailable overnight stay first repairs stay + dependent arrival/departure/route blocks; preceding unrelated full-day plan remains protected where feasible.

### AR-018 — Route disruption
Only route-dependent downstream blocks are in dependency closure. Unrelated prior blocks are not automatically re-planned.

### AR-019 — Preservation proof
Every `protectedUnchangedDayRef` requires before/after hash equality proof.

### AR-020 — Patch provenance
Every patch has trigger refs and reason codes; domain-fact-driven patches also carry evidence refs.

### AR-021 — No safe replacement
If no valid replacement exists, return `PARTIAL/BLOCKED`; do not invent candidate/fact.

### AR-022 — Verification mandatory
Any `REPAIRED` or `PARTIAL` mutation must include required `VERIFICATION_RECHECK`.

### AR-023 — No-change path
If trigger does not invalidate any current plan invariant or policy objective materially, return `NO_CHANGE_REQUIRED` with zero patches.

### AR-024 — Full itinerary threshold
`FULL_ITINERARY` repair is exceptional and requires global dependency evidence; “better plan available” is not sufficient.

## Primary R1 oracles

- protected hash changed → FAIL
- hard constraint missing after repair → FAIL
- patch outside impact scope → FAIL
- escalation missing reason/evidence → FAIL
- climate-normal exact repair trigger → FAIL
- recurring event memory used as cancellation fact → FAIL
- repaired plan without Verification recheck → FAIL
