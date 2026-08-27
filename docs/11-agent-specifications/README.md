# 11 — Agent Specifications

**Doküman türü:** canonical agent specification alanı  
**Durum:** canonical catalog v1.1 + **17/17 golden contract packages + reconciliation PASS**  
**Kodlama durumu:** runtime kapalı; **M1 harness implementation/test scaffolding açık**  
**Prototype durumu:** domain runtime kapalı

## Amaç

Bu klasör, Tatil Modu için kodlamaya geçmeden önce her agent'ın görevini, sınırlarını, input/output contract beklentilerini, failure mode'larını, evidence ihtiyaçlarını ve bağımsız test edilebilirlik koşullarını tanımlar.

```text
Her agent kod yazılmadan önce net, test edilebilir ve authority sınırları belli hale gelmelidir.
```

## Source of truth

- Agent seti/ownership: [`canonical-agent-contract-catalog.md`](canonical-agent-contract-catalog.md)
- Cross-contract audit: [`contract-reconciliation-audit-v1.md`](contract-reconciliation-audit-v1.md)
- Harness/test lifecycle: `docs/15-harness-and-orchestration/02-agent-contract-harness-baseline.md`
- Radar/DeepSeek Harness adoption: `docs/15-harness-and-orchestration/01-radar-deepseek-harness-adoption-review.md`

```yaml
runtime_implementation_allowed: false
m1_harness_implementation_allowed: true
live_provider_tests_as_first_step: false
agent_specs_required_before_runtime: true
source_of_truth: docs/11-agent-specifications/canonical-agent-contract-catalog.md
canonical_catalog_version: 1.1
canonical_catalog_date: 2026-08-27
cross_contract_reconciliation: PASS
```

> Package readiness için bu README kanoniktir. Bazı erken oluşturulmuş `specification.md` dosyalarındaki lokal `Current status` blokları stale olabilir ve readiness kararını override etmez.

## Kanonik agent seti ve paket durumu

| ID | Agent | Paket durumu |
|---|---|---|
| TM-AG-001 | Profile Agent | **golden package v1 ready** |
| TM-AG-002 | Preference & Policy Agent | **golden package v1 ready** |
| TM-AG-003 | Destination Research Agent | **golden package v1 ready** |
| TM-AG-004 | Place Intelligence Agent | **golden package v1 ready** |
| TM-AG-005 | Accommodation Agent | **golden package v1 ready** |
| TM-AG-006 | Food & Local Taste Agent | **golden package v1 ready** |
| TM-AG-007 | Weather Agent | **golden package v1 ready** |
| TM-AG-008 | Transportation Agent | **golden package v1 ready** |
| TM-AG-009 | Route Planner Agent | **golden package v1 ready** |
| TM-AG-010 | Budget Agent | **golden package v1 ready** |
| TM-AG-011 | Public Authority Intelligence Agent | **golden package v1 ready** |
| TM-AG-012 | Review Intelligence Agent | **golden package v1 ready** |
| TM-AG-013 | Adaptive Itinerary Agent | **golden package v1 ready** |
| TM-AG-014 | Verification Agent | **golden package v1 ready** |
| TM-AG-015 | Explanation Agent | **golden package v1 ready** |
| TM-AG-016 | Final Composer Agent | **golden package v1 ready** |
| TM-ORCH-001 | Travel Orchestrator | **golden package v1 ready** |

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

## Önemli fixture-driven contract düzeltmeleri

| Component | Fixture ile yakalanan ana gap |
|---|---|
| TM-AG-002 | `ExceptionPolicySet` |
| TM-AG-003 | exceptional destination `exceptionPolicyRefs` |
| TM-AG-004 | evidence-aware business status/rejection reasons |
| TM-AG-005 | journey segment query lineage |
| TM-AG-008 | corridor `ruleSnapshotId` |
| TM-AG-009 | user stop `selectionOrigin + selectionSourceRef`; budget ownership ayrımı |
| TM-AG-010 | `budgetCriticality` |
| TM-AG-011 | ordered `sourceLookupTrace[]` |
| TM-AG-012 | `snapshotLineage.baseSample + refreshContributions[]` |
| TM-AG-013 | per-trigger `triggerResolutions[]` |
| TM-AG-014 | verification `policySnapshotRefs[] + evaluatorRefs[]` |
| TM-AG-015 | explanation `generationRefs[]` |
| TM-ORCH-001 | `harnessPolicySnapshotId` + complete handoff object lineage |

## Ortak invariant özeti

```text
unknown stays unknown
hard constraint before soft score
regional taste knowledge != current venue menu
FORECAST != CLIMATE_NORMAL
straight-line distance != route duration
UNKNOWN price != 0
OfficialFact != ReviewSignal
small change → smallest justified repair
zero blocking findings → required for Verification PASS
facts(explanation) ⊆ verified facts
facts(final) ⊆ verified snapshot + verified explanation
Orchestrator → Specialist → ToolGateway → Tool
Verification PASS + matching hash → durable commit
```

## Backlog integration status

### Issue #49 — Route-to-Destination Journey
Integrated into TM-AG-002/003/004/005/006/008/009/010/013/014 and TM-ORCH-001 contracts.

### Issue #50 — Background Travel Knowledge Curator
Integrated as knowledge-first/freshness/source-registry interface. Background subsystem itself remains backlog and does not add a runtime TM-AG agent yet.

### Issue #51 — Seasonal & Event Intelligence
Integrated into preference, destination/place/weather, official/review, transportation, planning, adaptive, verification and orchestration contracts. Exact occurrence remains distinct from recurring knowledge.

## Cross-contract reconciliation

Audit: `contract-reconciliation-audit-v1.md`

```yaml
agent_ids: PASS
ownership: PASS
shared_domain_objects: PASS_AFTER_CATALOG_1_1
handoffs: PASS_AT_CONTRACT_LEVEL
tool_authority: PASS_AT_CONTRACT_LEVEL
source_authority: PASS
context_provenance: PASS
journey_issue_49: PASS
knowledge_issue_50: PASS_AS_INTERFACE
event_season_issue_51: PASS_AS_INTERFACE
verified_state_gate: PASS_AT_CONTRACT_LEVEL
m1_harness_entry: ALLOWED
runtime_implementation: BLOCKED_UNTIL_EXECUTABLE_M1_GATES
```

## Eski first-phase specs

Eski tekil `.md` dosyaları tarihsel tasarım/reconciliation kaydıdır. İsim veya ownership çakışmasında `canonical-agent-contract-catalog.md` v1.1 ve golden package sözleşmeleri önceliklidir.

## Sonraki aşama — M1 Executable Agent Contract Harness

```yaml
M1_1_agent_registry: next
M1_2_contract_loader_R0: pending
M1_3_deterministic_runner_R1: pending
M1_4_fixture_runner_R2: pending
M1_5_tool_gateway_authority_R6: pending
M1_6_context_trace: pending
M1_7_failure_attribution_RIVE: pending
M1_8_verified_state_gate: pending
M1_9_full_17_package_sweep: pending
```

M1 tamamlanana kadar gerçek domain runtime implementation ve live provider-first test akışı açılmaz. M1 için gerçek web/Places/Routes/Weather/Booking çağrısı gerekmez.
