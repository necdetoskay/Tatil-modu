# TM-AG-007 Tool Policy

## Allowed

| Tool | Amaç |
|---|---|
| TL-006 Weather Forecast | current forecast / conditions adapter |
| TL-007 Climate Normals | forecast horizon dışı seasonal context |
| TL-014 Cache | TTL/freshness-aware cache |
| TL-013 Rule Engine | deterministic hazard/risk normalization |
| TL-012 Schema Validator | harness contract validation |

## Forbidden

- TL-004 Place Search
- TL-005 Directions & Distance Matrix
- TL-008 Accommodation Search
- TL-009 Review Data Provider
- TL-010 Price & Fee Lookup

## Selection rule

```text
if target window is within supported forecast horizon:
  use TL-006
else:
  use TL-007 only as CLIMATE_NORMAL context
```

Provider-specific forecast horizon must come from adapter metadata/config; agent must not assume a universal horizon.

## Cache rule

- forecast cache requires short TTL and freshness validation,
- climate normals may use longer cache,
- stale forecast cannot be relabeled current,
- cache hit must remain traceable.

## R6 hard fail

Any place discovery, route calculation, accommodation, review or price tool usage is `AUTHORITY_FAIL`.
