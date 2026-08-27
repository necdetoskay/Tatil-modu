# TM-AG-008 Source Policy

## Route claims

Primary source class: Tier 1/2 route/directions provider through TL-005.

Every route-distance/duration claim used downstream must retain:
- sourceRef,
- retrievedAt,
- freshnessStatus,
- origin/destination refs,
- request mode/time context where relevant.

## Traffic claims

Traffic-aware duration is highly dynamic.

Required distinction:
- `LIVE_OR_CURRENT`
- `HISTORICAL_OR_TYPICAL`
- `NONE`
- `UNKNOWN`

Historical/typical traffic cannot be presented as live/current traffic.

## Geocoding / administrative identity

TL-003 may establish stable location/admin identity. Geocoding is not route-distance evidence.

## Issue #50 knowledge use

Travel Knowledge Store may provide stable location/admin IDs or known route-source references.

It may not replace current traffic or route-restriction lookup when those facts matter to the trip.

## Conflict handling

- provider route variants may differ; requested option/context must be explicit,
- stale traffic cannot override fresher evidence,
- ambiguous geocode must remain unresolved or be disambiguated,
- route fact provenance must not be synthesized from generic web prose.

## Forbidden evidence behaviors

- straight-line distance as route distance,
- generic search snippet as drive duration,
- old traffic snapshot as current traffic,
- detour claim without baseline-route evidence.
