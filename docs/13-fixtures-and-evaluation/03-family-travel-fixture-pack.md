# 03 — Family Travel Fixture Pack

**Doküman türü:** family travel fixture design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nun çocuklu aile seyahati isteklerini doğru yorumlayıp yorumlamadığını ölçmek için kullanılacak family travel fixture setini tanımlar.

Bu dosya test runner değildir.

Bu dosya runtime automation, CI, script veya evaluator implementation içermez.

## Ana karar

```yaml
fixture_pack_id: family_travel_fixture_pack
fixture_pack_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/03-family-travel-fixture-pack.md
related_golden_scenarios:
  - GS-001
  - GS-003
  - GS-004
  - GS-005
  - GS-006
  - GS-007
```

## Bu fixture pack neyi ölçer?

Family Travel Fixture Pack şu davranışları ölçer:

```yaml
measured_behaviors:
  - çocuk yaşlarının doğru taşınması
  - 2 yaş çocuk için öğle dinlenmesi ihtiyacının korunması
  - 6 yaş çocuk için ilgi/aktivite uygunluğunun dikkate alınması
  - her gün 2-3 alternatif beklentisinin korunması
  - yüksek yorgunluklu günlerin uyarı veya yeniden dengeleme üretmesi
  - ebeveyn yükünün görünür hale getirilmesi
  - rota ve aktivite temposunun aile profiline göre yorumlanması
  - indoor fallback ihtiyacının fark edilmesi
```

## İlgili agent/contract kapsamı

```yaml
covered_agents:
  - trip_intake_agent
  - constraint_policy_agent
  - family_suitability_agent
  - route_logistics_agent
  - activity_fit_agent
  - day_plan_composer_agent
  - final_response_composer_agent
covered_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
  - route-logistics-contract.md
  - activity-fit-contract.md
  - day-plan-contract.md
  - final-response-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
```

## Fixture required fields

Her family travel fixture aşağıdaki alanları taşımalıdır:

```yaml
required_fixture_fields:
  - fixture_id
  - source_golden_scenario
  - user_request
  - family_profile
  - expected_intake_behavior
  - expected_constraint_behavior
  - expected_family_suitability_behavior
  - expected_day_plan_behavior
  - expected_final_response_behavior
  - expected_warnings
  - forbidden_outputs
  - evaluation_notes
```

## FT-001 — Kocaeli çıkışlı 2 ve 6 yaş çocuklu aile

```yaml
fixture_id: FT-001
source_golden_scenario: GS-001
user_request: >
  Kocaeli'den çıkışlı, 2 yetişkin ve 2 çocuklu aile için 5 günlük tatil planı istiyorum.
  Çocuklar 2 ve 6 yaşında. Her gün için 2-3 alternatif olsun. Çok yorucu olmasın.
family_profile:
  adults: 2
  children:
    - age: 2
    - age: 6
expected_intake_behavior:
  origin_detected: Kocaeli
  party_detected: true
  children_ages_detected:
    - 2
    - 6
  duration_detected_days: 5
  alternatives_per_day_detected: true
expected_constraint_behavior:
  hard_constraints:
    - children_age_2_and_6
    - five_day_plan
  soft_preferences:
    - low_fatigue
    - multiple_alternatives_per_day
expected_family_suitability_behavior:
  toddler_rest_need: required
  older_child_engagement_need: required
  high_fatigue_warning_required: true
expected_day_plan_behavior:
  lunch_rest_block_required: true
  minimum_alternatives_per_day: 2
  maximum_target_alternatives_per_day: 3
expected_final_response_behavior:
  family_friendly_explanation_required: true
  fatigue_disclosure_required: true
forbidden_outputs:
  - toddler_rest_block_missing
  - one_option_only_day_plan
  - high_fatigue_plan_without_warning
  - child_ages_missing_from_reasoning
```

## FT-002 — Öğle dinlenmesi ihmal edilen yoğun plan

```yaml
fixture_id: FT-002
source_golden_scenario: GS-007
user_request: >
  Kocaeli çıkışlı 3 günlük plan yap. Sabah erken çıkalım, tüm gün gezelim,
  çocuklar 2 ve 6 yaşında ama mümkün olduğunca çok yer görelim.
family_profile:
  adults: 2
  children:
    - age: 2
    - age: 6
expected_intake_behavior:
  high_activity_intent_detected: true
  children_ages_detected:
    - 2
    - 6
expected_constraint_behavior:
  soft_preferences:
    - see_many_places
  policy_warnings:
    - toddler_fatigue_risk
expected_family_suitability_behavior:
  fatigue_risk: high
  toddler_rest_need: required
  parent_burden_warning_required: true
expected_day_plan_behavior:
  plan_must_be_rebalanced: true
  lunch_rest_block_required: true
  excessive_back_to_back_activity_forbidden: true
expected_final_response_behavior:
  must_explain_why_plan_is_softened: true
forbidden_outputs:
  - see_many_places_preference_overrides_toddler_rest
  - all_day_high_tempo_plan
  - no_fatigue_warning
```

