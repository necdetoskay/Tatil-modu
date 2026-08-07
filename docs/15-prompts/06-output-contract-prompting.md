# 06 — Output Contract Prompting

**Doküman türü:** output contract prompting design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, promptların agent çıktısını canonical contract dosyalarıyla uyumlu üretmesini nasıl zorunlu kılacağını tanımlar.

Bu dosya schema implementation veya validator değildir.

## Ana karar

```yaml
artifact_id: output_contract_prompting
artifact_state: drafted
implementation_allowed: false
schema_code_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/06-output-contract-prompting.md
```

## Temel ilke

```text
Prompt contract'ı yeniden tanımlamaz.
Prompt, agent'ın ilgili contract'a uymasını emreder.
```

Contract alanları `docs/12-contracts/` altında kanonik kaynaktır.

## Output contract instruction pattern

```text
Produce output compatible with [CONTRACT_NAME].

Populate only fields that belong to this contract.

For any required field that cannot be populated, emit the contract-defined missing, warning, blocker, or evidence gap representation.

Do not replace structured output requirements with free-form explanation.
```

## Contract compliance kuralları

```yaml
contract_prompting_rules:
  only_contract_fields: true
  required_missing_fields_visible: true
  evidence_fields_preserved: true
  warnings_and_blockers_preserved: true
  no_freeform_substitution: true
  no_schema_redefinition_in_prompt: true
```

## Agent-contract örnekleri

```yaml
agent_contract_mapping:
  trip_intake_agent:
    output_contract: travel-request-contract.md
  constraint_policy_agent:
    output_contract: constraint-policy-contract.md
  route_logistics_agent:
    output_contract: route-logistics-contract.md
  verification_evidence_agent:
    output_contract: verification-evidence-contract.md
  final_response_composer_agent:
    output_contract: final-response-contract.md
```

## Field-level prompt davranışı

```yaml
field_behavior:
  value_known:
    action: "populate field with evidence-aware value"
  value_missing:
    action: "populate missing_information or clarification requirement"
  value_unverified:
    action: "populate evidence_gap or warning"
  value_blocks_plan:
    action: "populate hard_blocker"
  value_outside_agent_scope:
    action: "do not infer; ask orchestrator via contract-safe output"
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - freeform_answer_instead_of_contract
  - invented_contract_field
  - missing_required_field_without_disclosure
  - hard_blocker_removed_for_readability
  - evidence_gap_hidden
  - final_response_claim_created_outside_contract_data
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 07-evidence-and-verification-prompting.md
implementation_allowed: false
schema_code_allowed: false
runtime_prompt_engine_allowed: false
```
