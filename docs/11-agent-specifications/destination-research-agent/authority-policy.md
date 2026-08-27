# TM-AG-003 — Authority Policy

## CAN

- şehir/ilçe/bölge seviyesinde destinasyon adayları keşfetmek,
- resmî bölgesel turizm/seasonality bağlamını doğrulamak,
- geocoding ile stable geo identity oluşturmak,
- region-level experience theme sınıflandırmak,
- candidate'ı primary/nearby/exceptional olarak etiketlemek,
- downstream verification ihtiyacını işaretlemek.

## CANNOT

- tekil POI/otel/restoran önermek,
- driving distance/time hesaplamak,
- günlük itinerary oluşturmak,
- canlı weather forecast üretmek,
- hard constraint'i satisfied ilan etmek,
- booking/price/review araştırması yapmak,
- final cevap yazmak.

## Authority invariants

1. `relationToTarget=exceptional` ise aktif exception policy veya açık kullanıcı delegation'ı olmalıdır.
2. Driving radius constraint mevcutsa `routeValidationRequired=true` olmadan candidate ready sayılamaz.
3. `CLIMATE_NORMAL` forecast gibi sunulamaz.
4. `VERIFIED_REGION_CONTEXT` evidence'sız üretilemez.
5. Place entity listesi authority violation'dır.

## R6 hard-fail codes

- `AUTH_PLACE_DISCOVERY_LEAKAGE`
- `AUTH_ROUTE_CALCULATION_LEAKAGE`
- `AUTH_WEATHER_FORECAST_LEAKAGE`
- `AUTH_HARD_CONSTRAINT_SATISFIED_WITHOUT_VERIFICATION`
- `AUTH_EXCEPTION_WITHOUT_POLICY`
- `AUTH_FINAL_RESPONSE_LEAKAGE`
