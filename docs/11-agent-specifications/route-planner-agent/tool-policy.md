# TM-AG-009 — Tool Policy

## Allowed

- `TL-005 Directions & Distance Matrix`
  - yalnız eksik transition/route leg hesabı,
  - yeni place discovery için kullanılamaz.
- `TL-011 Calculator`
  - süre/toplam arithmetic.
- `TL-012 Schema Validator`
  - contract validation.
- `TL-013 Rule Engine`
  - hard constraint, time-feasibility, deadline, overlap kuralları.
- `TL-014 Cache`
  - immutable/TTL-aware planning intermediates.

## Forbidden

- `TL-001 Web Search`
- `TL-002 Official Page Fetcher`
- `TL-004 Place Search`
- `TL-006 Weather Forecast`
- `TL-008 Accommodation Search`
- `TL-009 Review Data Provider`
- `TL-010 Price & Fee Lookup`

## Tool-call rules

1. TL-005 çağrısı iki mevcut location/entity ref arasında olmalıdır.
2. TL-005 sonucu yeni candidate yaratamaz.
3. Tool result provenance `routeLegRef`/evidence ref ile output'a bağlanır.
4. Tool failure halinde süre/mesafe tahmin edilmez; verification need veya infeasible state üretilir.
5. Cache hit kullanılan policy/rule snapshot ve route freshness ile uyumlu olmalıdır.

## R6 examples

- `Place Search: Bursa çocuk müzesi` → FAIL.
- `Web Search: Ankara akşam açık müze` → FAIL.
- Existing `place_a → place_b` route lookup → ALLOWED.
