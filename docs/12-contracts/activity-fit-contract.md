# Activity Fit Contract

**Doküman türü:** canonical contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Schema code durumu:** kapalı

## 1. Purpose

Activity Fit Contract, Tatil Modu içinde aktivite adaylarının çocuklu aile seyahati açısından aktarılacak standart değerlendirme biçimini tanımlar.

Bu contract şu soruya cevap verir:

```text
Bu aktivite, bu aile için hangi koşullarda uygun, riskli, doğrulama gerektiren veya elenmesi gereken bir seçenektir?
```

Bu contract aktivite önerisi üretmez.

Bu contract canlı saat, fiyat, hava durumu, park, kadınlar plajı veya tesis bilgisi doğrulamaz.

Bu contract, Activity Fit Agent çıktısının diğer planlama contract'ları tarafından güvenli biçimde tüketilmesini sağlar.

## 2. Producer

```yaml
producer_agent: activity_fit_agent
producer_contract_role: activity_suitability_assessment
```

## 3. Consumer

Bu contract aşağıdaki downstream parçalar tarafından tüketilebilir:

```yaml
consumer_agents:
  - day_plan_composer_agent
  - verification_evidence_agent
  - final_response_composer_agent
```

Dolaylı tüketiciler:

```yaml
indirect_consumers:
  - route_logistics_agent
  - accommodation_fit_agent
  - constraint_policy_agent
```

## 4. Input fields

Beklenen input alanları:

```yaml
input_fields:
  - travel_request_contract
  - constraint_policy_contract
  - family_suitability_contract
  - destination_candidate_contract
  - route_logistics_contract
  - activity_candidates
```

`activity_candidates` aşağıdaki adayları içerebilir:

```yaml
activity_candidate_types:
  - beach
  - women_only_beach
  - zoo
  - museum
  - science_center
  - nature_walk
  - playground
  - thermal_pool
  - spa_family_facility
  - boat_trip
  - city_walk
  - shopping_mall_backup
  - indoor_bad_weather_option
```

## 5. Output fields

Ana output:

```yaml
contract_name: activity_fit_contract
contract_version: 0.1.0
output_root: activity_fit_result
```

Beklenen output alanları:

```yaml
activity_fit_result:
  activity_summary:
    total_candidates: 0
    suitable_count: 0
    conditional_count: 0
    rejected_count: 0
    verification_required_count: 0
  activity_profiles:
    - activity_id: ""
      activity_name: ""
      activity_type: unknown
      destination_id: ""
      family_fit_band: unknown
      toddler_fit: unknown
      older_child_fit: unknown
      fatigue_risk: unknown
      weather_sensitivity: unknown
      privacy_requirement_status: unknown
      accessibility_risk: unknown
      parking_access_risk: unknown
      time_window_fit: unknown
      cost_sensitivity: unknown
      activity_blockers: []
      activity_warnings: []
      verification_needs: []
      recommended_usage: []
      explanation_notes: []
  rejected_activity_candidates: []
  clarification_requirements: []
  confidence:
    value: medium
    reasons: []
  validation_status:
    value: pending
    issues: []
```

## 6. Required fields

Her activity profile için zorunlu alanlar:

```yaml
required_fields:
  - activity_id
  - activity_type
  - family_fit_band
  - toddler_fit
  - older_child_fit
  - fatigue_risk
  - weather_sensitivity
  - privacy_requirement_status
  - verification_needs
  - confidence
  - validation_status
```

## 7. Optional fields

Opsiyonel alanlar:

```yaml
optional_fields:
  - activity_name
  - destination_id
  - estimated_visit_duration_band
  - stroller_compatibility
  - nap_conflict_risk
  - crowd_risk
  - shade_availability_assumption
  - food_access_assumption
  - toilet_access_assumption
  - ticket_price_band
  - alternative_for_bad_weather
  - alternative_for_low_fatigue
```

Opsiyonel alanlar kesin bilgi gibi sunulamaz.

## 8. Forbidden fields

Bu contract aşağıdaki alanları taşımaz:

```yaml
forbidden_fields:
  - live_opening_hours
  - live_ticket_price
  - live_weather_forecast
  - confirmed_parking_availability
  - confirmed_women_only_beach_status
  - booking_link
  - payment_information
  - personal_identity_data
  - provider_api_response
  - raw_search_result_dump
  - final_user_message
```

## 9. Evidence requirements

Aşağıdaki iddialar evidence veya verification marker gerektirir:

```yaml
evidence_required_for_claims:
  - opening_hours
  - ticket_price
  - parking_availability
  - women_only_beach_status
  - beach_privacy_status
  - weather_suitability
  - facility_age_limit
  - stroller_accessibility
  - pool_or_thermal_facility
  - safety_restriction
  - seasonal_operation
```

Evidence olmadan taşınacak ifade şu şekilde işaretlenir:

```yaml
verification_needs:
  - type: women_only_beach_status
    priority: high
    reason: sea_activity_requires_privacy_constraint_verification
  - type: opening_hours
    priority: medium
    reason: schedule_claim_not_verified
```

## 10. Confidence rules

Confidence kuralları:

```yaml
high:
  conditions:
    - activity_type_known
    - child_age_requirements_known
    - hard_constraints_applied
    - evidence_or_verification_markers_present

medium:
  conditions:
    - activity_type_known
    - general_family_fit_inferred
    - live_data_missing_but_marked

low:
  conditions:
    - activity_location_ambiguous
    - privacy_status_unknown_for_sea_activity
    - age_fit_unclear
    - weather_dependency_unmarked
```

