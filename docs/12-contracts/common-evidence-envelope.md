# Common Evidence Envelope

**Doküman türü:** canonical contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Common Evidence Envelope, Tatil Modu contract setindeki bütün evidence, claim, source, confidence ve verification ihtiyacı alanlarını ortak bir zarf altında standartlaştırır.

Bu dosya runtime schema değildir.

Bu dosya TypeScript type, Zod schema veya JSON Schema değildir.

Amaç, her agent handoff'unda şu soruların aynı biçimde cevaplanmasını sağlamaktır:

```text
Bu bilgi ne iddia ediyor?
Bu iddia hangi kaynağa dayanıyor?
Kaynak güvenilir mi?
Bilgi doğrulandı mı?
Doğrulanmadıysa final kullanıcı cevabında nasıl taşınmalı?
```

```yaml
contract_id: common_evidence_envelope
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
schema_code_allowed: false
used_by_all_contracts: true
```

## 2. Producer

Bu envelope tek bir agent'a ait değildir.

Aşağıdaki contract'lar tarafından kullanılabilir:

```yaml
producers:
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
```

## 3. Consumer

Bu envelope aşağıdaki tüketiciler için tasarlanır:

```yaml
consumers:
  - downstream_agents
  - verification_evidence_agent
  - final_response_composer_agent
  - evaluation_fixtures
  - audit_review
```

## 4. Input fields

Evidence envelope, claim taşıyan contract alanlarının yanında kullanılmalıdır.

Örnek input kaynakları:

```yaml
input_claim_sources:
  - user_input
  - inferred_preference
  - candidate_data
  - route_logistics_estimate
  - accommodation_candidate_data
  - activity_candidate_data
  - verification_result
  - policy_classification
```

## 5. Output fields

Ortak envelope alanları:

```yaml
evidence_envelope:
  envelope_version: "0.1"
  claim_id: ""
  claim_text: ""
  claim_type: unknown
  claim_subject: ""
  claim_value: null
  source_summary: []
  evidence_status: unknown
  verification_status: unknown
  confidence:
    value: medium
    reasons: []
  freshness:
    required: false
    checked_at: null
    expires_at: null
    staleness_risk: unknown
  user_visibility:
    may_show_to_user: true
    must_disclose_uncertainty: false
    must_not_present_as_fact: false
  blockers: []
  warnings: []
```

## 6. Required fields

Her evidence envelope için minimum alanlar:

```yaml
required_fields:
  - envelope_version
  - claim_id
  - claim_type
  - evidence_status
  - confidence
  - user_visibility
```

Claim final cevaba taşınacaksa şu alanlar da zorunludur:

```yaml
required_when_final_visible:
  - claim_text
  - source_summary
  - verification_status
  - must_disclose_uncertainty
```

## 7. Optional fields

Opsiyonel alanlar:

```yaml
optional_fields:
  - claim_subject
  - claim_value
  - checked_at
  - expires_at
  - freshness_window
  - source_url_label
  - source_owner
  - source_type
  - source_rank
  - evidence_notes
  - reviewer_notes
```

## 8. Forbidden fields

Envelope içinde taşınmaması gereken alanlar:

```yaml
forbidden_fields:
  - payment_card_data
  - identity_document_data
  - provider_api_secret
  - booking_account_password
  - raw_private_memory_dump
  - unrelated_personal_history
  - hidden_chain_of_thought
```

## 9. Claim types

Claim türleri:

```yaml
claim_types:
  - user_declared_preference
  - inferred_preference
  - hard_constraint
  - soft_preference
  - destination_claim
  - route_claim
  - parking_claim
  - price_claim
  - opening_hours_claim
  - weather_claim
  - accommodation_facility_claim
  - activity_availability_claim
  - women_only_beach_claim
  - safety_claim
  - budget_claim
  - policy_claim
```

## 10. Evidence status

Evidence status değerleri:

