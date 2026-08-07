# 10 — Prompt Evaluation and Regression Policy

**Doküman türü:** prompt evaluation and regression policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, prompt değişikliklerinin fixture ve golden scenario setlerine göre nasıl değerlendirileceğini tasarım seviyesinde tanımlar.

Bu dosya eval runner, CI workflow veya otomasyon değildir.

## Ana karar

```yaml
artifact_id: prompt_evaluation_and_regression_policy
artifact_state: drafted
implementation_allowed: false
eval_runner_allowed: false
ci_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/10-prompt-evaluation-and-regression-policy.md
```

## Evaluation amacı

Prompt evaluation şunu ölçer:

```text
Prompt değiştiğinde agent hâlâ doğru rol sınırında, doğru contract ile, doğru evidence davranışıyla ve hard constraint önceliğiyle çıktı üretiyor mu?
```

## Prompt regression sınıfları

```yaml
prompt_regression_classes:
  critical:
    - hard_constraint_ignored
    - evidence_gap_hidden
    - unverified_claim_as_fact
    - wrong_agent_role_execution
    - final_response_composer_calls_tools
    - privacy_sensitive_claim_overstated
  major:
    - missing_required_contract_field
    - warnings_dropped
    - output_too_freeform
    - fallback_missing
  minor:
    - less_clear_wording
    - redundant_explanation
    - inconsistent_labeling
```

## Evaluation kaynakları

```yaml
evaluation_inputs:
  - docs/13-fixtures-and-evaluation/02-golden-scenario-catalog.md
  - docs/13-fixtures-and-evaluation/03-family-travel-fixture-pack.md
  - docs/13-fixtures-and-evaluation/04-constraint-violation-fixture-pack.md
  - docs/13-fixtures-and-evaluation/05-evidence-gap-fixture-pack.md
  - docs/13-fixtures-and-evaluation/06-privacy-sensitive-beach-fixture-pack.md
  - docs/13-fixtures-and-evaluation/07-route-logistics-fixture-pack.md
  - docs/13-fixtures-and-evaluation/08-day-plan-coherence-fixture-pack.md
  - docs/13-fixtures-and-evaluation/09-final-response-quality-rubric.md
  - docs/13-fixtures-and-evaluation/10-regression-and-golden-baseline-policy.md
```

## Prompt evaluation checklist

```yaml
prompt_evaluation_checklist:
  role_boundary_preserved: required
  output_contract_preserved: required
  hard_constraint_behavior_preserved: required
  evidence_behavior_preserved: required
  uncertainty_visibility_preserved: required
  family_suitability_preserved: required
  privacy_sensitive_behavior_preserved: required
  final_response_quality_preserved: required
```

## Allowed drift

```yaml
allowed_prompt_drift:
  - clearer_wording_without_behavior_change
  - shorter_instruction_without_rule_loss
  - better_section_order_without_priority_change
  - improved_warning_language_without_hidden_blocker
```

## Forbidden drift

```yaml
forbidden_prompt_drift:
  - hard_constraint_to_soft_preference
  - evidence_requirement_removed
  - role_boundary_expanded_without_spec_update
  - contract_output_replaced_by_freeform_answer
  - privacy_sensitive_claim_made_confident
  - unverified_price_or_time_claim_becomes_fact
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 11-prompt-framework-completion-checklist.md
implementation_allowed: false
eval_runner_allowed: false
runtime_prompt_engine_allowed: false
```
