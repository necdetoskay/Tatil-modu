# 01 — Fixture Evaluation Overview

**Doküman türü:** fixture ve evaluation overview  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu belge, Tatil Modu için fixture ve evaluation tasarımının genel çerçevesini tanımlar.

Amaç, agent specification ve contract dosyalarının yalnızca yazılmış olmasını değil, örnek senaryolar üzerinden ölçülebilir ve denetlenebilir olmasını sağlamaktır.

Bu belge test runner, otomasyon, CI veya runtime evaluator değildir.

## Ana karar

```yaml
fixture_evaluation_overview_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/01-fixture-evaluation-overview.md
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
next_artifact: 02-golden-scenario-catalog.md
```

## Evaluation amacı

Evaluation tasarımı şu sorulara cevap vermelidir:

```text
Agent doğru contract'ı üretiyor mu?
Contract eksik veya belirsiz bilgiyi doğru taşıyor mu?
Hard constraint ihlali görünür mü?
Soft preference yanlışlıkla hard constraint'e dönüşüyor mu?
Evidence eksikliği final cevaba doğru disclosure ile taşınıyor mu?
Çocuklu aile planında yorgunluk, öğle dinlenmesi ve alternatif ihtiyacı korunuyor mu?
Mahremiyet/kadınlar plajı şartı olan senaryoda deniz önerisi güvenli şekilde sınırlandırılıyor mu?
```

## Evaluation hiyerarşisi

Fixture değerlendirmelerinde öncelik sırası değişmez:

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

Bu sıra önemlidir çünkü güzel görünen bir plan, hard constraint veya evidence ihlali varsa başarılı kabul edilemez.

## Fixture türleri

İlk phase fixture seti aşağıdaki türleri kapsar:

```yaml
fixture_types:
  golden_scenario:
    purpose: "Normal ve beklenen başarılı akışları temsil eder"
    examples:
      - Kocaeli çıkışlı çocuklu aile seyahati
      - 5 günlük tek il planı
      - günlük 2-3 alternatifli plan
  constraint_violation:
    purpose: "Hard constraint ihlallerini görünür kılar"
    examples:
      - kadınlar plajı şartı varken doğrulanmamış deniz önerisi
      - 150 km dışı aday için istisna gerekçesi olmaması
  evidence_gap:
    purpose: "Doğrulanmamış iddianın final cevapta kesin bilgiye dönüşmesini engeller"
    examples:
      - net fiyat yok
      - açılış saati yok
      - otopark bilgisi belirsiz
  family_fit:
    purpose: "Çocuk yaşı, yorgunluk, dinlenme ve ebeveyn yükünü ölçer"
    examples:
      - 2 yaş çocuk için öğle dinlenmesi eksik
      - her gün yüksek yorgunluklu aktivite
  final_response_quality:
    purpose: "Kullanıcıya gösterilen cevabın açıklanabilir, güvenli ve kullanışlı olmasını ölçer"
    examples:
      - varsayım bildirimi var mı
      - blocker disclosure var mı
      - alternatifler okunabilir mi
```

## Minimum fixture yapısı

Her fixture en az aşağıdaki alanları tasarım düzeyinde tanımlamalıdır:

```yaml
fixture_required_fields:
  fixture_id: required
  fixture_type: required
  user_request: required
  target_agents: required
  target_contracts: required
  given_context: required
  expected_outputs: required
  expected_blockers: required_when_applicable
  expected_warnings: required_when_applicable
  expected_evidence_gaps: required_when_applicable
  forbidden_outputs: required
  evaluation_priority: required
```

Bu alanlar runtime JSON schema değildir; fixture dokümantasyon standardıdır.

## Expected outcome kuralı

Her fixture yalnızca örnek input taşıyamaz.

Her fixture şu soruya cevap vermelidir:

```text
Bu senaryo doğru işlendiğinde ne görmeliyiz, yanlış işlendiğinde hangi hata yakalanmalı?
```

Örnek expected outcome alanları:

