# Tool Cache Architecture

## 1. Amaç

Tool çağrılarını hızlandırmak, maliyeti azaltmak ve provider rate limit riskini düşürmek için ortak cache davranışını tanımlar.

## 2. Cache katmanları

```text
L1 — Request-scoped memory cache
L2 — Application distributed cache
L3 — Persistent normalized result store
```

### L1

Aynı workflow içindeki tekrar çağrıları engeller.

### L2

Birden fazla instance tarafından paylaşılır.

### L3

Uzun ömürlü ve yeniden kullanılabilir normalize kayıtlar için kullanılır.

Raw provider cevaplarının L3'te tutulması lisans ve gizlilik politikasına bağlıdır.

## 3. Cache key

Cache anahtarı en az şu alanlardan oluşur:

```text
toolId
capability
capabilityVersion
normalizedInputHash
providerId
locale
timezone
dateRange
party/room profile when relevant
policyVersion
```

Provider bağımsız capability cache'i yalnız normalize sonuç sağlayıcılar arasında eşdeğerse kullanılabilir.

## 4. Freshness

Her kayıt:

- `createdAt`
- `retrievedAt`
- `effectiveAt`
- `expiresAt`
- `freshnessStatus`

taşır.

## 5. TTL başlangıç değerleri

| Veri türü | TTL |
|---|---:|
| Geocoding | 30 gün |
| Sabit place metadata | 30 gün |
| Çalışma saati | 24 saat–7 gün |
| Ücret | 24 saat–7 gün |
| Hava tahmini | 1–3 saat |
| Trafikli rota | 5–15 dakika |
| Trafiksiz rota | 1–24 saat |
| Otel fiyatı/müsaitlik | 15–60 dakika |
| Yorum özeti | 1–7 gün |
| Climate normal | 90 gün |

## 6. Cache policy modları

```text
use_cache
refresh
bypass
fixture_only
stale_if_error
```

### stale_if_error

Provider kullanılamıyorsa stale kayıt yalnız:

- policy izin veriyorsa,
- kayıt kritik freshness sınırını aşmamışsa,
- sonuç `stale` olarak etiketleniyorsa,
- confidence düşürülüyorsa

kullanılabilir.

## 7. Negative cache

`not_found` sonuçları kısa süreli cache'lenebilir.

Amaç:

- aynı olmayan entity için tekrar tekrar çağrı yapılmasını önlemek.

Negative cache TTL, normal TTL'den kısa olmalıdır.

## 8. Cache invalidation

Invalidation tetikleyicileri:

- provider webhook/event,
- manuel refresh,
- policy version değişimi,
- source conflict,
- entity merge,
- kullanıcı kritik yeniden doğrulama talebi.

## 9. Cache güvenliği

Cache içinde:

- secret tutulmaz,
- gereksiz kişisel veri saklanmaz,
- hassas kullanıcı bağlamı key içinde açık metin olmaz,
- hash ve scope kullanılır.

## 10. Testler

- aynı fingerprint cache hit,
- farklı locale cache miss,
- TTL expiry,
- stale_if_error,
- manual refresh,
- negative cache,
- policy version invalidation,
- PII redaction.