Düşük confidence, doğrudan final plana güvenli öneri olarak taşınamaz.

## 11. Validation rules

Validation kuralları:

```yaml
validation_rules:
  activity_id_required: true
  family_fit_band_required: true
  toddler_fit_required: true
  fatigue_risk_required: true
  weather_sensitivity_required: true
  privacy_status_required: true
  verification_needed_for_live_claims: true
  unverified_live_claim_as_fact: forbidden
  sea_activity_without_women_only_beach_when_required: forbidden
  low_confidence_hard_blocker: forbidden
```

Hard fail örnekleri:

```yaml
hard_fail_if:
  - claims_opening_hours_without_evidence
  - claims_ticket_price_without_evidence
  - claims_parking_confirmed_without_evidence
  - claims_women_only_beach_confirmed_without_evidence
  - ignores_toddler_fatigue_risk
  - ignores_bad_weather_dependency
  - produces_final_user_response
```

## 12. Failure modes

Olası failure mode'lar:

```yaml
failure_modes:
  - missing_activity_id
  - ambiguous_activity_type
  - missing_child_age_fit
  - missing_privacy_status_for_beach
  - unmarked_weather_dependency
  - unmarked_parking_dependency
  - overconfident_unverified_activity_claim
  - activity_incompatible_with_hard_constraint
  - activity_too_tiring_for_toddler
```

## 13. Clarification states

Clarification gerektiren durumlar:

```yaml
clarification_states:
  - child_activity_tolerance_unknown
  - privacy_requirement_unclear
  - beach_activity_requested_but_women_only_requirement_unclear
  - bad_weather_preference_unknown
  - stroller_or_nap_need_unknown
  - paid_activity_budget_unclear
```

Örnek clarification payload:

```yaml
clarification_requirement:
  field: privacy_requirement
  reason: sea_activity_candidate_present
  suggested_question: "Deniz önerilecekse kadınlar plajı şartını kesin kural olarak uygulayalım mı?"
  blocks_final_plan: true
```

## 14. Example payload sketch

```yaml
activity_fit_result:
  activity_summary:
    total_candidates: 3
    suitable_count: 1
    conditional_count: 1
    rejected_count: 1
    verification_required_count: 2
  activity_profiles:
    - activity_id: bursa_zoo_morning
      activity_name: Bursa Hayvanat Bahçesi
      activity_type: zoo
      destination_id: bursa
      family_fit_band: high
      toddler_fit: medium
      older_child_fit: high
      fatigue_risk: medium
      weather_sensitivity: medium
      privacy_requirement_status: not_applicable
      accessibility_risk: needs_verification
      parking_access_risk: needs_verification
      time_window_fit: morning_preferred
      cost_sensitivity: needs_verification
      activity_blockers: []
      activity_warnings:
        - toddler_fatigue_possible_after_long_walk
      verification_needs:
        - opening_hours
        - ticket_price
        - parking_availability
      recommended_usage:
        - use_as_morning_block
        - follow_with_rest_or_light_indoor_option
    - activity_id: sea_beach_option
      activity_type: beach
      family_fit_band: conditional
      toddler_fit: medium
      older_child_fit: high
      fatigue_risk: medium
      weather_sensitivity: high
      privacy_requirement_status: verification_required
      activity_blockers:
        - women_only_beach_status_unverified_when_required
      verification_needs:
        - women_only_beach_status
        - weather_suitability
        - parking_availability
  confidence:
    value: medium
    reasons:
      - activity_types_known
      - live_data_not_checked
      - verification_needs_marked
  validation_status:
    value: pending
    issues:
      - live_claims_require_verification
```

## 15. Fixture requirements

İlk fixture:

```yaml
fixture_id: TM-CONTRACT-ACTIVITY-001
name: Çocuklu aile için aktivite uygunluğu ve kadınlar plajı doğrulama ihtiyacı
input:
  traveler_group:
    adults: 2
    children:
      - age: 6
      - age: 2
  hard_constraints:
    - women_only_beach_required_when_sea_recommended
  activity_candidates:
    - bursa_zoo_morning
    - sea_beach_option
expected:
  must_include_toddler_fit: true
  must_include_fatigue_risk: true
  must_mark_beach_privacy_verification: true
  must_not_claim_live_hours_or_prices: true
```

## 16. Backward compatibility notes

```yaml
compatibility:
  contract_version_required: true
  additive_fields_allowed: true
  removing_required_fields_requires_new_major_version: true
  enum_value_addition_requires_consumer_review: true
```

## 17. Open design questions

```yaml
open_questions:
  - Aktivite süre bandı burada mı tutulmalı, yoksa Day Plan Contract içinde mi hesaplanmalı?
  - Kalabalık riski ayrı bir alan mı olmalı, yoksa fatigue_risk altında mı kalmalı?
  - Kadınlar plajı doğrulama sonucu Activity Fit Contract'a mı geri yazılmalı, yoksa Verification Evidence Contract'ta mı kalmalı?
  - Bebek arabası uyumluluğu her aktivite için zorunlu hale getirilmeli mi?
```

## Sonuç

Activity Fit Contract, aktivite adaylarının çocuklu aile açısından güvenli, yorgunluk kontrollü, mahremiyet duyarlı ve doğrulama ihtiyacı görünür biçimde taşınmasını sağlar.

Bu contract kod değildir.

Bu contract canlı veri doğrulamaz.

Bu contract final kullanıcı cevabı üretmez.

```yaml
contract_status: drafted
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
next_contract: day-plan-contract.md
```
