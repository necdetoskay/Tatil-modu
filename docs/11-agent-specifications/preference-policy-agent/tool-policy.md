# TM-AG-002 — Tool Policy

## Allowed

- `TL-012` Schema Validator — harness/output validation için.
- `TL-013` Rule Engine — kanonik classification/consistency kuralları için.

## Forbidden external tools

- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-003` Geocoding
- `TL-004` Place Search
- `TL-005` Directions & Distance Matrix
- `TL-006` Weather Forecast
- `TL-007` Climate Normals
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price & Fee Lookup
- `TL-011` Calculator
- dış provider/plugin/tool çağrılarının tamamı

## Rule

Bu agent dış dünyayı araştırmaz; yalnız kullanıcı ve policy context'ini sınıflandırır.

Harness her tool çağrısını trace eder. Forbidden tool çağrısı cevap doğru olsa bile `R6 Authority FAIL` üretir.
