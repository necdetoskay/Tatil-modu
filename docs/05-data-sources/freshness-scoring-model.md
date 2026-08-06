# Freshness Scoring Model v1.0

## 1. Amaç

Bir bilginin yaşı, geçerlilik dönemi ve değişim hızına göre ne kadar güncel kabul edileceğini deterministik biçimde hesaplamak.

Freshness, authority veya truth değildir.

Bir kaynak:

- yüksek authority fakat eski,
- düşük authority fakat çok yeni,
- güncel fakat yanlış entity'ye ait

olabilir.

## 2. Temel kavramlar

```text
retrievedAt
observedAt
effectiveAt
validFrom
validUntil
expiresAt
targetDate
evaluationTime
```

### retrievedAt

Verinin sistem tarafından alındığı zaman.

### observedAt

Kaynağın olayı veya durumu gözlemlediği zaman.

### effectiveAt

Bilginin geçerli olmaya başladığı zaman.

### validUntil

Bilginin açıkça geçerli olduğu son zaman.

### targetDate

Kullanıcının plan yaptığı tarih.

Freshness yalnız bugüne göre değil, gerektiğinde hedef tarihe göre hesaplanır.

## 3. Veri sınıfları

### F1 — Gerçek zamanlı

Örnek:

- trafik,
- canlı müsaitlik,
- anlık fiyat,
- aktif yol kapanması.

Başlangıç geçerlilik penceresi:

```text
5 dakika – 1 saat
```

### F2 — Hızlı değişen

Örnek:

- hava tahmini,
- otel fiyatı,
- etkinlik bileti,
- çalışma saati istisnası.

Başlangıç geçerlilik penceresi:

```text
1 saat – 24 saat
```

### F3 — Orta hızda değişen

Örnek:

- çalışma saatleri,
- giriş ücreti,
- çocuk politikası,
- otopark politikası,
- restoran menüsü.

Başlangıç geçerlilik penceresi:

```text
1 gün – 30 gün
```

### F4 — Yavaş değişen

Örnek:

- tesis özellikleri,
- adres,
- kategori,
- sabit rota bilgisi,
- genel destinasyon karakteri.

Başlangıç geçerlilik penceresi:

```text
30 gün – 1 yıl
```

### F5 — Tarihsel / iklimsel

Örnek:

- climate normal,
- uzun dönem istatistik,
- tarihsel bilgi.

Başlangıç geçerlilik penceresi:

```text
1 yıl – 10 yıl
```

## 4. Freshness score

Başlangıç modeli:

```text
ageRatio = ageSeconds / expectedLifetimeSeconds
```

Parçalı lineer model:

```text
ageRatio <= 0.25  → score 1.00–0.90
ageRatio <= 0.50  → score 0.90–0.75
ageRatio <= 1.00  → score 0.75–0.50
ageRatio <= 2.00  → score 0.50–0.20
ageRatio >  2.00  → score 0.20–0.00
```

## 5. Hard expiration

Aşağıdaki durumlardan biri varsa score doğrudan `0` olabilir:

- `validUntil < evaluationTime`,
- `expiresAt < evaluationTime` ve stale kullanımı yasak,
- target date bilginin validity window dışında,
- provider sonucu geçmiş bir olayı future state gibi gösteriyor.

## 6. Target-date freshness

Freshness yalnız verinin yaşına göre hesaplanmaz.

Örnek:

- bugün alınmış hava tahmini,
- hedef tarih 8 ay sonrası.

Veri yeni olsa bile hedef tarih provider forecast horizon dışında olduğu için uygun değildir.

Bu durumda:

```text
freshnessScore = 0
fitnessForTargetDate = 0
reason = OUTSIDE_VALID_HORIZON
```

## 7. Forecast horizon

Her forecast capability:

- generatedAt,
- forecastStart,
- forecastEnd

taşır.

Hedef tarih bu aralık dışındaysa forecast kullanılamaz.

## 8. Review freshness

Yorumlarda tek bir global freshness skoru yeterli değildir.

