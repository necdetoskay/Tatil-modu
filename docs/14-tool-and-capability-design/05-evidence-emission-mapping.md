# 05 — Evidence Emission Mapping

**Doküman türü:** canonical capability-to-evidence mapping design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Adapter entegrasyonu:** kapalı

## Purpose

Bu doküman, capability sonuçlarının Tatil Modu contract ve evidence diline nasıl dönüştürüleceğini tanımlar.

Bu dosya adapter implementation değildir.

Bu dosya live tool çağrısı, API client, schema validator, test runner veya production telemetry içermez.

## Ana karar

```yaml
evidence_emission_mapping_state: drafted
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/05-evidence-emission-mapping.md
related_contracts:
  - docs/12-contracts/common-evidence-envelope.md
  - docs/12-contracts/common-error-envelope.md
  - docs/12-contracts/verification-evidence-contract.md
  - docs/12-contracts/final-response-contract.md
```

## Core principle

```text
Capability sonucu ham bilgi değildir.
Capability sonucu, claim + evidence + confidence + freshness + visibility + failure semantics taşıyan evidence envelope'a dönüşmelidir.
```

Tool/provider sonucu doğrudan final cevap değildir.

Final cevap yalnızca evidence-aware ve disclosure-ready veri üzerinden oluşturulur.

## Evidence envelope target fields

Her capability çıktısı aşağıdaki alanları besleyebilmelidir:

```yaml
evidence_target_fields:
  claim_id: required
  claim_type: required
  claim_text: required
  source_summary: required_when_source_exists
  evidence_status: required
  verification_status: required
  confidence: required
  freshness: required_when_time_sensitive
  user_visibility: required
  blockers: optional
  warnings: optional
```

## Evidence status mapping

```yaml
evidence_status_mapping:
  provider_returned_relevant_current_source:
    evidence_status: supported
  provider_returned_partial_or_ambiguous_source:
    evidence_status: partial
  provider_returned_no_reliable_source:
    evidence_status: missing
  provider_failed_or_timed_out:
    evidence_status: unavailable
  source_is_stale_for_claim_type:
    evidence_status: stale
  conflicting_sources_found:
    evidence_status: conflicting
```

## Verification status mapping

```yaml
verification_status_mapping:
  claim_confirmed_by_sufficient_source:
    verification_status: verified
  claim_supported_but_not_fully_confirmed:
    verification_status: partially_verified
  claim_requires_check_but_check_not_completed:
    verification_status: needs_verification
  claim_disproved_or_conflicts_with_hard_constraint:
    verification_status: failed
  claim_cannot_be_checked_due_to_capability_failure:
    verification_status: unavailable
```

## Confidence mapping

```yaml
confidence_mapping:
  official_current_direct_match:
    confidence: high
  official_but_stale_or_indirect:
    confidence: medium
  review_or_aggregated_signal_only:
    confidence: low_to_medium
  user_memory_or_prior_context_only:
    confidence: low
  assumption_without_source:
    confidence: low
  conflicting_sources:
    confidence: low
```

Confidence yüksek olsa bile, hard constraint doğrulaması eksikse claim kesin karşılanmış kabul edilemez.

## Freshness mapping

```yaml
freshness_mapping:
  price_claim:
    freshness_required: same_day_or_current_listing
  opening_hours_claim:
    freshness_required: current_schedule_or_official_page
  weather_claim:
    freshness_required: forecast_period_specific
  traffic_claim:
    freshness_required: live_or_recent
  parking_claim:
    freshness_required: current_or_recent_place_information
  women_only_beach_claim:
    freshness_required: current_official_or_high_trust_source
  accommodation_availability_claim:
    freshness_required: current_availability_check
  route_distance_claim:
    freshness_required: stable_map_data
```

## User visibility mapping

```yaml
user_visibility_mapping:
  verified_safe_claim:
    user_visibility: visible_as_fact
  partially_verified_claim:
    user_visibility: visible_with_caution
  missing_evidence_for_optional_detail:
    user_visibility: visible_as_uncertainty
  missing_evidence_for_hard_constraint:
    user_visibility: visible_as_blocker_or_warning
  internal_provider_failure:
    user_visibility: visible_as_simple_limitation
  sensitive_private_detail:
    user_visibility: minimized_or_hidden
```

Raw provider errors, stack traces, tokens, hidden reasoning veya gereksiz özel veri kullanıcıya gösterilmez.

## Claim type mapping by capability

### maps_distance_and_route

```yaml
capability: maps_distance_and_route
emits_claim_types:
  - route_distance
  - route_drive_time_estimate
  - route_burden
  - out_of_radius_status
required_evidence_fields:
  - source_summary
  - confidence
  - freshness
failure_behavior:
  - route_distance_claim_marked_needs_verification
  - exact_drive_time_forbidden
  - route_burden_can_be_estimated_with_caution
```

### traffic_estimation

```yaml
capability: traffic_estimation
emits_claim_types:
  - traffic_risk
  - time_variability
required_evidence_fields:
  - freshness
  - confidence
failure_behavior:
  - traffic_claim_visible_as_uncertainty
  - exact_traffic_state_forbidden
```

### parking_information

```yaml
capability: parking_information
emits_claim_types:
  - parking_availability
  - parking_risk
  - access_burden
failure_behavior:
  - parking_claim_marked_needs_verification
  - no_definitive_parking_guarantee
```

