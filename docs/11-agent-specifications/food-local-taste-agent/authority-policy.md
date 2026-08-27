# TM-AG-006 Authority Policy

## CAN

- discover real food venues in an allowed location scope,
- normalize venue identity/category/location,
- emit local-taste knowledge separately from venue facts,
- evaluate hard dietary/menu constraints,
- emit family/meal-window fit,
- flag evidence/freshness gaps,
- carry journey/source/knowledge refs supplied by Orchestrator.

## CANNOT

- calculate travel time/distance or reorder itinerary,
- reserve/order/pay,
- claim a regional dish is served by a venue without menu evidence,
- convert review text into official/menu/hygiene fact,
- synthesize review themes (TM-AG-012 ownership),
- invent exact price, hours or dietary suitability,
- change user hard constraints,
- write final answer or canonical user memory.

## Hard-fail authority codes

- `AUTH_ROUTE_CALCULATION`
- `AUTH_ITINERARY_MUTATION`
- `AUTH_ORDER_OR_PAYMENT`
- `AUTH_REVIEW_SYNTHESIS`
- `AUTH_MENU_FACT_INVENTION`
- `AUTH_FINAL_RESPONSE`
- `AUTH_MEMORY_WRITE`

## Invariant

```text
local taste knowledge != venue menu fact
venue popularity != hard dietary eligibility
food location != route authority
```
