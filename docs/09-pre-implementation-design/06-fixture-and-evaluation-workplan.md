# 06 — Fixture and Evaluation Workplan

**Doküman türü:** Pre-implementation fixture and evaluation workplan  
**Kapsam:** Tatil Modu  
**Durum:** tasarım planı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu belge, Tatil Modu için koddan önce hazırlanması gereken golden scenario, fixture, evaluation rubric, regression ve test artifact'larının hangi sırayla tasarlanacağını belirler.

Amaç test kodu yazmak değildir.

Amaç, ileride yazılacak agent ve orchestrator davranışlarının nasıl ölçüleceğini kağıt üzerinde netleştirmektir.

```yaml
implementation_allowed: false
prototype_allowed: false
test_code_allowed: false
fixture_design_allowed: true
evaluation_design_allowed: true
```

## Ana ilke

Tatil Modu çıktısı tek bir güzel cevapla doğrulanamaz.

Sistem ancak aşağıdaki sorulara cevap verebiliyorsa tasarım açısından olgunlaşır:

- Aynı senaryoda tutarlı davranıyor mu?
- Hard constraint'leri ihlal ediyor mu?
- Çocuklu aile yorgunluğunu doğru yönetiyor mu?
- Kadınlar plajı / mahremiyet hassasiyetini yanlış veya uydurma bilgiyle mi ele alıyor?
- Trafik, otopark, rota ve dinlenme dengesini açıklayabiliyor mu?
- Evidence ve confidence taşıyor mu?
- Alternatifleri neden seçtiğini veya elediğini açıklıyor mu?

## Fixture sınıfları

| Fixture türü | Amaç | Örnek |
|---|---|---|
| `golden_scenario` | Uçtan uca referans senaryo | Kocaeli çıkışlı Bursa/Balıkesir aile tatili |
| `agent_unit_fixture` | Tek agent davranışını test eder | Trip Intake Agent normalize eder mi? |
| `contract_fixture` | Input/output schema uyumunu test eder | Agent response envelope geçerli mi? |
| `constraint_fixture` | Hard constraint davranışını test eder | Kadınlar plajı yoksa deniz önerisi nasıl işaretlenir? |
| `evidence_fixture` | Evidence/confidence davranışını test eder | Saat bilgisi eskiyse confidence düşüyor mu? |
| `tool_mock_fixture` | Canlı provider yerine mock veri verir | Hava, rota, POI, otel mock response |
| `regression_fixture` | Önceden doğru davranışı korur | Aynı aile isteği tekrar bozuluyor mu? |
| `adversarial_fixture` | Zorlayıcı/çelişkili istekleri test eder | Hem düşük bütçe hem lüks spa hem kısa mesafe |

## Evaluation katmanları

Tatil Modu evaluation sırası şu olmalıdır:

```text
1. Contract Validation
2. Safety / Policy / Hard Constraint Gate
3. Evidence and Verification Quality
4. Family Suitability Quality
5. Route / Logistics Practicality
6. Daily Plan Coherence
7. Alternative Quality
8. User Explanation Quality
9. Cost / Latency / Runtime Readiness
10. Regression Stability
```

Koddan önce her katmanın neyi ölçtüğü ve pass/fail davranışı yazılmalıdır.

## Golden scenario tasarım sırası

İlk golden scenario aşağıdaki gibi tasarlanmalıdır:

```yaml
golden_scenario_id: TM-GOLDEN-001
name: Kocaeli çıkışlı çocuklu aile kısa tatil planı
family:
  adults: 2
  children:
    - age: 6
    - age: 2
origin: Kocaeli
candidate_regions:
  - Bursa
  - Balıkesir
duration_days: 3
hard_constraints:
  - düşük yorgunluk
  - öğle dinlenmesi
  - çocuklara uygun aktivite
  - trafik ve otopark dikkate alınmalı
  - deniz öneriliyorsa kadınlar plajı/hassasiyet değerlendirmesi yapılmalı
soft_preferences:
  - zengin alternatifler
  - kısa sürüş blokları
  - aile dostu mekanlar
expected_output:
  - gün gün plan
  - her gün 2-3 alternatif
  - gerekçeli seçimler
  - evidence/confidence notları
  - uygulanabilirlik uyarıları
```

## Fixture artifact planı

Koddan önce aşağıdaki dosyalar tasarlanmalıdır:

