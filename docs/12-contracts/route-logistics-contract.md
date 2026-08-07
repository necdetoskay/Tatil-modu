# Route Logistics Contract

**Contract ID:** `route_logistics_contract`  
**Durum:** canonical contract draft  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Schema code durumu:** kapalı

## 1. Purpose

Route Logistics Contract, aday destinasyonların aile seyahati açısından lojistik yükünü standart biçimde taşır.

Bu contract'ın temel amacı şudur:

```text
Mesafe, yol süresi bandı, trafik/park riski, mola ihtiyacı, öğle dinlenmesi uyumu ve çocuk yorgunluğu riskini sonraki planlama adımlarına açık şekilde aktarmak.
```

Bu contract rota hesaplama implementation'ı değildir.

Bu contract canlı trafik verisi çekmez.

Bu contract yalnızca Route & Logistics Agent çıktısının canonical handoff biçimini tanımlar.

## 2. Producer

```yaml
producer_agent: route_logistics_agent
producer_input_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
  - destination-candidate-contract.md
```

## 3. Consumer

```yaml
consumer_agents:
  - accommodation_fit_agent
  - activity_fit_agent
  - day_plan_composer_agent
  - verification_evidence_agent
  - final_response_composer_agent
```

## 4. Input fields

Beklenen input alanları:

```yaml
input_fields:
  - contract_envelope
  - travel_request
  - constraint_policy_result
  - family_suitability_result
  - destination_candidate_result
```

Minimum gerekli input:

```yaml
minimum_input:
  origin:
    required: true
  candidate_destinations:
    required: true
  transport_mode:
    required: true
  duration:
    required: true
  hard_constraints:
    required: true
  family_suitability_summary:
    required: true
```

## 5. Output fields

Ana output:

```yaml
output_type: route_logistics_result
```

Output alanları:

```yaml
route_logistics_result:
  logistics_scope_summary: {}
  destination_route_profiles: []
  day_trip_feasibility: []
  overnight_recommendation_flags: []
  route_burden_summary: {}
  traffic_risk_summary: {}
  parking_risk_summary: {}
  rest_stop_requirements: []
  midday_rest_compatibility: []
  child_fatigue_risk_summary: {}
  logistics_blockers: []
  logistics_warnings: []
  verification_needs: []
  confidence_summary: {}
  clarification_requirements: []
```

## 6. Required fields

Her destination route profile için zorunlu alanlar:

```yaml
required_destination_route_profile_fields:
  - destination_id
  - destination_name
  - origin
  - route_distance_band
  - drive_time_band
  - route_burden_level
  - child_fatigue_risk
  - parking_risk
  - traffic_risk
  - rest_stop_need
  - midday_rest_compatibility
  - verification_status
  - confidence
```

## 7. Optional fields

Opsiyonel alanlar:

```yaml
optional_fields:
  - route_notes
  - seasonal_traffic_note
  - weekend_risk_note
  - ferry_or_bridge_note
  - toll_or_fee_note
  - stroller_unloading_note
  - hotel_rest_dependency
  - return_trip_risk
  - alternative_route_note
```

## 8. Forbidden fields

Bu contract içinde yasak alanlar:

```yaml
forbidden_fields:
  - exact_live_traffic_claim_without_evidence
  - exact_drive_time_without_source
  - booking_link
  - hotel_recommendation
  - activity_recommendation
  - final_user_narrative
  - raw_api_response
  - provider_secret
  - internal_prompt
```

## 9. Evidence requirements

Route logistics claim'leri evidence statüsü taşır.

```yaml
evidence_required_for_claims:
  - exact_distance
  - exact_drive_time
  - live_traffic_condition
  - parking_availability
  - toll_or_fee
  - road_closure
  - ferry_schedule
  - public_transport_claim
```

Evidence yoksa iddia band veya risk notu olarak taşınır:

```yaml
allowed_without_live_evidence:
  route_distance_band: true
  drive_time_band: true
  parking_risk_band: true
  traffic_risk_band: true
  child_fatigue_risk_band: true
```

## 10. Confidence rules

Confidence sınıfları:

```yaml
confidence_rules:
  high:
    conditions:
      - origin_known
      - destination_known
      - transport_mode_known
      - distance_or_time_has_source_or_recent_verification
  medium:
    conditions:
      - origin_known
      - destination_known
      - transport_mode_known
      - distance_or_time_estimated_as_band
  low:
    conditions:
      - origin_ambiguous
      - destination_location_ambiguous
      - route_burden_inferred_without_evidence
```

Düşük confidence hard eleme sebebi olamaz; ancak verification veya clarification ihtiyacı doğurur.