```yaml
evidence_status_values:
  verified: "Kaynakla desteklenmiş ve final cevaba güvenle taşınabilir."
  partially_verified: "Bazı kısımlar desteklenmiş, bazı kısımlar belirsizdir."
  user_provided: "Kullanıcı beyanına dayanır."
  inferred: "Sistem çıkarımıdır, kesin bilgi değildir."
  needs_verification: "Final öncesi doğrulama gerekir."
  unavailable: "Evidence yoktur veya bulunamamıştır."
  stale: "Evidence eski olabilir."
```

## 11. Verification status

Verification status değerleri:

```yaml
verification_status_values:
  not_required
  required_not_started
  in_progress_design_only
  verified
  failed
  blocked
  stale
```

Bu tasarım aşamasında canlı verification yapılmadığı için `in_progress_design_only` runtime anlamı taşımaz.

## 12. Source summary

Source summary alanı şu şekilde düşünülür:

```yaml
source_summary_item:
  source_id: ""
  source_type: unknown
  source_label: ""
  source_owner: unknown
  trust_band: unknown
  freshness_band: unknown
  supports_claim: true
  notes: []
```

Source type örnekleri:

```yaml
source_types:
  - user_input
  - official_source
  - provider_source
  - map_source
  - weather_source
  - accommodation_source
  - activity_source
  - internal_candidate_data
  - inferred_without_external_source
```

## 13. Trust bands

Kaynak güven bandı:

```yaml
trust_bands:
  high:
    examples:
      - official_source
      - direct_provider_source
      - user_declared_requirement
  medium:
    examples:
      - reputable_listing_source
      - recent_map_or_travel_source
      - structured_candidate_data
  low:
    examples:
      - old_source
      - ambiguous_listing
      - inferred_without_external_source
  unknown:
    examples:
      - missing_source
      - source_not_classified
```

## 14. Freshness rules

Aşağıdaki claim türleri taze evidence gerektirir:

```yaml
freshness_required_for:
  - price_claim
  - opening_hours_claim
  - weather_claim
  - parking_claim
  - live_availability_claim
  - road_condition_claim
  - facility_status_claim
  - women_only_beach_claim
```

Örnek kural:

```text
Açılış saati, fiyat veya hava durumu gibi değişebilir bilgiler eski kaynakla kesin bilgi gibi sunulamaz.
```

## 15. User visibility rules

Final cevaba taşınma kuralları:

```yaml
user_visibility_rules:
  verified:
    may_show_to_user: true
    must_disclose_uncertainty: false
    must_not_present_as_fact: false
  partially_verified:
    may_show_to_user: true
    must_disclose_uncertainty: true
    must_not_present_as_fact: false
  user_provided:
    may_show_to_user: true
    must_disclose_uncertainty: false
    must_not_present_as_fact: false
  inferred:
    may_show_to_user: true
    must_disclose_uncertainty: true
    must_not_present_as_fact: true
  needs_verification:
    may_show_to_user: true
    must_disclose_uncertainty: true
    must_not_present_as_fact: true
  unavailable:
    may_show_to_user: true
    must_disclose_uncertainty: true
    must_not_present_as_fact: true
```

## 16. Validation rules

Validation kuralları:

```yaml
validation_rules:
  claim_id_required: true
  confidence_required: true
  source_required_when_claim_presented_as_fact: true
  freshness_required_when_claim_is_time_sensitive: true
  uncertainty_disclosure_required_when_not_verified: true
  unverified_claim_as_fact: forbidden
  hidden_source_dependency: forbidden
```

Hard validation failure örnekleri:

```yaml
hard_fail_if:
  - price_claim_presented_as_verified_without_source
  - opening_hours_claim_presented_as_verified_without_source
  - women_only_beach_claim_presented_as_verified_without_source
  - parking_claim_presented_as_verified_without_source
  - weather_claim_presented_as_verified_without_source
  - inferred_preference_marked_as_user_declared
```

## 17. Failure modes

