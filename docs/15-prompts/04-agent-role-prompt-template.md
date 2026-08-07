# 04 — Agent Role Prompt Template

**Doküman türü:** agent role prompt template design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, her Tatil Modu agent'ı için kullanılacak agent role prompt şablonunu tasarım seviyesinde tanımlar.

Bu dosya gerçek agent prompt dosyası değildir; agent promptlarının hangi bölümleri taşıması gerektiğini tarif eder.

## Ana karar

```yaml
artifact_id: agent_role_prompt_template
artifact_state: drafted
implementation_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/04-agent-role-prompt-template.md
```

## Template bölümleri

```yaml
agent_role_prompt_sections:
  agent_identity:
    required: true
    purpose: "agent adı ve kısa görev tanımı"
  primary_responsibility:
    required: true
    purpose: "agent'ın ana sorumluluğu"
  explicit_non_responsibilities:
    required: true
    purpose: "agent'ın yapmayacağı işler"
  allowed_inputs:
    required: true
    purpose: "hangi context ve contract inputlarını okuyabileceği"
  allowed_outputs:
    required: true
    purpose: "hangi contract/output alanlarını üretebileceği"
  capability_access_boundary:
    required: true
    purpose: "doğrudan/dolaylı/no capability access sınırı"
  evidence_behavior:
    required: true
    purpose: "doğrulanmamış bilgi ve evidence gap davranışı"
  failure_behavior:
    required: true
    purpose: "eksik bilgi, çelişki ve blocker davranışı"
```

## Canonical role template

```text
You are [AGENT_NAME].

Your responsibility is [PRIMARY_RESPONSIBILITY].

You must only operate within this responsibility.

You must not perform these tasks:
- [NON_RESPONSIBILITY_1]
- [NON_RESPONSIBILITY_2]

You may read only the input context provided by the orchestrator.

You may produce only the output fields defined by [OUTPUT_CONTRACT].

You must preserve hard constraints and evidence requirements.

If required information is missing, emit missing information, warning, blocker, or evidence gap according to the contract.

Do not invent verified facts, tool results, prices, schedules, route times, parking status, weather, availability, or privacy-sensitive claims.
```

Bu template İngilizce örnek formatla yazılmıştır; production prompt dili ve yerelleştirme ayrı tasarım kararı olabilir.

## Role boundary örnekleri

```yaml
role_boundary_examples:
  trip_intake_agent:
    must_do: "free-form isteği normalize eder"
    must_not_do: "rota, otel veya aktivite önermez"
  route_logistics_agent:
    must_do: "rota yükü, mola, trafik/otopark belirsizliği üretir"
    must_not_do: "final kullanıcı cevabı yazmaz"
  final_response_composer_agent:
    must_do: "verified/evidence-aware planı kullanıcı diline çevirir"
    must_not_do: "live tool çağırmaz veya yeni bilgi uydurmaz"
```

## Prompt template anti-patterns

```yaml
forbidden_template_patterns:
  - agent_can_do_everything
  - missing_non_responsibilities
  - output_contract_not_named
  - evidence_behavior_missing
  - tool_access_implied_by_role
  - final_response_style_in_expert_agent_prompt
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 05-task-instruction-patterns.md
implementation_allowed: false
runtime_prompt_engine_allowed: false
```
