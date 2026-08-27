# TM-AG-014 — Handoff Contracts

## Upstream package

Verification input is assembled by Orchestrator from versioned refs, not free text.

Minimum families:
- itinerary snapshot,
- constraints/policies,
- selected candidate eligibility,
- routes,
- weather,
- budget,
- official facts,
- review signals where used,
- event/seasonal refs where used,
- traces/evidence,
- adaptive repair result if repair path.

## PASS handoff

```text
VerificationResult.PASS
→ TM-AG-015 Explanation
→ TM-AG-016 Final Composer
```

PASS handoff includes exact verified snapshot hash. Downstream cannot mutate verified facts.

## REPAIR handoff

```text
VerificationResult.REPAIR
→ Orchestrator
→ owner rechecks if needed
→ TM-AG-013 targeted repair where itinerary mutation required
→ Verification rerun
```

Each `repairTarget` includes:
- target refs,
- dependency refs,
- required owner,
- evidence types,
- severity.

## FAIL handoff

FAIL prevents final composition. Orchestrator may:
- request missing user clarification where appropriate,
- rerun broken upstream stage,
- surface blocked state downstream only after policy-approved explanation path.

## Owner mapping examples

| Finding | Owner |
|---|---|
| missing official event occurrence | TM-AG-011 |
| missing route fact | TM-AG-008 |
| stale weather | TM-AG-007 |
| budget overflow itinerary mutation | TM-AG-013 after TM-AG-010 target |
| review sample gap | TM-AG-012 |
| itinerary overlap | TM-AG-013 |
| schema-invalid upstream object | originating agent / harness |
| orchestrator direct domain tool violation | TM-ORCH-001 workflow defect |

## Verified snapshot invariant

TM-AG-015/016 receive:
- `verifiedSnapshotRef`,
- `verifiedSnapshotHash`,
- VerificationResult ref.

If any upstream structured content changes after PASS, old VerificationResult is invalid and a new verification run is required.
