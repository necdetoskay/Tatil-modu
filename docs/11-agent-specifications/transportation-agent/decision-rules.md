# TM-AG-008 Decision Rules

| Rule | Deterministic davranış |
|---|---|
| TR-001 | Route distance must come from route provider evidence; geodesic distance cannot populate route distance. |
| TR-002 | Traffic-aware duration requires supported provider result + time context + freshness. |
| TR-003 | Traffic duration is an estimate, never an arrival guarantee. |
| TR-004 | Detour calculation requires baseline route reference. |
| TR-005 | `detourDistance = viaCandidateRouteDistance - baselineRouteDistance` or provider-equivalent supported calculation. |
| TR-006 | `detourDuration = viaCandidateDuration - baselineDuration` or provider-equivalent supported calculation. |
| TR-007 | Corridor relation thresholds come from frozen rule snapshot, not prompt intuition. |
| TR-008 | Corridor candidate never receives tourism/family value from this agent. |
| TR-009 | Transportation never selects FULL_DAY/OVERNIGHT/etc stop role. |
| TR-010 | Matrix output is facts only; no visit-order optimization. |
| TR-011 | Supplied stop sequence may be recalculated but not reordered. |
| TR-012 | journeySegmentRef supplied for a leg must be preserved. |
| TR-013 | Stale traffic cannot be labeled current. |
| TR-014 | Ambiguous geocode cannot silently choose a different city/entity. |
| TR-015 | Weather caution may be attached as upstream context but cannot trigger autonomous reroute. |
| TR-016 | Knowledge location IDs may reduce rediscovery but do not bypass dynamic route/traffic checks. |

## Corridor discovery sequence

```text
baseline route
→ route geometry
→ administrative candidate resolution
→ threshold-based corridor classification
→ candidate detour route/matrix calculation
→ emit logistic corridor candidates
```

## Hard failures

- `STRAIGHT_LINE_AS_ROUTE_DISTANCE`
- `DETOUR_WITHOUT_BASELINE`
- `STOPOVER_SELECTION_LEAKAGE`
- `ITINERARY_ORDERING_LEAKAGE`
- `STALE_TRAFFIC_FALSE_CURRENT`
