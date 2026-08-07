# Verification Evidence Contract

**Doküman türü:** canonical contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Verification Evidence Contract, Tatil Modu planlama sürecinde üretilen iddiaların hangi doğrulama ihtiyacını taşıdığını, hangi iddiaların doğrulanmadan final kullanıcı cevabına gerçek gibi taşınamayacağını ve evidence eksikliğinin karar kalitesine nasıl yansıtılacağını tanımlar.

Bu contract'ın amacı şudur:

```text
Plan içindeki doğrulanabilir iddiaları görünür hale getirmek ve doğrulanmamış iddiaların kesin bilgi gibi sunulmasını engellemek.
```

Bu contract canlı veri çekmez.

Bu contract kaynak araması yapmaz.

Bu contract fiyat, saat, hava, otopark veya tesis bilgisini doğruladığını iddia etmez.

## 2. Producer

Beklenen producer:

```yaml
producer_agent: verification_evidence_agent
```

Bu contract şu upstream contract'lardan gelen verification ihtiyaçlarını toplar:

```yaml
upstream_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
  - destination-candidate-contract.md
  - route-logistics-contract.md
  - accommodation-fit-contract.md
  - activity-fit-contract.md
  - day-plan-contract.md
```

## 3. Consumer

Beklenen consumer'lar:

```yaml
consumer_contracts:
  - final-response-contract.md
  - common-evidence-envelope.md
  - contract-completion-checklist.md
```

Beklenen consumer agent:

```yaml
consumer_agent: final_response_composer_agent
```

## 4. Input fields

Ana input alanları:

```yaml
input_fields:
  - day_plan_draft
  - activity_profiles
  - accommodation_profiles
  - destination_route_profiles
  - destination_scope_summary
  - hard_constraints
  - policy_warnings
  - verification_needs
  - source_assumptions
```

## 5. Output fields

Ana output:

```yaml
output_type: verification_evidence_report
```

Beklenen output alanları:

```yaml
verification_evidence_report:
  report_id: ""
  contract_version: "1.0"
  generated_from_contracts: []
  evidence_items:
    - evidence_item_id: ""
      claim_id: ""
      claim_text: ""
      claim_category: unknown
      verification_status: unknown
      required_source_type: unknown
      acceptable_source_types: []
      freshness_requirement: unknown
      user_visible_status: unknown
      confidence_impact: unknown
      blocking_level: unknown
      notes: []
  unresolved_evidence_gaps: []
  hard_blockers: []
  soft_warnings: []
  final_response_rules: []
  confidence:
    value: medium
    reasons: []
  validation_status: pending
```

## 6. Required fields

```yaml
required_fields:
  - report_id
  - contract_version
  - generated_from_contracts
  - evidence_items
  - unresolved_evidence_gaps
  - hard_blockers
  - final_response_rules
  - confidence
  - validation_status
```

Her evidence item için zorunlu alanlar:

```yaml
evidence_item_required_fields:
  - evidence_item_id
  - claim_id
  - claim_text
  - claim_category
  - verification_status
  - required_source_type
  - user_visible_status
  - blocking_level
```

## 7. Optional fields

```yaml
optional_fields:
  - acceptable_source_types
  - freshness_requirement
  - confidence_impact
  - soft_warnings
  - notes
  - source_candidates
  - user_clarification_required
```

## 8. Forbidden fields

Bu contract aşağıdaki alanları taşımaz:

```yaml
forbidden_fields:
  - provider_api_key
  - raw_browser_session
  - payment_data
  - booking_confirmation
  - private_user_identity_documents
  - hidden_chain_of_thought
  - tool_runtime_result_claiming_live_verification
```

Bu contract doğrulama yapılmış gibi sahte sonuç üretemez.

## 9. Evidence requirements

Evidence gerektiren claim kategorileri:

```yaml
evidence_required_claim_categories:
  - opening_hours
  - ticket_price
  - hotel_price
  - live_availability
  - parking_availability
  - drive_time
  - traffic_condition
  - weather_condition
  - women_only_beach_status
  - pool_or_spa_facility
  - child_age_restriction
  - official_rule
  - ferry_schedule
  - toll_cost
  - distance_or_radius
```

Kadınlar plajı özel kuralı:

```yaml
women_only_beach_verification:
  required_when_sea_recommended_and_privacy_constraint_active: true
  unverified_status_user_visible: true
  unverified_status_can_be_final_recommendation: false
```

## 10. Confidence rules

```yaml
confidence_rules:
  high:
    conditions:
      - all_hard_constraint_relevant_claims_have_verified_or_visible_unresolved_status
      - final_response_rules_are_complete
      - no_hidden_hard_blocker
  medium:
    conditions:
      - some_soft_claims_unverified_but_visible
      - hard_constraint_claims_are_not_presented_as_verified
      - verification_gaps_are_user_visible
  low:
    conditions:
      - hard_constraint_related_claims_unverified
      - evidence_items_missing_claim_category
      - final_response_rules_incomplete
      - unresolved_blockers_exist
```

Düşük confidence durumunda final cevap iddiaları kesinleştiremez.

## 11. Validation rules

