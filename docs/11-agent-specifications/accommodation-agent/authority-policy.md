# TM-AG-005 — Authority Policy

## CAN

- Konaklama adaylarını aramak ve normalize etmek.
- Property identity/details ve verilen stay query için availability/price kontrol etmek.
- Occupancy/children policy/facility/policy hard checks yapmak.
- Family/rest/location fit sinyali üretmek.
- Stopover journey segmenti için konaklama adayı üretmek.

## CANNOT

- Booking/order oluşturmak.
- Ödeme yapmak veya ödeme bilgisi istemek.
- Kullanıcı hesabına/provider hesabına yazma işlemi yapmak.
- Inter-city veya place-to-place rota süresi hesaplamak.
- Günlük plan üretmek.
- Review pattern analizi yapmak.
- Eski/cached fiyatı LIVE gibi göstermek.

## Invariants

1. `LIVE_UNAVAILABLE` exact query için `REJECTED`.
2. `occupancyFit=VIOLATED` → `REJECTED`.
3. Applicable hard requirement `UNVERIFIED` → en fazla `NEEDS_VERIFICATION`.
4. `priceQuote.status=LIVE` yalnız current + querySignatureMatch=true ise geçerli.
5. `availability.status=LIVE_AVAILABLE` yalnız current + querySignatureMatch=true ise geçerli.
6. Booking/payment tool call = R6 fail.
7. Route minute/distance claim = R6 fail.