```yaml
expected_outcome_examples:
  - hard constraint korunmalı
  - women_only_beach verification gap görünmeli
  - öğle dinlenme bloğu korunmalı
  - doğrulanmamış fiyat kesin bilgi gibi yazılmamalı
  - 2-3 günlük alternatif sunulmalı
  - final cevap blocker disclosure içermeli
```

## Forbidden output kuralı

Her fixture, sistemin üretmemesi gereken şeyleri de tanımlamalıdır.

```yaml
common_forbidden_outputs:
  - unverified_claim_as_fact
  - hidden_hard_blocker
  - missing_toddler_rest_block
  - sea_recommendation_without_privacy_verification_when_required
  - exact_price_without_evidence
  - exact_opening_hours_without_evidence
  - exact_drive_time_without_evidence
  - out_of_radius_candidate_without_exception_reason
  - final_response_without_assumption_notice_when_assumptions_exist
```

## Contract coverage yaklaşımı

Fixture seti tüm contract dosyalarını kapsamalıdır:

```yaml
contract_coverage_required:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
  - destination-candidate-contract.md
  - route-logistics-contract.md
  - accommodation-fit-contract.md
  - activity-fit-contract.md
  - day-plan-contract.md
  - verification-evidence-contract.md
  - final-response-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
```

Hiçbir contract evaluation kapsamı dışında bırakılmamalıdır.

## Agent coverage yaklaşımı

Fixture seti tüm first phase agent specification dosyalarını kapsamalıdır:

```yaml
agent_coverage_required:
  - trip-intake-agent.md
  - constraint-policy-agent.md
  - family-suitability-agent.md
  - destination-candidate-agent.md
  - route-logistics-agent.md
  - accommodation-fit-agent.md
  - activity-fit-agent.md
  - day-plan-composer-agent.md
  - verification-evidence-agent.md
  - final-response-composer-agent.md
```

## Golden scenario önemi

Golden scenario, sistemin beklenen doğru davranışını korumak için kullanılır.

Golden scenario tasarımı şu tür soruları yanıtlar:

```text
Bu aile için doğru plan iskeleti nedir?
Hangi alternatifler görünmeli?
Hangi bilgi eksikleri kullanıcıya taşınmalı?
Hangi iddialar evidence olmadan kesinleşmemeli?
```

Golden scenario dosyaları runtime snapshot değildir.

## Regression yaklaşımı

Regression tasarımı, daha sonra yapılacak her değişiklikte korunması gereken davranışları tanımlar.

```yaml
regression_policy_design:
  preserve_hard_constraint_behavior: true
  preserve_evidence_disclosure_behavior: true
  preserve_family_rest_behavior: true
  preserve_privacy_sensitive_beach_behavior: true
  preserve_final_response_blocker_visibility: true
```

## Kalite kapıları

Kodlama öncesi evaluation tasarımının geçmesi gereken kapılar:

```yaml
pre_code_evaluation_gates:
  - all_first_phase_agents_have_fixture_coverage
  - all_first_phase_contracts_have_fixture_coverage
  - hard_constraint_failure_modes_defined
  - evidence_gap_failure_modes_defined
  - family_fatigue_failure_modes_defined
  - privacy_sensitive_beach_failure_modes_defined
  - final_response_quality_rubric_defined
  - regression_baseline_policy_defined
```

## Out of scope

Bu belge şunları içermez:

```yaml
out_of_scope:
  - test runner implementation
  - CI configuration
  - executable test code
  - Playwright or Jest design
  - model provider selection
  - runtime scoring algorithm
  - live tool invocation
  - live price or weather verification
```

## Open design questions

```yaml
open_questions:
  - Fixture dosyaları ileride tekil senaryo dosyalarına mı bölünecek?
  - Golden baseline manuel mi onaylanacak?
  - Evaluation rubric skorları sayısal mı, geçer/kaldı mı olacak?
  - Her fixture için minimum kaç failure expectation zorunlu olacak?
```

## Current status

```yaml
fixture_evaluation_overview_state: drafted
next_artifact: 02-golden-scenario-catalog.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