## FT-003 — 6 yaş çocuk için ilgi çekici ama 2 yaş için hafif alternatif

```yaml
fixture_id: FT-003
source_golden_scenario: GS-005
user_request: >
  Bursa hayvanat bahçesini sabah düşündüm. Öğleden sonra çocuklar için ne yapabiliriz?
  Çocuklar 2 ve 6 yaşında.
family_profile:
  adults: 2
  children:
    - age: 2
    - age: 6
expected_intake_behavior:
  morning_anchor_activity_detected: Bursa hayvanat bahçesi
  afternoon_recommendation_requested: true
expected_family_suitability_behavior:
  post_morning_fatigue_considered: true
  toddler_low_intensity_option_required: true
  older_child_engagement_option_required: true
expected_day_plan_behavior:
  afternoon_options_required: true
  low_fatigue_option_required: true
  indoor_or_weather_safe_option_preferred: true
expected_final_response_behavior:
  must_present_options_not_single_forced_plan: true
forbidden_outputs:
  - too_far_afternoon_transfer_without_warning
  - no_rest_or_light_option
  - only_adult_oriented_activity
```

## FT-004 — Yağmurlu gün aile planı

```yaml
fixture_id: FT-004
source_golden_scenario: GS-006
user_request: >
  2 ve 6 yaş çocukla tatildeyiz. Hava yağmurlu olursa aynı gün için alternatif plan da olsun.
family_profile:
  adults: 2
  children:
    - age: 2
    - age: 6
expected_constraint_behavior:
  soft_preferences:
    - rainy_day_backup
expected_family_suitability_behavior:
  indoor_fallback_required: true
  toddler_safe_indoor_option_required: true
expected_day_plan_behavior:
  weather_sensitive_blocks_marked: true
  indoor_alternatives_present: true
expected_final_response_behavior:
  weather_uncertainty_disclosure_required: true
forbidden_outputs:
  - outdoor_only_plan
  - weather_claim_without_evidence
  - indoor_fallback_missing
```

## FT-005 — Bütçe ve aile konforu dengesi

```yaml
fixture_id: FT-005
source_golden_scenario: GS-004
user_request: >
  Balıkesir için 3 günlük aile tatili planla. 2 yetişkin, çocuklar 2 ve 6 yaşında,
  bütçe 30000 TL. Kendi aracımız var. Öğlen dinlenme iyi olur.
family_profile:
  adults: 2
  children:
    - age: 2
    - age: 6
expected_intake_behavior:
  budget_detected: 30000 TL
  own_car_detected: true
  midday_rest_preference_detected: true
expected_constraint_behavior:
  hard_constraints:
    - family_with_children
  soft_preferences:
    - budget_awareness
    - own_car
    - midday_rest
expected_family_suitability_behavior:
  accommodation_family_fit_needed: true
  route_burden_considered: true
  rest_block_required: true
expected_final_response_behavior:
  budget_uncertainty_disclosure_required: true
  exact_price_without_evidence_forbidden: true
forbidden_outputs:
  - exact_total_cost_without_evidence
  - no_midday_rest_block
  - too_many_long_drive_days
```

## Common expected warnings

```yaml
expected_warnings:
  - toddler_fatigue_risk
  - long_drive_with_children
  - weather_sensitive_activity
  - unverified_price_or_hours
  - parking_or_access_uncertainty
  - parent_burden_high_when_day_is_dense
```

## Common forbidden outputs

```yaml
common_forbidden_outputs:
  toddler_rest_block_missing: forbidden
  child_ages_ignored: forbidden
  high_fatigue_day_without_warning: forbidden
  one_option_only_when_alternatives_requested: forbidden
  exact_price_without_evidence: forbidden
  exact_opening_hours_without_evidence: forbidden
  exact_drive_time_without_evidence: forbidden
  adult_only_plan_for_family_request: forbidden
```

## Evaluation notes

Bu fixture pack, planın eğlenceli olup olmadığından önce aile güvenliği, dinlenme, yorgunluk ve uygulanabilirlik dengesini ölçer.

```text
Aile tatili için iyi plan, en çok yer gezdiren plan değildir.
İyi plan; çocuk yaşına, dinlenmeye, yorgunluk riskine, ulaşım yüküne ve alternatif ihtiyacına uyumlu plandır.
```

## Current status

```yaml
fixture_pack_state: drafted
next_artifact: 04-constraint-violation-fixture-pack.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
