# Agent Runtime Profile Contract

## Amaç
Agent specification, model routing, capability authorization, memory scope, prompt version ve benchmark eligibility kararlarını runtime'da tek versioned profile üzerinden birleştirmek.

Bu profile agent'ın iş mantığını yeniden tanımlamaz; canonical belgelerdeki kararların executable configuration karşılığıdır.

## Canonical shape
```yaml
agent_runtime_profile:
  profile_version: v1
  agent_id: required
  agent_spec_version: required
  input_contract: required
  output_contract: required
  prompt_profile:
    prompt_version: required
    task_template_version: required
  model_policy:
    default_tier: T0|T1|T2|T3|T4
    escalation_tier: optional
    production_model_profile_id: null_until_promoted
    fallback_policy_id: required
  capability_policy:
    allowed_capabilities: []
    forbidden_capabilities: []
  memory_policy:
    access_mode: none|disclosure_only|scoped_read|write_candidate
    allowed_categories: []
    canonical_write: false
  budgets:
    context_budget_profile: required
    latency_budget_profile: required
    cost_budget_profile: required
  evaluation:
    benchmark_suite_id: required
    minimum_gate: required
    p0_failures_allowed: 0
```

## Güvenlik invariants
1. Model tier değişimi capability yetkisini değiştiremez.
2. Model promotion memory scope'u değiştiremez.
3. Prompt update contract version bypass edemez.
4. `production_model_profile_id` benchmark promotion olmadan doldurulamaz.
5. Runtime profile canonical agent spec ile çelişirse startup/config validation FAIL olur.
6. Agent doğrudan provider credential veya provider adapter alamaz.

## Version identity
Bir runtime davranışının yeniden üretilebilmesi için en az:
```text
agent spec version
+ contract versions
+ prompt version
+ model profile version
+ routing policy version
+ capability policy version
+ memory policy version
+ fixture/eval version
```
kaydedilir.

## Testler
- valid profile parse
- missing required version
- unauthorized capability
- excessive memory scope
- unpromoted production model
- incompatible contract
- invalid tier escalation
- profile/spec drift

## Implementation target
Bu contract H1/H3/H4/H5 sırasında ilgili package'lara bölünerek uygulanabilir; source-of-truth bu belgedir.
