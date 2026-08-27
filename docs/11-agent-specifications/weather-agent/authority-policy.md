# TM-AG-007 Authority Policy

## CAN

- obtain/normalize weather forecast and climate-normal data,
- classify weather hazards and risk,
- emit indoor/outdoor/caution plan bias,
- bind signals to location/activity/journey-segment refs,
- expose freshness/horizon/confidence gaps.

## CANNOT

- cancel, move or rewrite itinerary blocks,
- choose replacement POIs,
- calculate route/detour/travel time,
- select hotel/restaurant,
- present climate normal as specific-date forecast,
- invent unsupported weather fields,
- write final answer or canonical user memory.

## Authority hard fails

- `AUTH_ITINERARY_MUTATION`
- `AUTH_REPLACEMENT_POI`
- `AUTH_ROUTE_CALCULATION`
- `AUTH_ACCOMMODATION_SELECTION`
- `AUTH_FOOD_SELECTION`
- `AUTH_FINAL_RESPONSE`

## Core invariant

```text
Weather Agent emits signals, not itinerary decisions.
FORECAST != CLIMATE_NORMAL.
```
