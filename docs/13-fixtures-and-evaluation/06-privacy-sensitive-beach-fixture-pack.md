# 06 — Privacy Sensitive Beach Fixture Pack

**Doküman türü:** privacy-sensitive beach fixture design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nun deniz/plaj önerileriyle birlikte mahremiyet hassasiyeti ve kadınlar plajı şartını doğru taşıyıp taşımadığını ölçmek için kullanılacak fixture setini tanımlar.

Bu dosya test runner değildir.

Bu dosya runtime tool çağrısı, canlı kaynak kontrolü, CI, script veya implementation içermez.

## Ana karar

```yaml
fixture_pack_id: privacy_sensitive_beach_fixture_pack
fixture_pack_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/06-privacy-sensitive-beach-fixture-pack.md
related_golden_scenarios:
  - GS-002
  - GS-003
  - GS-004
  - GS-009
```

## Bu fixture pack neyi ölçer?

```yaml
measured_behaviors:
  - deniz önerisi yapıldığında kadınlar plajı şartının görünür kalması
  - privacy şartının soft preference değil hard constraint olarak taşınması
  - kadınlar plajı durumu doğrulanmadıysa final cevapta kesin bilgi gibi sunulmaması
  - plaj önerisinin uygun alternatifi yoksa non-sea alternative üretilmesi
  - mahremiyet şartı karşılanamıyorsa blocker veya clarification üretilmesi
  - kadınlar plajı iddiasının evidence envelope ile taşınması
  - aile profili ve çocuk yaşlarıyla privacy önerisinin çakışmaması
```

## İlgili agent/contract kapsamı

```yaml
covered_agents:
  - trip_intake_agent
  - constraint_policy_agent
  - destination_candidate_agent
  - activity_fit_agent
  - verification_evidence_agent
  - day_plan_composer_agent
  - final_response_composer_agent
covered_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - destination-candidate-contract.md
  - activity-fit-contract.md
  - verification-evidence-contract.md
  - day-plan-contract.md
  - final-response-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
```

## Fixture required fields

```yaml
required_fixture_fields:
  - fixture_id
  - source_golden_scenario
  - user_request
  - privacy_requirement
  - sea_recommendation_context
  - expected_constraint_behavior
  - expected_activity_behavior
  - expected_evidence_behavior
  - expected_final_response_behavior
  - expected_blockers_or_warnings
  - forbidden_outputs
  - evaluation_notes
```

## PB-001 — Deniz önerisi varsa kadınlar plajı şartı aktif

```yaml
fixture_id: PB-001
source_golden_scenario: GS-002
user_request: >
  Kocaeli çıkışlı çocuklarla 5 günlük tatil planı istiyorum. Deniz önerisi olursa kadınlar plajı mutlaka olsun.
privacy_requirement:
  women_only_beach_required_when_sea_recommended: true
sea_recommendation_context:
  sea_activity_allowed: conditional
  condition: women_only_beach_required
expected_constraint_behavior:
  privacy_requirement_classification: hard_constraint
  sea_activity_without_privacy_match: blocked_or_requires_alternative
expected_activity_behavior:
  sea_candidate_must_include_privacy_verification_need: true
  non_sea_alternative_required_when_privacy_unverified: true
expected_evidence_behavior:
  women_only_beach_claim_requires_evidence: true
  missing_evidence_must_be_visible: true
expected_final_response_behavior:
  must_not_say_women_only_beach_verified_without_evidence: true
  must_surface_privacy_condition: true
forbidden_outputs:
  - women_only_beach_requirement_hidden
  - sea_activity_recommended_without_privacy_status
  - women_only_beach_claim_without_evidence_as_fact
```

## PB-002 — Kadınlar plajı doğrulanmadıysa deniz planı kesinleştirilemez

```yaml
fixture_id: PB-002
source_golden_scenario: GS-009
user_request: >
  Balıkesir için deniz de olsun ama kadınlar plajı şart. Eğer emin değilsek alternatif ver.
privacy_requirement:
  women_only_beach_required_when_sea_recommended: true
sea_recommendation_context:
  target_area: Balıkesir
  evidence_status: missing
expected_constraint_behavior:
  hard_constraints:
    - women_only_beach_required_when_sea_recommended
expected_activity_behavior:
  sea_candidate_status: requires_verification
  fallback_activity_required: true
expected_evidence_behavior:
  evidence_gap_type: women_only_beach_verification_missing
  final_response_blocking_if_claim_is_presented_as_verified: true
expected_final_response_behavior:
  must_use_uncertainty_language: true
  must_offer_non_sea_or_indoor_backup: true
forbidden_outputs:
  - exact_privacy_status_without_evidence
  - beach_confirmed_language_without_source
  - no_fallback_option
```

