# 02 — Prompt Layering Model

**Doküman türü:** prompt layering design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu promptlarının hangi katmanlardan oluşacağını ve bu katmanların birbirine karışmadan nasıl tasarlanacağını tanımlar.

Bu dosya runtime prompt builder değildir.

## Ana karar

```yaml
artifact_id: prompt_layering_model
artifact_state: drafted
implementation_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/02-prompt-layering-model.md
```

## Katman sırası

```yaml
canonical_prompt_layers:
  1_universal_system_rules:
    mutable_by_agent: false
    purpose: "tüm agent'lar için ortak güvenlik, doğruluk ve boundary kuralları"
  2_agent_role_prompt:
    mutable_by_agent: true
    purpose: "agent'ın görevi, sorumluluk alanı ve yasakları"
  3_task_instruction:
    mutable_by_request: true
    purpose: "orchestrator tarafından o çağrı için verilen görev"
  4_input_context_package:
    mutable_by_orchestrator: true
    purpose: "agent'a verilen sınırlı ve izinli context"
  5_output_contract_instruction:
    mutable_by_contract_version: true
    purpose: "çıktı contract alanlarına uyum"
  6_quality_control_instruction:
    mutable_by_policy_version: true
    purpose: "cevap üretmeden önce kontrol ve failure davranışı"
```

## Katmanların sorumlulukları

| Katman | İçerir | İçermez |
|---|---|---|
| Universal System Rules | ortak yasaklar, evidence ilkeleri, hard constraint önceliği | agent özel görevi |
| Agent Role Prompt | agent rolü, sınırı, output ownership | başka agent görevleri |
| Task Instruction | bu çağrıdaki hedef | kalıcı politika |
| Input Context Package | orchestrator'ın verdiği veri | memory store tamamı |
| Output Contract Instruction | contract alanları ve validation beklentisi | schema code |
| Quality Control Instruction | self-check, blocker, warning, missing info davranışı | hidden chain-of-thought talebi |

## Layer collision kuralları

```yaml
collision_rules:
  universal_overrides_agent_role: true
  hard_constraint_overrides_soft_preference: true
  output_contract_overrides_freeform_text: true
  task_instruction_cannot_grant_tool_access: true
  agent_role_cannot_override_capability_access_matrix: true
  user_request_cannot_remove_evidence_requirement: true
```

## Prompt assembly tasarım ilkesi

Runtime implementation yapılmayacak olsa da tasarım seviyesinde prompt assembly şu mantığa uyar:

```text
Universal Rules
+ Agent Role
+ Task Instruction
+ Input Context
+ Output Contract Instruction
+ Quality Control
```

Bu sıra bilgi hiyerarşisini gösterir; kod değildir.

## Anti-patterns

```yaml
forbidden_prompt_patterns:
  - all_rules_in_one_huge_prompt
  - agent_role_repeats_universal_rules_inconsistently
  - task_instruction_changes_agent_boundary
  - output_format_free_text_without_contract_reference
  - prompt_requests_hidden_reasoning
  - prompt_includes_provider_key_or_secret
  - prompt_claims_live_tool_result_without_evidence
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 03-universal-system-rules.md
implementation_allowed: false
runtime_prompt_engine_allowed: false
```
