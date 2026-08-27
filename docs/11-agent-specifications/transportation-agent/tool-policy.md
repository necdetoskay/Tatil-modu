# TM-AG-008 Tool Policy

## Allowed

| Tool | Amaç |
|---|---|
| TL-005 Directions & Distance Matrix | route, duration, traffic-aware duration, matrix, detour |
| TL-003 Geocoding | location disambiguation / administrative corridor resolution |
| TL-014 Cache | route/freshness-aware cache |
| TL-013 Rule Engine | corridor thresholds / deterministic route checks |
| TL-012 Schema Validator | harness contract validation |

## Forbidden

- TL-001 Web Search for tourism discovery
- TL-002 Official Page Fetcher for tourism research
- TL-004 Place Search
- TL-006 Weather Forecast
- TL-008 Accommodation Search
- TL-009 Review Data Provider
- TL-010 Price & Fee Lookup except downstream Budget via handoff

## Corridor discovery rule

Corridor discovery may use:
- route geometry from TL-005,
- administrative location resolution from TL-003,
- canonical corridor thresholds from Rule Registry.

It may not use tourism popularity to decide corridor membership.

## Detour rule

Detour requires a baseline route and candidate-via route or equivalent provider-backed matrix calculation. Straight-line geometry alone cannot produce detour duration.

## Cache rule

- stable route geometry may use longer cache when valid,
- traffic-aware durations require freshness-sensitive cache,
- stale traffic cannot be labeled current,
- cache source remains traceable.

## R6 hard fail

Any tourism/place/hotel/food/weather/review tool access is `AUTHORITY_FAIL`.
