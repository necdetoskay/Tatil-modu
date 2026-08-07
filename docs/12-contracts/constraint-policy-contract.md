# Constraint Policy Contract

**Contract id:** `constraint_policy_contract`  
**Contract version:** `v1`  
**Producer:** `constraint_policy_agent`  
**Primary consumers:** `family_suitability_agent`, `destination_candidate_agent`, `activity_fit_agent`, `day_plan_composer_agent`, `final_response_composer_agent`  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu contract, `travel_request_contract` içindeki kısıt ve tercih adaylarını sınıflandırılmış, doğrulanabilir ve sonraki agent'lar tarafından uygulanabilir politika çıktısına dönüştürür.

Amaç, kullanıcı isteğindeki ifadelerin şu üç kategoriye ayrılmasıdır:

```text
1. hard_constraints
2. soft_preferences
3. policy_warnings
```

Bu contract plan üretmez.

Bu contract destinasyon, rota, otel veya aktivite önermez.

Bu contract sadece hangi kuralların ihlal edilemez olduğunu, hangilerinin puanlama tercihi olduğunu ve hangilerinin kullanıcıya uyarı olarak taşınması gerektiğini tanımlar.

## Producer

```yaml
producer_agent: constraint_policy_agent
producer_spec: docs/11-agent-specifications/constraint-policy-agent.md
input_contract: docs/12-contracts/travel-request-contract.md
```

## Consumers

```yaml
primary_consumers:
  - family_suitability_agent
  - destination_candidate_agent
  - activity_fit_agent
  - day_plan_composer_agent
  - final_response_composer_agent
secondary_consumers:
  - route_logistics_agent
  - accommodation_fit_agent
  - verification_evidence_agent
```

## Non-goals

```yaml
final_plan_generation: false
candidate_generation: false
activity_recommendation: false
hotel_recommendation: false
route_calculation: false
live_data_lookup: false
price_verification: false
weather_verification: false
memory_write: false
```

## Top-level envelope

```yaml
envelope:
  contract_id: constraint_policy_contract
  contract_version: v1
  producer_agent: constraint_policy_agent
  trace_id: required
  created_at: required
  input_contract_refs: required
  validation_status: required
  confidence: required
  evidence_summary: required
  payload: required
```

## Input fields

Bu contract temel olarak `travel_request_contract` çıktısını tüketir.

```yaml
input_fields:
  travel_request_envelope: required
  hard_constraint_candidates: optional
  soft_preference_candidates: optional
  privacy_preferences: optional
  family_constraints: optional
  logistics_preferences: optional
  missing_information: required
  ambiguity_notes: required
  assumptions: required
```

## Output fields

```yaml
payload:
  policy_summary: required
  hard_constraints: required
  soft_preferences: required
  policy_warnings: required
  clarification_requirements: required
  downstream_application_rules: required
  rejected_constraint_candidates: optional
  assumptions_to_surface: required
  validation_notes: required
```

## Required fields

```yaml
required_fields:
  - policy_summary
  - hard_constraints
  - soft_preferences
  - policy_warnings
  - clarification_requirements
  - downstream_application_rules
  - assumptions_to_surface
  - validation_notes
```

Boş liste geçerli olabilir; fakat alan tamamen yok bırakılamaz.

## Hard constraints

Hard constraint, ihlal edildiğinde adayın elenmesine veya kullanıcıdan açık onay alınmasına yol açan kuraldır.

```yaml
hard_constraints:
  - constraint_id: required
    label: required
    source: required
    source_text: required_if_from_user_statement
    category: required
    applies_to: required
    enforcement: required
    confidence: required
    evidence_requirement: required
    user_visible: required
    can_be_overridden_by_user: required
```

### Hard constraint category values

```yaml
allowed_categories:
  - privacy
  - safety
  - family_fit
  - budget
  - logistics
  - time
  - accessibility
  - legal_or_public_rule
```

### Enforcement values

```yaml
enforcement_values:
  eliminate_candidate: Aday doğrudan elenir.
  block_until_clarified: Kullanıcıdan bilgi alınmadan ilerlenmez.
  require_user_confirmation: Aday ancak açık onayla kullanılabilir.
  require_evidence_before_use: Doğrulama olmadan final plana alınamaz.
```

### Example hard constraint

```yaml
- constraint_id: women_only_beach_required_when_sea_recommended
  label: Deniz önerisi yapılırsa kadınlar plajı olmalı
  source: user_statement
  source_text: "eğer deniz önerisi verilecekse kadınlar plajı mutlaka olmalı"
  category: privacy
  applies_to:
    - sea_activity
    - beach_recommendation
  enforcement: eliminate_candidate
  confidence: high
  evidence_requirement: women_only_beach_verification_required
  user_visible: true
  can_be_overridden_by_user: true
```

