# Trip Profile Agent — Decision Rules

| Alan | Değer |
|---|---|
| Document ID | AGENT-002-DR |
| Sürüm | 1.0 |
| Durum | Taslak (Review) |
| Bağımlılıklar | AGENT-002 (Specification), TST-001 (Testing Standard) |
| Son Güncelleme | 2026-08-06 |

---

## 1. Karar Kuralları

Trip Profile Agent, kararlarını şu üç katmandan oluşturur:

1. **LLM Inference** — Doğal dil girdisinden entity çıkarma
2. **Deterministic Rule Engine** — Validasyon, çelişki kontrolü, enum normalizasyonu
3. **Confidence Hesaplama** — Eksiksizlik × kural uyumu

### 1.1. Entity Extraction (LLM)

| Alan | LLM Extraction Method | Deterministic Fallback |
|------|----------------------|----------------------|
| tripPurpose | Intent classification (7 sınıf) | Keyword matching |
| temporal | Tarih parsing (Turkish + ISO) | Regex date extraction |
| travelers.adults | Count of "yetişkin" / "adult" | Number entity extraction |
| travelers.children | Age extraction from child mentions | Number + age keyword extraction |
| budget | TRY amount extraction | Regex `\d+\s*(TL|₺)` |
| vehicle | Vehicle keyword mapping | Regex + enum matching |
| accommodationPreference | Keyword → enum | Keyword → enum |
| accessibilityNeeds | "engel", "ramp", "wheelchair" | Keyword matching |
| petFriendly | "evcil hayvan", "pet" | Keyword matching |

### 1.2. Deterministic Rule Engine

#### R-01: Zorunlu Alan Kontrolü

```
Zorunlu alanlar = [
  profileId, tripPurpose, temporal, travelers, budget, vehicle,
  accommodationPreference, accessibilityNeeds, childCareNeeds,
  petFriendly, riskTolerance, confidence, source, conflictFlags
]
```

Eksik her alan için `confidence.completeness` azaltılır.

#### R-02: Enum Validation

| Alan | Geçerli Değerler |
|------|-----------------|
| `tripPurpose` | `relaxation`, `exploration`, `adventure`, `family`, `romantic`, `culture`, `wellness` |
| `temporal.flexibility` | `fixed`, `flexible_3days`, `flexible_7days`, `month` |
| `temporal.seasonPreference` | `summer`, `winter`, `spring`, `autumn`, `any` |
| `vehicle.type` | `private_car`, `public_transport`, `walking`, `electric_vehicle`, `rental_car` |
| `accommodationPreference.type` | `hotel`, `apartment`, `villa`, `hostel`, `boutique`, `resort`, `camping`, `any` |
| `budget.currency` | `TRY` |
| `budget.budgetFlexibility` | `strict`, `moderate`, `flexible` |
| `riskTolerance` | `low`, `medium`, `high` |

Geçersiz enum → `conflictFlags += [field_invalid]`, enum `any` veya default değere çevrilir.

#### R-03: Sayısal Limit Kontrolü

| Kural | Koşul | Etki |
|-------|-------|------|
| R-03a | `budget.totalTRY ≤ 0` | `conflictFlags += [budget_invalid]` |
| R-03b | `temporal.durationDays < 1` | `conflictFlags += [duration_invalid]` |
| R-03b | `temporal.durationDays > 60` | `conflictFlags += [duration_exceeds_max]` |
| R-03c | `travelers.adults < 1` | `conflictFlags += [no_adult_traveler]` |
| R-03d | `travelers.children[].age < 0` veya `> 17` | `conflictFlags += [child_age_invalid]` |

#### R-04: Çelişki Tespit (Conflict Detection)

| ID | Kural | Etki |
|----|-------|------|
| CF-01 | `startDate > endDate` | `conflictFlags += [date_range_invalid]` |
| CF-02 | `durationDays > 60` | `conflictFlags += [duration_exceeds_max]` |
| CF-03 | `budget.totalTRY ≤ 0` | `conflictFlags += [budget_invalid]` |
| CF-04 | `adults < 1` | `conflictFlags += [no_adult_traveler]` |
| CF-05 | `children[].age` ∉ [0,17] | `conflictFlags += [child_age_invalid]` |
| CF-06 | `vehicle.type` geçersiz | `conflictFlags += [vehicle_invalid]` |
| CF-07 | `perPersonPerNightTRY > totalTRY / durationDays × 2` | `conflictFlags += [budget_unrealistic]` |
| CF-08 | `startDate`+`endDate` var ama `durationDays` hesaplanamıyorsa | `warnings += [duration_days_inferred]` |

#### R-05: Inference (Bilgi Çıkarma)

| Koşul | Eylem |
|-------|-------|
| `durationDays` yok, `startDate`+`endDate` var | `durationDays = endDate - startDate` |
| `perPersonPerNightTRY` yok | `= totalTRY / durationDays / adults` |
| `childCareNeeds` belirsiz | `true` if any child age < 6 |
| `riskTolerance` belirsiz | `medium` (default) |
| `seasonPreference` belirsiz | `any` |

### 1.3. Confidence Hesaplama

```
completeness = (filled_required_fields) / (total_required_fields)

rule_compliance = 1.0 - (conflict_count × 0.15) - (invalid_enum_count × 0.10)
  if rule_compliance < 0: rule_compliance = 0.0

confidence.score = completeness × 0.7 + rule_compliance × 0.3
```

| Confidence Range | Meaning | Orchestrator Eylemi |
|-----------------|---------|-------------------|
| 0.0 - 0.50 | Kritik eksiklik | Kullanıcıdan temel sorular sor |
| 0.51 - 0.80 | Orta eksiklik | Eksik alanlar için takip soruları |
| 0.81 - 1.00 | Hazır | Diğer agentları devreye al |

---

## 2. Puanlama Modeli

Trip Profile Agent için puanlama, doğrudan bir "skor" değil, **güvenilirlik profilidir**.

- **completeness**: %70 — Kullanıcı ne kadar detay verdiyse
- **rule_compliance**: %30 — Girdiler kısa kurallara uyuyor mu?

Bu iki faktörün çarpımları değil, ağırlıklı toplamıdır. Çünkü bir profil çok eksiksiz olabilir ama çelişkili (örnek: bütçe 0 TL), ya da çelişkisiz ama çok eksik olabilir.

---

## 3. Karar Akışı Diagramı

```
[User Input (text/structured)]
         ↓
  1. LLM Entity Extraction
         ↓
  2. Deterministic Validation
    ├── Enum Check (R-02)
    ├── Numeric Limits (R-03)
    ├── Conflict Detection (R-04)
    └── Inference (R-05)
         ↓
  3. Confidence Calculation
         ↓
  [TripProfile JSON]
    ├── confidence.score
    ├── conflictFlags
    ├── missingFields
    └── warnings
```

---

## 4. Diğer Agentlarla Etkileşim

| Consumer Agent | TripProfile alanı | Kullanım |
|---------------|-------------------|----------|
| Destination Research Agent | `tripPurpose`, `durationDays`, `budget.totalTRY`, `vehicle.type` | Konuşlandırma sinyali |
| Accommodation Agent | `travelers`, `budget.perPersonPerNightTRY`, `accommodationPreference`, `petFriendly` | Otel arama kriterleri |
| Route Planner | `travelers.children` (yaşlar), `vehicle.type`, `durationDays` | Rota kısıtlamaları |
| Budget Evaluator | `budget`, `durationDays`, `vehicle` | Maliyet tahmini |
| Orchestrator | `confidence`, `conflictFlags` | Profil readiness kontrolü |
