# Destination Discovery Agent — Scoring Model v1.0

## 1. Amaç

Bu belge, AG-002 tarafından kullanılan destinasyon puanlama modelini deterministik ve test edilebilir biçimde tanımlar.

LLM adayların açıklamasını ve gerekçesini yazabilir; ancak toplam skorun hesaplanması kod tabanlı evaluator tarafından yapılmalıdır.

## 2. Ana skor

Her aday için:

```text
baseScore =
  preferenceMatch      × wPreference
+ accessibility        × wAccessibility
+ seasonFit            × wSeason
+ familyFit            × wFamily
+ budgetFit            × wBudget
+ experienceDiversity  × wDiversity
+ dataReliability      × wReliability
```

Başlangıç ağırlıkları:

| Kriter | Ağırlık |
|---|---:|
| preferenceMatch | 0.25 |
| accessibility | 0.20 |
| seasonFit | 0.15 |
| familyFit | 0.15 |
| budgetFit | 0.10 |
| experienceDiversity | 0.10 |
| dataReliability | 0.05 |

Ağırlıkların toplamı her zaman `1.00` olmalıdır.

## 3. Profil bazlı ağırlık uyarlaması

Ağırlık değişikliği yalnız açık kullanıcı profiline dayanabilir.

### Çocuklu aile

0–5 yaş çocuk varsa:

```text
familyFit       +0.05
accessibility   +0.05
experienceDiversity -0.05
preferenceMatch -0.05
```

### Çok kısa tatil

`durationDays <= 3` ise:

```text
accessibility +0.10
experienceDiversity -0.05
budgetFit -0.05
```

### Gastronomi odaklı tatil

Gastronomi birinci öncelikse:

```text
preferenceMatch +0.05
experienceDiversity +0.05
accessibility -0.05
seasonFit -0.05
```

### Erişilebilirlik hard constraint

Tekerlekli sandalye veya step-free hard constraint varsa:

```text
familyFit +0.10
accessibility +0.05
experienceDiversity -0.05
preferenceMatch -0.10
```

Her uyarlama `scoringProfile.adjustments` alanında açıklanmalıdır.

## 4. Ceza modeli

```text
finalScore = clamp(baseScore - penalties, 0, 1)
```

### Belirsizlik cezaları

| Durum | Ceza |
|---|---:|
| Tek kritik kaynak | 0.03 |
| Çelişkili kritik kaynak | 0.08 |
| Güncelliği geçmiş veri | 0.10 |
| Bütçe verisi yok | 0.05 |
| Coğrafi çözüm belirsiz | 0.15 |
| Hard constraint koşullu | 0.10 |
| İleri tarih yalnız climate normal | 0.03 |

### Yol yükü cezaları

`travelBurdenPenalty` ayrı hesaplanır.

Başlangıç tablosu:

| Durum | Ceza |
|---|---:|
| 2 günlük tatilde tek yön 4–5 saat | 0.05 |
| 2 günlük tatilde tek yön >5 saat | 0.15 |
| 3 günlük tatilde tek yön 5–6 saat | 0.05 |
| 3 günlük tatilde tek yön >6 saat | 0.12 |
| 4–5 günlük tatilde tek yön >8 saat | 0.08 |
| Çok parçalı transfer | +0.05 |
| 0–5 yaş çocuk + uzun yol | +0.05 |

## 5. Hard constraint davranışı

Hard constraint ihlalinde puan hesaplanabilir ancak aday shortlist'e giremez.

```text
hardConstraintStatus = fail
eligibleForShortlist = false
```

Koşullu uyum varsa:

```text
hardConstraintStatus = conditional
penalty += 0.10
```

## 6. Confidence

Aday confidence skoru:

```text
candidateConfidence =
  sourceReliability      × 0.35
+ sourceAgreement        × 0.20
+ geographicResolution  × 0.15
+ temporalRelevance      × 0.15
+ inputCompleteness      × 0.15
- assumptionPenalty
- unresolvedConflictPenalty
```

Confidence ile suitability aynı şey değildir.

Bir aday:

- yüksek uygunluk + düşük confidence,
- düşük uygunluk + yüksek confidence

durumlarında olabilir.

## 7. Sıralama

Öncelik sırası:

1. `eligibleForShortlist = true`
2. `finalScore` yüksek
3. `candidateConfidence` yüksek
4. `dataReliability` yüksek
5. daha düşük yol yükü

Eşitlik hâlinde Orchestrator kullanıcıya iki adayı birlikte sunabilir.

## 8. Minimum kabul eşikleri

| Alan | Eşik |
|---|---:|
| shortlist finalScore | ≥ 0.60 |
| preferred candidate | ≥ 0.75 |
| candidate confidence | ≥ 0.65 |
| critical recommendation confidence | ≥ 0.80 |

Eşik altındaki adaylar yalnız alternatif veya araştırılması gereken aday olarak sunulabilir.

## 9. Çeşitlilik post-process

Top-N sıralaması doğrudan kullanıcıya verilmez.

Adaylar benzerlik kümelerine ayrılır:

- aynı alt bölge,
- aynı tatil türü,
- aynı erişim paterni,
- aynı maliyet bandı.

Top-3 içinde aynı kümeden en fazla 2 aday bulunabilir.

Hard constraint ve çok dar coğrafi kapsam bu kuralı geçersiz kılabilir.

## 10. Test zorunluluğu

Kod tabanlı evaluator en az şu testleri geçmelidir:

- ağırlık toplamı 1.00,
- finalScore 0–1,
- fail aday shortlist dışı,
- cezalar doğru uygulanıyor,
- profil uyarlamaları doğru,
- tie-break sırası doğru,
- çeşitlilik post-process deterministik.
