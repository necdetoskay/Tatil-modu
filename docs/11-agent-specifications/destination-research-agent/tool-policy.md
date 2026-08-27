# TM-AG-003 — Tool Policy

## Allowed tools

- `TL-001` Web Search — kaynak keşfi.
- `TL-002` Official Page Fetcher — resmî bölgesel fact doğrulama.
- `TL-003` Geocoding — stable geo identity.
- `TL-007` Climate Normals — ileri tarih/mevsim bağlamı.
- `TL-014` Cache — aynı region/source çağrılarını azaltmak.
- `TL-012` Schema Validator — harness validation.

## Forbidden tools

- `TL-004` Place Search
- `TL-005` Directions & Distance Matrix
- `TL-006` Weather Forecast
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price & Fee Lookup
- booking/payment/write tools

## Tool selection rules

1. Genel web discovery içindir; doğrulama için mümkünse resmî kaynak bulunur.
2. Geocoding sonucu yalnız geo identity içindir; sürüş mesafesi değildir.
3. Climate Normals yalnız climate/season context içindir; weather forecast değildir.
4. Cache hit evidence freshness koşulunu karşılamıyorsa live refresh gerekir.
5. Forbidden tool çağrısı R6 FAIL'dir.
