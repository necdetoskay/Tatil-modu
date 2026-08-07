# 13 — Fixtures and Evaluation

**Doküman türü:** canonical fixture ve evaluation design alanı  
**Durum:** first phase tamamlandı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu klasör, Tatil Modu agent specification ve contract setinin gerçek örneklerle değerlendirilebilir olmasını sağlamak için kullanılır.

Bu alan test runner, otomasyon, CI veya runtime evaluation implementation değildir.

Bu alanın amacı şudur:

```text
Agent + contract tasarımları hangi örnek senaryolarla, hangi kabul kriterleriyle ve hangi hata sınıflarıyla doğrulanacak?
```

## Ana karar

```yaml
fixture_evaluation_design_state: first_phase_completed
fixture_evaluation_first_phase_completed: true
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
test_runner_code_allowed: false
evaluation_design_required_before_coding: true
source_of_truth: docs/13-fixtures-and-evaluation/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
next_stage: docs/14-tool-and-capability-design/
first_next_artifact: docs/14-tool-and-capability-design/README.md
```

Bu klasörde Playwright, Jest, Vitest, CI workflow, script, TypeScript, Zod veya runtime evaluator yazılmaz.

Önce fixture ve değerlendirme tasarımı yapılır.

## Neden bu aşama gerekli?

Contract dosyalarının varlığı tek başına yeterli değildir.

Her contract için şu sorular yanıtlanmalıdır:

```text
Bu contract doğru doldu mu?
Eksik bilgi nasıl görünür?
Hard constraint ihlali nasıl yakalanır?
Doğrulanmamış iddia final cevaba nasıl taşınmaz?
Çocuklu aile için yorucu plan nasıl elenir veya uyarılır?
Kadınlar plajı şartı olan senaryoda deniz önerisi nasıl güvenli taşınır?
```

## İlk-phase fixture ve evaluation seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Fixture Evaluation Overview | [`01-fixture-evaluation-overview.md`](01-fixture-evaluation-overview.md) | drafted |
| 2 | Golden Scenario Catalog | [`02-golden-scenario-catalog.md`](02-golden-scenario-catalog.md) | drafted |
| 3 | Family Travel Fixture Pack | [`03-family-travel-fixture-pack.md`](03-family-travel-fixture-pack.md) | drafted |
| 4 | Constraint Violation Fixture Pack | [`04-constraint-violation-fixture-pack.md`](04-constraint-violation-fixture-pack.md) | drafted |
| 5 | Evidence Gap Fixture Pack | [`05-evidence-gap-fixture-pack.md`](05-evidence-gap-fixture-pack.md) | drafted |
| 6 | Privacy Sensitive Beach Fixture Pack | [`06-privacy-sensitive-beach-fixture-pack.md`](06-privacy-sensitive-beach-fixture-pack.md) | drafted |
| 7 | Route Logistics Fixture Pack | [`07-route-logistics-fixture-pack.md`](07-route-logistics-fixture-pack.md) | drafted |
| 8 | Day Plan Coherence Fixture Pack | [`08-day-plan-coherence-fixture-pack.md`](08-day-plan-coherence-fixture-pack.md) | drafted |
| 9 | Final Response Quality Rubric | [`09-final-response-quality-rubric.md`](09-final-response-quality-rubric.md) | drafted |
| 10 | Regression and Golden Baseline Policy | [`10-regression-and-golden-baseline-policy.md`](10-regression-and-golden-baseline-policy.md) | drafted |
| 11 | Evaluation Completion Checklist | [`11-evaluation-completion-checklist.md`](11-evaluation-completion-checklist.md) | drafted |

## Evaluation hiyerarşisi

Fixture ve evaluation tasarımı şu öncelik sırasını kullanır:

```text
Safety / Policy Gate
> Contract Validation
> Hard Constraint Compliance
> Evidence / Verification Quality
> Domain Quality
> Plan Coherence / Usability
> Cost / Latency
> Regression / Golden Fixture
```

## Fixture yazım ilkeleri

1. Fixture kullanıcı senaryosunu ve beklenen contract davranışını açıkça tanımlar.
2. Fixture gerçek runtime tool çağrısı içermez.
3. Fixture canlı fiyat, saat, hava veya otopark iddiasını gerçek gibi yazmaz.
4. Her fixture en az bir expected outcome taşır.
5. Her fixture hangi agent/contract çiftini test ettiğini belirtir.
6. Hard constraint ihlali bekleniyorsa expected blocker açıkça yazılır.
7. Evidence eksikliği varsa final cevapta nasıl disclosure yapılacağı belirtilir.
8. Fixture metinleri çocuklu aile, dinlenme, yorgunluk ve mahremiyet hassasiyetlerini kapsamalıdır.

## Golden scenario kapsamı

İlk golden scenario seti şu aile tatili problemlerini kapsamalıdır:

```yaml
required_golden_scenarios:
  - kocaeli_origin_family_two_children
  - women_only_beach_required_when_sea_recommended
  - five_day_single_target_city_with_alternatives
  - three_day_balikesir_budget_family_trip
  - bursa_zoo_morning_afternoon_alternative
  - rainy_day_indoor_fallback
  - excessive_drive_time_with_toddler
  - missing_date_and_budget
  - unverified_price_and_opening_hours
  - hard_constraint_vs_soft_preference_conflict
```

## Failure mode kapsamı

Evaluation tasarımı şu failure mode'ları yakalayabilmelidir:

```yaml
required_failure_modes:
  - hard_constraint_ignored
  - soft_preference_treated_as_hard_constraint
  - low_confidence_assumption_treated_as_fact
  - unverified_claim_presented_as_fact
  - women_only_beach_requirement_hidden
  - toddler_rest_block_missing
  - too_many_high_fatigue_days
  - no_daily_alternatives
  - out_of_radius_candidate_without_exception_reason
  - final_response_missing_blocker_disclosure
```

## Current status

```yaml
fixture_evaluation_design_state: first_phase_completed
completed_artifacts:
  - 01-fixture-evaluation-overview.md
  - 02-golden-scenario-catalog.md
  - 03-family-travel-fixture-pack.md
  - 04-constraint-violation-fixture-pack.md
  - 05-evidence-gap-fixture-pack.md
  - 06-privacy-sensitive-beach-fixture-pack.md
  - 07-route-logistics-fixture-pack.md
  - 08-day-plan-coherence-fixture-pack.md
  - 09-final-response-quality-rubric.md
  - 10-regression-and-golden-baseline-policy.md
  - 11-evaluation-completion-checklist.md
next_stage: docs/14-tool-and-capability-design/
first_next_artifact: docs/14-tool-and-capability-design/README.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
