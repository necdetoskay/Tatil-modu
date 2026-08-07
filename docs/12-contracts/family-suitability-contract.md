# Family Suitability Contract

**Doküman türü:** canonical contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu contract, `family-suitability-agent.md` çıktısının canonical handoff biçimini tanımlar.

Amaç; rota, destinasyon, konaklama, aktivite veya gün bloklarının çocuklu aile profiline uygunluğunu standart bir çıktı olarak taşımaktır.

Bu dosya runtime schema değildir.

## Producer

```yaml
producer_agent: family_suitability_agent
producer_spec: docs/11-agent-specifications/family-suitability-agent.md
```

## Consumers

```yaml
primary_consumers:
  - destination_candidate_agent
  - route_logistics_agent
  - accommodation_fit_agent
  - activity_fit_agent
  - day_plan_composer_agent
  - final_response_composer_agent
```

## Contract identity

```yaml
contract_id: family_suitability_contract
contract_version: v0.1-design
schema_code_allowed: false
runtime_validation_allowed: false
```

## Input fields

Bu contract şu kaynaklardan beslenir:

```yaml
input_sources:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - candidate entity from destination/activity/accommodation/day block
```

Minimum input alanları:

| Alan | Açıklama |
|---|---|
| `family_profile` | Yetişkin/çocuk sayısı, yaş bilgileri ve aile seyahati bağlamı |
| `candidate_ref` | Değerlendirilen rota, destinasyon, aktivite, konaklama veya gün bloğu referansı |
| `constraint_context` | Hard constraint ve soft preference listesi |
| `pace_context` | Gün temposu, mola ve dinlenme beklentisi |
| `known_risks` | Önceki agentlardan gelen risk veya belirsizlikler |

## Output fields

```yaml
output_fields:
  - family_suitability_summary
  - child_age_fit
  - toddler_fit
  - older_child_fit
  - fatigue_risk
  - rest_fit
  - safety_notes
  - parent_burden
  - accessibility_notes
  - suitability_blockers
  - suitability_warnings
  - recommended_adjustments
  - confidence
  - validation_status
```

## Required fields

```yaml
required_fields:
  - contract_id
  - contract_version
  - producer_agent
  - candidate_ref
  - family_suitability_summary
  - child_age_fit
  - fatigue_risk
  - rest_fit
  - parent_burden
  - confidence
  - validation_status
```

## Optional fields

```yaml
optional_fields:
  - stroller_fit
  - toilet_break_need
  - nap_conflict
  - crowd_sensitivity
  - weather_sensitivity
  - noise_sensitivity
  - long_walk_warning
  - recommended_adjustments
```

## Forbidden fields

```yaml
forbidden_fields:
  - live_provider_result
  - raw_user_private_memory
  - booking_availability_claim
  - exact_price_claim_without_evidence_marker
  - medical_advice
  - final_user_response_text
```

Bu contract final kullanıcı cevabı üretmez.

## Family suitability summary

`family_suitability_summary` kısa, yapılandırılmış bir değerlendirme olmalıdır.

Örnek değerler:

```yaml
family_suitability_summary:
  overall_fit_band: good
  reason_codes:
    - short_walking_distance
    - midday_rest_possible
    - toddler_friendly_pace
  main_risk: parking_uncertain
```

## Child age fit

Çocuk yaş uygunluğu ayrı ayrı taşınır.

```yaml
child_age_fit:
  children:
    - age: 2
      fit_band: good
      concerns:
        - nap_needed
        - stroller_may_help
    - age: 6
      fit_band: good
      concerns:
        - may_get_bored_if_waiting_time_long
```

## Toddler fit

2 yaş çocuk için özel alan:

```yaml
toddler_fit:
  fit_band: good | moderate | weak | blocked
  nap_compatible: true | false | unknown
  stroller_friendly: true | false | unknown
  long_wait_risk: low | medium | high | unknown
  toilet_break_need: low | medium | high | unknown
```

## Older child fit

6 yaş çocuk için özel alan:

```yaml
older_child_fit:
  fit_band: good | moderate | weak | blocked
  engagement_level: low | medium | high | unknown
  boredom_risk: low | medium | high | unknown
  learning_or_play_value: low | medium | high | unknown
```

## Fatigue risk

```yaml
fatigue_risk:
  level: low | medium | high | blocked
  drivers:
    - long_drive
    - too_many_transitions
    - no_midday_rest
    - long_walking_distance
  mitigation:
    - add_hotel_rest_block
    - reduce_second_activity
    - choose_nearby_evening_option
```

## Rest fit

