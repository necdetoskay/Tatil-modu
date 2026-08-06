# Evidence Strength Model v1.0

## 1. Amaç

Bir claim'i destekleyen kanıt kümesinin ne kadar güçlü olduğunu deterministik biçimde ölçmek.

Evidence strength:

- authority,
- freshness,
- örneklem büyüklüğü,
- doğrulanmışlık,
- kaynak çeşitliliği,
- segment uyumu,
- duplicate etkisi,
- destek/çelişki dengesi,
- doğrudan gözlem

boyutlarını birlikte değerlendirir.

Evidence strength, truth garantisi değildir.

## 2. Evidence türleri

### E1 — Tekil observed fact

Kaynakta doğrudan bulunan tek bilgi.

Örnek:

```text
Resmî sayfada otopark var.
```

### E2 — Tekil deneyim kaydı

Bir kullanıcının tek yorumu veya post-trip feedback'i.

### E3 — Toplu deneyim kanıtı

Birden fazla yorum veya deneyim kaydından oluşan tema.

### E4 — Cross-source corroborated fact

Birden fazla bağımsız kaynağın aynı claim'i desteklemesi.

### E5 — Derived assessment

Authority, freshness, relevance ve evidence strength ile oluşturulan değerlendirme.

## 3. Ana faktörler

```text
sourceAuthority
freshness
verification
sampleSufficiency
independence
sourceDiversity
segmentRelevance
claimSpecificity
directObservation
supportRatio
consistency
```

## 4. Başlangıç formülü

```text
baseStrength =
  sourceAuthority   × 0.18
+ freshness         × 0.12
+ verification      × 0.10
+ sampleSufficiency × 0.15
+ independence      × 0.10
+ sourceDiversity   × 0.08
+ segmentRelevance  × 0.10
+ claimSpecificity  × 0.07
+ directObservation × 0.05
+ supportRatio      × 0.05
```

Ardından:

```text
finalStrength =
  clamp(
    baseStrength
    - duplicatePenalty
    - contradictionPenalty
    - manipulationPenalty
    - coveragePenalty,
    0,
    1
  )
```

## 5. Örneklem yeterliliği

Tekil yorum ile yüzlerce yorum aynı ağırlığı alamaz.

Başlangıç logaritmik model:

```text
sampleSufficiency =
  min(1, log10(uniqueSampleCount + 1) / log10(targetSampleSize + 1))
```

Örnek hedefler:

| Claim türü | Target sample |
|---|---:|
| Temizlik deneyimi | 30 |
| Gürültü | 25 |
| Otopark yeterliliği | 20 |
| Çocuk uygunluğu | 20 |
| Personel davranışı | 30 |
| Fiyat/değer | 40 |
| Erişilebilirlik deneyimi | 15 |
| Çalışma saati corroboration | 3 |

Target sample claim türüne göre değişir.

## 6. Unique sample

`rawReviewCount` kullanılmaz.

Kullanılması gereken:

```text
uniqueSampleCount
```

Duplicate cluster içindeki yorumlar tek kanıt birimi sayılır veya azaltılmış ağırlık alır.

## 7. Duplicate penalty

```text
duplicateRatio = duplicateCount / rawRecordCount
```

Başlangıç cezası:

| Duplicate oranı | Ceza |
|---|---:|
| 0–0.05 | 0 |
| 0.05–0.15 | 0.03 |
| 0.15–0.30 | 0.08 |
| >0.30 | 0.15 |

## 8. Verification

Başlangıç değerleri:

| Durum | Skor |
|---|---:|
| verified stay/visit/purchase | 1.00 |
| platform verified identity | 0.80 |
| unverified platform review | 0.55 |
| anonymous community content | 0.30 |
| unknown | 0.40 |

Toplu evidence için ağırlıklı doğrulanmışlık oranı kullanılır.

## 9. Bağımsızlık

Kanıtların aynı kökten kopyalanmaması gerekir.

Bağımsızlığı düşüren durumlar:

- aynı metin hash'i,
- aynı providerdan yeniden yayın,
- işletme testimonial'ı,
- aynı kampanya kaynağı,
- aynı author cluster,
- ortak syndication kaynağı.

## 10. Kaynak çeşitliliği

Bir claim üç farklı bağımsız kaynak ailesinden destekleniyorsa tek platformdaki aynı sayıda kayda göre daha güçlü olabilir.

Ancak kaynak çeşitliliği örneklem sayısının yerini tutmaz.

Başlangıç skorlaması:

```text
1 source/provider   → 0.35
2 independent       → 0.65
3 independent       → 0.85
4+ independent      → 1.00
```

## 11. Segment relevance

Kullanıcının profiline benzeyen deneyim kayıtları daha ilişkilidir.

Örnek:

```text
Kullanıcı:
2 ve 6 yaş çocuklu aile

Yorum:
2 küçük çocuklu aile
→ relevance 1.00

Yorum:
çift
→ relevance 0.45

Yorum:
iş seyahati
→ relevance 0.25
```

