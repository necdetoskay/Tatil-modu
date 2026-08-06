# Source Trace & Data Lineage Standard

## 1. Amaç

Tatil Modu içinde dış dünyadan gelen veya başka verilerden türetilen her kritik bilginin:

- nereden geldiğini,
- ne zaman alındığını,
- hangi dönüşümlerden geçtiğini,
- hangi sağlayıcı ve adapter tarafından üretildiğini,
- ne kadar güvenilir olduğunu,
- hangi lisans ve kullanım koşullarına tabi olduğunu

izlenebilir hale getirmek.

## 2. Temel ilke

Her bilgi aynı türde değildir.

```text
Raw Source
  ↓ extraction/normalization
Observed Fact
  ↓ aggregation/scoring/inference
Derived Evidence
  ↓ decision policy
Recommendation
```

Recommendation, kaynak zincirini kaybetmemelidir.

## 3. Lineage seviyeleri

### L0 — Source

Orijinal provider, sayfa, kayıt veya API cevabı.

### L1 — Observed Fact

Kaynakta doğrudan bulunan normalize bilgi.

Örnek:

```text
Otel otoparkı ücretli.
```

### L2 — Aggregated Evidence

Birden fazla fact veya yorumdan üretilen ortak sinyal.

Örnek:

```text
Son 90 günde 34 yorumun 12'si otopark yetersizliğinden bahsediyor.
```

### L3 — Derived Assessment

Policy veya model ile oluşturulan değerlendirme.

Örnek:

```text
Özel araçla gelen aileler için otopark uygunluğu düşük.
```

### L4 — Recommendation

Kullanıcı profiline göre karar.

Örnek:

```text
Bu oteli ilk üç öneriye alma.
```

## 4. SourceTraceRecord

Her kaynak kaydı en az şunları taşır:

```json
{
  "sourceId": "src-uuid",
  "sourceType": "official_page",
  "providerId": "provider-name",
  "adapterVersion": "1.0.0",
  "canonicalUrl": "https://...",
  "providerEntityId": "entity-123",
  "retrievedAt": "2026-08-06T13:00:00Z",
  "effectiveAt": null,
  "expiresAt": "2026-08-07T13:00:00Z",
  "trustTier": 1,
  "verificationStatus": "verified",
  "license": "provider-terms-v1",
  "contentHash": "sha256:...",
  "privacyClass": "public"
}
```

## 5. EvidenceRecord

Türetilmiş kanıt:

```json
{
  "evidenceId": "ev-uuid",
  "evidenceType": "review_theme",
  "entityId": "hotel-internal-id",
  "claim": "Otopark kapasitesi yoğun dönemlerde yetersiz.",
  "lineageLevel": "L2",
  "sourceRefs": ["src-1", "src-2"],
  "transformationRefs": ["tr-1"],
  "timeWindow": {
    "start": "2026-05-01",
    "end": "2026-08-01"
  },
  "sampleSize": 34,
  "supportCount": 12,
  "contradictionCount": 2,
  "confidence": 0.82,
  "freshnessStatus": "fresh"
}
```

## 6. TransformationRecord

Her dönüşüm kayıt altına alınır:

```json
{
  "transformationId": "tr-uuid",
  "type": "normalize_review_theme",
  "component": "experience-intelligence",
  "componentVersion": "1.0.0",
  "model": "model-id-or-null",
  "promptVersion": "prompt-version-or-null",
  "policyVersion": "policy-version-or-null",
  "inputRefs": ["src-1", "src-2"],
  "outputRefs": ["ev-1"],
  "executedAt": "2026-08-06T13:05:00Z",
  "deterministic": false
}
```

## 7. Verification status

```text
verified
cross_checked
single_source
unverified
conflicting
stale
rejected
```

## 8. Trust tier

### Tier 1

Birincil/resmî kaynak veya veri sahibi.

### Tier 2

Lisanslı ve yapılandırılmış yetkili sağlayıcı.

### Tier 3

Güvenilir platform veya doğrulanmış kullanıcı içeriği.

### Tier 4

Genel web, forum, blog veya sosyal içerik.

Trust tier confidence ile aynı değildir.

Tier 1 kaynak da eski veya eksik olabilir.

## 9. Claim-level trace

Yalnız belgenin tamamına kaynak göstermek yeterli değildir.

Kritik alanlar kendi source/evidence referansını taşımalıdır.

Örnek:

```json
{
  "parking": {
    "status": "paid",
    "sourceRefs": ["src-official-1"],
    "confidence": 0.96
  },
  "parkingExperience": {
    "status": "often_full",
    "evidenceRefs": ["ev-review-4"],
    "confidence": 0.81
  }
}
```

## 10. Resmî iddia ile deneyim kanıtı ayrımı

Resmî bilgi:

```text
Otopark mevcut.
```

Deneyim kanıtı:

```text
Yoğun hafta sonlarında yer bulunamıyor.
```

İkisi çelişmeyebilir.

Sistem ikisini ayrı alanlarda tutmalıdır.

## 11. Çelişki

Kaynaklar çelişirse:

- tüm source refs korunur,
- çelişen değerler kaydedilir,
- primary source ve freshness değerlendirilir,
- gerektiğinde cross-check çağrısı yapılır,
- unresolved conflict kullanıcıya veya reviewer'a taşınır.

## 12. Yorum verisi özel kuralları

Yorum lineage kaydı:

- provider,
- review ID,
- tarih,
- verification flag,
- dil,
- izin verilen metin/özet kullanımı,
- duplicate cluster,
- spam/bot şüphesi,
- segment bilgisi

taşımalıdır.

Ham yorum metni saklama ve yeniden yayınlama provider lisansına bağlıdır.

## 13. Privacy

Source lineage içinde:

- kullanıcı adı gereksizse saklanmaz,
- review author kimliği internal hash ile temsil edilebilir,
- kişisel veri purpose limitation ile işlenir,
- silme taleplerine uyum için lineage bulunabilir olmalıdır.

## 14. Recommendation trace

Nihai öneri en az şunları gösterebilmelidir:

```text
Recommendation
→ Decision policy
→ Assessments
→ Evidence
→ Sources
```

Bu zincir debug, kalite kontrolü ve kullanıcı açıklaması için kullanılacaktır.

## 15. Saklama

Saklama sınıfları:

```text
ephemeral
short_term
operational
audit
restricted
```

Raw veri ile normalize evidence aynı süre saklanmak zorunda değildir.

## 16. Testler

- kaynak referansı kaybolmuyor,
- transformation chain tam,
- claim-level source mevcut,
- stale kaynak işaretleniyor,
- çelişki korunuyor,
- review duplicate lineage,
- lisans metadata,
- PII redaction,
- recommendation backtrace.
