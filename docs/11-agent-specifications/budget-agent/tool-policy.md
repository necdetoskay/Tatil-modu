# TM-AG-010 — Tool Policy

## Allowed

- `TL-010 Price & Fee Lookup`
  - eksik/current official fee lookup,
  - mevcut selected entity/fee scope içinde.
- `TL-011 Calculator`
  - deterministic arithmetic.
- `TL-012 Schema Validator`
- `TL-013 Rule Engine`
  - budget limit/status rules.
- `TL-014 Cache`
  - freshness-aware cost facts.

## Forbidden

- `TL-001` Web Search
- `TL-003` Geocoding
- `TL-004` Place Search
- `TL-005` Directions
- `TL-006` Weather
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider

## Rules

1. TL-010 yalnız mevcut selected entity/fee için lookup yapabilir; yeni alternatif keşfedemez.
2. Calculator output input refs ile reproduce edilebilir olmalıdır.
3. Tool failure → UNKNOWN/repair warning; fabricated fallback yok.
4. Current/live price TTL ve query-context doğrulaması korunur.
5. Currency conversion yalnız input'ta evidence-backed exchange-rate fact varsa yapılır.
