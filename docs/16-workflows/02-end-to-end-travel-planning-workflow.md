# 02 — End-to-End Travel Planning Workflow

**Doküman türü:** e2e workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, serbest kullanıcı isteğinden final aile tatili planına kadar uçtan uca tasarım akışını tanımlar.

Bu dosya runtime orchestration değildir.

## Ana karar

```yaml
workflow_id: e2e_travel_planning_workflow
workflow_state: drafted
implementation_allowed: false
prototype_allowed: false
live_agent_execution_allowed: false
source_of_truth: docs/16-workflows/02-end-to-end-travel-planning-workflow.md
```

## High-level flow

```text
1. User request intake
2. Trip Intake normalization
3. Constraint Policy classification
4. Hard constraint gate
5. Candidate destination/activity/accommodation/logistics reasoning
6. Verification and evidence gap mapping
7. Family suitability and route burden review
8. Day plan composition
9. Final response assembly
10. Final disclosure and quality gate
```

## Participating agents

```yaml
participating_agents:
  - trip_intake_agent
  - constraint_policy_agent
  - destination_candidate_agent
  - route_logistics_agent
  - accommodation_fit_agent
  - activity_fit_agent
  - family_suitability_agent
  - verification_evidence_agent
  - day_plan_composer_agent
  - final_response_composer_agent
```

## Gate sequence

```yaml
gates:
  - contract_validation_gate
  - missing_information_gate
  - hard_constraint_gate
  - evidence_requirement_gate
  - family_suitability_gate
  - day_plan_coherence_gate
  - final_response_quality_gate
```

## Workflow rule

Hard constraint gate, candidate ranking ve final plan üretiminden önce çalışır.

```text
Güzel öneri, hard constraint ihlalini telafi edemez.
```

## Fallback behavior

```yaml
fallback_behavior:
  missing_required_data: ask_or_use_visible_assumption
  unverifiable_variable_claim: evidence_gap_or_warning
  hard_constraint_violation: block_or_replace_candidate
  excessive_family_fatigue: lower_intensity_plan_or_warning
  final_response_uncertainty: disclose_clearly
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - final_plan_with_hidden_hard_constraint_violation
  - exact_price_without_evidence
  - exact_drive_time_without_evidence
  - women_only_beach_claim_without_verification
  - final_response_with_invented_source
  - direct_agent_to_agent_call_assumption
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 03-trip-intake-constraint-gate-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
