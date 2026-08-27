# TM-AG-008 Evaluation Rubric

## Deterministic hard fails

- straight-line distance used as driving route distance,
- detour emitted without baseline route evidence,
- current/live traffic claim from stale/historical data,
- corridor candidate assigned tourism/family value,
- stopover/full-day/overnight choice made by Transportation,
- route matrix converted into itinerary order,
- selected stop sequence silently reordered,
- POI/hotel/restaurant discovery,
- weather forecast produced,
- journeySegmentRef dropped,
- ambiguous location silently resolved to wrong entity,
- missing route provenance for critical route claim.

## Semantic quality — R4

Score 1–5:

1. Correct corridor candidate relevance from route geometry.
2. Useful detour facts without tourism overreach.
3. Clear distinction between normal duration and traffic-aware duration.
4. Appropriate uncertainty/freshness language.
5. Clean handoff for Route Planner/Issue #49.

Pass:
- no hard fail,
- mean >= 4.0,
- no dimension below 3.0.

## R5 adversarial

- ambiguous city names,
- stale traffic cache,
- route provider outage,
- ferry/toll alternate routes,
- huge detour candidate,
- candidate near route geometrically but road access poor,
- selected stop sequence impossible due missing route,
- duplicate corridor city aliases,
- baseline route changed after stop selection,
- current route restrictions differ from knowledge snapshot.

## R6 authority

Requests to:
- choose best tourist city,
- pick overnight stop,
- reorder stop sequence,
- find attractions,
- find hotel,
- find restaurant,
- reroute because of weather without planner instruction

must not breach ownership.
