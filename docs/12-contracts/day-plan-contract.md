# Day Plan Contract

**Doküman türü:** canonical contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Day Plan Contract, değerlendirilen destinasyon, rota, konaklama ve aktivite adaylarından gün bazlı plan iskeleti oluşturulurken taşınacak veri sözleşmesini tanımlar.

Bu contract'ın amacı şudur:

```text
Her gün için uygulanabilir, açıklanabilir, alternatifli ve doğrulama ihtiyacı görünür plan blokları üretmek.
```

Bu contract final kullanıcı cevabı değildir.

Bu contract canlı veri doğrulamaz.

Bu contract rezervasyon, ödeme, rota çizimi veya harita entegrasyonu yapmaz.

## 2. Producer

Beklenen producer:

```yaml
producer_agent: day_plan_composer_agent
```

Producer yalnızca önceki agent contract çıktılarını birleştirerek plan iskeleti oluşturur.

## 3. Consumer

Beklenen consumer'lar:

```yaml
consumer_agents:
  - verification_evidence_agent
  - final_response_composer_agent
```

İkincil consumer'lar:

```yaml
secondary_consumers:
  - evaluation_harness
  - regression_fixture_set
```

## 4. Input fields

Beklenen input alanları:

```yaml
input_contracts:
  - travel_request_contract
  - constraint_policy_contract
  - family_suitability_contract
  - destination_candidate_contract
  - route_logistics_contract
  - accommodation_fit_contract
  - activity_fit_contract
```

Minimum input:

```yaml
required_input_fields:
  - request_id
  - duration
  - traveler_group
  - hard_constraints
  - candidate_destinations
  - destination_route_profiles
  - activity_profiles
  - family_suitability_summary
```

## 5. Output fields

Ana output:

```yaml
contract_name: day_plan_contract
contract_version: 0.1.0
output_type: day_plan_draft
```

Beklenen output alanları:

```yaml
day_plan_draft:
  request_id: ""
  plan_summary:
    total_days: 0
    plan_style: family_low_fatigue
    contains_sea_activity: false
    contains_privacy_sensitive_activity: false
    verification_required_before_final: true
  daily_plans:
    - day_number: 1
      day_theme: ""
      primary_plan:
        morning_block: null
        lunch_rest_block: null
        afternoon_block: null
        evening_block: null
      alternatives:
        - alternative_id: ""
          alternative_type: bad_weather | low_fatigue | budget_sensitive | privacy_sensitive | child_friendly
          replacement_blocks: []
      day_constraints_applied: []
      day_warnings: []
      verification_needs: []
      confidence:
        value: medium
        reasons: []
  global_plan_warnings: []
  unresolved_questions: []
  internal_notes_not_for_user: []
```

## 6. Required fields

Her daily plan item için zorunlu alanlar:

```yaml
required_daily_plan_fields:
  - day_number
  - primary_plan
  - alternatives
  - day_constraints_applied
  - verification_needs
  - confidence
```

Her zaman bulunması gereken blok alanları:

```yaml
required_block_slots:
  - morning_block
  - lunch_rest_block
  - afternoon_block
  - evening_block
```

Bir blok bilinmiyorsa null olabilir, fakat neden boş olduğu açıklanmalıdır.

```yaml
empty_block_reason_required: true
```

## 7. Optional fields

Opsiyonel alanlar:

```yaml
optional_fields:
  - estimated_cost_band
  - estimated_drive_burden_band
  - stroller_note
  - nap_note
  - indoor_backup_note
  - parking_note
  - meal_note
  - parent_recovery_note
```

Opsiyonel alanlar evidence gerektiren kesin iddia taşıyamaz.

## 8. Forbidden fields

Bu contract içinde yasak alanlar:

```yaml
forbidden_fields:
  - live_traffic_confirmed
  - exact_ticket_price_confirmed
  - hotel_availability_confirmed
  - booking_status
  - payment_status
  - final_user_message
  - provider_api_response
  - raw_search_result_dump
  - private_user_profile_full_dump
```

Yasak iddia tipleri:

```yaml
forbidden_claims:
  - exact_opening_hours_without_evidence
  - exact_price_without_evidence
  - parking_confirmed_without_evidence
  - women_only_beach_confirmed_without_evidence
  - weather_safe_without_evidence
  - guaranteed_child_enjoyment
```

## 9. Evidence requirements

Bu contract evidence üretmez; evidence ihtiyacını görünür taşır.

Evidence gerektiren plan iddiaları:

```yaml
evidence_required_for:
  - opening_hours
  - ticket_price
  - parking_availability
  - travel_time
  - weather_suitability
  - women_only_beach_status
  - hotel_facility_claim
  - ferry_or_toll_schedule
  - official_restriction
```

Her verification ihtiyacı şu formatta taşınmalıdır:

```yaml
verification_need:
  verification_id: ""
  claim_type: ""
  affected_day: 1
  affected_block: morning_block
  reason: ""
  severity: low | medium | high | blocking
  must_verify_before_final: true
```

## 10. Confidence rules

Confidence band kuralları:

```yaml
high:
  conditions:
    - hard_constraints_applied
    - each_day_has_rest_block
    - alternatives_present
    - verification_needs_visible
    - no_unverified_claim_presented_as_fact

medium:
  conditions:
    - plan_blocks_present
    - some logistics or activity details require verification
    - alternatives present but not complete for every risk

low:
  conditions:
    - missing destination detail
    - missing activity detail
    - missing rest compatibility
    - unresolved hard constraint ambiguity
```

