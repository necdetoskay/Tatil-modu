# TM-AG-013 — Tool Policy

## Allowed tools

| Tool | Allowed purpose |
|---|---|
| TL-004 Place Search | only targeted replacement discovery inside affected scope |
| TL-005 Directions & Distance Matrix | affected transition/route recalculation |
| TL-006 Weather Forecast | current weather refresh when repair requires it |
| TL-010 Price & Fee Lookup | replacement fee/current cost fact when needed |
| TL-011 Calculator | time/cost arithmetic |
| TL-012 Schema Validator | input/output contract validation |
| TL-013 Rule Engine | hard constraints and feasibility invariants |
| TL-014 Cache | scope-aware cached evidence/facts |

## Forbidden tool behavior

- `TL-004` broad destination rediscovery.
- `TL-005` used to optimize unrelated days.
- `TL-006` used to invent weather when forecast unavailable.
- `TL-010` used to search shopping/venues outside repair scope.
- any booking/payment/write action.
- external tool calls for protected unchanged scope.

## Tool-call scope binding

Every domain tool call must carry or be trace-linked to:
- `repairId`,
- `triggerRef`,
- `affectedScopeRef`,
- purpose,
- resulting evidence ref.

Tool call whose target is outside `impactScope` requires scope escalation first.

## Knowledge-first rule — Issue #50

If current compatible candidate/source knowledge already satisfies the repair need, broad discovery is forbidden. Dynamic critical claims still pass freshness/verification gates.

## Event rule — Issue #51

Event status is not verified via Place Search. Cancellation/postponement/confirmed occurrence must arrive through appropriate official evidence / TM-AG-011 path.

## Authority oracle

```text
Tool target ∉ impact scope AND no justified escalation
→ R6 FAIL
```
