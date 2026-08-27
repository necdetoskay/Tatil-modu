# 11 — Agent Specifications

**Doküman türü:** canonical agent specification alanı  
**Durum:** canonical catalog v1.0 donduruldu  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu klasör, Tatil Modu için kodlamaya geçmeden önce her agent'ın görevini, sınırlarını, input/output contract beklentilerini, failure mode'larını, evidence ihtiyaçlarını ve bağımsız test edilebilirlik koşullarını tanımlar.

Bu alan runtime implementation değildir.

```text
Her agent kod yazılmadan önce kağıt üzerinde net, test edilebilir ve authority sınırları belli hale gelmelidir.
```

## Source of truth

Agent seti, ownership, authority envelope, tool izinleri, veri kaynakları ve ortak test seviyeleri için tek kanonik belge:

- [`canonical-agent-contract-catalog.md`](canonical-agent-contract-catalog.md)

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
agent_specs_required_before_coding: true
source_of_truth: docs/11-agent-specifications/canonical-agent-contract-catalog.md
pre_freeze_reference: docs/02-agents/
canonical_catalog_version: 1.0
canonical_catalog_date: 2026-08-27
```

## Kanonik agent seti

| ID | Agent |
|---|---|
| TM-AG-001 | Profile Agent |
| TM-AG-002 | Preference & Policy Agent |
| TM-AG-003 | Destination Research Agent |
| TM-AG-004 | Place Intelligence Agent |
| TM-AG-005 | Accommodation Agent |
| TM-AG-006 | Food & Local Taste Agent |
| TM-AG-007 | Weather Agent |
| TM-AG-008 | Transportation Agent |
| TM-AG-009 | Route Planner Agent |
| TM-AG-010 | Budget Agent |
| TM-AG-011 | Public Authority Intelligence Agent |
| TM-AG-012 | Review Intelligence Agent |
| TM-AG-013 | Adaptive Itinerary Agent |
| TM-AG-014 | Verification Agent |
| TM-AG-015 | Explanation Agent |
| TM-AG-016 | Final Composer Agent |
| TM-ORCH-001 | Travel Orchestrator |

Ayrıntılı mission, input/output, tool, data source, authority, forbidden action, invariant ve test oracle tanımları kanonik katalogdadır.

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

Her kanonik agent için ayrı spec paketi aşağıdaki başlıkları içermelidir:

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

## İlgili kanonik belgeler

- Tool sınıfları: `docs/04-tools/tool-catalog.md`
- Veri güven/freshness: `docs/01-architecture/data-source-trust-policy.md`
- Handoff standardı: `docs/01-architecture/handoff-contract-standard.md`
- Contracts: `docs/12-contracts/`
- Fixtures/evaluation: `docs/13-fixtures-and-evaluation/`
- Tool/capability design: `docs/14-tool-and-capability-design/`

## Sonraki aşama

```yaml
canonical_catalog: completed
individual_spec_reconciliation: pending
input_output_schema_freeze: pending
tool_policy_freeze: pending
fixture_matrix: pending
authority_tests: pending
implementation_allowed: false
```

Bir sonraki çalışma, `TM-AG-001` ile başlayarak her agent için ayrı specification + schema + tool policy + fixture + authority test paketini kanonik katalogla uyumlu hale getirmektir.
