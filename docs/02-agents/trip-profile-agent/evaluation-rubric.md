# Trip Profile Agent — Evaluation Rubric

| Alan | Değer |
|---|---|
| Document ID | AGENT-002-RUB |
| Sürüm | 1.0 |
| Durum | Onay Bekliyor |
| Bağımlılıklar | TST-001, AGENT-002 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Trip Profile Agent için test değerlendirme kriterlerini (rubric) tanımlar. TST-001 standardına göre dört test seviyesi için ayrı rubrikler.

---

## 1. Schema Rubric

| Criterion | Description | Pass Condition |
|-----------|-------------|----------------|
| SCHEMA_VALID | Çıktı JSON Schema'ya uyuyor mu? | `additionalProperties: false` ile validasyon geçer |
| REQUIRED_FIELDS | Tüm zorunlu alanlar mevcut mu? | 22 zorunlu alan hep dolu |
| FIELD_TYPES | Tipler doğru mu? | `budget.amount` number, `travelParty.adults` integer |
| STATUS_ENUM | status enum geçerli mi? | `complete`, `partial`, `invalid` |
| CONFIDENCE_RANGE | confidence 0-1 arasında mı? | `confidence ∈ [0, 1]` |
| CONF_FACTORS | confidenceFactors objesi eksiksiz mi? | 5 faktör hep var |

**Scoring**: 6/6 → 1.0. **Threshold**: 1.0 (zorunlu)

---

## 2. Contract Rubric

| Criterion | Description | Pass Condition |
|-----------|-------------|----------------|
| INPUT_PARSED | Girdi doğru parse ediliyor mu? | `userMessage` → schema alanlarına eşleşir |
| STATUS_ASSIGNED | Doğru status ataması yapılıyor mu? | TPA-004 → invalid, TPA-001 → partial |
| HANDOFF_VALID | Diğer agentlar için çıktı kullanılabilir mi? | `ProfileReadiness` contract geçer |
| NO_UNDEFINED | Schema dışı alan üretmedi mi? | `additionalProperties: false` |
| SOURCE_TRACE | sourceTrace dolduruldu mu? | Boş olabilir ama var olmalı |

---

## 3. Behavioral Rubric

| Test ID | Rule | Expected Behavior |
|---------|------|-------------------|
| TPA-001 | R-01 | origin=Kocaeli, destination=Balıkesir, travelers=4, budget=30000 |
| TPA-002 | R-02 | budget=null → missingInformation includes "budget.amount" |
| TPA-005 | R-03 | Çocuk yaşı -2 → validationErrors: INVALID_CHILD_AGE |
| TPA-006 | R-01 | "Deniz" → preferences.tripTypes[0].type = "sea" |
| TPA-007 | R-02 | "ücretsiz otopark" → mustHaveFeatures includes "free_parking" |
| TPA-009 | R-01 | Güncel mesaj "yalnızca ben" → adults=1, CURRENT_MESSAGE_CONTEXT_CONFLICT |
| TPA-011 | R-05 | "Otel için 15000 TL" → budget.scope = "accommodation_only" |
| TPA-012 | R-05 | Otel bütçesi > toplam → ACCOMMODATION_BUDGET_EXCEEDS_TOTAL |
| TPA-013 | R-04 | "Elektrikli araç" → vehicleType = "electric_car" |
| TPA-014 | R-02 | "erşilebilir banyo" → mustHaveFeatures includes "accessible_bathroom" |
| TPA-015 | R-06 | "güzel tatil ayarla" → confidence < 0.5, status=invalid |

---

## 4. Scenario & Adversarial Rubric

| Test ID | Type | Expected Behavior |
|---------|------|-------------------|
| TPA-003 | Scenario | dates.mode=fixed, durationDays=3 |
| TPA-010 | Scenario | dates.agentMayRecommendDates=true (esnek tarih) |
| TPA-004 | Adversarial | startDate/endDate süresiyle çelişki → DATE_DURATION_MISMATCH |
| TPA-009 | Adversarial | knownUserContext ile çelişki → CURRENT_MESSAGE_CONTEXT_CONFLICT |
| TPA-012 | Adversarial | Otel bütçesi > toplam → ACCOMMODATION_BUDGET_EXCEEDS_TOTAL |
| TPA-005 | Adversarial | Negatif yaş → INVALID_CHILD_AGE, status=invalid |

## 5. Triple Evaluation Skorları

Her test için üç motor çalışır:

| Motor | Ağırlık | Trip Profile için not |
|-------|---------|----------------------|
| Schema Validator | %25 | Zorunlu 1.0 |
| Rule Evaluator | %30 | deterministic kural kontrolü |
| LLM Reviewer | %15 | girdi çıktı mantıklı mı? |
| Scenario/Test | %20 | senaryo sonuçları |
| Cost/Perf | %10 | latency, maliyet |

**Geçme**: schemaScore=1.0 AND ruleScore≥0.85 AND overallScore≥0.85

## 6. Başarı Metrikleri (from specification.md §11)

| Metrik | Hedef |
|--------|-------|
| Schema Validity | %100 |
| Information Extraction Accuracy | ≥ %98 |
| Child Ages | 100% |
| Budget Extraction | ≥ %99 |
| Conflict Detection | ≥ %95 |
| Assumption Rate | ≤ %1 |
