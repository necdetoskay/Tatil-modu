# Contract Rubric — Trip Profile Agent

| Criterion | Description | Pass Condition |
|-----------|-------------|----------------|
| SCHEMA_VALID | Çıktı JSON Schema'ya uyuyor mu? | `additionalProperties: false` ile validasyon geçer |
| REQUIRED_FIELDS | Tüm zorunlu alanlar mevcut mu? | `required` array'deki 14 alan hep dolu |
| FIELD_TYPES | Tipler doğru mu? | `budget.totalTRY` number, `conflictFlags` array, vs. |
| ENUM_VALID | Enum değerleri geçerli mi? | `tripPurpose` 7 değerden biri, `vehicle.type` 5 değerden biri |
| CONFIDENCE_RANGE | Confidence 0-1 arasında mı? | `confidence.score ∈ [0, 1]` |
| NO_UNDEFINED_FIELDS | Schema dışı alan üretmedi mi? | `additionalProperties` kontrolü |
| SOURCE_PRESENT | Source bilgisi eksiksiz mi? | `method`, `timestamp` mevcut |
| CONFLICT_FLAGS_ARRAY | conflictFlags array mi? | `typeof === array` |

**Scoring**: 8/8 → 1.0, 7/8 → 0.875, …, 0/8 → 0.0
```
schemaScore = passedChecks / totalChecks
```

**Pass threshold**: 1.0 (tüm kontroller geçmeli)
```
<tool_call>write<arg_key>contents</arg_key><arg_value># Behavioral Rubric — Trip Profile Agent

| Criterion | Rule ID | Description | Pass Condition |
|-----------|---------|-------------|----------------|
| AGE_BAND_ELEMENTARY | R-01 | Yaş 6 → elementary | children[0].ageBand === "elementary" |
| AGE_BAND_BABY | R-01 | Yaş 2 → baby | children[1].ageBand === "baby" |
| AGE_BAND_PRESCHOOLER | R-01 | Yaş 3-5 → preschooler | children[].ageBand === "preschooler" |
| CHILD_CARE_INFERENCE | R-05 | Yaş < 6 çocuk varsa childCareNeeds=true | childCareNeeds === true |
| BUDGET_POSITIVE | R-03a | Bütçe > 0 | budget.totalTRY > 0 (veya conflict flag) |
| BUDGET_NEGATIVE_FLAG | CF-03 | Negatif bütçe → conflict flag | conflictFlags includes "budget_invalid" |
| VEHICLE_NORMALIZED | R-02 | Geçersiz vehicle → any | vehicle.type === "any" + conflict flag |
| DATE_CONFLICT_DETECTED | CF-01 | startDate > endDate → flag | conflictFlags includes "date_range_invalid" |
| PER_PERSON_CALCULATED | R-05 | perPersonPerNightTRY hesaplanır | perPersonPerNightTRY > 0 |
| ACCESSIBILITY_INFERRED | R-05 | "engel" kelimesi → accessibilityNeeds dolu | accessibilityNeeds.length > 0 |
| PET_FRIENDLY_DETECTED | R-01 | "kedi/köpek/evcil hayvan" → petFriendly=true | petFriendly === true |
| ELDERLY_COUNTED | R-01 | 65 yaş → elderlyCount >= 1 | elderlyCount >= 1 |
| CONFIDENCE_PENALTY | R-03 | Conflict varsa confidence <= 0.5 | confidence.score <= 0.5 |

**Scoring**: 13 kontrolden geçen / 13
```
ruleScore = passedChecks / totalChecks
```

**Pass threshold**: 0.92 (en az 12/13)

- **Not**: `budget_negative_flag` gibi "hata durumunu doğru tespit etme" kuralları da burada değerlendirilir. Hata vermek başarıdır, sessiz kalmak başarısızdır.
```