```yaml
low_confidence_hard_blocker: forbidden
low_confidence_requires_visibility: true
```

## 11. Validation rules

Validation kuralları:

```yaml
validation_rules:
  destination_id_required: true
  route_distance_band_required: true
  drive_time_band_required: true
  route_burden_level_required: true
  child_fatigue_risk_required: true
  midday_rest_compatibility_required: true
  exact_time_claim_requires_evidence: true
  parking_availability_claim_requires_evidence: true
  route_hard_blocker_requires_reason: true
```

Hard fail durumları:

```yaml
hard_fail_if:
  - exact_drive_time_presented_without_evidence
  - parking_availability_claimed_without_evidence
  - midday_rest_requirement_ignored
  - route_burden_missing_for_candidate
  - child_fatigue_risk_missing_for_candidate
  - final_user_response_generated
```

## 12. Failure modes

Olası failure mode'lar:

```yaml
failure_modes:
  - missing_origin
  - ambiguous_destination_location
  - transport_mode_missing
  - no_route_burden_assessment
  - parking_risk_unknown
  - traffic_risk_unknown
  - midday_rest_conflict
  - long_drive_for_toddler_without_rest_plan
```

## 13. Clarification states

Clarification gerektiren durumlar:

```yaml
clarification_states:
  - origin_not_precise_enough
  - private_car_not_confirmed
  - stroller_or_child_seat_need_unclear
  - user_accepts_long_drive_unknown
  - hotel_rest_requirement_unclear
  - parking_sensitivity_unclear
```

Örnek clarification:

```text
Çocuklarla aynı gün içinde uzun gidiş-dönüş yol kabul edilebilir mi, yoksa konaklama tercih edilir mi?
```

## 14. Example payload sketch

```yaml
contract_envelope:
  contract_id: route_logistics_contract
  contract_version: 0.1.0
  producer_agent: route_logistics_agent
  consumer_agent: day_plan_composer_agent
  trace_id: trace-example
  validation_status: valid_with_warnings

route_logistics_result:
  destination_route_profiles:
    - destination_id: bursa_zoo_area
      destination_name: Bursa Hayvanat Bahçesi çevresi
      origin: Kocaeli
      route_distance_band: medium
      drive_time_band: medium
      route_burden_level: moderate
      child_fatigue_risk: medium
      parking_risk: needs_verification
      traffic_risk: weekend_sensitive
      rest_stop_need: optional
      midday_rest_compatibility: compatible_if_afternoon_light
      verification_status:
        distance: needs_verification
        drive_time: needs_verification
        parking: needs_verification
      confidence:
        value: medium
        reasons:
          - origin_known
          - destination_known
          - live_traffic_not_checked
  logistics_warnings:
    - weekend_or_holiday_traffic_may_change_plan_quality
  verification_needs:
    - parking_availability
    - current_drive_time
```

## 15. Fixture requirements

İlk fixture:

```yaml
fixture_id: TM-CONTRACT-ROUTE-001
name: Kocaeli çıkışlı çocuklu aile Bursa lojistik değerlendirmesi
input:
  origin: Kocaeli
  transport_mode: private_car
  children_ages:
    - 6
    - 2
  candidate_destinations:
    - Bursa Hayvanat Bahçesi çevresi
expected_output:
  route_burden_level: moderate
  child_fatigue_risk: medium
  midday_rest_compatibility: compatible_if_afternoon_light
  verification_needs:
    - current_drive_time
    - parking_availability
```

## 16. Backward compatibility notes

```yaml
backward_compatibility:
  contract_version_required: true
  new_risk_fields_optional_until_version: 0.2.0
  route_distance_band_must_remain_supported: true
  exact_drive_time_must_not_be_required_without_evidence: true
```

## 17. Open design questions

```yaml
open_questions:
  - Route burden band saat bazlı mı yoksa qualitative mı tutulacak?
  - 2 yaş çocuk için maksimum tek yön yol süresi default olarak belirlenecek mi?
  - Trafik riski hafta içi/hafta sonu ayrımı contract içinde ayrı alan mı olmalı?
  - Park riski doğrulanmadan plan kalitesi ne kadar düşmeli?
```

## Sonuç

Route Logistics Contract, aday destinasyonların aile seyahati açısından yol yükünü görünür kılar.

Bu contract canlı rota hesaplamaz.

Bu contract, plan compose aşamasında lojistik olarak yorucu veya doğrulanması gereken seçeneklerin açıkça fark edilmesini sağlar.

```yaml
contract_status: drafted
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
next_contract: accommodation-fit-contract.md
```