## PB-003 — Plaj önerisi yoksa kadınlar plajı şartı planı gereksiz kilitlemez

```yaml
fixture_id: PB-003
source_golden_scenario: GS-003
user_request: >
  5 günlük aile planı yap. Deniz şart değil ama deniz önerirsen kadınlar plajı olmalı.
privacy_requirement:
  women_only_beach_required_when_sea_recommended: true
  sea_required: false
expected_constraint_behavior:
  women_only_beach_condition_scope: only_when_sea_recommended
  non_sea_candidates_not_blocked_by_beach_requirement: true
expected_day_plan_behavior:
  non_sea_days_can_be_planned: true
  sea_day_requires_privacy_status: true
expected_final_response_behavior:
  must_not_treat_beach_as_required_for_all_days: true
forbidden_outputs:
  - all_non_beach_options_blocked_due_to_women_only_beach_rule
  - women_only_beach_rule_applied_to_museum_zoo_nature_activities
  - sea_requirement_invented
```

## PB-004 — Mahremiyet şartı ile uzak istisna aday çakışması

```yaml
fixture_id: PB-004
source_golden_scenario: GS-010
user_request: >
  Kocaeli çevresinde 150 km içinde aile planı yap. Deniz olursa kadınlar plajı olsun.
  150 km dışı ancak gerçekten çok iyiyse değerlendir.
privacy_requirement:
  women_only_beach_required_when_sea_recommended: true
radius_rule:
  default_radius_km: 150
  out_of_radius_exception_allowed: conditional
expected_destination_behavior:
  out_of_radius_sea_candidate_requires_exception_reason: true
  out_of_radius_sea_candidate_requires_privacy_verification_need: true
expected_evidence_behavior:
  distance_claim_requires_evidence_or_uncertainty: true
  privacy_claim_requires_evidence_or_uncertainty: true
expected_final_response_behavior:
  must_explain_both_radius_and_privacy_uncertainty: true
forbidden_outputs:
  - out_of_radius_beach_without_exception_reason
  - out_of_radius_beach_without_privacy_status
  - exact_distance_and_privacy_claim_without_evidence
```

## PB-005 — Çocuklu aile için privacy-sensitive plaj alternatifi yorucuysa uyarı gerekir

```yaml
fixture_id: PB-005
source_golden_scenario: GS-001
user_request: >
  2 ve 6 yaş çocukla denizli bir gün olabilir. Kadınlar plajı şart ama çok yorucu olmasın.
privacy_requirement:
  women_only_beach_required_when_sea_recommended: true
family_profile:
  children:
    - age: 2
    - age: 6
expected_family_behavior:
  toddler_fatigue_considered: true
  beach_day_rest_block_required: true
expected_route_behavior:
  long_drive_to_privacy_beach_requires_warning: true
expected_day_plan_behavior:
  beach_day_must_include_rest_or_light_afternoon: true
expected_final_response_behavior:
  must_not_over_optimize_privacy_by_creating_excessive_fatigue: true
forbidden_outputs:
  - privacy_match_overrides_toddler_fatigue
  - long_beach_transfer_without_warning
  - no_rest_block_on_beach_day
```

## Common expected warnings

```yaml
expected_warnings:
  - women_only_beach_verification_missing
  - privacy_requirement_active
  - sea_candidate_requires_verification
  - non_sea_fallback_recommended
  - long_drive_to_privacy_candidate
  - family_fatigue_risk_on_beach_day
```

## Common forbidden outputs

```yaml
common_forbidden_outputs:
  women_only_beach_requirement_hidden: forbidden
  sea_activity_without_privacy_status: forbidden
  women_only_beach_claim_without_evidence_as_fact: forbidden
  exact_privacy_status_without_evidence: forbidden
  beach_confirmed_language_without_source: forbidden
  non_sea_options_blocked_by_conditional_beach_rule: forbidden
  privacy_match_overrides_child_fatigue: forbidden
```

## Evaluation notes

Bu fixture pack, mahremiyet hassasiyetini hem görünür hem de doğru sınırlı tutmayı ölçer.

```text
Kadınlar plajı şartı aktifse deniz önerisi güvenli şekilde doğrulama ihtiyacıyla taşınır.
Ama deniz zorunlu değilse bu şart tüm planı gereksiz yere kilitlemez.
```

## Current status

```yaml
fixture_pack_state: drafted
next_artifact: 07-route-logistics-fixture-pack.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