```yaml
rest_fit:
  midday_rest_possible: true | false | unknown
  hotel_return_possible: true | false | unknown
  low_pace_alternative_needed: true | false
  rest_conflict_reason: string | null
```

## Parent burden

```yaml
parent_burden:
  level: low | medium | high
  drivers:
    - parking_uncertain
    - stroller_unfriendly
    - too_many_transitions
    - meal_timing_uncertain
```

## Suitability blockers

Aşağıdaki durumlar blocker olabilir:

```yaml
suitability_blockers:
  - no_safe_access_for_children
  - impossible_midday_rest_when_required
  - excessive_route_burden_for_short_trip
  - activity_not_age_appropriate
  - privacy_requirement_conflict
```

## Suitability warnings

Blocker olmayan ama plana taşınması gereken uyarılar:

```yaml
suitability_warnings:
  - parking_uncertain
  - crowd_risk
  - long_walk_possible
  - weather_sensitive
  - toddler_nap_conflict_possible
```

## Evidence requirements

Bu contract çoğunlukla aile uygunluğu yorumu taşır; fakat aşağıdaki alanlar evidence marker ister:

```yaml
evidence_required_for:
  - stroller_friendly_claim
  - toilet_available_claim
  - parking_available_claim
  - children_playground_claim
  - pool_or_facility_claim
  - official_age_or_safety_rule
```

Evidence yoksa ifade kesin bilgi gibi taşınamaz.

## Confidence rules

```yaml
confidence_rules:
  high:
    - family_profile_complete
    - candidate_details_sufficient
    - rest_and_route_context_available
  medium:
    - family_profile_complete
    - candidate_details_partial
  low:
    - child_age_missing
    - candidate_details_vague
    - rest_need_unknown
```

Düşük güvenli suitability değerlendirmesi hard eleme sebebi olamaz; sadece clarification veya verification ihtiyacı doğurur.

```yaml
low_confidence_hard_blocker: forbidden
```

## Validation rules

```yaml
validation_rules:
  child_ages_required_for_age_fit: true
  fatigue_risk_required: true
  rest_fit_required_for_family_trip: true
  parent_burden_required: true
  blocker_reason_required_when_fit_blocked: true
  evidence_marker_required_for_facility_claims: true
```

## Failure modes

```yaml
failure_modes:
  - missing_child_ages
  - missing_candidate_ref
  - candidate_type_unknown
  - rest_need_unknown
  - insufficient_candidate_details
```

## Clarification states

```yaml
clarification_states:
  - ask_child_ages
  - ask_rest_expectation
  - ask_stroller_need
  - ask_low_pace_preference
```

## Example payload sketch

```yaml
contract_id: family_suitability_contract
contract_version: v0.1-design
producer_agent: family_suitability_agent
candidate_ref:
  type: activity
  id: bursa_zoo_morning
family_suitability_summary:
  overall_fit_band: good
  reason_codes:
    - morning_energy_fit
    - strong_child_interest
    - rest_after_activity_recommended
  main_risk: post_activity_fatigue
child_age_fit:
  children:
    - age: 2
      fit_band: moderate
      concerns:
        - stroller_may_help
        - nap_after_visit_needed
    - age: 6
      fit_band: good
      concerns: []
fatigue_risk:
  level: medium
  drivers:
    - long_walking_distance_possible
  mitigation:
    - schedule_hotel_rest_after_lunch
rest_fit:
  midday_rest_possible: true
  hotel_return_possible: true
  low_pace_alternative_needed: false
parent_burden:
  level: medium
  drivers:
    - parking_uncertain
suitability_blockers: []
suitability_warnings:
  - parking_uncertain
confidence:
  level: medium
  reason: facility_and_parking_details_need_verification
validation_status: valid_with_warnings
```

## Fixture requirements

İlk fixture senaryoları:

```yaml
fixtures:
  - two_children_ages_2_and_6_good_fit
  - toddler_nap_conflict
  - no_midday_rest_high_fatigue
  - missing_child_ages_clarification
  - parking_uncertain_parent_burden
```

## Backward compatibility notes

- `contract_version` zorunludur.
- Yeni çocuk yaş segmentleri eklenirse eski `child_age_fit` yapısı bozulmamalıdır.
- `fit_band` enum değerleri geriye dönük uyumluluk düşünülmeden değiştirilmemelidir.

## Open design questions

```yaml
open_questions:
  - stroller_need_should_be_user_profile_or_trip_specific
  - toddler_nap_need_should_be_default_assumption_or_explicit_input
  - parent_burden_should_affect_ranking_directly_or_day_plan_only
```

## Current status

```yaml
contract_design_state: drafted
next_contract: destination-candidate-contract.md
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
```
