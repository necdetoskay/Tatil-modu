# 02 — Golden Scenario Catalog

**Doküman türü:** golden scenario catalog  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu doküman, Tatil Modu sisteminin tasarım olarak başarılı sayılması için desteklemesi gereken temel kullanıcı senaryolarını tanımlar.

Bu dosya test runner değildir.

Bu dosya golden scenario setinin tasarım kataloğudur.

## Ana karar

```yaml
golden_scenario_catalog_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/02-golden-scenario-catalog.md
```

## Golden scenario ne demektir?

Golden scenario, sistemin mutlaka doğru ele alması gereken temsilî senaryodur.

Bir golden scenario şunları kanıtlamak için kullanılır:

```text
Kullanıcı isteği doğru anlaşılmış mı?
Hard constraint doğru taşınmış mı?
Çocuklu aile temposu korunmuş mu?
Alternatif üretme beklentisi karşılanmış mı?
Doğrulanmamış iddialar final cevapta kesin bilgi gibi sunulmamış mı?
```

Golden scenario, gerçek zamanlı arama veya canlı veri doğrulama yapmaz.

## Golden scenario formatı

Her golden scenario aşağıdaki alanları taşımalıdır:

```yaml
golden_scenario_required_fields:
  - scenario_id
  - title
  - user_request
  - user_context
  - expected_primary_contracts
  - expected_hard_constraints
  - expected_soft_preferences
  - expected_evidence_gaps
  - expected_final_response_behavior
  - forbidden_outputs
  - evaluation_priority
```

## Scenario listesi

| ID | Başlık | Ana risk | Öncelik |
|---|---|---|---|
| GS-001 | Kocaeli çıkışlı iki çocuklu aile tatili | aile temposu + mesafe + alternatif | high |
| GS-002 | Deniz önerisi varsa kadınlar plajı şartı | mahremiyet hard constraint | critical |
| GS-003 | Tek hedef il için 5 günlük plan | günlük alternatif + tempo | high |
| GS-004 | Balıkesir 3 günlük bütçeli aile tatili | bütçe + yol + çocuk uyumu | high |
| GS-005 | Bursa hayvanat bahçesi sabah, öğleden sonra alternatif | yarım gün planlama | medium |
| GS-006 | Yağmurlu gün indoor fallback | hava belirsizliği + alternatif | high |
| GS-007 | 2 yaş çocukla aşırı uzun yol | yorgunluk hard warning | critical |
| GS-008 | Tarih ve bütçe eksik istek | clarification + assumption | high |
| GS-009 | Doğrulanmamış fiyat ve açılış saati | evidence disclosure | critical |
| GS-010 | Hard constraint ile soft preference çakışması | constraint hiyerarşisi | critical |

## GS-001 — Kocaeli çıkışlı iki çocuklu aile tatili

```yaml
scenario_id: GS-001
title: Kocaeli çıkışlı iki çocuklu aile tatili
user_request: >
  Kocaeli'de yaşıyorum. 2 yetişkin, 6 ve 2 yaşında iki çocukla kısa bir tatil planlamak istiyorum.
  Kendi aracım var. Çok yorucu olmasın, çocuklara uygun olsun, her gün alternatifler olsun.
user_context:
  origin: Kocaeli
  adults: 2
  children:
    - age: 6
    - age: 2
  transport: own_car
expected_primary_contracts:
  - travel-request-contract.md
  - family-suitability-contract.md
  - route-logistics-contract.md
  - day-plan-contract.md
expected_hard_constraints:
  - toddler_rest_needs_visible
  - no_excessive_daily_fatigue_without_warning
expected_soft_preferences:
  - family_friendly_activities
  - low_fatigue_tempo
  - daily_alternatives
expected_evidence_gaps:
  - exact_drive_time
  - live_traffic
  - parking_status
expected_final_response_behavior:
  - explain_family_tempo
  - show_daily_alternatives
  - disclose_unverified_logistics
forbidden_outputs:
  - exact_drive_time_presented_without_evidence
  - no_midday_rest_for_toddler
  - single_option_day_plan_only
```

## GS-002 — Deniz önerisi varsa kadınlar plajı şartı

```yaml
scenario_id: GS-002
title: Deniz önerisi varsa kadınlar plajı şartı
user_request: >
  Deniz önereceksen kadınlar plajı mutlaka olmalı. Ailemle çocuklara uygun bir plan istiyorum.
user_context:
  privacy_requirement: women_only_beach_required_when_sea_recommended
  family_trip: true
expected_primary_contracts:
  - constraint-policy-contract.md
  - destination-candidate-contract.md
  - activity-fit-contract.md
  - verification-evidence-contract.md
  - final-response-contract.md
expected_hard_constraints:
  - women_only_beach_required_when_sea_recommended
expected_soft_preferences:
  - sea_activity_if_privacy_requirement_can_be_satisfied
expected_evidence_gaps:
  - women_only_beach_status
  - beach_operational_rules
  - current_access_rules
expected_final_response_behavior:
  - never_hide_privacy_requirement
  - mark_unverified_privacy_claims
  - avoid_sea_recommendation_as_confirmed_without_evidence
forbidden_outputs:
  - sea_activity_without_women_only_beach_when_required
  - women_only_beach_claim_without_evidence
  - privacy_requirement_treated_as_soft_preference
```

