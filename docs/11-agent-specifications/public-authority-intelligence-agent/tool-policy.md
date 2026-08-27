# TM-AG-011 — Tool Policy

## Allowed

- `TL-001 Web Search` — yalnız resmî kaynak discovery.
- `TL-002 Official Page Fetcher` — primary verification.
- `TL-010 Price & Fee Lookup` — resmî/current tariff/fee.
- `TL-012 Schema Validator` — harness/contract.
- `TL-014 Cache` — freshness-aware source snapshots.

## Forbidden

- `TL-004 Place Search`
- `TL-005 Directions`
- `TL-006 Weather Forecast`
- `TL-008 Accommodation Search`
- `TL-009 Review Data Provider`

## Rules

1. Healthy relevant Trusted Source Registry hit varsa broad Web Search ilk adım olamaz.
2. Web Search sonucu fact evidence değil, source-discovery candidate'dır.
3. Official Page Fetcher claim scope/date ile eşleşen source üzerinde çalışmalıdır.
4. TL-010 yalnız official/current fee claim'i için kullanılabilir.
5. Tool failure veya dead source → UNKNOWN/fallback discovery; fact uydurulmaz.
6. Cached evidence freshness policy'yi geçmek zorundadır.
