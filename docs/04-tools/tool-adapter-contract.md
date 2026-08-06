# Tool Adapter Contract

## 1. Amaç

Tüm provider adapterlarının uygulaması gereken ortak davranış ve sözleşmeyi tanımlar.

## 2. Mantıksal arayüz

```text
execute(ToolRequest) -> ToolResult
healthCheck() -> ProviderHealth
estimateCost(ToolRequest) -> CostEstimate
supports(CapabilityRequirement) -> boolean
```

## 3. Adapter sorumlulukları

- provider kimlik doğrulaması,
- provider-specific request oluşturma,
- timeout uygulama,
- provider cevabını parse etme,
- ortak modele normalize etme,
- provider hata kodlarını ortak hata modeline çevirme,
- kaynak metadata üretme,
- kullanım/maliyet bilgisini raporlama,
- hassas bilgileri loglardan temizleme.

## 4. Adapterın yapmayacağı işler

- agent niyetini yorumlamak,
- alternatif destinasyon önermek,
- iş kuralı kararı vermek,
- provider cevabına kaynakta olmayan bilgi eklemek,
- fallback provider seçmek,
- cache politikasını kendi başına değiştirmek.

Bu görevler Tool Gateway veya Decision Policy katmanına aittir.

## 5. İdempotency

Salt-okuma tool çağrıları aynı request fingerprint için idempotent kabul edilir.

Yazma yapan gelecekteki tool sınıfları için:

- `idempotencyKey`,
- explicit confirmation,
- duplicate prevention

zorunludur.

## 6. Versioning

Her adapter:

- adapter version,
- capability contract version,
- provider API version

bilgisini taşır.

Major capability contract değişiminde consumer uyumluluğu yeniden doğrulanır.

## 7. Provider health

```json
{
  "providerId": "provider-name",
  "status": "healthy",
  "checkedAt": "2026-08-06T13:00:00Z",
  "latencyMs": 180,
  "rateLimitRemaining": 900,
  "warnings": []
}
```

Durumlar:

```text
healthy
degraded
rate_limited
unavailable
misconfigured
unknown
```

## 8. Güvenlik

Adapter:

- secret değerlerini response veya loga yazamaz,
- kişisel veriyi gereksiz yere provider'a gönderemez,
- sadece gereken alanları iletir,
- provider kullanım şartlarına uyar,
- raw response saklama politikasını uygular.

## 9. Test zorunluluğu

Her adapter için:

- valid response,
- empty response,
- timeout,
- rate limit,
- authentication error,
- invalid response,
- partial response,
- provider schema change,
- source metadata,
- redaction

testleri bulunmalıdır.
