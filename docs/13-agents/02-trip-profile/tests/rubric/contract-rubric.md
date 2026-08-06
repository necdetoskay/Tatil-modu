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
