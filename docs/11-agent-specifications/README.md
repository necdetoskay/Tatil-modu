# 11 — Agent Specifications

**Doküman türü:** canonical agent specification alanı  
**Durum:** canonical catalog v1.0 + three golden agent packages  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu klasör, Tatil Modu için kodlamaya geçmeden önce her agent'ın görevini, sınırlarını, input/output contract beklentilerini, failure mode'larını, evidence ihtiyaçlarını ve bağımsız test edilebilirlik koşullarını tanımlar.

```text
Her agent kod yazılmadan önce net, test edilebilir ve authority sınırları belli hale gelmelidir.
```

## Source of truth

- Agent seti/ownership: [`canonical-agent-contract-catalog.md`](canonical-agent-contract-catalog.md)
- Harness/test lifecycle: `docs/15-harness-and-orchestration/02-agent-contract-harness-baseline.md`
- Radar/DeepSeek Harness adoption: `docs/15-harness-and-orchestration/01-radar-deepseek-harness-adoption-review.md`

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
agent_specs_required_before_coding: true
source_of_truth: docs/11-agent-specifications/canonical-agent-contract-catalog.md
canonical_catalog_version: 1.0
canonical_catalog_date: 2026-08-27
```

## Kanonik agent seti ve paket durumu

| ID | Agent | Paket durumu |
|---|---|---|
| TM-AG-001 | Profile Agent | **golden package v1 ready** |
| TM-AG-002 | Preference & Policy Agent | **golden package v1 ready** |
| TM-AG-003 | Destination Research Agent | **golden package v1 ready** |
| TM-AG-004 | Place Intelligence Agent | pending |
| TM-AG-005 | Accommodation Agent | pending |
| TM-AG-006 | Food & Local Taste Agent | pending |
| TM-AG-007 | Weather Agent | pending |
| TM-AG-008 | Transportation Agent | pending |
| TM-AG-009 | Route Planner Agent | pending |
| TM-AG-010 | Budget Agent | pending |
| TM-AG-011 | Public Authority Intelligence Agent | pending |
| TM-AG-012 | Review Intelligence Agent | pending |
| TM-AG-013 | Adaptive Itinerary Agent | pending |
| TM-AG-014 | Verification Agent | pending |
| TM-AG-015 | Explanation Agent | pending |
| TM-AG-016 | Final Composer Agent | pending |
| TM-ORCH-001 | Travel Orchestrator | pending |

## Golden package standardı

Her hazır paket şunları içerir:

- `specification.md`
- `input.schema.json`
- `output.schema.json`
- `authority-policy.md`
- `tool-policy.md`
- `source-policy.md`
- `decision-rules.md`
- `handoff-contracts.md`
- `evaluation-rubric.md`
- `tests/fixture-pack.v1.json`

### TM-AG-001 Profile

```yaml
normal_and_edge_cases: 10
authority_cases: 5
context_lifecycle_cases: 4
provenance_cases: 2
```

### TM-AG-002 Preference & Policy

```yaml
behavior_cases: 14
authority_cases: 6
context_lifecycle_cases: 4
provenance_cases: 3
conditional_hard_supported: true
exception_policy_supported: true
```

Contract gap: `ExceptionPolicySet` fixture tasarımında ortaya çıkarılmış ve schema'ya eklenmiştir.

### TM-AG-003 Destination Research

```yaml
behavior_cases: 14
authority_cases: 7
tool_policy_cases: 7
context_lifecycle_cases: 4
provenance_cases: 4
region_level_only: true
route_validation_delegated_to: TM-AG-008
place_discovery_delegated_to: TM-AG-004
```

Contract gap: exceptional region adayının hangi exception policy'ye dayandığını göstermek için `exceptionPolicyRefs` alanı fixture/handoff incelemesinde ortaya çıkarılmış ve output schema'ya eklenmiştir.

## Eski first-phase specs

Eski spec dosyaları silinmez; tarihsel tasarım/reconciliation kaydıdır. İsim veya ownership çakışmasında `canonical-agent-contract-catalog.md` önceliklidir.

## Agent specification standardı

Her paket en az şunları kapsar:

1. Purpose / Non-goals
2. Inputs / Outputs
3. Required / Forbidden context
4. Dependencies / Handoff
5. Hard constraints / invariants
6. Evidence / confidence
7. Failure / clarification
8. Fixture/evaluation
9. Authority/tool/source policy
10. Context lifecycle/provenance binding

## Sonraki aşama

```yaml
canonical_catalog: completed
harness_adoption_review: completed
harness_baseline: completed
TM_AG_001_profile_package: completed
TM_AG_002_preference_policy_package: completed
TM_AG_003_destination_research_package: completed
runtime_tests: pending
next_agent_package: TM-AG-004
implementation_allowed: false
```

Bir sonraki paket `TM-AG-004 Place Intelligence Agent` olacaktır.
