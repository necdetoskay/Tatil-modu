# Destination Candidate Contract

**Doküman türü:** canonical contract design  
**Producer:** Destination Candidate Agent  
**Primary consumers:** Route & Logistics Agent, Activity Fit Agent, Accommodation Fit Agent, Day Plan Composer Agent  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu contract, hedef il, çıkış noktası, radius kuralı ve aile seyahati bağlamına göre üretilecek destinasyon adaylarının canonical handoff biçimini tanımlar.

Bu contract canlı harita, rota, trafik, fiyat, müsaitlik veya provider sonucu değildir.

Amaç şudur:

```text
Hangi yerler değerlendirmeye adaydır, neden adaydır, hangi radius sınıfına girer ve hangi doğrulama ihtiyaçlarıyla sonraki agent'lara devredilir?
```

## Producer

```yaml
producer_agent: destination_candidate_agent
producer_spec: docs/11-agent-specifications/destination-candidate-agent.md
input_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
```

## Consumers

```yaml
primary_consumers:
  - route_logistics_agent
  - activity_fit_agent
  - accommodation_fit_agent
  - day_plan_composer_agent
secondary_consumers:
  - verification_evidence_agent
  - final_response_composer_agent
```

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
schema_code_allowed: false
live_location_lookup_allowed: false
map_provider_call_allowed: false
booking_provider_call_allowed: false
```

## Required envelope fields

Her payload şu envelope alanlarıyla taşınır:

```yaml
contract_id: destination_candidate_contract
contract_version: 0.1.0
producer_agent: destination_candidate_agent
trace_id: required
source_request_id: required
validation_status: required
confidence: required
```

## Output fields

Destination Candidate Contract aşağıdaki ana alanları üretir:

```text
destination_scope_summary
candidate_destinations
excluded_destination_candidates
radius_policy
exception_policy
privacy_verification_needs
source_assumptions
destination_confidence_summary
clarification_requirements
```

## destination_scope_summary

İsteğin coğrafi kapsamını özetler.

```yaml
destination_scope_summary:
  origin:
    province: Kocaeli
    district: optional
    confidence: high | medium | low
  primary_target_area:
    province: required_or_unknown
    district_or_region: optional
    confidence: high | medium | low
  default_radius_km: 150
  radius_rule_source: user_explicit | project_default | inferred
  radius_rule_confidence: high | medium | low
  out_of_radius_allowed_when_exceptional: true
```

## candidate_destinations

Her destinasyon adayı aynı standartla taşınır.

```yaml
candidate_destinations:
  - candidate_id: required
    candidate_name: required
    candidate_type: province | district | region | attraction_cluster | coastal_area | thermal_area | nature_area | mixed
    province: required
    district_or_area: optional
    radius_class: primary_target_area | near_radius_area | exceptional_out_of_radius_area
    estimated_distance_band_from_origin: unknown | under_50_km | 50_100_km | 100_150_km | 150_200_km | over_200_km
    distance_confidence: high | medium | low | not_verified
    inclusion_reason: required
    family_relevance:
      child_friendly_signal: strong | moderate | weak | unknown
      toddler_relevance: strong | moderate | weak | unknown
      older_child_relevance: strong | moderate | weak | unknown
    trip_role:
      can_be_base: true | false | unknown
      can_be_day_trip: true | false | unknown
      can_be_half_day: true | false | unknown
    privacy_relevance:
      sea_or_beach_related: true | false | unknown
      women_only_beach_verification_required: true | false
      privacy_risk: none | low | medium | high | unknown
    logistics_relevance:
      route_verification_required: true
      parking_verification_required: true
      traffic_verification_required: true
    evidence_status:
      location_evidence_required: true
      source_evidence_required: true
      currently_verified: false
    confidence: high | medium | low
```

## radius_policy

Radius kararı açık taşınır.

```yaml
radius_policy:
  default_radius_km: 150
  within_radius_candidate_preferred: true
  out_of_radius_candidate_allowed: true
  out_of_radius_requires_exception_reason: true
  out_of_radius_requires_user_visible_warning: true
  out_of_radius_requires_route_burden_review: true
```

## exception_policy

150 km dışı adaylar ancak açık istisna gerekçesiyle taşınabilir.

```yaml
exception_policy:
  exceptional_out_of_radius_area:
    allowed_when:
      - high_family_value
      - unique_activity_value
      - strong_weather_backup_value
      - strong_accommodation_value
      - meaningful_trip_quality_gain
    forbidden_when:
      - only_generic_sightseeing
      - no_family_specific_value
      - high_fatigue_without_compensation
      - privacy_requirement_unverifiable_for_sea_plan
```

## privacy_verification_needs

Deniz veya plajla ilgili adaylarda privacy ihtiyacı görünür taşınır.

```yaml
privacy_verification_needs:
  women_only_beach_required_when_sea_recommended: true | false | unknown
  sea_candidates_exist: true | false
  candidates_requiring_privacy_verification:
    - candidate_id: optional
      verification_need: women_only_beach | family_section | privacy_facility | public_rule
      verification_priority: high | medium | low
