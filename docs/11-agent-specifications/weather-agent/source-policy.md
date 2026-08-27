# TM-AG-007 Source Policy

## Forecast claims

Use current structured weather provider output through TL-006.

Required provenance where available:
- provider/source ref,
- retrievedAt,
- issuedAt,
- valid window,
- location,
- freshness status.

Unsupported or missing fields remain unknown.

## Climate-normal claims

Use TL-007 or approved knowledge snapshot sourced from climate data.

Climate normal is long-term statistical context, never a specific-day forecast.

## Trust and conflicts

- forecast/provider evidence is time-sensitive and must be freshness checked,
- stale data cannot be used as current fact,
- credible source conflicts remain visible,
- severe-risk conflict may produce conservative `CAUTION`, not fabricated certainty.

## Issue #50

Travel Knowledge Store may retain climate normals and source registry references. It must not provide a historical/current weather snapshot as a substitute for a fresh trip forecast.

## Forbidden evidence behavior

- general web/blog weather prose as primary forecast evidence,
- climate average relabeled as forecast,
- provider field inferred from unrelated fields without a canonical deterministic rule,
- freshness omitted for current-trip weather claims.