Olası failure mode'lar:

```yaml
failure_modes:
  - missing_claim_id
  - missing_confidence
  - missing_source_for_fact_claim
  - stale_evidence_for_time_sensitive_claim
  - unsupported_hard_constraint
  - inferred_claim_presented_as_user_declared
  - user_visible_claim_without_uncertainty_marker
```

## 18. Clarification states

Evidence eksikliği clarification doğurabilir:

```yaml
clarification_states:
  - clarification_not_needed
  - clarification_recommended
  - clarification_required_before_final_plan
  - user_confirmation_required_for_assumption
```

Örnek:

```text
Kadınlar plajı şartı zorunlu mu, yoksa tercih mi?
```

## 19. Example payload sketch

```yaml
claim:
  claim_id: claim_beach_privacy_001
  claim_text: "Deniz önerisi için kadınlar plajı doğrulaması gerekir."
  claim_type: women_only_beach_claim
  claim_subject: sea_activity_privacy
  source_summary:
    - source_id: user_request_001
      source_type: user_input
      source_label: "Kullanıcı kadınlar plajı şartını belirtti"
      trust_band: high
      freshness_band: not_time_sensitive
      supports_claim: true
  evidence_status: user_provided
  verification_status: required_not_started
  confidence:
    value: high
    reasons:
      - explicit_user_requirement
  user_visibility:
    may_show_to_user: true
    must_disclose_uncertainty: true
    must_not_present_as_fact: false
  warnings:
    - live_beach_status_not_verified
```

Başka örnek:

```yaml
claim:
  claim_id: claim_price_001
  claim_text: "Otel fiyatı güncel olarak doğrulanmadı."
  claim_type: price_claim
  claim_subject: accommodation_price
  evidence_status: needs_verification
  verification_status: required_not_started
  confidence:
    value: low
    reasons:
      - live_price_not_checked
  user_visibility:
    may_show_to_user: true
    must_disclose_uncertainty: true
    must_not_present_as_fact: true
  blockers:
    - exact_price_cannot_be_presented
```

## 20. Fixture requirements

İlk fixture:

```yaml
fixture_id: TM-EVIDENCE-ENVELOPE-001
name: Kadınlar plajı ve fiyat iddiası için ortak evidence envelope
input:
  claims:
    - claim_type: women_only_beach_claim
      source_type: user_input
      verification_status: required_not_started
    - claim_type: price_claim
      source_type: inferred_without_external_source
      verification_status: required_not_started
expected_output:
  validation_status: warning
  user_visibility:
    women_only_beach_claim:
      must_disclose_uncertainty: true
    price_claim:
      must_not_present_as_fact: true
```

## 21. Backward compatibility notes

```yaml
compatibility:
  envelope_version_required: true
  additive_fields_allowed: true
  removing_required_fields_requires_contract_revision: true
  changing_claim_type_semantics_requires_fixture_update: true
```

## 22. Open design questions

```yaml
open_questions:
  - Evidence envelope contract dosyalarında inline mı tutulacak, yoksa ortak referans olarak mı bağlanacak?
  - Confidence değeri tek band mı, yoksa evidence/source/user-visible confidence ayrımı yapılmalı mı?
  - Tazelik süresi claim type bazında sabit mi, provider bazında değişken mi olmalı?
  - Kullanıcı beyanı her zaman high trust mı sayılmalı, yoksa sadece preference/constraint için mi high trust olmalı?
```

## Sonuç

Common Evidence Envelope, Tatil Modu içindeki bütün claim ve evidence aktarımını ortaklaştırır.

Bu envelope sayesinde final cevapta doğrulanmamış bilgi kesin bilgi gibi sunulmaz.

Bu dosya kod değildir.

Bu dosya schema değildir.

Bu dosya, sonraki contract ve evaluation tasarımları için ortak evidence sözleşmesidir.

```yaml
contract_status: drafted
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
next_contract: common-error-envelope.md
```
