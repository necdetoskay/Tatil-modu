# 03 — Trip Intake and Constraint Gate Workflow

**Doküman türü:** intake + constraint workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya kullanıcı isteğinin normalize edilmesi, eksik alanların görünür hale getirilmesi ve hard constraint gate'in nasıl çalışacağını tanımlar.

## Ana karar

```yaml
workflow_id: trip_intake_constraint_gate_workflow
workflow_state: drafted
implementation_allowed: false
live_agent_execution_allowed: false
source_of_truth: docs/16-workflows/03-trip-intake-constraint-gate-workflow.md
```

## Entry conditions

```yaml
entry_conditions:
  - raw_user_request_exists
  - user_intent_is_family_travel_planning_or_related
```

## Flow

```text
1. Raw user request alınır.
2. Trip Intake Agent normalized travel request üretir.
3. Missing information ve assumptions ayrılır.
4. Constraint Policy Agent hard constraints / soft preferences / warnings üretir.
5. Hard constraint gate çalışır.
6. Downstream agent'lara yalnız gate-approved constraint package gönderilir.
```

## Hard constraint examples

```yaml
hard_constraint_examples:
  - children_ages_2_and_6
  - women_only_beach_required_if_sea_recommended
  - origin_kocaeli
  - duration_days_when_explicit
  - budget_when_explicit
  - no_overly_tiring_plan_when_strongly_stated
```

## Gate behavior

```yaml
hard_constraint_gate_behavior:
  low_confidence_inference: cannot_be_hard_constraint
  explicit_requirement: must_be_preserved
  conditional_requirement: must_preserve_condition
  conflicting_requirements: produce_clarification_or_blocker
  soft_preference_conflict: hard_constraint_wins
```

## Output contracts

```yaml
output_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - common-error-envelope.md
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - treating_soft_preference_as_hard_constraint_without_user_signal
  - dropping_women_only_beach_condition
  - ignoring_children_ages
  - sending_raw_unclassified_user_text_to_all_agents
  - resolving_missing_critical_information_as_hidden_assumption
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 04-candidate-research-verification-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