## GS-003 — Tek hedef il için 5 günlük plan

```yaml
scenario_id: GS-003
title: Tek hedef il için 5 günlük plan
user_request: >
  Sadece hedef bir il vereceğim. O ilde 5 gün için, her gün 2-3 alternatifli bir tatil planı istiyorum.
user_context:
  duration_days: 5
  target_mode: single_city
expected_primary_contracts:
  - travel-request-contract.md
  - destination-candidate-contract.md
  - activity-fit-contract.md
  - day-plan-contract.md
  - final-response-contract.md
expected_hard_constraints:
  - daily_alternative_count_visible
expected_soft_preferences:
  - rich_options
  - low_fatigue_balance
  - family_friendly_day_blocks
expected_evidence_gaps:
  - opening_hours
  - ticket_prices
  - weather_sensitivity
expected_final_response_behavior:
  - organize_by_day
  - include_2_to_3_options_per_day_where_possible
  - disclose_operational_uncertainty
forbidden_outputs:
  - one_long_unstructured_list
  - no_daily_alternatives
  - exact_prices_without_evidence
```

## GS-004 — Balıkesir 3 günlük bütçeli aile tatili

```yaml
scenario_id: GS-004
title: Balıkesir 3 günlük bütçeli aile tatili
user_request: >
  Kocaeli'den Balıkesir'e 3 günlük tatil planlamak istiyorum. 2 yetişkin, 6 ve 2 yaşında iki çocuk var.
  Kendi aracım var. Bütçe 30000 TL olsun.
user_context:
  origin: Kocaeli
  target_area: Balıkesir
  duration_days: 3
  budget: 30000 TRY
  transport: own_car
  children:
    - age: 6
    - age: 2
expected_primary_contracts:
  - travel-request-contract.md
  - route-logistics-contract.md
  - accommodation-fit-contract.md
  - day-plan-contract.md
  - verification-evidence-contract.md
expected_hard_constraints:
  - budget_visible
  - toddler_rest_needs_visible
expected_soft_preferences:
  - route_reasonable_for_family
  - accommodation_family_fit
  - daily_alternatives
expected_evidence_gaps:
  - accommodation_price
  - live_availability
  - route_time
  - parking_status
expected_final_response_behavior:
  - show_budget_caveat
  - separate_verified_from_unverified
  - avoid_booking_claims
forbidden_outputs:
  - confirmed_hotel_availability_without_evidence
  - exact_total_cost_without_evidence
  - route_time_as_fact_without_evidence
```

## GS-005 — Bursa hayvanat bahçesi sabah, öğleden sonra alternatif

```yaml
scenario_id: GS-005
title: Bursa hayvanat bahçesi sabah, öğleden sonra alternatif
user_request: >
  Bursa hayvanat bahçesini sabah sevdim. Öğleden önce buraya gidersek öğleden sonra için ne önerirsin?
user_context:
  partial_day_plan: true
  morning_anchor: Bursa hayvanat bahçesi
  family_trip: true
expected_primary_contracts:
  - activity-fit-contract.md
  - route-logistics-contract.md
  - day-plan-contract.md
  - final-response-contract.md
expected_hard_constraints:
  - afternoon_fatigue_must_be_considered
expected_soft_preferences:
  - nearby_low_fatigue_afternoon
  - indoor_or_light_alternative
expected_evidence_gaps:
  - opening_hours
  - distance_between_points
  - parking_status
expected_final_response_behavior:
  - propose_light_afternoon_options
  - explain_child_fatigue
  - disclose_unverified_hours
forbidden_outputs:
  - too_many_high_fatigue_afternoon_options
  - exact_opening_hours_without_evidence
```

## GS-006 — Yağmurlu gün indoor fallback

```yaml
scenario_id: GS-006
title: Yağmurlu gün indoor fallback
user_request: >
  Çocuklarla gezi planı yapıyoruz ama yağmur yağarsa alternatifimiz de olsun.
user_context:
  weather_sensitive: true
  family_trip: true
expected_primary_contracts:
  - activity-fit-contract.md
  - day-plan-contract.md
  - verification-evidence-contract.md
expected_hard_constraints:
  - weather_sensitive_activity_must_have_fallback
expected_soft_preferences:
  - indoor_family_friendly_options
expected_evidence_gaps:
  - weather_forecast
  - indoor_activity_opening_hours
expected_final_response_behavior:
  - include_bad_weather_alternative
  - avoid_claiming_forecast_without_evidence
forbidden_outputs:
  - outdoor_only_plan_when_weather_risk_exists
  - weather_forecast_as_fact_without_evidence
```

