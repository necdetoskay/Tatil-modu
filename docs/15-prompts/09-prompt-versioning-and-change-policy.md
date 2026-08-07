# 09 — Prompt Versioning and Change Policy

**Doküman türü:** prompt versioning and change policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu prompt tasarımlarının nasıl sürümleneceğini, değişikliklerin nasıl sınıflandırılacağını ve hangi değişikliklerin regression riski sayılacağını tanımlar.

Bu dosya prompt registry implementation değildir.

## Ana karar

```yaml
artifact_id: prompt_versioning_and_change_policy
artifact_state: drafted
implementation_allowed: false
prompt_registry_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/09-prompt-versioning-and-change-policy.md
```

## Versioning format

```yaml
prompt_version_format:
  pattern: "<agent-or-layer>-prompt-v<major>.<minor>.<patch>"
  examples:
    - universal-system-rules-prompt-v1.0.0
    - trip-intake-agent-role-prompt-v1.0.0
    - final-response-composer-task-pattern-v1.1.0
```

## Version increment policy

```yaml
version_increment_policy:
  major:
    when:
      - role_boundary_changes
      - output_contract_expectation_changes
      - hard_constraint_behavior_changes
      - evidence_behavior_changes
  minor:
    when:
      - wording_improves_without_boundary_change
      - new_warning_or_quality_control_instruction_added
      - task_pattern_extended
  patch:
    when:
      - typo_fix
      - clarity_improvement
      - formatting_update
```

## Change classification

```yaml
prompt_change_types:
  behavioral_change:
    regression_review_required: true
  contract_alignment_change:
    regression_review_required: true
  wording_only_change:
    regression_review_required: conditional
  formatting_change:
    regression_review_required: false
  safety_or_hard_constraint_change:
    regression_review_required: true
    requires_architecture_review: true
```

## Change record fields

```yaml
prompt_change_record_fields:
  - prompt_layer
  - affected_agent
  - old_version
  - new_version
  - change_type
  - affected_contracts
  - affected_fixtures
  - expected_behavior_change
  - regression_risk
  - approval_status
```

## Forbidden change behavior

```yaml
forbidden_change_behavior:
  - silent_prompt_behavior_change
  - prompt_update_without_version_change
  - hard_constraint_change_without_fixture_review
  - evidence_rule_change_without_regression_review
  - contract_output_change_without_contract_reference
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 10-prompt-evaluation-and-regression-policy.md
implementation_allowed: false
prompt_registry_allowed: false
runtime_prompt_engine_allowed: false
```
