# 08 — Day Plan Coherence Fixture Pack

**Doküman türü:** day plan coherence fixture design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nun gün bazlı plan üretirken sabah, öğle dinlenmesi, öğleden sonra ve akşam bloklarını tutarlı biçimde kurup kurmadığını ölçen fixture setini tanımlar.

Bu dosya test runner değildir.

Bu dosya runtime automation, CI, script veya evaluator implementation içermez.

## Ana karar

```yaml
fixture_pack_id: day_plan_coherence_fixture_pack
fixture_pack_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/08-day-plan-coherence-fixture-pack.md
related_golden_scenarios:
  - GS-001
  - GS-003
  - GS-004
  - GS-005
  - GS-006
  - GS-007
```

## Bu fixture pack neyi ölçer?

Day Plan Coherence Fixture Pack şu davranışları ölçer:

```yaml
measured_behaviors:
  - her gün için morning/lunch_rest/afternoon/evening bloklarının anlamlı kurulması
  - 2 yaş çocuk varsa öğle dinlenmesi bloğunun korunması
  - kullanıcı 2-3 alternatif istediyse günlük alternatiflerin korunması
  - çok yorucu arka arkaya günlerin uyarı veya yeniden dengeleme üretmesi
  - hava/otopark/yol/fiyat belirsizliklerinin plan akışında disclosure olarak taşınması
  - deniz/plaj bloğunda privacy şartının görünür kalması
  - aynı gün içinde rota ve aktivite yoğunluğunun çelişmemesi
  - final cevapta planın uygulanabilir ve okunabilir sunulması
```

## İlgili agent/contract kapsamı

```yaml
covered_agents:
  - day_plan_composer_agent
  - route_logistics_agent
  - family_suitability_agent
  - activity_fit_agent
  - verification_evidence_agent
  - final_response_composer_agent
covered_contracts:
  - day-plan-contract.md
  - route-logistics-contract.md
  - family-suitability-contract.md
  - activity-fit-contract.md
  - verification-evidence-contract.md
  - final-response-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
```

## Fixture required fields

```yaml
required_fixture_fields:
  - fixture_id
  - source_golden_scenario
  - user_request
  - plan_context
  - expected_day_plan_behavior
  - expected_route_logistics_behavior
  - expected_family_suitability_behavior
  - expected_verification_behavior
  - expected_final_response_behavior
  - expected_warnings
  - forbidden_outputs
  - evaluation_notes
```

## DPC-001 — Beş günlük plan, her gün 2-3 alternatif

```yaml
fixture_id: DPC-001
source_golden_scenario: GS-003
user_request: >
  Kocaeli çıkışlı aile için 5 günlük plan yap. Her gün için 2-3 alternatif olsun.
  Çocuklar 2 ve 6 yaşında, çok yorucu olmasın.
plan_context:
  duration_days: 5
  children_ages:
    - 2
    - 6
  alternatives_requested: true
expected_day_plan_behavior:
  daily_plan_count: 5
  minimum_alternatives_per_day: 2
  maximum_target_alternatives_per_day: 3
  lunch_rest_block_required_each_day: true
  high_fatigue_sequence_warning_required: true
expected_family_suitability_behavior:
  toddler_rest_need_preserved: true
  older_child_engagement_need_preserved: true
expected_final_response_behavior:
  daily_cards_required: true
  alternatives_visible_per_day: true
  fatigue_notes_visible: true
forbidden_outputs:
  - missing_day
  - one_option_only_when_alternatives_requested
  - toddler_rest_block_missing
  - high_fatigue_sequence_without_warning
```

## DPC-002 — Sabah sabit aktivite sonrası hafif öğleden sonra

```yaml
fixture_id: DPC-002
source_golden_scenario: GS-005
user_request: >
  Bursa hayvanat bahçesine sabah gideceğiz. Öğleden sonra için çocuklara uygun 2-3 alternatif ver.
  Çocuklar 2 ve 6 yaşında.
plan_context:
  fixed_morning_activity: Bursa hayvanat bahçesi
  requested_block: afternoon
  children_ages:
    - 2
    - 6
expected_day_plan_behavior:
  morning_anchor_preserved: true
  afternoon_options_required: true
  low_fatigue_afternoon_option_required: true
  rest_or_light_transition_required: true
expected_route_logistics_behavior:
  far_afternoon_transfer_warning_required: true
expected_final_response_behavior:
  options_not_forced_single_plan: true
  parent_friendly_explanation_required: true
forbidden_outputs:
  - replaces_fixed_morning_activity
  - too_far_afternoon_transfer_without_warning
  - no_light_option_after_morning_zoo
```

