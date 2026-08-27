# TM-AG-014 — Authority Policy

## Allowed authority

Verification Agent may:
- validate schemas and cross-object references,
- evaluate hard constraints/invariants,
- evaluate route/time/budget/evidence/provenance integrity,
- detect agent/tool/orchestrator authority violations,
- classify findings as blocking/non-blocking,
- return `PASS | REPAIR | FAIL`,
- produce targeted recheck/repair requirements.

## Forbidden authority

Verification Agent may not:
- write or mutate itinerary,
- invent or select new place/hotel/food candidates,
- relax a hard constraint,
- convert missing evidence into an assumed fact,
- let semantic judgement override deterministic failure,
- write final user-facing plan,
- directly advance repaired state.

## Status authority

### PASS
Only when all blocking gates pass.

### REPAIR
Only when findings are actionable and target/dependency refs are bounded.

### FAIL
Used for integrity/authority/schema failures that cannot be safely reduced to a targeted repair, or when current snapshot must not proceed.

## Reviewer-generated-content rule

Any new destination/place/hotel/restaurant introduced by Verification is an R6 FAIL.

## Orchestrator audit rule

Verification audits the invariant:

```text
Orchestrator → Specialist Agent → Domain Tool
```

Direct Orchestrator domain-tool usage without an explicitly allowed exception is authority violation.

## Repair boundary

Verification produces repair targets; TM-AG-013 owns itinerary mutation.
