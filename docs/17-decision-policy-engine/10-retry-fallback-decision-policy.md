# 10 — Retry Fallback Decision Policy

**Doküman türü:** retry fallback decision policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, karar sürecinde retry, yeniden planlama, fallback ve clarification kararlarının nasıl üretileceğini tanımlar.

Bu belge runtime retry loop veya job runner değildir.

## Ana karar

```yaml
retry_fallback_decision_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
runtime_retry_loop_allowed: false
source_of_truth: docs/17-decision-policy-engine/10-retry-fallback-decision-policy.md
```

## Retry gerektiren durumlar

```yaml
retry_triggers:
  contract_valid_but_quality_low: retry_allowed
  hard_constraint_failed_due_to_bad_candidate: retry_with_candidate_replacement
  evidence_gap_for_noncritical_claim: no_retry_disclose
  evidence_gap_for_hard_constraint: retry_or_block
  conflicting_agent_outputs: retry_or_clarify
  missing_user_required_information: clarify_not_retry
```

## Retry sınırları

Retry sonsuz döngü değildir.

```yaml
retry_limits:
  max_design_retries: bounded
  retry_requires_new_strategy: true
  repeated_same_failure: fallback_or_clarification
  hidden_retry_loop: forbidden
```

## Fallback türleri

```yaml
fallback_types:
  safer_family_plan:
    use_when: fatigue_or_child_fit_risk
  indoor_plan:
    use_when: weather_uncertain_or_bad
  lower_cost_plan:
    use_when: budget_risk
  no_sea_plan:
    use_when: women_only_beach_unverified
  shorter_route_plan:
    use_when: route_burden_high
  clarification_response:
    use_when: missing_user_decision_blocks_planning
```

## Decision outcomes

```yaml
decision_outcomes:
  retry_with_revised_constraints:
    allowed_when: candidate_selection_failed
  retry_with_verification_needed:
    allowed_when: missing_critical_evidence_may_be_resolved
  fallback_to_safer_plan:
    allowed_when: child_or_privacy_risk
  stop_and_ask_clarification:
    allowed_when: user_input_required
  proceed_with_disclosure:
    allowed_when: noncritical_uncertainty
```

## Retry vs clarification

Sistem kullanıcıdan bilgi istemeden çözemeyeceği durumda retry yapmaz.

Örnek:

```yaml
missing_date_window:
  if_required_for_weather_or_availability: clarification
missing_budget:
  if_plan_can_use_assumption: proceed_with_assumption_disclosure
```

## Final response behavior

Fallback kullanıldıysa final response bunu saklamaz.

```yaml
must_show:
  - why_primary_plan_was_not_used
  - what_fallback_was_selected
  - unresolved_evidence_gaps
  - whether_user_clarification_would_improve_plan
```

## Forbidden behavior

```yaml
forbidden:
  - infinite_retry_loop
  - retry_without_strategy_change
  - hiding_fallback_reason
  - asking_user_for_info_already_available
  - pretending_unverified_fallback_is_verified
```
