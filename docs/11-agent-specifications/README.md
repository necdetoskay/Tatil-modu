# 11 — Agent Specifications

**Doküman türü:** canonical agent specification alanı  
**Durum:** aktif tasarım artifact alanı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu klasör, Tatil Modu için kodlamaya geçmeden önce her agent'ın görevini, sınırlarını, input/output contract beklentilerini, failure mode'larını, evidence ihtiyaçlarını ve bağımsız test edilebilirlik koşullarını tanımlar.

Bu alan runtime implementation değildir.

Bu alanın amacı şudur:

```text
Her agent kod yazılmadan önce kağıt üzerinde net, test edilebilir ve sınırları belli hale gelsin.
```

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
agent_specs_required_before_coding: true
source_of_truth: docs/11-agent-specifications/
pre_freeze_reference: docs/02-agents/
```

`docs/02-agents/` pre-freeze referans olarak kalır.

Bu klasör ise yeni, canonical, pre-code agent specification alanıdır.

## İlk-phase agent seti

| Sıra | Agent | Dosya | Durum |
|---:|---|---|---|
| 1 | Trip Intake Agent | [`trip-intake-agent.md`](trip-intake-agent.md) | drafted |
| 2 | Constraint & Policy Agent | [`constraint-policy-agent.md`](constraint-policy-agent.md) | drafted |
| 3 | Family Suitability Agent | `family-suitability-agent.md` | next |
| 4 | Destination Candidate Agent | `destination-candidate-agent.md` | planned |
| 5 | Route & Logistics Agent | `route-logistics-agent.md` | planned |
| 6 | Accommodation Fit Agent | `accommodation-fit-agent.md` | planned |
| 7 | Activity Fit Agent | `activity-fit-agent.md` | planned |
| 8 | Day Plan Composer Agent | `day-plan-composer-agent.md` | planned |
| 9 | Verification & Evidence Agent | `verification-evidence-agent.md` | planned |
| 10 | Final Response Composer Agent | `final-response-composer-agent.md` | planned |

## Agent specification standardı

Her agent spec dosyası aşağıdaki başlıkları içermelidir:

1. Purpose
2. Non-goals
3. Inputs
4. Outputs
5. Required context
6. Forbidden context
7. Dependencies
8. Handoff rules
9. Hard constraints
10. Evidence requirements
11. Confidence rules
12. Failure modes
13. Clarification triggers
14. Fixture requirements
15. Evaluation rubric
16. Example contract sketch
17. Open design questions

## Kritik kural

Agent specification dosyaları kod değildir.

Bu dosyalarda provider implementation, API çağrısı, UI component, runtime queue, database table veya execution framework tasarlanmaz.

Bu dosyalar yalnızca agent'ın davranış sözleşmesini tanımlar.

## Current status

```yaml
agent_specification_state: active
completed_agent_specs:
  - trip-intake-agent.md
  - constraint-policy-agent.md
next_agent_spec: family-suitability-agent.md
implementation_allowed: false
```
