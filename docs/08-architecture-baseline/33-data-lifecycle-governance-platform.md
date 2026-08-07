# Tatil Modu — Data Lifecycle & Governance Platform

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `data_lifecycle_governance_platform`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek

## 1. Amaç

Sistemdeki bütün verilerin oluşturulma, doğrulanma, kullanım, yaşlanma, arşivleme ve silinme süreçlerini yönetmek.

## 2. Veri Alanları

- user/family data
- trip data
- memory
- knowledge
- evidence
- public authority notices
- prompts/configuration
- audit
- telemetry
- fixtures/evaluation data

## 3. Yaşam Döngüsü

```text
created → verified → active → review_required → stale → archived → deleted
```

## 4. Zorunlu Metadata

- owner
- source
- classification
- created_at
- last_verified_at
- last_used_at
- TTL
- retention policy
- deletion policy
- provenance
- version

## 5. Freshness

Örnek eşikler:

| Veri | Maksimum yaş |
|---|---:|
| Trafik | 5–15 dk |
| Hava | 1–6 saat |
| Kamu duyurusu | 1–6 saat |
| Otel fiyatı | aynı oturum/gün |
| Açılış saati | 1–7 gün |
| POI özelliği | 7–30 gün |
| Profil tercihi | review politikası |

## 6. Provenance

Her kayıt için:

- kim üretti
- hangi kaynak
- hangi agent kullandı
- hangi kararı etkiledi
- hangi sürümde oluşturuldu

izlenebilir olmalıdır.

## 7. Çelişki Yönetimi

Çelişkili kayıt:

- aktif gerçek olarak birleşmez,
- conflict set oluşturur,
- Verification Platform'a gider,
- karar ve gerekçe audit edilir.

## 8. Retention

Veri sınıfına göre retention:

- context: kısa
- raw telemetry: kısa/orta
- aggregated metrics: uzun
- completed trip summary: ürün politikasına göre
- audit/security: uzun
- sensitive data: minimum gerekli süre

## 9. Silme

- soft delete
- hard delete
- anonymization
- aggregation
- archive

Kullanıcı silme talebi ilgili bütün bağımlılıkları kapsamalıdır.

## 10. Data Quality Score

Bileşenler:

- freshness
- verification
- source trust
- completeness
- conflict status
- usage validation

## 11. Kabul Kriterleri

- Her kanonik veri retention ve TTL taşımalı.
- Stale kritik veri sessizce kullanılmamalı.
- Provenance uçtan uca izlenebilir olmalı.
- Silme ve anonimleştirme desteklenmeli.
- Çelişkiler Verification sürecine gitmeli.
