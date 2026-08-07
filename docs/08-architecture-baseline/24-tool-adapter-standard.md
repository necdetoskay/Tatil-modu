# Tatil Modu — Tool Adapter Standardı

**Doküman türü:** Dış servis ve tool entegrasyon standardı
**Teknik kod adı:** `tool_adapter_standard`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Tool Adapter Standardı, dış servislerin, yerel servislerin ve mock kaynakların Tatil Modu'na aynı sözleşmeyle bağlanmasını sağlar.

Her entegrasyon üç mod desteklemelidir:

- online adapter
- offline adapter
- mock adapter

## 2. Temel İlkeler

- Agent dış servise doğrudan bağlanmaz.
- Bütün çağrılar adapter gateway üzerinden geçer.
- Her adapter timeout, retry, rate limit, cache ve schema validation destekler.
- Tool çıktısı Universal Evidence Model ile ilişkilendirilir.
- Adapter provider-specific hataları standart hata modeline çevirir.
- Online servis yoksa offline veya mock fallback kullanılabilir.
- Tool yetkisi ACP security context ile sınırlandırılır.

## 3. Adapter Arayüzü

```ts
interface ToolAdapter<TRequest, TResponse> {
  readonly id: string;
  readonly version: string;
  readonly mode: "online" | "offline" | "mock";

  validateRequest(input: unknown): TRequest;
  execute(request: TRequest, context: ToolContext): Promise<ToolResult<TResponse>>;
  healthCheck(): Promise<ToolHealth>;
}
```

## 4. Tool Context

```json
{
  "trace_id": "trc_001",
  "task_id": "tsk_001",
  "trip_id": "trip_001",
  "deadline_at": "2026-08-06T18:00:30Z",
  "allowed_domains": [],
  "data_scopes": [],
  "cache_policy": {},
  "retry_policy": {}
}
```

## 5. Tool Result

```json
{
  "status": "success",
  "data": {},
  "evidence": [],
  "warnings": [],
  "source_metadata": {},
  "metrics": {
    "duration_ms": 420,
    "cache_hit": false,
    "attempts": 1
  }
}
```

## 6. Adapter Kategorileri

- weather
- traffic
- maps
- route
- POI
- hotel
- public authority
- events
- pricing
- currency
- notification
- storage
- memory
- verification
- local model
- external model

## 7. Online Adapter

Canlı dış servis kullanır.

Zorunlu özellikler:

- domain allowlist
- TLS doğrulama
- timeout
- retry
- provider quota takibi
- source metadata
- rate limit
- circuit breaker

## 8. Offline Adapter

Yerel veri veya cache kullanır.

Örnek kaynaklar:

- offline harita
- yerel POI verisi
- önceden senkronize edilmiş kamu duyuruları
- yerel hava arşivi
- yerel model
- dosya tabanlı fixture

## 9. Mock Adapter

Test için deterministik veri üretir.

Özellikler:

- seed
- scenario id
- gecikme simülasyonu
- hata simülasyonu
- stale data simülasyonu
- çelişkili veri simülasyonu

## 10. Request Validation

Her adapter request şeması taşır.

Geçersiz istek dış servise gönderilmez.

## 11. Response Validation

Provider çıktısı kanonik şemaya dönüştürülür.

Eksik veya beklenmeyen alanlar:

- rejected
- partial
- quarantined

olarak işaretlenebilir.

## 12. Error Normalization

Provider hataları standart kodlara çevrilir:

- `TOOL_TIMEOUT`
- `TOOL_RATE_LIMITED`
- `TOOL_AUTH_FAILED`
- `TOOL_SCHEMA_INVALID`
- `TOOL_SOURCE_UNAVAILABLE`
- `TOOL_DATA_STALE`
- `TOOL_PERMISSION_DENIED`
- `TOOL_CIRCUIT_OPEN`
- `TOOL_UNSUPPORTED_MODE`

## 13. Retry Politikası

Retry yapılabilir:

- timeout
- 429
- geçici 5xx
- kısa süreli bağlantı hatası

Retry yapılmaz:

- 4xx validation
- permission denied
- schema mismatch
- hard policy violation
- unsupported operation

## 14. Cache Standardı

Cache key bileşenleri:

- adapter id
- operation
- normalized request
- locale
- date scope
- provider version

Her veri türü ayrı TTL taşır.

## 15. Circuit Breaker

Durumlar:

- CLOSED
- OPEN
- HALF_OPEN

Provider bağımsız sağlık metriği tutulur.

## 16. Evidence Üretimi

Her dış claim:

- source type
- source ref
- retrieved_at
- valid_for_date
- confidence
- verification status

taşımalıdır.

## 17. Fallback Zinciri

Örnek:

```text
online weather
  ↓ failure
offline cached weather
  ↓ unavailable
mock/test fixture
  ↓ only in test mode
```

Production'da mock fallback kullanıcıya gerçek veri gibi sunulamaz.

## 18. Air-Gap Modu

Air-gap ortamda:

- outbound internet kapalı olabilir,
- yalnızca offline adapterlar aktif olur,
- kontrollü sync gateway kullanılabilir,
- senkronizasyon paketleri imzalı olabilir,
- cache yaşı kullanıcıya gösterilir.

## 19. Secret Yönetimi

- secret prompt içine girmez,
- adapter runtime secret store kullanır,
- secret loglanmaz,
- provider anahtarları agentlarla paylaşılmaz,
- rotation desteklenir.

## 20. Observability

Her çağrı için:

- adapter id/version
- provider
- mode
- duration
- attempts
- cache hit
- quota usage
- error code
- evidence count
- response freshness

izlenir.

## 21. Health Modeli

```json
{
  "status": "healthy",
  "latency_ms": 180,
  "last_success_at": "2026-08-06T18:00:00Z",
  "error_rate_5m": 0.02,
  "circuit_state": "CLOSED"
}
```

## 22. Tool Capability Registry

Her adapter şunları ilan eder:

- desteklenen operasyonlar
- giriş/çıkış şemaları
- mode
- veri kapsamı
- maliyet sınıfı
- güncellik
- quota
- güvenilirlik

## 23. Testler

- request schema
- response normalization
- timeout
- retry
- rate limit
- cache
- circuit breaker
- offline fallback
- mock determinism
- secret leakage
- prompt injection içeren provider içeriği

## 24. Kabul Kriterleri

- Agentlar provider SDK'larına doğrudan bağlanmamalı.
- Online/offline/mock modları aynı arayüzü kullanmalı.
- Her adapter request/response şeması taşımalı.
- Provider hataları normalize edilmeli.
- Cache, retry ve circuit breaker zorunlu olmalı.
- Evidence üretimi desteklenmeli.
- Secret isolation uygulanmalı.
- Air-gap modda çalışabilmeli.
- Mock adapterlar deterministik olmalı.