Segment relevance kullanıcı tercihini değiştirmez; yalnız evidence'in kullanıcıya uygulanabilirliğini ölçer.

## 12. Claim specificity

Genel yorum:

```text
Harikaydı.
```

düşük claim specificity taşır.

Spesifik yorum:

```text
Otopark saat 20:00'den sonra tamamen doluydu.
```

yüksek claim specificity taşır.

## 13. Support ratio

```text
supportRatio =
  supportWeight /
  (supportWeight + contradictionWeight)
```

Neutral veya alakasız kayıtlar paydaya girmez.

## 14. Contradiction penalty

Çelişki otomatik olarak evidence'i geçersiz kılmaz.

Başlangıç yaklaşımı:

```text
contradictionRate =
  contradictionWeight /
  (supportWeight + contradictionWeight)
```

| Oran | Ceza |
|---|---:|
| 0–0.10 | 0 |
| 0.10–0.25 | 0.04 |
| 0.25–0.40 | 0.10 |
| >0.40 | 0.18 |

Kaynak segmentleri farklıysa çelişki ayrı segmentlerde tutulabilir.

## 15. Recency weighting

Her evidence item freshness score ile ağırlıklandırılır.

```text
weightedSupport =
  Σ(itemWeight × itemFreshness × itemAuthority × itemVerification)
```

Eski yorum tamamen silinmeyebilir fakat son dönem trendinde etkisi düşer.

## 16. Trend evidence

Trend için en az iki zaman penceresi karşılaştırılır:

```text
currentWindow
previousWindow
```

Trend claim üretmek için:

- her iki pencere minimum örneklem sağlamalı,
- duplicate temizlenmeli,
- segment dağılımı aşırı değişmemeli,
- değişim minimum effect size eşiğini geçmeli.

## 17. Effect size

Yalnız yüzde değişim yeterli değildir.

Örnek:

```text
1 şikâyet → 2 şikâyet
%100 artış
```

ama örneklem çok küçüktür.

Trend için:

```text
absoluteChange
relativeChange
sampleSize
confidenceInterval
```

birlikte değerlendirilir.

## 18. Resmî fact evidence

Resmî fact için sample size genellikle 1 olabilir.

Bu durumda gücü artıran faktörler:

- claim-specific authority,
- effective date,
- source identity,
- cross-check,
- evidence fragment,
- freshness.

Sample sufficiency claim türüne göre farklı yorumlanır.

## 19. Deneyim evidence

Deneyim claim'lerinde güçlü evidence için:

- yeterli unique sample,
- güncel kayıt,
- verified ratio,
- segment relevance,
- düşük duplicate,
- spesifik claim,
- dengeli contradiction analizi

gerekir.

## 20. Manipülasyon penalty

Ceza nedenleri:

```text
sponsored_without_disclosure
testimonial_source
spam_cluster
rating_burst
copy_pattern
single_campaign_source
review_exchange_suspicion
```

## 21. Coverage penalty

Claim'in yalnız küçük bir alt boyutu gözlemleniyorsa uygulanır.

Örnek:

```text
2 yorum otopark girişini anlatıyor,
genel otopark kapasitesini değil.
```

## 22. Strength sınıfları

| Sınıf | Skor | Anlam |
|---|---:|---|
| `very_strong` | 0.85–1.00 | karar için güçlü |
| `strong` | 0.70–0.84 | çoğu karar için yeterli |
| `moderate` | 0.50–0.69 | destekleyici |
| `weak` | 0.25–0.49 | dikkatle kullanılmalı |
| `insufficient` | 0.00–0.24 | öneri için yetersiz |

## 23. Evidence confidence

Strength ile confidence ayrıdır.

```text
strength:
eldeki kanıt kümesinin gücü

confidence:
bu strength hesabının doğruluğundan ne kadar eminiz?
```

Eksik metadata confidence'ı düşürür.

## 24. Evidence değerlendirme çıktısı

```json
{
  "evidenceId": "ev-parking-001",
  "claimType": "parking_experience",
  "entityId": "hotel-001",
  "rawRecordCount": 42,
  "uniqueSampleCount": 34,
  "supportCount": 24,
  "contradictionCount": 5,
  "neutralCount": 5,
  "verifiedRatio": 0.76,
  "duplicateRatio": 0.19,
  "sourceDiversityCount": 2,
  "segmentRelevance": 0.91,
  "strengthScore": 0.78,
  "strengthClass": "strong",
  "strengthConfidence": 0.88,
  "penalties": [],
  "policyVersion": "1.0.0"
}
```

## 25. Hard kurallar

- Duplicate kayıtlar bağımsız örneklem sayılmaz.
- Tek anonim yorum `strong` olamaz.
- Verified status model tarafından uydurulamaz.
- Segment relevance örneklem yetersizliğini tamamen telafi edemez.
- Yüksek yıldız ortalaması claim-specific evidence yerine kullanılamaz.
- Resmî policy fact ile kullanıcı deneyimi aynı evidence kümesinde eritilmez.
