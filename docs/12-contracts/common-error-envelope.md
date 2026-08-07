# Common Error Envelope

**Doküman türü:** canonical shared contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu contract setinde bütün agent handoff'larında ortak kullanılacak hata, uyarı, blocker, clarification ve recovery zarfını tanımlar.

Bu dosya runtime error class, exception type, API response, logging format veya monitoring implementation değildir.

Amaç şudur:

```text
Bir agent veya contract geçersiz, eksik, düşük güvenli ya da kullanıcıya taşınması gereken riskli bir durum ürettiğinde, bu durum hangi ortak alanlarla taşınır?
```

## Ana karar

```yaml
contract_name: common_error_envelope
contract_version: 0.1.0
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
runtime_exception_model: false
api_error_response: false
shared_by_all_contracts: true
```

## Producer

Bu envelope'ı üretebilecek taraflar:

```yaml
producers:
  - travel_orchestrator
  - trip_intake_agent
  - constraint_policy_agent
  - family_suitability_agent
  - destination_candidate_agent
  - route_logistics_agent
  - accommodation_fit_agent
  - activity_fit_agent
  - day_plan_composer_agent
  - verification_evidence_agent
  - final_response_composer_agent
  - contract_validator
```

## Consumer

Bu envelope'ı tüketebilecek taraflar:

```yaml
consumers:
  - travel_orchestrator
  - downstream_agents
  - verification_layer
  - final_response_composer_agent
  - evaluation_fixtures
  - audit_review
```

## Error envelope alanları

Her hata veya uyarı kaydı aşağıdaki mantığı taşımalıdır:

```yaml
common_error_envelope:
  error_id: string
  error_type: enum
  severity: enum
  source_contract: string
  source_agent: string
  affected_field: string | null
  affected_claim_id: string | null
  user_visible: boolean
  user_message_required: boolean
  internal_note_allowed: boolean
  recovery_action: enum
  clarification_question: string | null
  downstream_blocking: boolean
  final_response_blocking: boolean
  confidence_impact: enum
  related_evidence_gap_ids: list
  validation_status: enum
```

## Error type değerleri

```yaml
error_type_values:
  - missing_required_field
  - invalid_field_semantics
  - hard_constraint_violation
  - soft_preference_conflict
  - evidence_missing
  - evidence_conflict
  - low_confidence_inference
  - stale_information_risk
  - privacy_requirement_unverified
  - budget_uncertainty
  - route_logistics_uncertainty
  - accommodation_availability_uncertainty
  - activity_operational_uncertainty
  - weather_uncertainty
  - contract_version_mismatch
  - forbidden_field_present
  - agent_scope_violation
  - final_response_safety_violation
  - clarification_required
```

## Severity değerleri

```yaml
severity_values:
  - info
  - warning
  - blocker
  - hard_blocker
```

### Severity anlamları

```text
info:
  Planı engellemez, kullanıcıya her zaman gösterilmesi gerekmez.

warning:
  Plan devam edebilir; fakat karar kalitesi, güven veya kullanıcı beklentisi etkilenebilir.

blocker:
  İlgili aday, gün bloğu veya final cevap parçası durdurulur.

hard_blocker:
  Hard constraint, safety/policy veya kritik evidence ihlali vardır; final cevap bunu görünür yapmak zorundadır.
```

## Recovery action değerleri

```yaml
recovery_action_values:
  - proceed_with_warning
  - request_clarification
  - require_verification
  - remove_candidate
  - downgrade_to_soft_preference
  - mark_as_assumption
  - block_final_response_claim
  - escalate_to_orchestrator
```

## Required fields

Her error envelope kaydında zorunlu alanlar:

```yaml
required_fields:
  - error_id
  - error_type
  - severity
  - source_contract
  - source_agent
  - user_visible
  - user_message_required
  - recovery_action
  - downstream_blocking
  - final_response_blocking
  - confidence_impact
  - validation_status
```

## Optional fields

```yaml
optional_fields:
  - affected_field
  - affected_claim_id
  - clarification_question
  - related_evidence_gap_ids
  - internal_note
  - suggested_user_wording
  - affected_candidate_id
  - affected_day_id
  - affected_block_id
```

## Forbidden fields

```yaml
forbidden_fields:
  - raw_provider_exception
  - stack_trace
  - secret_value
  - auth_token
  - api_key
  - private_user_data_not_needed_for_plan
  - hidden_chain_of_thought
  - unredacted_sensitive_memory
```

## User visibility rules

Bazı error türleri kullanıcıya açıkça taşınmalıdır:

```yaml
must_be_user_visible_when:
  - hard_constraint_violation
  - privacy_requirement_unverified
  - evidence_missing_for_final_claim
  - evidence_conflict_affecting_recommendation
  - clarification_required
  - budget_uncertainty_affecting_plan
  - accommodation_availability_uncertainty_affecting_booking_decision
```

Kullanıcıya taşınmaması gereken iç detaylar:

```yaml
must_not_be_user_visible:
  - stack_trace
  - raw_model_error
  - provider_retry_detail
  - internal_prompt_detail
  - hidden_agent_reasoning
```

## Contract validation rules

```yaml
validation_rules:
  error_id_required: true
  severity_required: true
  hard_blocker_requires_user_visible: true
  final_response_blocking_requires_recovery_action: true
  clarification_required_requires_question_or_missing_field: true
  evidence_missing_requires_related_claim_or_field: true
  forbidden_raw_exception_data: true
  hidden_reasoning_exposure: forbidden
```

## Confidence impact

```yaml
confidence_impact_values:
  - none
  - lowers_local_confidence
  - lowers_plan_confidence
  - blocks_claim_confidence
  - blocks_candidate_confidence
  - blocks_final_response_confidence
```

## Kritik Tatil Modu error pattern'leri

### Kadınlar plajı doğrulanamadı

```yaml
error_type: privacy_requirement_unverified
severity: hard_blocker
user_visible: true
user_message_required: true
recovery_action: require_verification
final_response_blocking: true
affected_claim_id: women_only_beach_claim
```

### Açılış saati evidence yok

```yaml
error_type: evidence_missing
severity: warning
user_visible: true
user_message_required: true
recovery_action: require_verification
final_response_blocking: true
confidence_impact: blocks_claim_confidence
```

### Bütçe uyumu düşük güvenli

```yaml
error_type: budget_uncertainty
severity: warning
user_visible: true
recovery_action: mark_as_assumption
final_response_blocking: false
confidence_impact: lowers_plan_confidence
```

### Agent kendi kapsamı dışına çıktı

```yaml
error_type: agent_scope_violation
severity: blocker
user_visible: false
user_message_required: false
recovery_action: escalate_to_orchestrator
downstream_blocking: true
final_response_blocking: true
```

## Final response kuralları

Final Response Composer, error envelope içeren alanları şu şekilde kullanmalıdır:

```yaml
final_response_rules:
  hard_blocker_must_be_visible: true
  warning_can_be_summarized: true
  internal_error_detail_must_be_hidden: true
  clarification_required_must_be_asked_or_marked: true
  blocked_claim_must_not_be_presented_as_fact: true
  blocked_candidate_must_not_be_recommended_as_primary: true
```

## Example payload sketch

```yaml
common_error_envelope:
  error_id: ERR-PRIVACY-001
  error_type: privacy_requirement_unverified
  severity: hard_blocker
  source_contract: activity-fit-contract
  source_agent: activity_fit_agent
  affected_field: privacy_requirement_status
  affected_claim_id: CLAIM-WOMEN-ONLY-BEACH-001
  user_visible: true
  user_message_required: true
  internal_note_allowed: true
  recovery_action: require_verification
  clarification_question: null
  downstream_blocking: true
  final_response_blocking: true
  confidence_impact: blocks_claim_confidence
  related_evidence_gap_ids:
    - GAP-WOMEN-ONLY-BEACH-001
  validation_status: failed
```

## Fixture requirements

Bu envelope için fixture setinde en az şu örnekler bulunmalıdır:

```yaml
fixture_requirements:
  - missing_required_field_error
  - hard_constraint_violation_error
  - women_only_beach_unverified_error
  - stale_price_warning
  - opening_hours_missing_warning
  - agent_scope_violation_blocker
  - clarification_required_state
  - final_response_blocked_claim
```

## Backward compatibility notes

```yaml
compatibility_rules:
  new_error_type_additive: allowed_with_minor_version
  severity_meaning_change: breaking_change
  required_field_removal: breaking_change
  forbidden_field_relaxation: requires_architecture_review
  user_visibility_rule_change: requires_contract_review
```

## Open design questions

```yaml
open_questions:
  - Error envelope ile audit log formatı ileride ayrı mı tutulacak?
  - Kullanıcıya gösterilecek warning özetleri için ayrı presentation contract gerekecek mi?
  - Birden fazla error aynı claim'e bağlandığında öncelik sırası nasıl hesaplanacak?
```

## Current status

```yaml
contract_design_state: drafted
next_contract: contract-completion-checklist.md
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
```