Ayrı hesaplanır:

```text
reviewRecordFreshness
reviewWindowFreshness
trendFreshness
```

Örnek:

- 5 yıllık yorum tekil record olarak eski,
- son 90 günlük trend için etkisi çok düşük,
- tarihsel kalite karşılaştırması için hâlâ yararlı olabilir.

## 9. Resmî politika freshness

Resmî policy sayfasında `effectiveAt` veya `lastUpdatedAt` varsa kullanılır.

Yoksa:

- retrievedAt,
- page change history,
- provider metadata,
- cross-check

ile freshness confidence düşürülür.

## 10. Freshness confidence

Freshness score ile freshness confidence ayrıdır.

```text
freshnessScore
→ bilgi ne kadar yeni/geçerli?

freshnessConfidence
→ bu zaman bilgilerinin doğruluğundan ne kadar eminiz?
```

Örnek:

```text
score: 0.90
confidence: 0.45
```

Sayfa bugün çekilmiş olabilir ama içeriğin ne zaman güncellendiği bilinmiyorsa bu mümkündür.

## 11. Zaman alanı önceliği

Freshness hesaplamasında öncelik:

```text
validUntil / expiresAt
→ effectiveAt / observedAt
→ provider generatedAt
→ source publishedAt / updatedAt
→ retrievedAt
```

Yalnız `retrievedAt` kullanılması en zayıf senaryodur.

## 12. Freshness status

| Durum | Aralık |
|---|---:|
| `fresh` | 0.80–1.00 |
| `acceptable` | 0.50–0.79 |
| `stale` | 0.01–0.49 |
| `expired` | 0.00 |
| `unknown` | hesaplanamadı |

## 13. Claim-specific lifetime

Başlangıç örnekleri:

| Claim | Expected lifetime |
|---|---:|
| live traffic | 10 dakika |
| hotel availability | 15 dakika |
| hotel price | 30 dakika |
| weather forecast | 3 saat |
| opening hours | 7 gün |
| admission fee | 7 gün |
| event schedule | 24 saat |
| parking policy | 30 gün |
| child policy | 30 gün |
| place address | 180 gün |
| climate normal | 3 yıl |
| individual review | 2 yıl |
| review trend window | 90 gün |

Bu değerler capability/provider/policy bazında override edilebilir.

## 14. Ceza modeli

Freshness nihai evidence confidence'a ceza olarak uygulanabilir:

```text
freshnessPenalty = 1 - freshnessScore
```

Ancak hard-expired bilgi tamamen elenir.

## 15. Stale-if-error

Stale veri yalnız şu şartlarla kullanılabilir:

- policy izin veriyor,
- veri hard-expired değil,
- kaynak identity eşleşiyor,
- kullanıcıya kritik risk oluşturmuyor,
- sonuç stale olarak etiketleniyor,
- confidence düşürülüyor,
- fallback sebebi kaydediliyor.

## 16. Kritik claim'ler

Aşağıdaki claim'lerde stale kullanımı çok sınırlıdır:

```text
availability
price
opening_hours
event_date
road_closure
safety_restriction
weather_forecast
reservation_condition
```

## 17. Freshness değerlendirme çıktısı

```json
{
  "claimType": "hotel_price",
  "freshnessClass": "F1",
  "evaluationTime": "2026-08-06T13:00:00Z",
  "targetDate": "2026-09-01",
  "ageSeconds": 1200,
  "expectedLifetimeSeconds": 1800,
  "freshnessScore": 0.67,
  "freshnessConfidence": 0.98,
  "status": "acceptable",
  "hardExpired": false,
  "reasonCodes": []
}
```

## 18. Hard kurallar

- Future target date validity yoksa fresh kabul edilmez.
- `retrievedAt` ile `effectiveAt` karıştırılmaz.
- Climate normal forecast gibi puanlanmaz.
- Review trend freshness, tekil review freshness ile aynı değildir.
- Expired fiyat veya müsaitlik kullanıcıya güncel teklif gibi sunulamaz.
