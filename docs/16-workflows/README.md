# 16 — Workflow Design

**Doküman türü:** canonical workflow design alanı  
**Durum:** aktif tasarım artifact alanı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime orchestration:** kapalı

## Amaç

Bu klasör, Tatil Modu için agent sıralaması, orchestrator karar noktaları, handoff akışı, retry/fallback davranışı ve final cevap üretim yolunu koddan önce kanonik şekilde tasarlamak için kullanılır.

Bu alan runtime workflow engine, job runner, queue, cron, async worker, production orchestration veya agent execution implementation değildir.

## Ana karar

```yaml
workflow_design_state: active
implementation_allowed: false
prototype_allowed: false
runtime_orchestration_allowed: false
job_runner_allowed: false
queue_allowed: false
live_agent_execution_allowed: false
source_of_truth: docs/16-workflows/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/14-tool-and-capability-design/
  - docs/15-prompts/
```

## Neden bu aşama gerekli?

Agent, contract, fixture, tool/capability ve prompt tasarımları tamamlandıktan sonra bu parçaların hangi sırayla ve hangi karar kapılarından geçerek çalışacağı tanımlanmalıdır.

Tatil Modu için workflow tasarımı şu sorulara cevap verir:

```text
Kullanıcı isteği hangi sırayla normalize edilir?
Hard constraint gate ne zaman çalışır?
Hangi agent çıktısı hangi agent'a input olur?
Verification ne zaman yapılır?
Eksik veya doğrulanmamış bilgi planı durdurur mu, uyarıya mı dönüşür?
Final response hangi verilerle yazılır?
Retry ve fallback nerede devreye girer?
```

## Kapsam

```yaml
scope:
  - e2e workflow blueprint
  - orchestrator decision gates
  - agent handoff sequence
  - parallel_vs_sequential_workflow_rules
  - verification_and_evidence_workflow
  - day_plan_composition_workflow
  - final_response_workflow
  - error_retry_and_fallback_workflow
  - privacy_sensitive_workflow
  - workflow_observability_and_audit_design
```

## Kapsam dışı

```yaml
out_of_scope:
  - workflow engine implementation
  - background jobs
  - queue configuration
  - production orchestration
  - live agent execution
  - provider calls
  - real retries
  - runtime monitoring
  - CI workflow
  - notification automation
```

## First-phase workflow design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Workflow Design Overview | `01-workflow-design-overview.md` | next |
| 2 | End-to-End Travel Planning Workflow | `02-end-to-end-travel-planning-workflow.md` | planned |
| 3 | Trip Intake and Constraint Gate Workflow | `03-trip-intake-constraint-gate-workflow.md` | planned |
| 4 | Candidate Research and Verification Workflow | `04-candidate-research-verification-workflow.md` | planned |
| 5 | Family Suitability and Logistics Workflow | `05-family-suitability-logistics-workflow.md` | planned |
| 6 | Day Plan Composition Workflow | `06-day-plan-composition-workflow.md` | planned |
| 7 | Final Response Assembly Workflow | `07-final-response-assembly-workflow.md` | planned |
| 8 | Error Retry and Fallback Workflow | `08-error-retry-fallback-workflow.md` | planned |
| 9 | Privacy Sensitive Travel Workflow | `09-privacy-sensitive-travel-workflow.md` | planned |
| 10 | Workflow Observability and Audit Design | `10-workflow-observability-audit-design.md` | planned |
| 11 | Workflow Completion Checklist | `11-workflow-completion-checklist.md` | planned |

## Workflow tasarım ilkeleri

1. Orchestrator agent değildir; workflow karar kapılarını ve handoff sırasını yönetir.
2. Expert agent'lar birbirini doğrudan çağırmaz.
3. Hard constraint gate ranking ve plan composition'dan önce çalışır.
4. Verification sonucu olmayan değişken bilgi final cevapta kesin gerçek gibi sunulmaz.
5. Final Response Composer live tool çağırmaz ve yeni bilgi icat etmez.
6. Retry, yalnızca contract-valid fakat kalite/eksik bilgi problemi olan durumda tasarlanır; sonsuz loop yoktur.
7. Privacy-sensitive gereksinimler workflow içinde görünür gate olarak taşınır.
8. Workflow output'ları contract ve evidence envelope ile uyumlu olmalıdır.
9. Workflow başarısızlığı kullanıcıya anlaşılır evidence gap veya fallback olarak döner.
10. Bu klasör tasarım alanıdır; runtime orchestration değildir.

## Current status

```yaml
workflow_design_state: active
completed_artifacts: []
next_artifact: 01-workflow-design-overview.md
implementation_allowed: false
prototype_allowed: false
runtime_orchestration_allowed: false
job_runner_allowed: false
live_agent_execution_allowed: false
```
