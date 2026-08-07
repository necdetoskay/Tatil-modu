# 20 — Orchestrator Design

**Doküman türü:** canonical orchestrator, coordination ve handoff-routing design alanı  
**Durum:** first phase tamamlandı  
**Kodlama / prototype / runtime orchestration:** kapalı

## Amaç

Bu klasör Tatil Modu Orchestrator'ının agent olmadan, yeni domain bilgisi üretmeden ve uzman sorumluluklarını üstlenmeden; workflow yürütme, state koordinasyonu, gate uygulama, handoff routing, retry/fallback, quality feedback ve finalization kararlarını nasıl yöneteceğini tanımlar.

## Kanonik sınır

```yaml
orchestrator_design_state: first_phase_completed
orchestrator_is_agent: false
implementation_allowed: false
prototype_allowed: false
runtime_orchestration_allowed: false
live_agent_execution_allowed: false
source_of_truth: docs/20-orchestrator/
inputs:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/16-workflows/
  - docs/17-decision-policy-engine/
  - docs/18-memory-architecture/
  - docs/19-quality-engine/
```

Orchestrator **koordine eder; uzmanlık üretmez**. Expert agent'lar birbirini doğrudan çağırmaz. Orchestrator policy sonucunu değiştirmez, evidence uydurmaz, quality blocker'ı puanla telafi etmez ve final composer yerine içerik üretmez.

## First-phase artifact seti

| # | Artifact | Dosya |
|---:|---|---|
| 1 | Boundary & Responsibilities | `01-orchestrator-boundary-responsibilities.md` |
| 2 | State Model | `02-orchestrator-state-model.md` |
| 3 | Routing & Handoff | `03-routing-handoff-model.md` |
| 4 | Gate Coordination | `04-gate-coordination-model.md` |
| 5 | Parallelism & Dependency | `05-parallelism-dependency-policy.md` |
| 6 | Retry, Recovery & Fallback | `06-retry-recovery-fallback-policy.md` |
| 7 | Quality Feedback Loop | `07-quality-feedback-loop.md` |
| 8 | Finalization & Stop Conditions | `08-finalization-stop-conditions.md` |
| 9 | Audit & Explainability | `09-orchestrator-audit-explainability.md` |
| 10 | Completion Checklist | `10-orchestrator-completion-checklist.md` |

## Değişmez ilkeler

1. Hard constraint ihlali sonraki ranking/composition aşamasına taşınmaz.
2. Contract-invalid çıktı downstream'e verilmez.
3. Verification/evidence durumu state içinde kaybolmaz.
4. Privacy-sensitive gereksinimler açık routing/gate sinyalidir.
5. Retry sınırlıdır; aynı hatayı sonsuz tekrar etmez.
6. Parallel çalışma yalnız veri bağımsızlığında mümkündür.
7. Quality blocker finalization'ı durdurur.
8. Degraded/fallback sonuç kullanıcıya gizlenmez.
9. Her kritik kararın nedeni audit trace'e yazılabilir olmalıdır.
10. Bu tasarım runtime engine değildir.

## Current status

```yaml
orchestrator_design_state: first_phase_completed
orchestrator_first_phase_completed: true
next_stage: observability_upper_layer
implementation_allowed: false
prototype_allowed: false
runtime_orchestration_allowed: false
```