## DPC-003 — Öğle dinlenmesi ile yoğun plan çakışması

```yaml
fixture_id: DPC-003
source_golden_scenario: GS-007
user_request: >
  2 ve 6 yaş çocukla sabahtan akşama kadar çok yer gezmek istiyoruz.
  Öğlen mümkünse dinlenelim ama zamanı da iyi kullanalım.
plan_context:
  children_ages:
    - 2
    - 6
  high_activity_intent: true
  midday_rest_preference: true
expected_day_plan_behavior:
  plan_must_be_rebalanced: true
  lunch_rest_block_required: true
  excessive_activity_density_warning_required: true
expected_family_suitability_behavior:
  fatigue_risk: high
  parent_burden_warning_required: true
expected_final_response_behavior:
  must_explain_tradeoff: true
forbidden_outputs:
  - see_many_places_preference_overrides_rest
  - all_day_dense_plan_without_warning
  - lunch_rest_block_missing
```

## DPC-004 — Yağmurlu gün outdoor plan fallback ihtiyacı

```yaml
fixture_id: DPC-004
source_golden_scenario: GS-006
user_request: >
  Hava yağmurlu olursa aynı gün için kapalı alan alternatifi de olsun.
  Çocuklar küçük olduğu için zorlanmayalım.
plan_context:
  weather_sensitive: true
  children_ages:
    - 2
    - 6
expected_day_plan_behavior:
  weather_sensitive_blocks_marked: true
  indoor_fallback_required: true
  fallback_should_preserve_rest_block: true
expected_verification_behavior:
  weather_claim_requires_evidence: true
  indoor_hours_requires_evidence: true
expected_final_response_behavior:
  rainy_day_disclosure_required: true
forbidden_outputs:
  - outdoor_only_plan
  - weather_will_be_good_without_evidence
  - indoor_fallback_without_hours_uncertainty
```

## DPC-005 — Deniz/plaj günü privacy ve dinlenme birlikte korunmalı

```yaml
fixture_id: DPC-005
source_golden_scenario: GS-002
user_request: >
  Deniz önerilecekse kadınlar plajı mutlaka olsun. Çocuklar 2 ve 6 yaşında,
  öğlen dinlenme iyi olur.
plan_context:
  sea_recommendation_possible: true
  women_only_beach_required_when_sea_recommended: true
  children_ages:
    - 2
    - 6
expected_day_plan_behavior:
  sea_day_must_carry_privacy_verification_need: true
  lunch_rest_block_required: true
  non_sea_alternative_required_if_privacy_unverified: true
expected_verification_behavior:
  women_only_beach_claim_requires_evidence: true
expected_final_response_behavior:
  privacy_disclosure_visible: true
forbidden_outputs:
  - sea_activity_without_women_only_beach_when_required
  - women_only_beach_claim_without_evidence_as_fact
  - privacy_match_overrides_toddler_rest
```

## Common expected warnings

```yaml
expected_warnings:
  - high_fatigue_day
  - high_fatigue_sequence
  - midday_rest_conflict
  - weather_sensitive_activity
  - parking_or_access_uncertainty
  - women_only_beach_verification_needed
  - exact_price_or_hours_unverified
```

## Common forbidden outputs

```yaml
common_forbidden_outputs:
  missing_day_in_multi_day_plan: forbidden
  one_option_only_when_alternatives_requested: forbidden
  toddler_rest_block_missing: forbidden
  activity_density_without_warning: forbidden
  fixed_morning_anchor_replaced_without_reason: forbidden
  outdoor_only_plan_when_rainy_fallback_requested: forbidden
  privacy_requirement_hidden_on_sea_day: forbidden
  exact_price_or_hours_without_evidence: forbidden
```

## Evaluation notes

Bu fixture pack, planın sadece öneri listesi olmamasını sağlar.

```text
İyi gün planı; blokları, alternatifleri, dinlenme aralıklarını, belirsizlikleri ve çocuk yorgunluğunu birlikte taşıyan uygulanabilir akıştır.
```

## Current status

```yaml
fixture_pack_state: drafted
next_artifact: 09-final-response-quality-rubric.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
