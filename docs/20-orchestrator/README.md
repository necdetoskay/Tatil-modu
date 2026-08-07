# 20 — Orchestrator Design

**Doküman türü:** canonical orchestrator, coordination ve handoff-routing design alanı  
**Durum:** first phase tamamlandı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime orchestration:** kapalı

## Amaç

Bu klasör, Tatil Modu Orchestrator'ının workflow yürütme, state koordinasyonu, gate uygulama, handoff routing, parallelism, retry/fallback, quality feedback, finalization ve audit davranışlarını koddan önce kanonik şekilde tasarlamak için kullanılır.

Bu alan runtime orchestrator engine, scheduler, queue, job runner, live agent execution, production workflow runtime veya provider integration değildir.

## Ana karar

```yaml
orchestrator_design_state: first_phase_completed
orchestrator_first_phase_completed: true
orchestrator_is_agent: false
implementation_allowed: false
prototype_allowed: false
runtime_orchestration_allowed: false
live_agent_execution_allowed: false
queue_allowed: false
job_runner_allowed: false
source_of_truth: docs/20-orchestrator/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/14-tool-and-capability-design/
  - docs/15-prompts/
  - docs/16-workflows/
  - docs/17-decision-policy-engine/
  - docs/18-memory-architecture/
  - docs/19-quality-engine/
```

## Neden bu aşama gerekli?

Agent, contract, workflow, policy, memory ve quality tasarımları tamamlandıktan sonra bunların hangi control-plane kurallarıyla birlikte çalışacağı netleştirilmelidir.

Orchestrator tasarımı şu sorulara cevap verir:

```text
Orchestrator tam olarak neyin sahibi, neyin sahibi değil?
Workflow state nasıl taşınır?
Expert agent'lar arasında handoff nasıl route edilir?
Gate sonuçlarını kim üretir, kim uygular?
Hangi işler paralel, hangileri sıralı yürütülebilir?
Retry ne zaman yapılır, ne zaman fallback gerekir?
Quality feedback hangi owner/stage'e geri döner?
Workflow ne zaman tamamlanır, ne zaman degraded veya blocked olur?
Kritik routing kararları nasıl açıklanabilir ve audit edilebilir?
```

## Kapsam

```yaml
scope:
  - orchestrator_boundary_and_responsibilities
  - orchestration_state_model
  - routing_and_handoff_model
  - gate_coordination
  - parallelism_and_dependency_policy
  - retry_recovery_and_fallback_policy
  - quality_feedback_loop
  - finalization_and_stop_conditions
  - audit_and_explainability
```

## Kapsam dışı

```yaml
out_of_scope:
  - runtime_orchestrator_engine
  - scheduler_implementation
  - queue_configuration
  - background_job_runtime
  - live_agent_execution
  - provider_calls
  - production_retry_runtime
  - database_schema
  - production_observability
  - deployment_topology
```

## First-phase orchestrator design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Orchestrator Boundary & Responsibilities | [`01-orchestrator-boundary-responsibilities.md`](01-orchestrator-boundary-responsibilities.md) | drafted |
| 2 | Orchestrator State Model | [`02-orchestrator-state-model.md`](02-orchestrator-state-model.md) | drafted |
| 3 | Routing & Handoff Model | [`03-routing-handoff-model.md`](03-routing-handoff-model.md) | drafted |
| 4 | Gate Coordination Model | [`04-gate-coordination-model.md`](04-gate-coordination-model.md) | drafted |
| 5 | Parallelism & Dependency Policy | [`05-parallelism-dependency-policy.md`](05-parallelism-dependency-policy.md) | drafted |
| 6 | Retry, Recovery & Fallback Policy | [`06-retry-recovery-fallback-policy.md`](06-retry-recovery-fallback-policy.md) | drafted |
| 7 | Quality Feedback Loop | [`07-quality-feedback-loop.md`](07-quality-feedback-loop.md) | drafted |
| 8 | Finalization & Stop Conditions | [`08-finalization-stop-conditions.md`](08-finalization-stop-conditions.md) | drafted |
| 9 | Orchestrator Audit & Explainability | [`09-orchestrator-audit-explainability.md`](09-orchestrator-audit-explainability.md) | drafted |
| 10 | Orchestrator Completion Checklist | [`10-orchestrator-completion-checklist.md`](10-orchestrator-completion-checklist.md) | drafted |

## Orchestrator tasarım ilkeleri

1. Orchestrator agent değildir; control-plane koordinasyon bileşenidir.
2. Expert agent'lar birbirini doğrudan çağırmaz.
3. Orchestrator domain bilgisi, evidence, policy sonucu veya quality score üretmez.
4. Contract-invalid output downstream'e verilmez.
5. Hard constraint ve privacy-sensitive blocker'lar soft skorlarla override edilemez.
6. Parallelism yalnız dependency-safe kollarda kullanılabilir.
7. Retry bounded ve failure-aware olmalıdır; sonsuz loop yoktur.
8. Fallback hard requirement gevşetmez ve degradation'ı gizlemez.
9. Quality blocker finalization'ı durdurur.
10. Her kritik route/gate/finalization kararı açıklanabilir ve audit edilebilir olmalıdır.
11. Final Composer yalnız gate'ten geçmiş canonical artifact'ları tüketir.
12. Bu klasör tasarım alanıdır; runtime orchestration değildir.

## Current status

```yaml
orchestrator_design_state: first_phase_completed
orchestrator_first_phase_completed: true
completed_artifacts:
  - 01-orchestrator-boundary-responsibilities.md
  - 02-orchestrator-state-model.md
  - 03-routing-handoff-model.md
  - 04-gate-coordination-model.md
  - 05-parallelism-dependency-policy.md
  - 06-retry-recovery-fallback-policy.md
  - 07-quality-feedback-loop.md
  - 08-finalization-stop-conditions.md
  - 09-orchestrator-audit-explainability.md
  - 10-orchestrator-completion-checklist.md
next_stage: observability_upper_layer
implementation_allowed: false
prototype_allowed: false
runtime_orchestration_allowed: false
live_agent_execution_allowed: false
queue_allowed: false
job_runner_allowed: false
```