```yaml
validation_rules:
  every_claim_with_evidence_need_has_evidence_item: true
  unverified_claim_as_fact: forbidden
  hidden_evidence_gap: forbidden
  hard_constraint_claim_without_status: forbidden
  women_only_beach_claim_without_verification_status: forbidden
  exact_price_without_evidence: forbidden
  exact_opening_hour_without_evidence: forbidden
  exact_drive_time_without_evidence: forbidden
```

Hard blocker örnekleri:

```yaml
hard_blocker_examples:
  - women_only_beach_required_but_status_unknown_for_sea_recommendation
  - hotel_price_used_for_budget_fit_without_price_verification
  - opening_hours_required_for_day_plan_but_missing
  - long_route_claim_presented_as_exact_without_drive_time_evidence
```

## 12. Failure modes

```yaml
failure_modes:
  - evidence_item_missing_for_claim
  - hard_constraint_evidence_gap_hidden
  - unverified_claim_marked_as_verified
  - source_type_not_declared
  - freshness_requirement_missing
  - final_response_rule_missing
  - confidence_overstated
```

## 13. Clarification states

```yaml
clarification_states:
  - user_must_choose_between_verified_safe_option_and_unverified_option
  - user_must_confirm_if_unverified_far_option_is_allowed
  - user_must_confirm_budget_flexibility_when_price_unverified
  - user_must_confirm_privacy_requirement_if_ambiguous
```

Örnek clarification:

```text
Kadınlar plajı doğrulanmadan deniz alternatifi sunmamı ister misiniz, yoksa sadece doğrulanabilir kapalı/alternatif aktiviteleri mi kullanalım?
```

## 14. Example payload sketch

```yaml
verification_evidence_report:
  report_id: ver-001
  contract_version: "1.0"
  generated_from_contracts:
    - day-plan-contract.md
    - activity-fit-contract.md
    - accommodation-fit-contract.md
  evidence_items:
    - evidence_item_id: ev-001
      claim_id: claim-women-beach-001
      claim_text: "Deniz alternatifi kadınlar plajı şartını karşılıyor."
      claim_category: women_only_beach_status
      verification_status: unverified
      required_source_type: official_or_operator_source
      acceptable_source_types:
        - municipality_page
        - official_facility_page
        - operator_page
      freshness_requirement: current_season
      user_visible_status: must_show_as_unverified
      confidence_impact: high
      blocking_level: hard_blocker
      notes:
        - privacy_constraint_active
    - evidence_item_id: ev-002
      claim_id: claim-price-001
      claim_text: "Otel fiyatı bütçe içindedir."
      claim_category: hotel_price
      verification_status: unverified
      required_source_type: booking_or_operator_source
      freshness_requirement: current_date_range
      user_visible_status: must_show_as_unverified
      confidence_impact: medium
      blocking_level: soft_warning
  unresolved_evidence_gaps:
    - ev-001
    - ev-002
  hard_blockers:
    - women_only_beach_required_but_status_unknown_for_sea_recommendation
  soft_warnings:
    - hotel_price_unverified
  final_response_rules:
    - do_not_present_women_only_beach_claim_as_verified
    - show_price_as_requires_current_check
  confidence:
    value: low
    reasons:
      - hard_constraint_related_evidence_gap_exists
  validation_status: blocked
```

## 15. Fixture requirements

İlk fixture:

```yaml
fixture_id: TM-CONTRACT-VERIFICATION-001
name: Kadınlar plajı ve otel fiyatı doğrulama boşluğu
input:
  privacy_constraint:
    women_only_beach_required_when_sea_recommended: true
  day_plan_draft:
    includes_sea_option: true
  accommodation_profiles:
    includes_price_claim: true
expected_output:
  hard_blockers:
    - women_only_beach_required_but_status_unknown_for_sea_recommendation
  soft_warnings:
    - hotel_price_unverified
  final_response_rules:
    - do_not_present_women_only_beach_claim_as_verified
    - show_price_as_requires_current_check
```

## 16. Backward compatibility notes

```yaml
versioning:
  contract_version: "1.0"
  backward_compatible_if:
    - new_claim_categories_are_optional
    - existing_verification_status_values_are_not_removed
    - blocking_level_meaning_is_not_changed
  breaking_change_if:
    - unverified_status_is_allowed_as_fact
    - hard_blocker_semantics_change
    - evidence_item_required_fields_removed
```

## 17. Open design questions

```yaml
open_questions:
  - Evidence source type enumları ortak envelope dosyasında mı tutulmalı?
  - Freshness requirement tarih aralığı olarak mı yoksa band olarak mı taşınmalı?
  - Official source ile user-provided source çakışırsa precedence nasıl kurulacak?
  - Verification Evidence Agent ileride canlı tool kullanırsa bu contract ayrı runtime result envelope'a mı bölünmeli?
```

## Sonuç

Verification Evidence Contract, Tatil Modu'nun güvenilirlik omurgasını tanımlar.

Bu contract doğrulama yapmaz.

Bu contract, neyin doğrulanması gerektiğini ve doğrulanmadan neyin söylenemeyeceğini açıkça taşır.

```yaml
contract_status: drafted
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
next_contract: final-response-contract.md
```
