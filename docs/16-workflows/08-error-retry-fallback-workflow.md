# 08 — Error Retry and Fallback Workflow

**Doküman türü:** error/retry/fallback workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya workflow sırasında oluşabilecek eksik bilgi, contract uyumsuzluğu, evidence gap, capability failure ve kalite düşüşlerinin nasıl ele alınacağını tanımlar.

## Ana karar

```yaml
workflow_id: error_retry_fallback_workflow
workflow_state: drafted
implementation_allowed: false
runtime_retry_allowed: false
source_of_truth: docs/16-workflows/08-error-retry-fallback-workflow.md
```

## Error classes

```yaml
error_classes:
  contract_invalid: blocking
  hard_constraint_violation: blocking
  evidence_missing: warning_or_blocking
  capability_failure: fallback_or_gap
  family_suitability_failure: fallback_or_blocking
  final_response_quality_failure: revise_within_same_data
```

## Retry design rules

```yaml
retry_rules:
  max_retry_policy: design_only_no_runtime_value
  retry_allowed_when: contract_valid_but_quality_or_gap_can_be_improved
  retry_forbidden_when: hard_constraint_is_unmet_without_alternative
  retry_must_not: invent_information
  retry_output: updated_contract_or_error_envelope
```

## Fallback behavior

```yaml
fallback_behavior:
  missing_price: present_budget_uncertainty
  missing_opening_hours: avoid_exact_schedule_or_warn
  missing_weather: include_weather_sensitive_fallback
  missing_parking: add_access_warning
  missing_privacy_verification: avoid_confirmed_beach_claim
  overly_tiring_plan: lower_intensity_alternative
```

## User-visible behavior

Hard blocker kullanıcıdan saklanmaz.

```text
Sistem sessizce uydurmak yerine evidence gap, warning veya fallback üretir.
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - silent_retry_that_changes_user_constraints
  - retry_that_invents_evidence
  - fallback_that_violates_hard_constraint
  - hiding_capability_failure
  - infinite_retry_loop_assumption
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 09-privacy-sensitive-travel-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
