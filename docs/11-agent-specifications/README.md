# 11 — Agent Specifications

**Doküman türü:** canonical agent specification alanı  
**Durum:** canonical catalog v1.0 + eight golden agent packages  
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
| TM-AG-004 | Place Intelligence Agent | **golden package v1 ready** |
| TM-AG-005 | Accommodation Agent | **golden package v1 ready** |
| TM-AG-006 | Food & Local Taste Agent | **golden package v1 ready** |
| TM-AG-007 | Weather Agent | **golden package v1 ready** |
| TM-AG-008 | Transportation Agent | **golden package v1 ready** |
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
Contract gap: exceptional region adayının exception policy provenance'ı için `exceptionPolicyRefs` eklenmiştir.

### TM-AG-004 Place Intelligence
```yaml
behavior_cases: 16
authority_cases: 8
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 4
place_level_only: true
hard_eligibility_separated_from_family_fit: true
review_analysis_delegated_to: TM-AG-012
route_calculation_delegated_to: TM-AG-008
weather_delegated_to: TM-AG-007
```
Contract gaps:
- `businessStatus` artık `value + evidenceRefs` taşır.
- `eligibility.dispositionReasons[]` kararın nedenini evidence'a bağlar.

### TM-AG-005 Accommodation
```yaml
behavior_cases: 16
authority_cases: 7
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 4
query_signature_required: true
live_price_and_availability_freshness_required: true
booking_and_payment_forbidden: true
journey_issue_49_compatible: true
```
Contract gap: stopover konaklamasının journey provenance'ı için `journeySegmentRef` query signature'a eklenmiştir.

### TM-AG-006 Food & Local Taste
```yaml
behavior_cases: 16
authority_cases: 8
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 4
local_taste_separated_from_venue_menu_fact: true
hard_dietary_eligibility_before_family_fit: true
review_analysis_delegated_to: TM-AG-012
journey_issue_49_compatible: true
knowledge_issue_50_compatible: true
```
Invariant:
```text
regional local-taste knowledge != venue current menu fact
knowledge hit != dynamic freshness bypass
```

### TM-AG-007 Weather
```yaml
behavior_cases: 14
authority_cases: 6
tool_policy_cases: 5
context_lifecycle_cases: 4
provenance_cases: 4
forecast_vs_climate_normal_separated: true
forecast_horizon_from_adapter_metadata: true
provider_selected: false
journey_issue_49_compatible: true
knowledge_issue_50_compatible: true
```
Invariant:
```text
FORECAST != CLIMATE_NORMAL
weather signal != itinerary mutation
```

### TM-AG-008 Transportation
```yaml
behavior_cases: 18
authority_cases: 8
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 5
route_corridor_discovery: true
straight_line_never_route_distance: true
stop_selection_delegated_to: TM-AG-009
corridor_value_research_delegated_to: TM-AG-003
journey_issue_49_required: true
knowledge_issue_50_compatible: true
```
Invariant:
```text
Transportation computes logistics.
Destination Research evaluates destination value.
Route Planner decides schedule/order.
```
Contract gap: fixture provenance testinde corridor relation threshold'unu açıklamak için `ruleSnapshotId` output schema'ya eklenmiştir.

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
TM_AG_004_place_intelligence_package: completed
TM_AG_005_accommodation_package: completed
TM_AG_006_food_local_taste_package: completed
TM_AG_007_weather_package: completed
TM_AG_008_transportation_package: completed
runtime_tests: pending
next_agent_package: TM-AG-009
implementation_allowed: false
```

Bir sonraki paket `TM-AG-009 Route Planner Agent` olacaktır. Issue #49'daki `JourneyPlan / JourneySegment / stop-role` planlama modeli bu paketin ana tasarım girdisidir.
