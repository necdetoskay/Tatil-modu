# TM-AG-013 — Source Policy

Adaptive Itinerary Agent yeni bir genel research agent değildir. Repair için kullanılan source/evidence trigger türüyle uyumlu olmalıdır.

## Source mapping

| Repair trigger | Required evidence family |
|---|---|
| PLACE_CLOSED / OPENING_HOURS_CHANGED | current OfficialFact / primary operational source |
| EVENT_CANCELLED / EVENT_POSTPONED | exact occurrence official evidence, not recurring-event memory |
| WEATHER_RISK_CHANGED | fresh FORECAST; climate normal alone is insufficient |
| ROUTE_DISRUPTION | current/provider-backed route fact |
| ACCOMMODATION_UNAVAILABLE | matching current availability fact |
| BUDGET_OVERFLOW | BudgetLedger + item provenance |
| EVENT_CROWD_IMPACT_CHANGED | EventImpactSignal and/or review/current logistics evidence according to policy |
| USER_PLAN_CHANGE | explicit user source |
| VERIFICATION_REPAIR_TARGET | TM-AG-014 repair target + evidence refs |

## Trust rules

- Tier 4 alone cannot establish a critical closure/event-status fact.
- Review experience cannot become official operational state.
- Cached critical dynamic evidence must pass freshness gate.
- Recurring event knowledge is discovery/context, not exact-year confirmation.
- Issue #50 knowledge can accelerate replacement selection but cannot bypass current critical verification.

## Replacement source rule

A replacement candidate may be selected from:
1. already accepted/current upstream candidates,
2. compatible knowledge-store candidates with required freshness checks,
3. targeted repair-scope discovery.

Any critical dynamic property required for feasibility must carry evidence/freshness.

## Provenance

Each patch must reference the evidence that caused or justified the mutation. If a patch changes route, accommodation, event, place or time due to a fact change, the relevant evidence ref cannot be omitted.