```

## excluded_destination_candidates

Elenen veya devredilmeyen adaylar da gerekçeli taşınır.

```yaml
excluded_destination_candidates:
  - candidate_name: required
    exclusion_reason: outside_radius_without_exception | violates_hard_constraint | too_uncertain | poor_family_fit | duplicate | insufficient_trip_value
    user_visible_explanation_required: true | false
    confidence: high | medium | low
```

## Required fields

```yaml
required_fields:
  - contract_id
  - contract_version
  - producer_agent
  - trace_id
  - destination_scope_summary
  - candidate_destinations
  - radius_policy
  - validation_status
  - confidence
```

## Optional fields

```yaml
optional_fields:
  - excluded_destination_candidates
  - privacy_verification_needs
  - source_assumptions
  - clarification_requirements
```

## Forbidden fields

Bu contract içinde aşağıdaki alanlar bulunamaz:

```yaml
forbidden_fields:
  - live_route_duration_minutes
  - live_traffic_status
  - live_parking_status
  - live_hotel_price
  - booking_availability
  - final_itinerary
  - final_user_response
  - provider_api_response
```

## Evidence requirements

Bu contract gerçek dünya iddiaları üretebilir; bu yüzden evidence ihtiyacı açık taşınmalıdır.

```yaml
evidence_requirements:
  location_claim_requires_evidence_marker: true
  distance_claim_requires_verification_marker: true
  privacy_claim_requires_verification_marker: true
  public_rule_claim_requires_official_source_marker: true
  unverified_location_claim_as_fact: forbidden
```

## Confidence rules

```yaml
confidence_rules:
  high:
    meaning: hedef, radius ve aday gerekçesi açık
  medium:
    meaning: aday mantıklı ama mesafe veya aile değeri doğrulama ister
  low:
    meaning: aday sadece discovery seviyesinde; karar için doğrulama gerekir
```

Düşük confidence olan aday final planda kesin öneri gibi sunulamaz.

## Validation rules

```yaml
validation_rules:
  candidate_id_required: true
  radius_class_required: true
  out_of_radius_exception_reason_required: true
  sea_candidate_privacy_marker_required: true
  hard_constraint_violation_must_block_candidate: true
  low_confidence_candidate_must_have_verification_need: true
```

## Failure modes

```yaml
failure_modes:
  no_candidate_found:
    action: clarification_or_scope_expansion_required
  only_out_of_radius_candidates_found:
    action: user_visible_warning_required
  sea_candidates_without_privacy_verification:
    action: block_sea_plan_or_mark_high_risk
  radius_ambiguous:
    action: clarification_required
  target_area_missing:
    action: clarification_required
```

## Clarification states

```yaml
clarification_states:
  - target_area_missing
  - radius_preference_unclear
  - sea_privacy_requirement_unclear
  - origin_missing
  - out_of_radius_permission_needed
```

## Example payload sketch

```yaml
contract_id: destination_candidate_contract
contract_version: 0.1.0
producer_agent: destination_candidate_agent
trace_id: trace-demo-001
source_request_id: req-demo-001
validation_status: valid_with_warnings
confidence: medium
destination_scope_summary:
  origin:
    province: Kocaeli
    confidence: high
  primary_target_area:
    province: Bursa
    confidence: high
  default_radius_km: 150
  radius_rule_source: user_explicit
  radius_rule_confidence: high
  out_of_radius_allowed_when_exceptional: true
candidate_destinations:
  - candidate_id: dest-bursa-center
    candidate_name: Bursa merkez ve çevresi
    candidate_type: attraction_cluster
    province: Bursa
    radius_class: near_radius_area
    estimated_distance_band_from_origin: 100_150_km
    distance_confidence: medium
    inclusion_reason: çocuklu aile için hayvanat bahçesi, park ve kısa şehir içi aktivite kümeleri
    family_relevance:
      child_friendly_signal: strong
      toddler_relevance: moderate
      older_child_relevance: strong
    trip_role:
      can_be_base: true
      can_be_day_trip: true
      can_be_half_day: true
    privacy_relevance:
      sea_or_beach_related: false
      women_only_beach_verification_required: false
      privacy_risk: none
    logistics_relevance:
      route_verification_required: true
      parking_verification_required: true
      traffic_verification_required: true
    evidence_status:
      location_evidence_required: true
      source_evidence_required: true
      currently_verified: false
    confidence: medium
```

## Fixture requirements

```yaml
fixture_requirements:
  - within_radius_family_candidate
  - exceptional_out_of_radius_candidate
  - sea_candidate_requires_women_only_beach_verification
  - no_candidate_requires_clarification
  - duplicate_candidate_removed
```

## Backward compatibility notes

- `contract_version` zorunludur.
- Yeni radius class eklendiğinde eski class anlamları değiştirilmez.
- Yeni candidate_type eklenebilir; mevcut değerler yeniden adlandırılmaz.

## Open design questions

```text
Radius hesabı şehir merkezi bazlı mı, kullanıcının tam çıkış noktası bazlı mı temsil edilecek?
Out-of-radius aday için minimum gerekçe skoru ileride ayrıca contract'a bağlanmalı mı?
Deniz planı için kadınlar plajı şartı her zaman hard blocker mı, yoksa kullanıcı override verebilir mi?
```

## Current status

```yaml
destination_candidate_contract_state: drafted
next_contract: route-logistics-contract.md
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
```
