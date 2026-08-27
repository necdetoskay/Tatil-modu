# TM-AG-005 — Source Policy

## Tier priority

### Tier 1
Property official site/policy/tariff where useful for static facility/policy corroboration.

### Tier 2
Licensed accommodation provider for live search, availability, pricing, room/product and property details.

### Tier 3
Review/community source only as experience signal via TM-AG-012.

### Tier 4
General web discovery only; live price/availability cannot be established from Tier 4.

## Claim-specific rules

| Claim | Required/Preferred source |
|---|---|
| Live availability | Tier 2 current availability/search result tied to query signature |
| Live price | Tier 2 current search/availability tied to query signature |
| Property identity | Tier 2 + optional Tier 1 corroboration |
| Occupancy/product fit | Tier 2 product/availability data |
| Children policy | Tier 2/official policy evidence |
| Cancellation | Current product/policy evidence |
| Facility | Tier 2 details or Tier 1 official property source |
| Static official tariff | Tier 1, but not treated as live room quote |

## Freshness

- availability/price: short-lived, current-query data only,
- cancellation/booking conditions: tied to selected product/query and current retrieval,
- property static facilities: longer TTL allowed,
- check-in/out rules: revalidate if provider indicates changes.

## Conflict rules

Live product-specific terms outrank generic/static property text for that product.

Conflicting facility/policy claims remain `CONFLICTING`; hard requirement cannot be satisfied until resolved.

## No static-price rule

Stored/cached old accommodation prices or availability may support historical/debug evidence but may not be represented as current/live user-facing truth.
