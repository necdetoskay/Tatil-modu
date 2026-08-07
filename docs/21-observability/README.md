# 21 — Observability Design

**Doküman türü:** canonical observability design alanı  
**Durum:** first phase tamamlandı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime telemetry:** kapalı

## Amaç

Bu klasör, Tatil Modu'nun agent, platform, engine, workflow ve orchestrator davranışlarının runtime implementation başlamadan önce nasıl gözlemlenebilir, ölçülebilir, izlenebilir ve açıklanabilir olacağını kanonik olarak tasarlamak için kullanılır.

Bu alan runtime logging, metrics backend, tracing backend, dashboard implementation veya live monitoring değildir.

## Ana karar

```yaml
observability_design_state: first_phase_completed
observability_first_phase_completed: true
implementation_allowed: false
prototype_allowed: false
runtime_telemetry_allowed: false
production_logging_allowed: false
production_metrics_allowed: false
production_tracing_allowed: false
alerting_runtime_allowed: false
source_of_truth: docs/21-observability/
input_sources:
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/16-workflows/
  - docs/17-decision-policy-engine/
  - docs/18-memory-architecture/
  - docs/19-quality-engine/
  - docs/20-orchestrator/
```

## Neden bu aşama gerekli?

Tatil Modu çok katmanlı bir agentic sistemdir. Sadece final cevabın doğru olup olmadığına bakmak yeterli değildir; hangi agent'ın ne yaptığı, hangi gate'in neden durdurduğu, evidence nerede kaybolduğu, retry/fallback'in neden çalıştığı ve maliyet/latency'nin hangi katmanda oluştuğu gözlemlenebilir olmalıdır.

Bu aşama şu sorulara cevap verir:

```text
Bir kullanıcı isteği uçtan uca nasıl trace edilir?
Hangi agent ne kadar sürdü ve hangi sonucu üretti?
Hangi gate neden pass/block/revise verdi?
Retry ve fallback oranları nasıl görünür olur?
Quality failure hangi aşamadan kaynaklandı?
Evidence freshness/confidence problemleri nasıl izlenir?
Token, model ve tool maliyeti hangi işleme aittir?
Privacy-sensitive veriler telemetry içinde nasıl korunur?
```

## Kapsam

```yaml
scope:
  - observability_boundary
  - telemetry_taxonomy
  - correlation_and_trace_context
  - structured_event_model
  - agent_and_stage_metrics
  - gate_policy_quality_observability
  - evidence_verification_observability
  - cost_token_latency_observability
  - retry_fallback_failure_observability
  - privacy_and_redaction_policy
  - dashboard_and_alert_design
  - audit_alignment
```

## Kapsam dışı

```yaml
out_of_scope:
  - logging_library_selection
  - opentelemetry_sdk_configuration
  - prometheus_or_grafana_setup
  - production_dashboard_creation
  - alert_rule_deployment
  - runtime_log_shipping
  - tracing_backend
  - database_schema
  - live_monitoring
  - incident_response_automation
```

## First-phase observability design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Observability Overview and Boundary | [`01-observability-overview-boundary.md`](01-observability-overview-boundary.md) | drafted |
| 2 | Telemetry Taxonomy and Event Classes | [`02-telemetry-taxonomy-event-classes.md`](02-telemetry-taxonomy-event-classes.md) | drafted |
| 3 | Correlation, Trace and Execution Context | [`03-correlation-trace-execution-context.md`](03-correlation-trace-execution-context.md) | drafted |
| 4 | Structured Event Envelope Design | [`04-structured-event-envelope-design.md`](04-structured-event-envelope-design.md) | drafted |
| 5 | Agent and Workflow Metrics Model | [`05-agent-workflow-metrics-model.md`](05-agent-workflow-metrics-model.md) | drafted |
| 6 | Gate, Policy and Quality Observability | [`06-gate-policy-quality-observability.md`](06-gate-policy-quality-observability.md) | drafted |
| 7 | Evidence and Verification Observability | [`07-evidence-verification-observability.md`](07-evidence-verification-observability.md) | drafted |
| 8 | Cost, Token and Latency Observability | [`08-cost-token-latency-observability.md`](08-cost-token-latency-observability.md) | drafted |
| 9 | Retry, Fallback and Failure Observability | [`09-retry-fallback-failure-observability.md`](09-retry-fallback-failure-observability.md) | drafted |
| 10 | Privacy, Redaction and Sensitive Telemetry Policy | [`10-privacy-redaction-sensitive-telemetry-policy.md`](10-privacy-redaction-sensitive-telemetry-policy.md) | drafted |
| 11 | Dashboard, Alert and Operational View Design | [`11-dashboard-alert-operational-view-design.md`](11-dashboard-alert-operational-view-design.md) | drafted |
| 12 | Observability Completion Checklist | [`12-observability-completion-checklist.md`](12-observability-completion-checklist.md) | drafted |

## Observability tasarım ilkeleri

1. Her E2E workflow tek correlation kimliği ile izlenebilir olmalıdır.
2. Her kritik orchestration kararı reason code ile gözlemlenebilir olmalıdır.
3. Log, metric ve trace aynı semantic context'i paylaşmalıdır.
4. Privacy-sensitive veri telemetry içine varsayılan olarak açık biçimde yazılamaz.
5. Agent başarısı yalnız latency ile ölçülmez; contract validity, evidence readiness ve quality outcome birlikte değerlendirilir.
6. Retry/fallback normal başarı metriği içinde gizlenmez.
7. Model/tool maliyeti workflow ve stage seviyesine bağlanabilir olmalıdır.
8. Evidence freshness/confidence problemleri ayrı operasyonel sinyal üretmelidir.
9. Observability, Audit Logger'ın yerine geçmez; operational insight ile audit accountability ayrılır.
10. Bu klasör tasarım alanıdır; runtime telemetry implementation değildir.

## Current status

```yaml
observability_design_state: first_phase_completed
observability_first_phase_completed: true
completed_artifacts:
  - 01-observability-overview-boundary.md
  - 02-telemetry-taxonomy-event-classes.md
  - 03-correlation-trace-execution-context.md
  - 04-structured-event-envelope-design.md
  - 05-agent-workflow-metrics-model.md
  - 06-gate-policy-quality-observability.md
  - 07-evidence-verification-observability.md
  - 08-cost-token-latency-observability.md
  - 09-retry-fallback-failure-observability.md
  - 10-privacy-redaction-sensitive-telemetry-policy.md
  - 11-dashboard-alert-operational-view-design.md
  - 12-observability-completion-checklist.md
next_stage: architecture_completion_review
implementation_allowed: false
prototype_allowed: false
runtime_telemetry_allowed: false
production_logging_allowed: false
production_metrics_allowed: false
production_tracing_allowed: false
alerting_runtime_allowed: false
```
