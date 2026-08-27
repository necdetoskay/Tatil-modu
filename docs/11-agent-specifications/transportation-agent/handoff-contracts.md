# TM-AG-008 Handoff Contracts

## To Orchestrator

Returns `TransportationResult` only:
- route legs,
- matrix entries,
- corridor candidates,
- warnings/confidence,
- full route provenance.

## To TM-AG-003 Destination Research

For Issue #49 corridor enrichment, disclose only:
- `corridorCityId`,
- location/admin identity,
- corridor relation,
- route progress ratio,
- detour distance/duration,
- route evidence refs.

TM-AG-003 adds tourism/region intelligence. Transportation does not.

## To TM-AG-009 Route Planner

Disclose:
- point-to-point route legs,
- traffic-aware durations/status,
- route matrix,
- selected stop-sequence route legs,
- toll/ferry/highway metadata,
- freshness/confidence.

TM-AG-009 owns ordering, timing, daily-drive constraints and fatigue decisions.

## To TM-AG-010 Budget

Disclose:
- route distance,
- route metadata relevant to toll/ferry/highway,
- segment refs,
- evidence refs.

Transportation does not calculate total trip budget.

## To TM-AG-013 Adaptive Itinerary

Disclose only recalculated affected route legs/matrix/corridor facts requested for repair.

## To TM-AG-014 Verification

Disclose full route provenance including:
- baseline route evidence,
- detour route evidence,
- traffic data type/freshness,
- request mode/time context,
- journey segment refs.

## Issue #49 chain

```text
Transportation corridor facts
→ Destination Research value enrichment
→ user/Route Planner stop selection
→ Transportation selected-sequence recalculation
→ Route Planner daily schedule
```

No step may silently collapse these ownership boundaries.