## Soft preferences

Soft preference, plan kalitesini ve sıralamayı etkiler ama tek başına aday elemek zorunda değildir.

```yaml
soft_preferences:
  - preference_id: required
    label: required
    source: required
    source_text: optional
    category: required
    applies_to: required
    ranking_effect: required
    confidence: required
    user_visible: required
```

### Ranking effect values

```yaml
ranking_effect_values:
  boost: Uygun adayları yukarı taşır.
  penalize: Zayıf adayları aşağı taşır.
  diversify: Alternatif çeşitliliğini artırır.
  explain_only: Final açıklamada görünür ama sıralama etkisi zayıftır.
```

### Example soft preference

```yaml
- preference_id: low_fatigue_preferred
  label: Düşük yorgunluklu plan tercih edilir
  source: user_statement
  category: family_fit
  applies_to:
    - route
    - daily_plan
    - activity
  ranking_effect: boost
  confidence: high
  user_visible: true
```

## Policy warnings

Policy warning, kullanıcıya açıkça taşınması gereken risk veya belirsizliktir.

```yaml
policy_warnings:
  - warning_id: required
    label: required
    severity: required
    reason: required
    affected_fields: required
    must_surface_to_user: required
    blocks_final_plan: required
```

### Severity values

```yaml
severity_values:
  info: Bilgilendirme.
  caution: Dikkat edilmesi gereken belirsizlik.
  warning: Plan kalitesini veya güvenilirliğini ciddi etkiler.
  blocking: Kullanıcıdan bilgi alınmadan ilerlenmemeli.
```

### Example policy warning

```yaml
- warning_id: missing_date_window_limits_verification
  label: Tarih bilgisi eksik olduğu için hava ve çalışma saati doğrulaması sınırlı
  severity: caution
  reason: Tarih verilmezse sezon, hava, açık/kapalı saatler net doğrulanamaz.
  affected_fields:
    - date_window
    - weather_forecast
    - business_hours
  must_surface_to_user: true
  blocks_final_plan: false
```

## Clarification requirements

```yaml
clarification_requirements:
  - clarification_id: required
    question: required
    reason: required
    importance: low | medium | high | blocking
    blocks_downstream: boolean
    affected_contracts: required
```

Örnek:

```yaml
- clarification_id: confirm_strict_privacy_rule
  question: Deniz önerisi yapılırsa sadece kadınlar plajı olan yerler mi değerlendirilsin?
  reason: Mahremiyet kuralının hard constraint mi soft preference mı olduğu kesinleştirilmeli.
  importance: high
  blocks_downstream: false
  affected_contracts:
    - activity_fit_contract
    - day_plan_contract
```

## Downstream application rules

Bu alan sonraki agent'ların kuralları nasıl uygulayacağını belirtir.

```yaml
downstream_application_rules:
  candidate_generation:
    must_apply_hard_constraints_before_ranking: true
  ranking:
    soft_preferences_can_adjust_score: true
    soft_preferences_cannot_override_hard_constraints: true
  final_response:
    must_surface_policy_warnings: true
    must_surface_user_visible_assumptions: true
  verification:
    hard_constraint_evidence_gap_must_be_reported: true
```

## Rejected constraint candidates

Trip Intake çıktısındaki bazı adaylar policy agent tarafından reddedilebilir veya soft preference'a indirilebilir.

```yaml
rejected_constraint_candidates:
  - candidate_id: required
    original_label: required
    rejection_reason: required
    converted_to: none | soft_preference | policy_warning
    confidence: required
```

## Assumptions to surface

```yaml
assumptions_to_surface:
  - assumption_id: required
    statement: required
    source: required
    risk_level: low | medium | high
    must_be_shown_to_user: true
```

## Forbidden fields

```yaml
forbidden_fields:
  - final_itinerary
  - destination_candidates
  - ranked_destinations
  - hotel_recommendations
  - activity_recommendations
  - verified_prices
  - verified_weather
  - booking_links
  - canonical_memory_write
  - internal_chain_of_thought
  - provider_response_raw
```

## Evidence requirements

Bu contract'ta evidence çoğunlukla kullanıcı beyanı ve input contract trace'inden gelir.

```yaml
evidence_requirements:
  input_contract_reference: required
  user_statement_source_text: required_for_user_derived_constraints
  external_source_evidence: not_required_unless_policy_claim_added
  evidence_gap_marker: required_when_evidence_needed_later
```

Policy agent, dış kaynak gerektiren bir iddiayı doğrulanmış bilgi gibi sunamaz.

## Confidence rules