### weather_forecast

```yaml
capability: weather_forecast
emits_claim_types:
  - weather_forecast
  - weather_sensitivity
  - indoor_fallback_need
failure_behavior:
  - weather_claim_not_final_fact
  - indoor_fallback_recommended_when_weather_sensitive
```

### place_opening_hours

```yaml
capability: place_opening_hours
emits_claim_types:
  - opening_hours
  - closure_risk
  - schedule_fit
failure_behavior:
  - opening_hours_visible_as_verification_gap
  - plan_block_not_confirmed_by_hours
```

### place_price_information

```yaml
capability: place_price_information
emits_claim_types:
  - entrance_fee
  - estimated_activity_cost
  - budget_risk
failure_behavior:
  - exact_price_forbidden_without_evidence
  - budget_fit_marked_as_estimate
```

### accommodation_search

```yaml
capability: accommodation_search
emits_claim_types:
  - accommodation_candidate
  - family_room_fit
  - location_fit
  - facility_claim
failure_behavior:
  - candidate_visible_as_unverified_option
  - facility_claim_needs_verification
```

### accommodation_availability

```yaml
capability: accommodation_availability
emits_claim_types:
  - room_availability
  - date_availability
  - booking_risk
failure_behavior:
  - availability_not_claimed_as_fact
  - user_told_to_verify_before_booking
```

### women_only_beach_verification

```yaml
capability: women_only_beach_verification
emits_claim_types:
  - women_only_beach_status
  - privacy_fit
  - privacy_blocker
  - privacy_verification_gap
required_evidence_fields:
  - source_summary
  - freshness
  - confidence
failure_behavior:
  - sea_plan_not_confirmed
  - non_sea_fallback_required_when_privacy_is_hard_constraint
  - final_response_must_disclose_uncertainty
```

### official_source_lookup

```yaml
capability: official_source_lookup
emits_claim_types:
  - official_confirmation
  - official_closure_notice
  - official_price_or_schedule_reference
failure_behavior:
  - official_source_gap
  - lower_trust_source_cannot_override_missing_official_source_for_hard_constraint
```

### review_signal_lookup

```yaml
capability: review_signal_lookup
emits_claim_types:
  - family_experience_signal
  - crowding_signal
  - practical_access_signal
  - cleanliness_or_suitability_signal
failure_behavior:
  - review_signal_not_used_as_hard_fact
  - review_signal_cannot_override_official_source
```

## Blocker emission mapping

```yaml
blocker_mapping:
  hard_constraint_cannot_be_verified:
    emits: blocker_or_high_visibility_warning
  women_only_beach_required_but_unverified:
    emits: privacy_verification_blocker_for_sea_plan
  route_outside_radius_without_exception:
    emits: radius_policy_blocker
  accommodation_availability_unverified:
    emits: booking_readiness_blocker
  opening_hours_unverified_for_anchor_activity:
    emits: schedule_readiness_blocker
```

## Warning emission mapping

```yaml
warning_mapping:
  price_missing:
    emits: budget_uncertainty_warning
  traffic_missing:
    emits: travel_time_uncertainty_warning
  parking_missing:
    emits: parking_uncertainty_warning
  weather_missing:
    emits: weather_uncertainty_warning
  review_signal_low_confidence:
    emits: user_experience_uncertainty_warning
  stale_source:
    emits: freshness_warning
```

## Error envelope mapping

Capability başarısız olduğunda common error envelope aşağıdaki şekilde beslenir:

```yaml
error_envelope_mapping:
  capability_timeout:
    error_type: capability_unavailable
    severity: major
    recovery_action: use_fallback_or_disclose_gap
  provider_conflict:
    error_type: conflicting_evidence
    severity: major
    recovery_action: require_higher_trust_source
  missing_required_source:
    error_type: evidence_gap
    severity: major
    recovery_action: disclose_uncertainty
  hard_constraint_unverified:
    error_type: hard_constraint_verification_gap
    severity: critical
    recovery_action: block_or_offer_safe_alternative
```

## Final response mapping

```yaml
final_response_mapping:
  verified_claim:
    may_be_presented_as_fact: true
  partially_verified_claim:
    may_be_presented_as_fact: false
    must_include_caution: true
  missing_evidence_claim:
    may_be_presented_as_fact: false
    must_include_disclosure: true
  failed_hard_constraint_claim:
    may_be_presented_as_fact: false
    must_surface_blocker: true
  provider_failure:
    may_be_presented_as_fact: false
    must_surface_simple_limitation: true
```

## Forbidden evidence behaviors

```yaml
forbidden_behaviors:
  - raw_tool_output_used_as_final_answer
  - provider_name_exposed_as_architecture_dependency
  - exact_price_without_supported_evidence
  - exact_opening_hours_without_supported_evidence
  - exact_drive_time_without_supported_evidence
  - weather_claim_without_forecast_specificity
  - women_only_beach_claim_without_current_high_trust_evidence
  - review_signal_used_as_official_confirmation
  - hard_constraint_marked_satisfied_from_assumption
```

## Current status

```yaml
evidence_emission_mapping_state: drafted
next_artifact: 06-tool-trust-and-freshness-model.md
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
