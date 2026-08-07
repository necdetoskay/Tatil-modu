# 07 — Provider and Adapter Boundary

**Doküman türü:** provider ve adapter boundary design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Provider entegrasyonu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nda capability, provider ve adapter sınırlarının nasıl ayrılacağını tanımlar.

Bu dosya gerçek adapter kodu, SDK entegrasyonu, API çağrısı, scraping, browser automation veya credential yönetimi içermez.

## Ana karar

```yaml
artifact_id: provider_and_adapter_boundary
artifact_state: drafted
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/07-provider-and-adapter-boundary.md
```

## Temel ayrım

```yaml
capability:
  meaning: sistemin ihtiyaç duyduğu doğrulama/yetenek türü
  examples:
    - maps_distance_and_route
    - weather_forecast
    - women_only_beach_verification
provider:
  meaning: bu capability için kullanılabilecek dış kaynak veya servis
  examples:
    - harita servisi
    - hava servisi
    - resmi belediye/tesis sayfası
adapter:
  meaning: provider sonucunu sistemin contract/evidence diline çeviren sınır
  examples:
    - provider_response_to_evidence_envelope
    - raw_error_to_common_error_envelope
```

## Boundary kuralları

```yaml
boundary_rules:
  agent_knows_provider_name: false
  contract_depends_on_provider_schema: false
  final_response_sees_raw_provider_payload: false
  adapter_outputs_evidence_envelope: true
  adapter_outputs_common_error_envelope_on_failure: true
  provider_change_requires_agent_spec_change: false
  provider_change_requires_contract_change: false
```

Agent capability ister.

Adapter provider ile konuşur.

Final cevap yalnızca evidence-aware claim görür.

## Adapter sorumlulukları

```yaml
adapter_responsibilities:
  - normalize_provider_payload
  - map_provider_result_to_claim_type
  - assign_evidence_status
  - assign_verification_status
  - assign_confidence
  - assign_freshness
  - attach_source_summary
  - detect_partial_or_conflicting_results
  - emit_warning_or_blocker
  - convert_provider_failure_to_error_envelope
```

Adapter öneri üretmez.

Adapter kullanıcıya doğrudan cevap yazmaz.

Adapter yalnızca provider sonucunu sistemin güvenli diline çevirir.

## Provider seçimi tasarım ilkeleri

```yaml
provider_selection_principles:
  - capability_fit_first
  - trust_and_freshness_second
  - cost_and_latency_visible
  - official_source_preferred_for_sensitive_claims
  - review_sources_never_enough_for_hard_constraints
  - provider_redundancy_allowed_for_cross_check
  - provider_lock_in_avoided
```

Provider seçimi runtime implementation değildir.

Bu aşamada yalnızca hangi provider türlerinin hangi capability'yi besleyebileceği tasarlanır.

## Provider-neutral contract ilkesi

Contract alanları provider'a göre şekillenmez.

Yanlış örnek:

```yaml
bad_contract_field_examples:
  - google_maps_duration_text
  - booking_com_price_raw
  - weather_provider_payload
```

Doğru örnek:

```yaml
good_contract_field_examples:
  - drive_time_band
  - price_claim
  - weather_risk
  - source_summary
  - evidence_status
  - freshness
```

## Raw payload sınırı

```yaml
raw_payload_policy:
  persisted_by_default: false
  passed_to_final_response: false
  passed_to_non_verification_agents: false
  sanitized_summary_required: true
  secrets_or_tokens_allowed: false
  personal_data_minimization_required: true
```

Raw provider payload, sistemin kanonik contract dili değildir.

## Adapter output şekli

Adapter başarılı olduğunda evidence envelope üretir.

```yaml
successful_adapter_output:
  output_type: evidence_envelope
  required_fields:
    - claim_id
    - claim_type
    - claim_text
    - source_summary
    - evidence_status
    - verification_status
    - confidence
    - freshness
    - user_visibility
    - blockers
    - warnings
```

Adapter başarısız olduğunda common error envelope üretir.

```yaml
failed_adapter_output:
  output_type: common_error_envelope
  required_fields:
    - error_id
    - error_type
    - severity
    - source_contract
    - affected_field
    - user_visible
    - recovery_action
    - downstream_blocking
    - final_response_blocking
```

## Provider değişim senaryosu

```yaml
provider_change_policy:
  same_capability_same_contract: true
  adapter_replacement_allowed: true
  agent_prompt_change_required: false
  final_response_contract_change_required: false
  evaluation_fixture_change_required_by_default: false
  trust_freshness_review_required: true
```

Provider değişirse önce trust/freshness ve adapter mapping gözden geçirilir.

Agent davranışı capability kimliğine bağlı kaldığı için değişmemelidir.

## Forbidden boundary violations

```yaml
forbidden_boundary_violations:
  - agent_mentions_specific_provider_as_required_dependency
  - final_response_uses_raw_provider_payload
  - contract_field_named_after_provider
  - provider_failure_hidden_from_evidence
  - adapter_returns_recommendation_instead_of_evidence
  - review_source_used_as_hard_constraint_proof
  - provider_result_presented_without_source_summary
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 08-capability-failure-and-fallback-policy.md
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
