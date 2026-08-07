# 19 — Quality Engine Design

**Doküman türü:** canonical quality engine, review ve scoring design alanı  
**Durum:** first phase tamamlandı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime reviewer:** kapalı

## Amaç

Bu klasör, Tatil Modu'nun ürettiği tatil planlarını kalite, güvenlik, aile uygunluğu, kanıt görünürlüğü, plan tutarlılığı ve kullanıcı kullanılabilirliği açısından nasıl değerlendireceğini koddan önce kanonik şekilde tasarlamak için kullanılır.

Bu alan runtime reviewer, scoring engine, CI evaluator, automated judge, LLM-as-judge implementation, production quality gate veya test runner değildir.

## Ana karar

```yaml
quality_engine_design_state: first_phase_completed
quality_engine_first_phase_completed: true
implementation_allowed: false
prototype_allowed: false
runtime_reviewer_allowed: false
scoring_engine_allowed: false
ci_evaluator_allowed: false
llm_judge_runtime_allowed: false
source_of_truth: docs/19-quality-engine/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/14-tool-and-capability-design/
  - docs/15-prompts/
  - docs/16-workflows/
  - docs/17-decision-policy-engine/
  - docs/18-memory-architecture/
```

## Neden bu aşama gerekli?

Tatil Modu iyi görünen ama yanlış, yorucu, kanıtsız veya aile için uygunsuz plan üretmemelidir.

Quality Engine tasarımı şu sorulara cevap verir:

```text
Plan gerçekten aileye uygun mu?
Hard constraint ihlali var mı?
Kadınlar plajı / privacy şartı görünür ve doğrulanmış mı?
2 yaş çocuk için öğle dinlenmesi korunmuş mu?
Fiyat, saat, hava, otopark gibi bilgiler kanıtsız kesin yazılmış mı?
Alternatifler yeterli ve kullanılabilir mi?
Final cevap net, dürüst ve aksiyona dönük mü?
```

## Kapsam

```yaml
scope:
  - quality_engine_boundary
  - quality_dimension_taxonomy
  - review_gate_hierarchy
  - hard_failure_policy
  - family_suitability_quality_rubric
  - evidence_quality_rubric
  - plan_coherence_quality_rubric
  - final_response_quality_rubric_alignment
  - regression_quality_policy
  - human_review_handoff_policy
  - quality_report_contract_design
```

## Kapsam dışı

```yaml
out_of_scope:
  - runtime_quality_reviewer
  - scoring_engine_code
  - automated_ci_evaluator
  - llm_as_judge_runtime
  - production_monitoring
  - model_eval_runner
  - database_schema
  - provider_integration
  - live_agent_execution
```

## First-phase quality engine design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Quality Engine Overview | [`01-quality-engine-overview.md`](01-quality-engine-overview.md) | drafted |
| 2 | Quality Dimension Taxonomy | [`02-quality-dimension-taxonomy.md`](02-quality-dimension-taxonomy.md) | drafted |
| 3 | Quality Gate Hierarchy | [`03-quality-gate-hierarchy.md`](03-quality-gate-hierarchy.md) | drafted |
| 4 | Hard Failure and Blocker Policy | [`04-hard-failure-blocker-policy.md`](04-hard-failure-blocker-policy.md) | drafted |
| 5 | Family Suitability Quality Rubric | [`05-family-suitability-quality-rubric.md`](05-family-suitability-quality-rubric.md) | drafted |
| 6 | Evidence Quality Rubric | [`06-evidence-quality-rubric.md`](06-evidence-quality-rubric.md) | drafted |
| 7 | Plan Coherence Quality Rubric | [`07-plan-coherence-quality-rubric.md`](07-plan-coherence-quality-rubric.md) | drafted |
| 8 | Final Response Quality Alignment | [`08-final-response-quality-alignment.md`](08-final-response-quality-alignment.md) | drafted |
| 9 | Regression Quality Policy | [`09-regression-quality-policy.md`](09-regression-quality-policy.md) | drafted |
| 10 | Human Review Handoff Policy | [`10-human-review-handoff-policy.md`](10-human-review-handoff-policy.md) | drafted |
| 11 | Quality Report Contract Design | [`11-quality-report-contract-design.md`](11-quality-report-contract-design.md) | drafted |
| 12 | Quality Engine Completion Checklist | [`12-quality-engine-completion-checklist.md`](12-quality-engine-completion-checklist.md) | drafted |

## Quality tasarım ilkeleri

1. Hard constraint violation kalite puanı ile telafi edilemez.
2. Kanıtsız kesin bilgi quality failure sayılır.
3. Aile uygunluğu yalnızca öneri kalitesi değil, kalite gate'idir.
4. Privacy-sensitive gereksinimler quality review içinde görünür olmalıdır.
5. Final response doğrulanmamış bilgiyi kesin gerçek gibi sunamaz.
6. Quality score tek başına karar değildir; blocker, warning ve confidence birlikte değerlendirilir.
7. Regression sadece metin farkı değildir; davranış ve güvenlik sınırı bozulmasıdır.
8. Quality Engine tasarımı implementation değildir.
9. Quality report kullanıcıya neyin güvenli, neyin eksik ve neyin riskli olduğunu açıklayabilir olmalıdır.
10. Runtime reviewer veya CI evaluator bu aşamada yazılmaz.

## Current status

```yaml
quality_engine_design_state: first_phase_completed
quality_engine_first_phase_completed: true
completed_artifacts:
  - 01-quality-engine-overview.md
  - 02-quality-dimension-taxonomy.md
  - 03-quality-gate-hierarchy.md
  - 04-hard-failure-blocker-policy.md
  - 05-family-suitability-quality-rubric.md
  - 06-evidence-quality-rubric.md
  - 07-plan-coherence-quality-rubric.md
  - 08-final-response-quality-alignment.md
  - 09-regression-quality-policy.md
  - 10-human-review-handoff-policy.md
  - 11-quality-report-contract-design.md
  - 12-quality-engine-completion-checklist.md
next_stage: docs/20-orchestrator/
implementation_allowed: false
prototype_allowed: false
runtime_reviewer_allowed: false
scoring_engine_allowed: false
ci_evaluator_allowed: false
llm_judge_runtime_allowed: false
```
