# 04 — Constraint Violation Fixture Pack

**Doküman türü:** constraint violation fixture design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nun hard constraint, soft preference, policy warning ve clarification requirement ayrımını doğru yapıp yapmadığını ölçen fixture setini tanımlar.

Bu dosya test runner değildir.

Bu dosya runtime validation, CI, script, TypeScript, Zod veya evaluator implementation içermez.

## Ana karar

```yaml
fixture_pack_id: constraint_violation_fixture_pack
fixture_pack_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/04-constraint-violation-fixture-pack.md
related_golden_scenarios:
  - GS-002
  - GS-008
  - GS-010
```

## Bu fixture pack neyi ölçer?

Constraint Violation Fixture Pack şu davranışları ölçer:

```yaml
measured_behaviors:
  - hard constraint'in soft preference tarafından ezilmemesi
  - soft preference'in hard constraint gibi davranmaması
  - düşük güvenli varsayımın gerçek veya hard constraint yapılmaması
  - eksik bilginin clarification requirement olarak taşınması
  - privacy şartının görünür tutulması
  - 150 km radius kuralının istisna gerekçesi olmadan ihlal edilmemesi
  - final cevapta blocker disclosure'ın kaybolmaması
```

## İlgili agent/contract kapsamı

```yaml
covered_agents:
  - trip_intake_agent
  - constraint_policy_agent
  - destination_candidate_agent
  - activity_fit_agent
  - day_plan_composer_agent
  - verification_evidence_agent
  - final_response_composer_agent
covered_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - destination-candidate-contract.md
  - activity-fit-contract.md
  - day-plan-contract.md
  - verification-evidence-contract.md
  - final-response-contract.md
  - common-error-envelope.md
```

## Fixture required fields

Her constraint violation fixture aşağıdaki alanları taşımalıdır:

```yaml
required_fixture_fields:
  - fixture_id
  - source_golden_scenario
  - user_request
  - constraint_under_test
  - expected_constraint_classification
  - expected_blocker_or_warning
  - expected_clarification_state
  - expected_downstream_behavior
  - expected_final_response_behavior
  - forbidden_outputs
  - evaluation_notes
```

## CV-001 — Kadınlar plajı şartının gizlenmesi

```yaml
fixture_id: CV-001
source_golden_scenario: GS-002
user_request: >
  Deniz önerisi olursa kadınlar plajı mutlaka olsun. Kocaeli çevresinde 5 günlük aile planı yap.
constraint_under_test: women_only_beach_required_when_sea_recommended
expected_constraint_classification:
  hard_constraints:
    - women_only_beach_required_when_sea_recommended
  policy_warnings:
    - privacy_sensitive_beach_requirement
expected_blocker_or_warning:
  sea_activity_without_verified_women_only_beach: hard_blocker_or_verification_required
expected_clarification_state:
  clarification_required_if_no_verified_women_only_beach_candidate: true
expected_downstream_behavior:
  sea_candidates_must_carry_privacy_verification_need: true
expected_final_response_behavior:
  privacy_requirement_must_be_visible: true
forbidden_outputs:
  - sea_activity_recommended_without_women_only_beach_status
  - women_only_beach_requirement_hidden
  - privacy_requirement_treated_as_soft_preference
```

## CV-002 — Soft preference hard constraint gibi ele alınmamalı

```yaml
fixture_id: CV-002
source_golden_scenario: GS-010
user_request: >
  Çok yorucu olmasın ama mümkünse en popüler yerleri de görmek isterim.
constraint_under_test: low_fatigue_vs_popular_places
expected_constraint_classification:
  hard_constraints: []
  soft_preferences:
    - low_fatigue
    - popular_places
expected_blocker_or_warning:
  no_hard_blocker_expected: true
  conflict_warning_expected: true
expected_clarification_state:
  clarification_optional_for_priority: true
expected_downstream_behavior:
  plan_should_balance_preferences: true
expected_final_response_behavior:
  should_explain_tradeoff: true
forbidden_outputs:
  - popular_places_treated_as_hard_constraint
  - low_fatigue_treated_as_absolute_ban_without_user_text
  - candidate_eliminated_only_due_to_soft_preference
```

## CV-003 — Düşük güvenli varsayım hard constraint yapılamaz