```yaml
confidence_rules:
  explicit_user_statement: high
  direct_candidate_from_intake: medium_or_high
  inferred_constraint: medium
  weak_inference: low
  missing_or_ambiguous: low
```

Low confidence hard constraint üretilemez; low confidence durumunda clarification veya warning üretilmelidir.

```yaml
low_confidence_hard_constraint: forbidden
```

## Validation rules

```yaml
validation_rules:
  hard_constraints_field_present: required
  soft_preferences_field_present: required
  policy_warnings_field_present: required
  no_soft_preference_overrides_hard_constraint: required
  user_visible_sensitive_rules_marked: required
  privacy_rules_not_persisted_to_memory: required
  no_final_plan_fields: required
  no_live_data_claims: required
```

## Failure modes

```yaml
failure_modes:
  - contradictory_constraints
  - ambiguous_privacy_requirement
  - missing_core_policy_context
  - unsupported_or_unfulfillable_constraint
  - unsafe_constraint_request
  - hard_constraint_without_evidence_path
```

## Clarification states

```yaml
clarification_states:
  none_needed: Downstream agent'lar devam edebilir.
  useful_but_not_blocking: Final cevapta varsayım gösterilerek devam edilebilir.
  blocking: Contract downstream agent'lara gönderilmeden önce kullanıcı cevabı gerekir.
```

## Example payload sketch

Bu örnek schema code değildir.

```yaml
envelope:
  contract_id: constraint_policy_contract
  contract_version: v1
  producer_agent: constraint_policy_agent
  trace_id: TM-TRACE-EXAMPLE-001
  created_at: 2026-08-07T11:26:00+03:00
  input_contract_refs:
    - travel_request_contract:v1
  validation_status: valid
  confidence: high
payload:
  policy_summary: Deniz önerisi yapılırsa kadınlar plajı hard constraint kabul edilir; düşük yorgunluk ve park/trafik dikkati soft preference olarak uygulanır.
  hard_constraints:
    - constraint_id: women_only_beach_required_when_sea_recommended
      label: Deniz önerisi yapılırsa kadınlar plajı olmalı
      source: user_statement
      source_text: "eğer deniz önerisi verilecekse kadınlar plajı mutlaka olmalı"
      category: privacy
      applies_to:
        - sea_activity
        - beach_recommendation
      enforcement: eliminate_candidate
      confidence: high
      evidence_requirement: women_only_beach_verification_required
      user_visible: true
      can_be_overridden_by_user: true
  soft_preferences:
    - preference_id: low_fatigue_preferred
      label: Düşük yorgunluklu plan tercih edilir
      source: user_statement
      category: family_fit
      applies_to:
        - route
        - daily_plan
      ranking_effect: boost
      confidence: high
      user_visible: true
  policy_warnings:
    - warning_id: missing_date_window_limits_verification
      label: Tarih bilgisi eksik olduğu için doğrulama sınırlı
      severity: caution
      reason: Tarih verilmezse hava, sezon ve çalışma saatleri net doğrulanamaz.
      affected_fields:
        - date_window
      must_surface_to_user: true
      blocks_final_plan: false
  clarification_requirements: []
  downstream_application_rules:
    candidate_generation:
      must_apply_hard_constraints_before_ranking: true
    ranking:
      soft_preferences_can_adjust_score: true
      soft_preferences_cannot_override_hard_constraints: true
    final_response:
      must_surface_policy_warnings: true
      must_surface_user_visible_assumptions: true
    verification:
      hard_constraint_evidence_gap_must_be_reported: true
  assumptions_to_surface: []
  validation_notes: []
```

## Fixture requirements

```yaml
fixtures_required:
  - explicit_women_only_beach_hard_constraint
  - low_fatigue_soft_preference
  - missing_date_policy_warning
  - contradictory_constraints
  - ambiguous_privacy_requirement
  - weak_inference_rejected_as_hard_constraint
  - soft_preference_cannot_override_hard_constraint
```

## Backward compatibility notes

```yaml
versioning:
  current_version: v1
  breaking_change_requires_new_version: true
  additive_optional_fields_allowed: true
  required_field_removal_forbidden: true
  enforcement_value_change_requires_review: true
```

## Open design questions

```yaml
open_questions:
  - Kullanıcı mahremiyet tercihini bir kere belirttiğinde aynı session içinde tekrar onay gerekir mi?
  - Hard constraint override için final response agent mı yoksa orchestrator mı kullanıcı onayı istemeli?
  - Policy warning severity seviyeleri evaluation rubric içinde nasıl puanlanacak?
```

## Current status

```yaml
contract_state: drafted
next_contract: family-suitability-contract.md
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
```
