# 01 — Prompt Framework Overview

**Doküman türü:** prompt framework overview  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Runtime prompt engine:** kapalı

## Purpose

Bu dosya, Tatil Modu prompt framework'ünün genel tasarımını tanımlar.

Prompt framework, agent'ların nasıl konuşacağını değil; hangi kurallarla, hangi katmanlarla, hangi sınırlar içinde ve hangi contract'a uygun yanıt üreteceğini tanımlar.

Bu dosya production prompt değildir.

Bu dosya model çağrısı, template engine, prompt registry implementation veya runtime routing içermez.

## Ana karar

```yaml
artifact_id: prompt_framework_overview
artifact_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/01-prompt-framework-overview.md
```

## Prompt framework neyi çözer?

```yaml
problems_addressed:
  - agent_prompt_duplication
  - inconsistent_hard_constraint_behavior
  - unverified_claims_becoming_final_facts
  - output_contract_drift
  - role_boundary_confusion
  - prompt_change_regression
  - hidden_provider_dependency_in_prompt
  - overlong_unstructured_prompts
```

## Temel model

Prompt framework şu ayrımı korur:

```text
Ortak kurallar != agent rolü != task instruction != output contract != quality control
```

Bu ayrım sayesinde aynı agent rolü farklı task instruction ile çalışabilir; aynı universal rule set ise tüm agent'lara tekrar yazılmadan uygulanabilir.

## Prompt framework bileşenleri

```yaml
prompt_framework_components:
  universal_system_rules:
    responsibility: "tüm agent'lar için ortak davranış kuralları"
  agent_role_prompt:
    responsibility: "agent'ın sorumluluğu, yetkisi ve yasakları"
  task_instruction_pattern:
    responsibility: "o çağrıdaki görevin nasıl yürütüleceği"
  input_context_policy:
    responsibility: "agent'ın hangi veriyi görebileceği"
  output_contract_prompting:
    responsibility: "çıktının contract ile uyumlu üretilmesi"
  evidence_instruction:
    responsibility: "doğrulama, kaynak, confidence ve disclosure dili"
  quality_control_instruction:
    responsibility: "yanıt öncesi kontrol ve failure davranışı"
```

## Prompt tasarım sınırı

Prompt tasarımı agent davranışını tarif eder; runtime çalışma biçimini uygulamaz.

```yaml
prompt_design_can_define:
  - required_behavior
  - forbidden_behavior
  - expected_output_shape
  - evidence_disclosure_language
  - uncertainty_handling
  - hard_constraint_priority
  - role_boundary
prompt_design_cannot_define_as_code:
  - model_call_execution
  - tool_invocation
  - prompt_template_compilation
  - provider_selection
  - token_budget_enforcement_runtime
  - automatic_eval_runner
```

## İlişkili alanlar

```yaml
related_design_areas:
  agent_specifications: docs/11-agent-specifications/
  contracts: docs/12-contracts/
  fixtures_and_evaluation: docs/13-fixtures-and-evaluation/
  tool_capability_design: docs/14-tool-and-capability-design/
```

## Prompt değişikliği neden risklidir?

Prompt değişikliği, kod değişikliği gibi davranış değişikliği doğurabilir.

```yaml
prompt_change_risks:
  - hard_constraint_ignored
  - evidence_gap_hidden
  - final_response_overconfident
  - agent_does_other_agent_work
  - contract_field_missing
  - hallucinated_tool_result
  - user_request_overinterpreted
```

Bu nedenle promptlar sürümlenir, fixture ile değerlendirilir ve regression riski olarak ele alınır.

## Current status

```yaml
artifact_state: drafted
next_artifact: 02-prompt-layering-model.md
implementation_allowed: false
prototype_allowed: false
runtime_prompt_engine_allowed: false
```
