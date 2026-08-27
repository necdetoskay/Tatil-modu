# 11 — Agent Specifications

**Doküman türü:** canonical agent specification alanı  
**Durum:** canonical catalog v1.0 + first golden agent package  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu klasör, Tatil Modu için kodlamaya geçmeden önce her agent'ın görevini, sınırlarını, input/output contract beklentilerini, failure mode'larını, evidence ihtiyaçlarını ve bağımsız test edilebilirlik koşullarını tanımlar.

```text
Her agent kod yazılmadan önce net, test edilebilir ve authority sınırları belli hale gelmelidir.
```

## Source of truth

Agent seti ve ownership için:

- [`canonical-agent-contract-catalog.md`](canonical-agent-contract-catalog.md)

Harness/test lifecycle için:

- `docs/15-harness-and-orchestration/02-agent-contract-harness-baseline.md`

Radar/DeepSeek Harness adoption kararları için:

- `docs/15-harness-and-orchestration/01-radar-deepseek-harness-adoption-review.md`

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
| TM-AG-002 | Preference & Policy Agent | pending |
| TM-AG-003 | Destination Research Agent | pending |
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

## TM-AG-001 Golden Package

`profile-agent/` şu artefaktları içerir:

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

Fixture pack:

```yaml
normal_and_edge_cases: 10
authority_cases: 5
context_lifecycle_cases: 4
provenance_cases: 2
```

Bu paket diğer agentlar için golden template görevi görür.

## Önceki first-phase spec dosyaları

Aşağıdaki dosyalar silinmez. Bunlar önceki tasarım çalışmasının kanıtıdır ve yeni kanonik katalogla reconciliation için kullanılacaktır:

- `trip-intake-agent.md`
- `constraint-policy-agent.md`
- `family-suitability-agent.md`
- `destination-candidate-agent.md`
- `route-logistics-agent.md`
- `accommodation-fit-agent.md`
- `activity-fit-agent.md`
- `day-plan-composer-agent.md`
- `verification-evidence-agent.md`
- `final-response-composer-agent.md`

İsim veya ownership çakışmasında `canonical-agent-contract-catalog.md` önceliklidir.

## Agent specification standardı

Her kanonik agent için ayrı spec paketi en az şu alanları içermelidir:

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
18. Harness binding

Ek zorunlu artefaktlar:

- input/output schema,
- authority policy,
- tool policy,
- source policy,
- decision rules,
- handoff contract,
- machine-readable fixture pack.

## İlgili kanonik belgeler

- Tool sınıfları: `docs/04-tools/tool-catalog.md`
- Veri güven/freshness: `docs/01-architecture/data-source-trust-policy.md`
- ACP: `docs/08-architecture-baseline/18-agent-communication-protocol.md`
- Contracts: `docs/12-contracts/`
- Fixtures/evaluation: `docs/13-fixtures-and-evaluation/`
- Tool/capability design: `docs/14-tool-and-capability-design/`
- Harness baseline: `docs/15-harness-and-orchestration/`

## Sonraki aşama

```yaml
canonical_catalog: completed
harness_adoption_review: completed
harness_baseline: completed
TM_AG_001_profile_package: completed
TM_AG_001_runtime_tests: pending
next_agent_package: TM-AG-002
implementation_allowed: false
```

Bir sonraki tasarım paketi `TM-AG-002 Preference & Policy Agent` olacaktır. Runtime kodlama başlamadan önce M1 Harness runner sözleşmelerinin uygulanabilirlik planı ayrıca çıkarılacaktır.