```text
docs/12-fixtures/
├─ README.md
├─ golden-scenarios/
│  ├─ TM-GOLDEN-001-kocaeli-bursa-balikesir-family-trip.md
│  └─ TM-GOLDEN-001.expected-output.md
├─ agent-unit-fixtures/
│  ├─ trip-intake-agent-fixtures.md
│  ├─ constraint-policy-agent-fixtures.md
│  ├─ family-suitability-agent-fixtures.md
│  └─ final-response-composer-fixtures.md
├─ tool-mock-fixtures/
│  ├─ weather-mock-fixtures.md
│  ├─ route-logistics-mock-fixtures.md
│  ├─ poi-activity-mock-fixtures.md
│  └─ accommodation-mock-fixtures.md
└─ adversarial-fixtures/
   ├─ conflicting-preferences-fixtures.md
   └─ missing-evidence-fixtures.md
```

## Evaluation artifact planı

Koddan önce aşağıdaki evaluation belgeleri tasarlanmalıdır:

```text
docs/13-evaluation/
├─ README.md
├─ evaluation-hierarchy.md
├─ contract-validation-rubric.md
├─ hard-constraint-rubric.md
├─ family-suitability-rubric.md
├─ route-logistics-rubric.md
├─ evidence-confidence-rubric.md
├─ final-plan-quality-rubric.md
├─ regression-gate-policy.md
└─ evaluation-report-format.md
```

## Rubric tasarım ilkeleri

Her rubric şunları içermelidir:

- ölçülen davranış,
- pass/fail kriteri,
- puanlama gerekiyorsa puan ölçeği,
- hard fail koşulları,
- warning koşulları,
- örnek iyi çıktı,
- örnek kötü çıktı,
- hangi fixture ile test edileceği,
- hangi artifact'a bağlı olduğu.

## Hard fail örnekleri

Aşağıdaki durumlar hard fail sayılmalıdır:

- çocuk yaşları dikkate alınmadan yorucu plan verilmesi,
- öğle dinlenmesi gereği yok sayılması,
- kadınlar plajı/hassasiyet şartının uydurma bilgiyle karşılanması,
- kapalı veya doğrulanmamış mekanın yüksek confidence ile önerilmesi,
- trafik/otopark uyarısı gereken yerde hiç uyarı verilmemesi,
- hard constraint ihlal eden seçeneğin normal öneri gibi sunulması,
- evidence olmadan kesin ifade kullanılması.

## Agent bazlı fixture önceliği

İlk fixture tasarım sırası:

1. Trip Intake Agent fixtures
2. Constraint & Policy Agent fixtures
3. Family Suitability Agent fixtures
4. Route & Logistics Agent fixtures
5. Activity Fit Agent fixtures
6. Final Response Composer fixtures
7. End-to-end golden scenario expected output

Bu sıra, agent implementation sırası değildir.

Bu sıra sadece tasarım ve test hazırlığı sırasıdır.

## Mock provider tasarım ihtiyacı

Canlı provider kullanılmadan önce mock response şekilleri tasarlanmalıdır:

- weather mock response,
- route duration mock response,
- parking availability mock response,
- POI opening hours mock response,
- accommodation feature mock response,
- public authority rule mock response.

Mock fixture'lar gerçek sağlayıcı entegrasyonu değildir.

## Regression yaklaşımı

Regression tasarımı şu soruya cevap vermelidir:

```text
Daha önce doğru kabul ettiğimiz bir senaryo, yeni agent/spec/contract değişikliğiyle bozuldu mu?
```

İlk regression gate yalnız doküman düzeyinde tanımlanmalıdır.

Kod yok.

## Completion criteria

Bu workplan tamamlandı sayılırsa:

- fixture sınıfları tanımlanmış olur,
- ilk golden scenario belirlenmiş olur,
- fixture dosya ağacı önerilmiş olur,
- evaluation dosya ağacı önerilmiş olur,
- hard fail örnekleri belirlenmiş olur,
- ilk fixture tasarım sırası belirlenmiş olur,
- regression yaklaşımı tasarım düzeyinde açıklanmış olur.

## Son karar

```yaml
fixture_workplan_state: created
evaluation_workplan_state: created
first_golden_scenario: TM-GOLDEN-001
first_fixture_batch:
  - Trip Intake Agent fixtures
  - Constraint & Policy Agent fixtures
  - Family Suitability Agent fixtures
  - Route & Logistics Agent fixtures
  - Final Response Composer fixtures
next_design_document: 07-tool-and-capability-workplan.md
implementation_status: blocked
prototype_status: blocked
```