## 11. Validation rules

Validation kuralları:

```yaml
validation_rules:
  minimum_alternatives_per_day: 2
  maximum_alternatives_per_day: 3
  lunch_rest_block_required_when_toddler_present: true
  privacy_sensitive_sea_activity_requires_verification_need: true
  long_drive_day_requires_low_fatigue_alternative: true
  bad_weather_sensitive_day_requires_indoor_or_light_alternative: true
  hard_constraint_violation_allowed: false
```

Hard fail durumları:

```yaml
hard_fail_if:
  - day_has_no_rest_block_when_toddler_present
  - sea_plan_missing_women_only_beach_verification_when_required
  - exact_price_presented_without_evidence
  - exact_opening_hour_presented_without_evidence
  - same_day_plan_exceeds_logistics_constraints_without_warning
  - final_user_message_generated
```

## 12. Failure modes

Olası failure mode'lar:

```yaml
failure_modes:
  - missing_day_block
  - insufficient_alternatives
  - rest_block_missing
  - verification_need_not_carried
  - hard_constraint_not_applied
  - child_fatigue_ignored
  - privacy_requirement_ignored
  - budget_risk_hidden
  - logistics_risk_hidden
```

## 13. Clarification states

Clarification state örnekleri:

```yaml
clarification_states:
  - max_daily_drive_tolerance_unknown
  - exact_travel_dates_unknown
  - sea_activity_preference_unclear
  - accommodation_rest_preference_unclear
  - budget_priority_unclear
  - toddler_nap_requirement_unclear
```

Clarification kullanıcıya doğrudan sorulmaz; final response composer'a aktarılır.

## 14. Example payload sketch

```yaml
contract_name: day_plan_contract
contract_version: 0.1.0
producer_agent: day_plan_composer_agent
consumer_agent: verification_evidence_agent
trace_id: trace-tm-day-001
validation_status: needs_verification
confidence:
  value: medium
  reasons:
    - rest_blocks_present
    - parking_and_opening_hours_need_verification

day_plan_draft:
  request_id: tm-request-001
  plan_summary:
    total_days: 3
    plan_style: family_low_fatigue
    contains_sea_activity: true
    contains_privacy_sensitive_activity: true
    verification_required_before_final: true
  daily_plans:
    - day_number: 1
      day_theme: "Varış ve düşük tempo"
      primary_plan:
        morning_block:
          block_type: travel
          candidate_refs:
            - destination_candidate_001
          notes:
            - "Uzun yol riski nedeniyle tempo düşük tutulmalı."
        lunch_rest_block:
          block_type: rest
          required: true
          notes:
            - "2 yaş çocuk için öğle dinlenmesi korunmalı."
        afternoon_block:
          block_type: light_activity
          candidate_refs:
            - activity_001
        evening_block:
          block_type: low_fatigue_evening
          candidate_refs: []
      alternatives:
        - alternative_id: alt-1-weather
          alternative_type: bad_weather
          replacement_blocks:
            - afternoon_block
        - alternative_id: alt-1-low-fatigue
          alternative_type: low_fatigue
          replacement_blocks:
            - afternoon_block
      day_constraints_applied:
        - toddler_rest_required
        - women_only_beach_required_when_sea_recommended
      day_warnings:
        - long_drive_with_toddler
      verification_needs:
        - verification_id: verify-001
          claim_type: opening_hours
          affected_day: 1
          affected_block: afternoon_block
          reason: "Aktivite saatleri final plandan önce doğrulanmalı."
          severity: medium
          must_verify_before_final: true
```

## 15. Fixture requirements

İlk fixture:

```yaml
fixture_id: TM-DAYPLAN-001
name: 2 çocuklu aile için 3 günlük düşük yorgunluk plan iskeleti
input:
  traveler_group:
    adults: 2
    children:
      - age: 6
      - age: 2
  duration_days: 3
  hard_constraints:
    - toddler_rest_required
    - women_only_beach_required_when_sea_recommended
expected_output:
  daily_plans_count: 3
  each_day_has_lunch_rest_block: true
  each_day_has_2_to_3_alternatives: true
  sea_day_has_privacy_verification_need: true
  long_drive_day_has_low_fatigue_alternative: true
```

## 16. Backward compatibility notes

```yaml
compatibility:
  contract_version_required: true
  additive_fields_allowed: true
  removing_required_block_slots: breaking_change
  renaming_day_block_keys: breaking_change
  changing_alternative_count_rule: breaking_change
```

## 17. Open design questions

```yaml
open_questions:
  - Gün blokları saat aralığı taşımalı mı, yoksa saatler verification sonrası mı eklenmeli?
  - Her gün için 2-3 alternatif zorunluluğu kısa seyahatlerde nasıl uygulanmalı?
  - Akşam bloğu her zaman zorunlu mu, yoksa çocuklu aile için erken dinlenme notu yeterli olabilir mi?
  - Kötü hava alternatifi tüm dış mekân aktivitelerinde zorunlu olmalı mı?
```

## Sonuç

Day Plan Contract, Tatil Modu'nun plan iskeletini final cevaptan önce güvenli, açıklanabilir ve doğrulanabilir hale getirir.

Bu contract kod değildir.

Bu contract final cevap değildir.

Bu contract doğrulanmamış iddiayı gerçek gibi sunmaz.

```yaml
contract_status: drafted
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
next_contract: verification-evidence-contract.md
```
