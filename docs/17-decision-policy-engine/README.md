# 17 — Decision Policy Engine Design

**Doküman türü:** canonical decision policy engine design alanı  
**Durum:** first phase completed  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime policy engine:** kapalı

## Amaç

Bu klasör, Tatil Modu içinde kararların hangi sırayla, hangi gate'lerden geçerek ve hangi öncelik hiyerarşisiyle verileceğini koddan önce kanonik şekilde tasarlamak için kullanılır.

Bu alan runtime policy engine, scoring implementation, rule evaluator, DSL, production decision engine veya live agent decision execution değildir.

## Ana karar

```yaml
decision_policy_design_state: first_phase_completed
decision_policy_design_first_phase_completed: true
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
rule_evaluator_code_allowed: false
scoring_code_allowed: false
live_decision_execution_allowed: false
source_of_truth: docs/17-decision-policy-engine/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/14-tool-and-capability-design/
  - docs/15-prompts/
  - docs/16-workflows/
```

## Neden bu aşama gerekli?

Agent, contract, fixture, capability, prompt ve workflow tasarımları tamamlandığında sistemin karar verirken hangi kuralı hangi kurala göre üstün tutacağı net olmalıdır.

Bu aşama şu sorulara cevap verir:

```text
Hard constraint mi önce gelir, ranking mi?
Evidence yoksa plan durur mu, uyarı mı üretir?
Privacy-sensitive gereksinim hangi gate'te kilitler?
2 yaş çocukla yoğun plan ne zaman blocker olur?
150 km dışı öneri ne zaman istisna sayılır?
Soft preference hard constraint'i dengeleyebilir mi?
Final cevapta hangi belirsizlik görünür olmak zorundadır?
```

## Kapsam

```yaml
scope:
  - policy_priority_hierarchy
  - hard_constraint_gate_design
  - soft_preference_ranking_policy
  - evidence_confidence_decision_policy
  - family_suitability_policy
  - privacy_sensitive_decision_policy
  - route_radius_exception_policy
  - budget_decision_policy
  - retry_fallback_decision_policy
  - final_response_decision_policy
```

## Kapsam dışı

```yaml
out_of_scope:
  - runtime_policy_engine
  - rules_dsl_implementation
  - scoring_code
  - ranking_algorithm_code
  - production_guardrail_engine
  - live_agent_execution
  - provider_calls
  - database_schema
  - test_runner
  - ci_policy_checks
```

## First-phase decision policy design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Decision Policy Overview | [`01-decision-policy-overview.md`](01-decision-policy-overview.md) | drafted |
| 2 | Policy Priority Hierarchy | [`02-policy-priority-hierarchy.md`](02-policy-priority-hierarchy.md) | drafted |
| 3 | Hard Constraint Gate Policy | [`03-hard-constraint-gate-policy.md`](03-hard-constraint-gate-policy.md) | drafted |
| 4 | Soft Preference Ranking Policy | [`04-soft-preference-ranking-policy.md`](04-soft-preference-ranking-policy.md) | drafted |
| 5 | Evidence Confidence Decision Policy | [`05-evidence-confidence-decision-policy.md`](05-evidence-confidence-decision-policy.md) | drafted |
| 6 | Family Suitability Decision Policy | [`06-family-suitability-decision-policy.md`](06-family-suitability-decision-policy.md) | drafted |
| 7 | Privacy Sensitive Decision Policy | [`07-privacy-sensitive-decision-policy.md`](07-privacy-sensitive-decision-policy.md) | drafted |
| 8 | Route Radius Exception Policy | [`08-route-radius-exception-policy.md`](08-route-radius-exception-policy.md) | drafted |
| 9 | Budget Decision Policy | [`09-budget-decision-policy.md`](09-budget-decision-policy.md) | drafted |
| 10 | Retry Fallback Decision Policy | [`10-retry-fallback-decision-policy.md`](10-retry-fallback-decision-policy.md) | drafted |
| 11 | Final Response Decision Policy | [`11-final-response-decision-policy.md`](11-final-response-decision-policy.md) | drafted |
| 12 | Decision Policy Completion Checklist | [`12-decision-policy-completion-checklist.md`](12-decision-policy-completion-checklist.md) | completed |

## Decision policy tasarım ilkeleri

1. Hard constraint, soft preference veya ranking score ile telafi edilemez.
2. Evidence eksikliği kesin bilgi üretimine dönüşemez.
3. Privacy-sensitive gereksinim görünmez uyarıya indirgenemez.
4. Çocuk yaşı ve dinlenme ihtiyacı plan kalitesi değil, karar girdisidir.
5. 150 km dışı öneri ancak açık istisna gerekçesiyle geçebilir.
6. Düşük güvenli varsayım hard constraint yapılamaz.
7. Final response, policy sonucunu kullanıcıya anlaşılır şekilde taşır.
8. Retry sonsuz döngü değildir; karar politikası bounded fallback üretir.
9. Policy engine tasarımı kod değildir.
10. Orchestrator policy kararlarını uygular; expert agent kendi başına global policy değiştirmez.

## Current status

```yaml
decision_policy_design_state: first_phase_completed
completed_artifacts:
  - 01-decision-policy-overview.md
  - 02-policy-priority-hierarchy.md
  - 03-hard-constraint-gate-policy.md
  - 04-soft-preference-ranking-policy.md
  - 05-evidence-confidence-decision-policy.md
  - 06-family-suitability-decision-policy.md
  - 07-privacy-sensitive-decision-policy.md
  - 08-route-radius-exception-policy.md
  - 09-budget-decision-policy.md
  - 10-retry-fallback-decision-policy.md
  - 11-final-response-decision-policy.md
  - 12-decision-policy-completion-checklist.md
next_stage: docs/18-memory-architecture/
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
rule_evaluator_code_allowed: false
live_decision_execution_allowed: false
```
