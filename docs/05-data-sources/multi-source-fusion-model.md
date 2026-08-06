# Multi-source Fusion Model v1.0

## 1. Amaç

Aynı entity ve claim hakkında birden fazla kaynaktan gelen:

- observed fact,
- experience evidence,
- authority assessment,
- freshness assessment,
- evidence strength,
- conflict resolution

sonuçlarını tek ve izlenebilir claim-level assessment içinde birleştirmek.

Fusion, kaynakları ortalamak değildir.

## 2. Temel çıktı türleri

### Fused Fact

Resmî veya yapılandırılmış factual claim.

Örnek:

```text
parking_policy = free
```

### Fused Experience Assessment

Kullanıcı deneyimine dayalı claim.

Örnek:

```text
parking_capacity_experience = often_insufficient_evening
```

### Composite User Assessment

Fact ve experience sonucunun kullanıcı profiline göre birlikte yorumlanması.

Örnek:

```text
Özel araçlı aile için otopark riski orta-yüksek.
```

## 3. Fusion ön koşulları

Kaynaklar birleştirilmeden önce:

- canonical entity eşleşmeli,
- claim type normalize edilmeli,
- time window ayrılmalı,
- segment normalize edilmeli,
- unit/value scale normalize edilmeli,
- duplicate temizlenmeli,
- conflict resolution uygulanmalı.

## 4. Kaynak ağırlığı

Her source/evidence item için başlangıç ağırlığı:

```text
itemWeight =
  authorityScore
× freshnessScore
× evidenceStrength
× relevanceScore
× verificationModifier
× independenceModifier
```

Değerler `0–1` aralığındadır.

## 5. Hard gate

Aşağıdaki item'lar fusion'a alınmaz:

- hard expired,
- rejected source,
- identity conflict unresolved,
- license/use policy ihlali,
- critical privacy ihlali,
- schema invalid,
- duplicate primary copy,
- claim scope dışı source.

## 6. Factual claim fusion

Factual claim için:

```text
weightedValueSupport =
  Σ(itemWeight for normalized value)
```

En yüksek destekli değer dominant candidate olur.

Ancak dominant candidate seçilebilmesi için:

- minimum total weight,
- minimum margin,
- conflict severity uygunluğu,
- authority/freshness hard gate

sağlanmalıdır.

## 7. Categorical value fusion

Örnek:

```text
free
paid
unavailable
unknown
```

Her kategori için weighted support hesaplanır.

Başlangıç seçim kuralı:

```text
winnerShare >= 0.65
ve
winnerMargin >= 0.20
```

Aksi halde:

```text
status = mixed_or_unresolved
```

## 8. Numeric fusion

Sayısal claim'lerde:

- scale normalize edilir,
- outlier kontrol edilir,
- weighted median tercih edilir,
- gerektiğinde weighted mean destekleyici olarak tutulur.

Örnek claim'ler:

```text
price
distance
rating
temperature
```

Canlı fiyat ve availability gibi claim'lerde farklı offer/entity bağlamları birleştirilmez.

## 9. Experience fusion

Deneyim claim'lerinde ana birim tekil yorum değil, normalize evidence kümesidir.

Fusion faktörleri:

- evidence strength,
- segment relevance,
- trend freshness,
- source diversity,
- contradiction rate,
- sample sufficiency.

## 10. Source diversity bonusu

Bağımsız kaynak çeşitliliği confidence'ı artırabilir.

Başlangıç bonusu:

| Bağımsız kaynak ailesi | Bonus |
|---|---:|
| 1 | 0 |
| 2 | 0.03 |
| 3 | 0.06 |
| 4+ | 0.08 |

Bonus quality score'a eklenir; 1'i aşamaz.

## 11. Dominant source sınırı

Tek bir provider veya source cluster nihai toplam ağırlığın çok büyük kısmını oluşturuyorsa confidence cezası uygulanır.

Başlangıç:

```text
dominantSourceShare > 0.80
→ penalty 0.05

dominantSourceShare > 0.95
→ penalty 0.10
```

Resmî tekil policy fact'lerde bu kural claim türüne göre esnetilebilir.

## 12. Fact ve experience ayrımı

Aşağıdaki alanlar aynı değerde eritilmez:

```text
officialFact
experienceAssessment
userImpactAssessment
```

Örnek:

```json
{
  "officialFact": {
    "parkingAvailable": true,
    "parkingFee": "free"
  },
  "experienceAssessment": {
    "eveningCapacity": "often_insufficient"
  },
  "userImpactAssessment": {
    "riskLevel": "medium_high"
  }
}
```

## 13. Segment-aware fusion

Kullanıcı segmenti varsa ayrı fusion profili uygulanır.

Örnek:

```text
family_with_toddler
couple
business
mobility_support_needed
```

Aynı evidence farklı segmentlerde farklı relevance ağırlığı alabilir.

## 14. Time-window fusion

Historical ve current data aynı pencerede birleştirilmez.

Örnek:

```text
current_90_days
previous_90_days
historical_2_years
```

Trend assessment ayrı üretilir.

## 15. Conflict etkisi

Conflict Resolution sonucu fusion'a şu şekilde yansır:

- resolved: seçilen claim dominant olabilir,
- partially_resolved: confidence cezası,
- unresolved: claim mixed/unresolved kalır,
- not_a_conflict: scope/segment ayrı tutulur.

## 16. Fusion confidence

Başlangıç modeli:

```text
fusionConfidence =
  weightedEvidenceQuality × 0.35
+ sourceAgreement         × 0.20
+ sourceDiversity         × 0.10
+ freshnessCoverage       × 0.15
+ authorityCoverage       × 0.10
+ metadataCompleteness    × 0.10
+ diversityBonus
- dominantSourcePenalty
- unresolvedConflictPenalty
- coveragePenalty
```

## 17. Fusion status

```text
resolved
resolved_with_caveats
mixed
unresolved
insufficient
```

## 18. Minimum coverage

Bir claim için fusion sonucu üretmek için en az:

- bir eligible source/evidence item,
- claim-specific authority veya evidence strength,
- freshness değerlendirmesi,
- source trace

gereklidir.

Kritik claim'lerde daha yüksek coverage şartı uygulanabilir.

## 19. Explanation payload

Fusion sonucu kullanıcıya açıklanabilir olmalıdır.

```text
Neyi biliyoruz?
Neye dayanıyoruz?
Hangi kaynaklar destekliyor?
Hangi çelişkiler kaldı?
Bu kullanıcının profiline etkisi ne?
```

## 20. Fusion çıktısı

```json
{
  "fusionId": "fusion-parking-001",
  "entityId": "hotel-001",
  "claimType": "parking",
  "segment": "family_with_toddler",
  "timeWindow": "current_90_days",
  "status": "resolved_with_caveats",
  "officialFact": {},
  "experienceAssessment": {},
  "userImpactAssessment": {},
  "selectedValue": null,
  "candidateValues": [],
  "sourceRefs": [],
  "evidenceRefs": [],
  "conflictRefs": [],
  "fusionConfidence": 0.83,
  "qualityScore": 0.86,
  "reasonCodes": [],
  "policyVersion": "1.0.0"
}
```

## 21. Hard kurallar

- Factual ve experiential claim tek scalar değere indirgenmez.
- Hard-expired veya lisans dışı veri fusion'a girmez.
- Unresolved critical conflict resolved gibi gösterilmez.
- Dominant source etkisi gizlenmez.
- Segment-aware evidence genel kullanıcıya otomatik uygulanmaz.
- Source/evidence refsiz fusion sonucu üretilemez.
