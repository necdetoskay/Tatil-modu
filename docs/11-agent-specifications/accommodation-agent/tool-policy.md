# TM-AG-005 — Tool Policy

## Allowed

| Tool | Scope |
|---|---|
| TL-008 Accommodation Search | property search, availability, product/price/details |
| TL-004 Place Search | location/entity corroboration only |
| TL-002 Official Page Fetcher | facility/policy corroboration |
| TL-011 Calculator | deterministic totals/budget arithmetic |
| TL-013 Rule Engine | hard constraint evaluation |
| TL-014 Cache | freshness-aware cache |
| TL-012 Schema Validator | harness validation |

## Booking.com adapter

V1 tercih edilen adapter Booking.com Demand API'dir; ancak contract provider-independent kalır.

Search/availability/details response'ları normalized contract'a çevrilir.

Live price/availability için:
- exact stay query signature eşleşmeli,
- retrievedAt kaydedilmeli,
- freshness CURRENT olmalı.

Provider access/token yoksa canlı veri uydurulmaz; status `UNKNOWN` kalır.

## Forbidden

- order/create or booking side effects,
- payment tools,
- route/directions tools,
- review semantic-analysis tools,
- user account mutation.

## Cache

Price/availability kısa TTL'li ve query-signature scoped olmalıdır. Static content cache ile live quote cache ayrı tutulur.

Stale price/availability current olarak kullanılamaz.
