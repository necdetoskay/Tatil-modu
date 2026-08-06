# Provider Adapter Specification Template

## 1. Kimlik

| Alan | Değer |
|---|---|
| Adapter ID | `provider-capability-adapter` |
| Provider ID |  |
| Capability ID |  |
| Adapter Version |  |
| Provider API Version |  |
| Durum | proposed / fixture-tested / live-tested / approved / deprecated |

## 2. Amaç

Bu adapterın hangi provider capability'sini ortak Capability Platform sözleşmesine dönüştürdüğünü açıkla.

## 3. Desteklenen capability

- Capability ID:
- Capability version:
- Input contract:
- Output contract:
- Batch desteği:
- Realtime/freshness sınıfı:

## 4. Provider gereksinimleri

- base URL,
- authentication türü,
- required headers,
- region/locale desteği,
- API version,
- kota modeli,
- fiyatlandırma modeli.

## 5. Request mapping

Ortak `ToolRequest.input` alanlarının provider request alanlarına eşlemesi.

| Capability alanı | Provider alanı | Zorunlu | Dönüşüm |
|---|---|---:|---|

## 6. Response mapping

Provider cevabının normalize capability sonucuna eşlemesi.

| Provider alanı | Capability alanı | Null davranışı | Kaynak izi |
|---|---|---|---|

## 7. Entity identity

- Provider entity ID:
- Internal canonical ID üretimi:
- Alias/merge davranışı:
- Provider ID değişimi yönetimi:

## 8. Error mapping

| Provider hata kodu | Ortak kategori | Retryable | Fallback |
|---|---|---:|---:|

## 9. Freshness ve cache

- provider timestamp alanı,
- önerilen TTL,
- stale-if-error desteği,
- negative cache,
- invalidation sinyalleri.

## 10. Cost mapping

- fiyatlandırma türü,
- billable unit,
- estimate algoritması,
- actual cost kaynağı,
- pricing version.

## 11. Rate limit

- kota tipi,
- response header'ları,
- güvenli limit,
- token bucket ayarı,
- circuit breaker eşikleri.

## 12. Source trace

- source type,
- canonical URL,
- provider entity ID,
- trust tier,
- license metadata,
- content hash uygulanabilirliği.

## 13. Privacy ve güvenlik

- gönderilen kullanıcı verileri,
- veri minimizasyonu,
- secret referansları,
- log redaction,
- veri yerleşimi,
- retention kısıtları.

## 14. Observability

- metric names,
- event fields,
- latency,
- cache hit,
- provider health,
- error counters,
- cost counters.

## 15. Fixture paketi

- valid response,
- empty response,
- partial response,
- rate limit,
- timeout,
- auth error,
- schema drift,
- stale response,
- redaction,
- cost mapping.

## 16. Kabul kriterleri

- capability contract uyumu %100,
- source trace eksiksiz,
- secret leakage 0,
- fixture testleri %100,
- live smoke test başarılı,
- cost estimate tolerans içinde,
- provider schema drift alarmı çalışıyor.
