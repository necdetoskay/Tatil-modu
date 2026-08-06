# Destination Discovery Agent — Deterministic Evaluator Contract

## 1. Amaç

LLM tarafından üretilen aday ham verisini doğrulayan, puanlayan ve sıralayan kod tabanlı bileşenin sözleşmesini tanımlar.

## 2. Girdi

```json
{
  "tripProfile": {},
  "scoringProfile": {},
  "candidateDrafts": [],
  "distanceMatrix": {},
  "sourceRecords": [],
  "evaluationContext": {
    "currentDate": "2026-08-06",
    "mode": "fixture"
  }
}
```

## 3. Çıktı

```json
{
  "validatedCandidates": [],
  "rejectedCandidates": [],
  "ranking": [],
  "diversityAdjustments": [],
  "validationErrors": [],
  "metrics": {
    "candidateCount": 0,
    "eligibleCount": 0,
    "rejectedCount": 0
  }
}
```

## 4. Sorumluluklar

Evaluator:

- schema doğrular,
- ağırlık toplamını kontrol eder,
- skorları hesaplar,
- ceza uygular,
- hard constraint kontrol eder,
- duplicate adayları birleştirir veya reddeder,
- shortlist eligibility belirler,
- sıralama yapar,
- çeşitlilik post-process uygular.

Evaluator:

- yeni destinasyon üretmez,
- kaynak araştırmaz,
- doğal dil açıklaması yazmaz,
- kullanıcı niyetini yeniden yorumlamaz.

## 5. Deterministik alanlar

Aşağıdakiler LLM tarafından nihai değer olarak belirlenemez:

- `baseScore`
- `penaltyTotal`
- `finalScore`
- `eligibleForShortlist`
- `rank`
- `duplicateStatus`
- `hardConstraintStatus`
- `diversityAdjustment`

## 6. Hata kodları

```text
INVALID_WEIGHT_SUM
MISSING_REQUIRED_SCORE
SCORE_OUT_OF_RANGE
UNKNOWN_PENALTY
DUPLICATE_CANDIDATE
MISSING_SOURCE_REFERENCE
HARD_CONSTRAINT_CONFLICT
INVALID_RANKING
```

## 7. Kabul kriterleri

- Aynı girdi her çalışmada aynı sonucu üretir.
- Floating-point toleransı `1e-6`.
- Ağırlık toplamı `1.0 ± 1e-6`.
- Tüm skorlar 0–1 aralığında.
- Hard fail aday rank alamaz.
- Rank değerleri 1'den başlayıp kesintisiz ilerler.
- Top-N çeşitlilik kuralı deterministik uygulanır.

## 8. Test modu

Fixture mode'da evaluator dış servise çağrı yapmaz.

Tüm mesafe, kaynak ve candidate draft verisi fixture'dan gelir.