## GS-007 — 2 yaş çocukla aşırı uzun yol

```yaml
scenario_id: GS-007
title: 2 yaş çocukla aşırı uzun yol
user_request: >
  Kocaeli'den çok uzak bir yere günübirlik gitmek istiyorum. Yanımızda 2 yaşında çocuk var.
user_context:
  origin: Kocaeli
  trip_type: day_trip
  toddler_present: true
expected_primary_contracts:
  - route-logistics-contract.md
  - family-suitability-contract.md
  - day-plan-contract.md
  - final-response-contract.md
expected_hard_constraints:
  - excessive_drive_time_requires_warning_or_alternative
expected_soft_preferences:
  - shorter_route_alternatives
  - rest_stop_needed
expected_evidence_gaps:
  - exact_drive_time
  - live_traffic
expected_final_response_behavior:
  - warn_about_toddler_fatigue
  - offer closer alternatives
  - avoid forcing long route
forbidden_outputs:
  - long_day_trip_without_fatigue_warning
  - no_rest_stop_or_rest_block
```

## GS-008 — Tarih ve bütçe eksik istek

```yaml
scenario_id: GS-008
title: Tarih ve bütçe eksik istek
user_request: >
  Ailemle güzel bir tatil planı yapalım.
user_context:
  missing_date: true
  missing_budget: true
  missing_target: true
expected_primary_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - final-response-contract.md
expected_hard_constraints: []
expected_soft_preferences:
  - family_trip_inferred_if_user_says_family
expected_evidence_gaps:
  - target_area
  - date_window
  - budget
expected_final_response_behavior:
  - ask_or_surface_clarification_candidates
  - mark_assumptions_as_assumptions
forbidden_outputs:
  - specific_booking_style_plan_without_basic_inputs
  - low_confidence_assumption_treated_as_fact
```

## GS-009 — Doğrulanmamış fiyat ve açılış saati

```yaml
scenario_id: GS-009
title: Doğrulanmamış fiyat ve açılış saati
user_request: >
  Bana fiyatları ve açık olduğu saatleriyle bir gezi planı hazırla.
user_context:
  asks_for_prices: true
  asks_for_opening_hours: true
expected_primary_contracts:
  - verification-evidence-contract.md
  - common-evidence-envelope.md
  - final-response-contract.md
expected_hard_constraints:
  - unverified_price_and_hours_cannot_be_presented_as_fact
expected_soft_preferences:
  - show_what_must_be_checked
expected_evidence_gaps:
  - current_price
  - opening_hours
  - source_freshness
expected_final_response_behavior:
  - disclose_price_hour_uncertainty
  - separate known assumptions from verification needs
forbidden_outputs:
  - exact_price_without_evidence
  - exact_opening_hours_without_evidence
  - source_claim_without_source_trace
```

## GS-010 — Hard constraint ile soft preference çakışması

```yaml
scenario_id: GS-010
title: Hard constraint ile soft preference çakışması
user_request: >
  Deniz olsun isterim ama kadınlar plajı yoksa deniz önermeyin. Çocuklar da yorulmasın.
user_context:
  sea_preference: soft
  women_only_beach_requirement: hard_when_sea_recommended
  low_fatigue: soft_to_strong_preference
expected_primary_contracts:
  - constraint-policy-contract.md
  - activity-fit-contract.md
  - verification-evidence-contract.md
  - final-response-contract.md
expected_hard_constraints:
  - women_only_beach_required_when_sea_recommended
expected_soft_preferences:
  - sea_activity
  - low_fatigue
expected_evidence_gaps:
  - women_only_beach_status
  - beach_access_rules
expected_final_response_behavior:
  - prioritize_hard_constraint_over_sea_preference
  - offer_non_sea_alternative_if_privacy_unverified
forbidden_outputs:
  - soft_preference_overrides_hard_constraint
  - privacy_requirement_hidden
  - unverified_beach_claim_as_fact
```

## Golden scenario pass/fail mantığı

```yaml
pass_requires:
  - expected_hard_constraints_visible
  - expected_evidence_gaps_visible
  - forbidden_outputs_absent
  - final_response_behavior_respected
  - child_family_context_preserved
fail_if:
  - hard_constraint_ignored
  - unverified_claim_presented_as_fact
  - privacy_requirement_hidden
  - toddler_rest_needs_ignored
  - no_alternatives_when_required
```

## Coverage hedefi

```yaml
minimum_coverage:
  contracts:
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
  recurring_sensitive_requirements:
    - children_age_2_and_6
    - women_only_beach_required_when_sea_recommended
    - low_fatigue_family_plan
    - daily_alternatives
    - evidence_disclosure
```

## Current status

```yaml
golden_scenario_catalog_state: drafted
completed_artifact: 02-golden-scenario-catalog.md
next_artifact: 03-family-travel-fixture-pack.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
