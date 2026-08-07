# 27 — Agent Model Routing & Evaluation

**Doküman türü:** canonical model selection, routing ve benchmark design alanı  
**Durum:** extended first phase completed  
**UI:** locked  
**Live model/provider selection:** L8 benchmark evidence'e bağlı

## Amaç
Her agent için hangi model özelliklerinin gerektiğini, hangi model tier'ının kullanılacağını, tool/capability ve memory erişiminin nasıl sınırlandırılacağını, fallback/routing politikasını ve gerçek model seçiminin hangi benchmark sonuçlarıyla yapılacağını kanonik olarak tanımlar.

## Ana ilkeler
1. Agent görevi modelden bağımsız tanımlıdır.
2. Model seçimi agent bazında yapılır.
3. Policy ve kritik validation deterministic kalır.
4. Tool access modelin değil agent/capability policy'nin yetkisidir.
5. Memory visibility model tier'ına göre genişlemez.
6. Daha pahalı model yalnız ölçülebilir kalite artışı sağlıyorsa kullanılır.
7. P0 failure üreten model production candidate olamaz.
8. Fallback hard constraint'i gevşetemez.
9. L8 benchmark L0–L7 deterministic testlerinin yerine geçmez.
10. Benchmark dataset leakage ve overfitting'e karşı versioned governance kullanır.
11. Runtime'da kullanılan model/routing kararı trace edilebilir olmalıdır.

## Model tier'ları
```yaml
T0_no_llm: deterministic logic, validation, policy
T1_fast_small: extraction, classification, normalization
T2_balanced: comparison, suitability, moderate reasoning
T3_strong_reasoning: complex planning and verification
T4_fallback_judge: exceptional fallback/judge
```

## Agent default tier özeti
| Agent | Default | Escalation |
|---|---|---|
| Trip Intake | T1 | T2 |
| Constraint & Policy | T1 + T0 enforcement | T2 |
| Family Suitability | T2 | T3 |
| Destination Candidate | T2 | T3 |
| Route & Logistics | T2 | T3 |
| Accommodation Fit | T2 | T3 |
| Activity Fit | T2 | T3 |
| Day Plan Composer | T3 | T4 |
| Verification & Evidence | T3 | T4 |
| Final Response Composer | T2 | T3 |

## Artifact seti
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
| 10 | Repeated Run and Statistical Protocol | `10-repeated-run-statistical-protocol.md` |
| 11 | Model Scoring and Selection Formula | `11-model-scoring-selection-formula.md` |
| 12 | Promotion, Demotion and Rollback | `12-model-promotion-demotion-rollback.md` |
| 13 | Candidate Model Evaluation Record | `13-candidate-model-evaluation-record.md` |
| 14 | Completion Checklist | `14-agent-routing-completion-checklist.md` |
| 15 | Agent Runtime Profile Contract | `15-agent-runtime-profile-contract.md` |
| 16 | Agent Test Card Standard | `16-agent-test-card-standard.md` |
| 17 | Model Evaluation Dataset Governance | `17-model-evaluation-dataset-governance.md` |
| 18 | Model Routing Observability Record | `18-model-routing-observability-record.md` |

## Henüz bilinçli olarak seçilmeyenler
```yaml
production_model_names_selected: false
exact_token_limits_selected: false
exact_latency_limits_selected: false
exact_cost_limits_selected: false
reason: benchmark evidence required
```

## Current state
```yaml
agent_model_routing_design: extended_first_phase_completed
runtime_profile_contract: defined
agent_test_card_standard: defined
evaluation_dataset_governance: defined
routing_observability: defined
production_model_assignments: pending_L8_benchmark
ui_development_allowed: false
```