```yaml
fixture_id: CV-003
source_golden_scenario: GS-008
user_request: >
  Aile için birkaç günlük tatil planı yapabilir misin?
constraint_under_test: missing_date_budget_origin_duration
expected_constraint_classification:
  hard_constraints: []
  missing_information:
    - origin
    - duration
    - date_window
    - budget
    - children_ages
expected_blocker_or_warning:
  clarification_required: true
expected_clarification_state:
  required_before_precise_plan: true
expected_downstream_behavior:
  must_not_invent_family_profile: true
expected_final_response_behavior:
  must_state_assumptions_or_ask_for_missing_info: true
forbidden_outputs:
  - assumed_kocaeli_origin_as_fact
  - assumed_children_ages_as_fact
  - assumed_budget_as_fact
  - hard_constraint_created_from_low_confidence_assumption
```

## CV-004 — Radius ihlali istisna gerekçesi olmadan geçemez

```yaml
fixture_id: CV-004
source_golden_scenario: GS-001
user_request: >
  Kocaeli hedefli 5 günlük aile planı yap. 150 km çevresindeki yerleri de önerebilirsin,
  uzak öneriler gerçekten çok iyi olmalı.
constraint_under_test: radius_policy_with_exception
expected_constraint_classification:
  hard_constraints:
    - default_radius_150_km
  soft_preferences:
    - exceptional_out_of_radius_allowed_if_strong_reason
expected_blocker_or_warning:
  out_of_radius_without_exception_reason: blocker
expected_clarification_state:
  no_clarification_required_if_exception_reason_present: true
expected_downstream_behavior:
  out_of_radius_candidates_must_include_exception_reason: true
expected_final_response_behavior:
  out_of_radius_reason_must_be_visible: true
forbidden_outputs:
  - out_of_radius_candidate_without_exception_reason
  - distant_candidate_presented_as_normal_radius_candidate
  - exact_distance_claim_without_evidence
```

## CV-005 — Çocuk yaşı hard aile bağlamıdır, göz ardı edilemez

```yaml
fixture_id: CV-005
source_golden_scenario: GS-007
user_request: >
  2 ve 6 yaş çocukla günübirlik uzun bir gezi yapalım, sabah çok erken çıkıp gece dönelim.
constraint_under_test: children_age_and_fatigue
expected_constraint_classification:
  hard_constraints:
    - family_with_children_age_2_and_6
  soft_preferences:
    - day_trip
    - maximize_trip_time
  policy_warnings:
    - toddler_fatigue_risk
expected_blocker_or_warning:
  fatigue_warning_required: true
  plan_rebalance_required: true
expected_clarification_state:
  clarification_optional_for_tolerance_level: true
expected_downstream_behavior:
  route_and_day_plan_must_reduce_burden: true
expected_final_response_behavior:
  must_explain_child_fatigue_risk: true
forbidden_outputs:
  - child_ages_ignored
  - all_day_high_tempo_plan_without_warning
  - toddler_rest_block_missing
```

## Common expected blockers

```yaml
expected_blockers:
  - hard_constraint_ignored
  - out_of_radius_candidate_without_exception_reason
  - privacy_requirement_unverified_for_sea_activity
  - final_response_missing_blocker_disclosure
```

## Common expected warnings

```yaml
expected_warnings:
  - soft_preference_conflict
  - low_confidence_assumption
  - missing_required_trip_information
  - toddler_fatigue_risk
  - verification_required_before_final_claim
```

## Common forbidden outputs

```yaml
common_forbidden_outputs:
  hard_constraint_ignored: forbidden
  soft_preference_treated_as_hard_constraint: forbidden
  low_confidence_assumption_treated_as_fact: forbidden
  privacy_requirement_hidden: forbidden
  blocker_missing_from_final_response: forbidden
  exact_distance_without_evidence: forbidden
  exact_price_without_evidence: forbidden
  final_response_claims_verified_status_without_evidence: forbidden
```

## Evaluation notes

Bu fixture pack, plan kalitesinden önce constraint doğruluğunu ölçer.

```text
Hard constraint uyumu, güzel öneriden önce gelir.
Soft preference puanı, hard constraint ihlalini telafi edemez.
```

## Current status

```yaml
fixture_pack_state: drafted
next_artifact: 05-evidence-gap-fixture-pack.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
