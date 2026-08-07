# 15 — Prompt Framework

**Doküman türü:** canonical prompt framework design alanı  
**Durum:** first phase completed  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime prompt engine:** kapalı

## Amaç

Bu klasör, Tatil Modu agent'larının prompt tasarımını koddan önce kanonik, katmanlı, sürümlenebilir ve test edilebilir hale getirmek için kullanılır.

Bu alan production prompt, runtime prompt router, model provider entegrasyonu, prompt registry implementation veya live agent çalıştırma alanı değildir.

Bu alanın amacı şudur:

```text
Tatil Modu agent'ları hangi prompt katmanlarıyla çalışacak, ortak kurallar nasıl taşınacak, agent rolü nasıl ayrılacak, task instruction nasıl değiştirilecek, output contract prompt'a nasıl bağlanacak ve prompt değişiklikleri regression riskine karşı nasıl yönetilecek?
```

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
prompt_engine_allowed: false
provider_prompt_integration_allowed: false
live_agent_prompt_allowed: false
source_of_truth: docs/15-prompts/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/14-tool-and-capability-design/
```

Bu klasörde TypeScript prompt builder, runtime prompt router, model call, provider SDK, eval runner veya production template engine yazılmaz.

Önce prompt framework tasarımı yapılır.

## Neden bu aşama gerekli?

Agent specification ve contract tasarımı tek başına yeterli değildir.

Agent'ların doğru davranması için promptlar şu özellikleri taşımalıdır:

```text
ortak sistem kuralları
agent rol sınırı
görev talimatı
hard constraint davranışı
evidence ve verification dili
output contract uyumu
hata ve belirsizlik davranışı
sürümleme ve değişiklik yönetimi
regression kontrolü
```

Promptlar tek parça uzun metin olarak değil, katmanlı ve değiştirilebilir design artifact olarak ele alınır.

## Kapsam

```yaml
scope:
  - prompt framework overview
  - prompt layering model
  - universal system rules
  - agent role prompt template
  - task instruction patterns
  - output contract prompting
  - evidence verification prompting
  - hard constraint and safety prompting
  - prompt versioning and change policy
  - prompt evaluation and regression policy
  - completion checklist
```

## Kapsam dışı

```yaml
out_of_scope:
  - runtime prompt builder code
  - prompt template engine implementation
  - model provider prompt integration
  - live agent execution
  - hidden chain-of-thought exposure
  - automatic prompt optimization
  - production eval runner
  - CI workflow
  - token/cost measurement implementation
```

## İlk-phase prompt framework design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Prompt Framework Overview | [`01-prompt-framework-overview.md`](01-prompt-framework-overview.md) | drafted |
| 2 | Prompt Layering Model | [`02-prompt-layering-model.md`](02-prompt-layering-model.md) | drafted |
| 3 | Universal System Rules | [`03-universal-system-rules.md`](03-universal-system-rules.md) | drafted |
| 4 | Agent Role Prompt Template | [`04-agent-role-prompt-template.md`](04-agent-role-prompt-template.md) | drafted |
| 5 | Task Instruction Patterns | [`05-task-instruction-patterns.md`](05-task-instruction-patterns.md) | drafted |
| 6 | Output Contract Prompting | [`06-output-contract-prompting.md`](06-output-contract-prompting.md) | drafted |
| 7 | Evidence and Verification Prompting | [`07-evidence-and-verification-prompting.md`](07-evidence-and-verification-prompting.md) | drafted |
| 8 | Hard Constraint and Safety Prompting | [`08-hard-constraint-and-safety-prompting.md`](08-hard-constraint-and-safety-prompting.md) | drafted |
| 9 | Prompt Versioning and Change Policy | [`09-prompt-versioning-and-change-policy.md`](09-prompt-versioning-and-change-policy.md) | drafted |
| 10 | Prompt Evaluation and Regression Policy | [`10-prompt-evaluation-and-regression-policy.md`](10-prompt-evaluation-and-regression-policy.md) | drafted |
| 11 | Prompt Framework Completion Checklist | [`11-prompt-framework-completion-checklist.md`](11-prompt-framework-completion-checklist.md) | drafted |

## Prompt tasarım ilkeleri

1. Prompt tek parça metin değil, katmanlı design artifact olmalıdır.
2. Agent rolü, task instruction ve output contract birbirinden ayrılır.
3. Prompt contract'ı değiştirmez; contract'a uymayı emreder.
4. Prompt, doğrulanmamış bilgiyi kesin gerçek gibi sunmaya izin vermez.
5. Hard constraint ihlali skor veya güzel anlatımla telafi edilemez.
6. Final Response Composer prompt'u live tool çağırmaz.
7. Prompt içinde provider adı, adapter detayı veya runtime secret bulunmaz.
8. Promptlar hidden reasoning istemez ve kullanıcıya açıklanmayacak iç düşünce üretimi talep etmez.
9. Prompt değişikliği regression riski olarak değerlendirilir.
10. Prompt sürümü değiştiğinde etkilediği agent, contract ve fixture görünür olmalıdır.

## Prompt katman yaklaşımı

```yaml
prompt_layers:
  universal_system_rules:
    purpose: "tüm agent'lar için ortak değişmeyen davranış kuralları"
  agent_role_prompt:
    purpose: "agent'ın görevi, sınırı ve yasakları"
  task_instruction:
    purpose: "o çağrıdaki belirli işin talimatı"
  input_context_package:
    purpose: "orchestrator tarafından verilen sınırlı context"
  output_contract_instruction:
    purpose: "hangi contract alanlarının nasıl doldurulacağı"
  quality_control_instruction:
    purpose: "yanıt öncesi kontrol ve failure davranışı"
```

## Current status

```yaml
prompt_framework_design_state: first_phase_completed
prompt_framework_first_phase_completed: true
completed_artifacts:
  - 01-prompt-framework-overview.md
  - 02-prompt-layering-model.md
  - 03-universal-system-rules.md
  - 04-agent-role-prompt-template.md
  - 05-task-instruction-patterns.md
  - 06-output-contract-prompting.md
  - 07-evidence-and-verification-prompting.md
  - 08-hard-constraint-and-safety-prompting.md
  - 09-prompt-versioning-and-change-policy.md
  - 10-prompt-evaluation-and-regression-policy.md
  - 11-prompt-framework-completion-checklist.md
next_stage: docs/16-workflows/
implementation_allowed: false
prototype_allowed: false
prompt_engine_allowed: false
provider_prompt_integration_allowed: false
live_agent_prompt_allowed: false
```
