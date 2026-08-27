# 15 — Harness & Orchestration

**Doküman türü:** canonical pre-implementation harness/orchestration design area  
**Durum:** active design  
**Kodlama durumu:** kapalı

## Amaç

Bu alan Tatil Modu agent sisteminin modelden bağımsız çalıştırma, context lifecycle, provenance, evaluation attribution, plugin/adaptor sınırları ve orchestration harness sözleşmelerini tanımlar.

Bu alan DeepSeek Harness runtime bağımlılığı anlamına gelmez. Radar tarafından çıkarılan yeniden kullanılabilir harness pattern'leri Tatil Modu'nun kendi contract ve ACP yapısına adapte edilir.

## Kanonik dosyalar

1. [`01-radar-deepseek-harness-adoption-review.md`](01-radar-deepseek-harness-adoption-review.md) — Radar + DeepSeek Harness adoption kararları.
2. [`02-agent-contract-harness-baseline.md`](02-agent-contract-harness-baseline.md) — M1 Agent Contract Harness kanonik baseline'ı.

## İlgili source-of-truth belgeleri

- Agent seti: `docs/11-agent-specifications/canonical-agent-contract-catalog.md`
- Agent Communication Protocol: `docs/08-architecture-baseline/18-agent-communication-protocol.md`
- Testing: `docs/03-testing/agent-testing-evaluation-standard.md`
- Fixtures/evaluation: `docs/13-fixtures-and-evaluation/`
- Tool/capability: `docs/14-tool-and-capability-design/`
- Evidence mapping: `docs/14-tool-and-capability-design/05-evidence-emission-mapping.md`

## Ana karar

```yaml
harness_owner: tatil_modu
external_harness_runtime_dependency: false
deepseek_harness_mode: PATTERN_AND_INSPIRE
model_provider_independent: true
agent_runtime_independent: true
implementation_allowed: false
```
