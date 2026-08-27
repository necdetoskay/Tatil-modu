# TM-AG-012 — Tool Policy

## Allowed

- `TL-009 Review Data Provider`
  - normalized review records,
  - provider review metadata,
  - targeted window refresh.
- `TL-011 Calculator`
  - counts, prevalence, ratios.
- `TL-012 Schema Validator`
  - contract validation.
- `TL-014 Cache`
  - snapshot/window/freshness-aware reuse.

## Forbidden

- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-003` Geocoding
- `TL-004` Place Search
- `TL-005` Directions
- `TL-006` Weather Forecast
- `TL-008` Accommodation Search
- `TL-010` Price & Fee Lookup

## Rules

1. Sufficient fresh prior snapshot varsa full-history provider pull yapılmaz.
2. Refresh gerekiyorsa yalnız eksik/stale analysis window veya provider coverage hedeflenir.
3. Provider record entity identity input entityRef ile eşleşmelidir.
4. Tool result raw body retention, `licensePolicySnapshotId` kararını bypass edemez.
5. Provider outage → stale snapshot current olarak promote edilmez; limitations/freshness görünür kalır.
6. Calculator yalnız deterministic sample/prevalence arithmetic için kullanılır.
