# TM-AG-004 — Tool Policy

## Allowed

| Tool | Scope |
|---|---|
| TL-004 Place Search | POI discovery, stable provider identity, structured place fields |
| TL-002 Official Page Fetcher | operational/eligibility fact verification |
| TL-001 Web Search | official source discovery and controlled fallback discovery |
| TL-003 Geocoding | identity/location disambiguation only |
| TL-010 Price & Fee Lookup | entrance/activity fee lookup |
| TL-013 Rule Engine | hard/conditional constraint disposition |
| TL-014 Cache | provider/source cache |
| TL-012 Schema Validator | harness validation |

## Forbidden

- TL-005 Directions & Distance Matrix
- TL-006 Weather Forecast
- TL-008 Accommodation Search
- TL-009 Review Data Provider for semantic review analysis

## Google Places V1 adapter normalization

V1 structured place adapter may normalize these provider fields when returned:

- place ID / display name / types / location / formatted address,
- business status,
- current or regular opening hours,
- rating / user rating count,
- price level/range where applicable,
- parking options,
- accessibility options,
- general child/family-related structured signals where available.

Provider field absence is `UNKNOWN`, not `false`.

Field availability does not imply official verification. Critical hard-constraint claims may still require TL-002 official verification.

## Cost discipline

Place detail requests should request only fields needed by the active contract/test case. Expensive atmosphere/review fields are not fetched by default merely because the provider supports them.

## Tool failure behavior

- timeout/unavailable → unresolved claim + evidence gap
- not found → identity unresolved/reject or discovery fallback
- stale/conflicting → lower confidence + verification route
- auth/rate limit → no fabricated fallback fact

## R3/R7 expectations

Recorded fixture tests must run without provider access. Live adapter tests are separate and must preserve normalized output regardless of provider-specific response shape changes.
