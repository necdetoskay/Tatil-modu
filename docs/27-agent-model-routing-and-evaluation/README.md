# 27 — Agent Model Routing & Evaluation

**Doküman türü:** canonical model selection, routing ve benchmark design alanı  
**Durum:** first phase in progress  
**UI:** locked  
**Live model/provider selection:** evaluation gate'e bağlı

## Amaç
Her agent için hangi model özelliklerinin gerektiğini, hangi model tier'ının kullanılacağını, tool/capability ve memory erişiminin nasıl sınırlandırılacağını, fallback/routing politikasını ve gerçek model seçiminin hangi benchmark sonuçlarıyla yapılacağını kanonik olarak tanımlar.

Bu klasör tek bir sağlayıcıya veya tek bir modele bağlanmaz. Model isimleri ancak evaluation candidate olarak ele alınır; production seçimi test sonucuyla yapılır.

## Ana ilkeler
1. Agent görevi modelden bağımsız tanımlıdır.
2. Model seçimi agent bazında yapılır; tek model tüm sisteme zorunlu değildir.
3. Policy ve kritik deterministic validation LLM'e bırakılmaz.
4. Tool access modelin değil agent/capability policy'nin yetkisidir.
5. Daha pahalı model yalnız ölçülebilir kalite artışı sağlıyorsa kullanılır.
6. P0 failure üreten model production candidate olamaz.
7. Fallback modeli hard constraint'i gevşetemez.
8. Gerçek model benchmark'ı deterministic L0–L7 testlerinin yerine geçmez.

## Model tier'ları
```yaml
T0_no_llm:
  purpose: deterministic logic, validation, policy, routing primitives
T1_fast_small:
  purpose: extraction, classification, normalization, low-risk structured tasks
T2_balanced:
  purpose: comparison, suitability analysis, moderate reasoning
T3_strong_reasoning:
  purpose: complex planning, reconciliation, difficult multi-constraint reasoning
T4_fallback_judge:
  purpose: exceptional difficult cases, review/judge/fallback only
```

## First-phase artifact seti
| # | Artifact | Dosya |
|---:|---|---|
| 1 | Model Routing Principles | `01-model-routing-principles.md` |
| 2 | Agent Model Requirement Matrix | `02-agent-model-requirement-matrix.md` |
| 3 | Agent × Capability × Memory Matrix | `03-agent-capability-memory-matrix.md` |
| 4 | Model Tier and Eligibility Policy | `04-model-tier-eligibility-policy.md` |
| 5 | Primary/Fallback Routing Policy | `05-primary-fallback-routing-policy.md` |
| 6 | Context, Token and Output Budget Policy | `06-context-token-output-budget-policy.md` |
| 7 | Latency and Cost Budget Policy | `07-latency-cost-budget-policy.md` |
| 8 | Structured Output and Tool-Use Requirements | `08-structured-output-tool-use-requirements.md` |
| 9 | Agent Benchmark Suite Design | `09-agent-benchmark-suite-design.md` |
| 10 | Repeated Run and Statistical Evaluation Protocol | `10-repeated-run-statistical-protocol.md` |
| 11 | Model Scoring and Selection Formula | `11-model-scoring-selection-formula.md` |
| 12 | Promotion, Demotion and Rollback Policy | `12-model-promotion-demotion-rollback.md` |
| 13 | Candidate Model Evaluation Record | `13-candidate-model-evaluation-record.md` |
| 14 | Agent Routing Completion Checklist | `14-agent-routing-completion-checklist.md` |

## Current state
```yaml
agent_model_routing_design: in_progress
production_model_assignments: undecided
model_candidates_allowed_for_benchmark: true
production_selection_requires_L8_evidence: true
ui_development_allowed: false
```
