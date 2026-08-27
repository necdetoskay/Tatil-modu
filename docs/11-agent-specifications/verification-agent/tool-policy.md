# TM-AG-014 — Tool Policy

## Primary allowed tools

| Tool | Purpose |
|---|---|
| TL-012 Schema Validator | schema/contract validation |
| TL-013 Rule Engine | hard constraints, authority and deterministic invariants |
| TL-011 Calculator | arithmetic/time/budget verification |

## Base-pass rule

Default verification pass external-world domain tools çağırmaz.

Missing/conflicting critical fact:

```text
Verification finding
→ requiredRecheck(ownerId, scope)
→ Orchestrator routes owner specialist
→ new evidence
→ Verification rerun
```

## Controlled read-only recheck

Only when `reverificationMode=DIRECT_READONLY_ALLOWED` and policy explicitly allows it, a narrow existing read-only adapter may be used for a single missing/conflicting claim.

Restrictions:
- no discovery,
- no ranking,
- no new candidate creation,
- scope limited to existing subject/claim,
- tool/evidence trace mandatory.

## Forbidden

- Place Search to find alternatives.
- Accommodation Search to find another hotel.
- Web Search for broad research.
- Route optimization beyond verification of an existing route claim.
- Booking/payment/write actions.

## R6 oracle

```text
Verification uses domain tool to create a new recommendation
→ FAIL
```
