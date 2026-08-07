# 03 — Required Design Artifact Map

**Doküman türü:** Zorunlu tasarım artifact haritası  
**Durum:** tasarım planı  
**Tarih:** 2026-08-07  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu doküman, Tatil Modu için kodlama veya prototype başlamadan önce üretilmesi gereken tüm zorunlu tasarım artifact'larını listeler.

Amaç dosya üretmek için dosya üretmek değildir.

Amaç, sistemin her kritik karar alanını yazılı, izlenebilir, test edilebilir ve birbirine bağlı hale getirmektir.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
artifact_state: mapping_required_design_artifacts
next_goal: create_complete_pre_code_design_inventory
```

Kodlama ancak bu artifact seti tamamlandıktan sonra ayrıca değerlendirilebilir.

## Artifact sınıfları

Tatil Modu için gereken tasarım artifact'ları şu sınıflara ayrılır:

1. product and user experience artifacts,
2. system architecture artifacts,
3. orchestration artifacts,
4. agent specification artifacts,
5. contract and schema artifacts,
6. memory and privacy artifacts,
7. tool and capability artifacts,
8. evidence / verification / confidence artifacts,
9. policy and hard constraint artifacts,
10. fixture and evaluation artifacts,
11. observability and audit artifacts,
12. data model and store boundary artifacts,
13. prompt and response composition artifacts,
14. governance and decision record artifacts,
15. pre-code freeze artifacts.

## 1. Product and UX artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Product vision | `docs/10-product/PRD-001-URUN-VIZYONU.md` | existing | Defines the product goal and family travel problem |
| Target user profile | `docs/09-pre-implementation-design/product/target-user-profile.md` | required | Defines family, children, constraints and decision context |
| Primary user journeys | `docs/09-pre-implementation-design/product/user-journeys.md` | required | Defines end-to-end travel planning journeys |
| UX decision flow | `docs/09-pre-implementation-design/product/ux-decision-flow.md` | required | Defines screens, questions, confirmations and user decisions before UI coding |
| Output plan format | `docs/09-pre-implementation-design/product/final-plan-output-format.md` | required | Defines what a final travel plan must contain |
| Rejected alternative explanation format | `docs/09-pre-implementation-design/product/rejected-alternative-explanation-format.md` | required | Defines how rejected or downgraded options are explained |

## 2. System architecture artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Architecture baseline | `docs/08-architecture-baseline/README.md` | existing | Holds freeze-era architecture baseline |
| System blueprint gap analysis | `docs/09-pre-implementation-design/02-system-blueprint-gap-analysis.md` | existing | Lists current design gaps |
| Canonical system blueprint | `docs/09-pre-implementation-design/architecture/canonical-system-blueprint.md` | required | Defines final pre-code system architecture |
| Component ownership matrix | `docs/09-pre-implementation-design/architecture/component-ownership-matrix.md` | required | Defines owner and boundary of each component |
| Runtime interaction map | `docs/09-pre-implementation-design/architecture/runtime-interaction-map.md` | required | Defines allowed interactions between orchestrator, agents, platforms and tools |
| Non-goals and blocked scope | `docs/09-pre-implementation-design/architecture/non-goals-and-blocked-scope.md` | required | Prevents uncontrolled implementation scope growth |

## 3. Orchestration artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Orchestration model | `ai-agent-architecture-handbook/05-orchestration-model.md` | existing generic | Defines generic orchestration rules |
| Travel Orchestrator specification | `docs/09-pre-implementation-design/orchestration/travel-orchestrator-specification.md` | required | Defines Tatil Modu orchestration responsibilities |
| Workflow routing table | `docs/09-pre-implementation-design/orchestration/workflow-routing-table.md` | required | Defines which request type goes to which components |
| Retry and fallback policy | `docs/09-pre-implementation-design/orchestration/retry-and-fallback-policy.md` | required | Defines retries, partial failures and graceful degradation |
| Decision reconciliation policy | `docs/09-pre-implementation-design/orchestration/decision-reconciliation-policy.md` | required | Defines how conflicting agent outputs are resolved |
| Final response composition flow | `docs/09-pre-implementation-design/orchestration/final-response-composition-flow.md` | required | Defines how final user-facing plan is assembled |

## 4. Agent specification artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Generic agent specification template | `ai-agent-architecture-handbook/12-agent-specification-template.md` | existing generic | Defines required fields for every agent spec |
| First-phase agent catalog | `docs/09-pre-implementation-design/agents/first-phase-agent-catalog.md` | required | Freezes first design-phase agent list |
| Trip Intake Agent spec | `docs/09-pre-implementation-design/agents/trip-intake-agent.md` | required | Normalizes user request and missing information |
| Constraint and Policy Agent spec | `docs/09-pre-implementation-design/agents/constraint-policy-agent.md` | required | Extracts hard constraints and policy gates |
| Destination Candidate Agent spec | `docs/09-pre-implementation-design/agents/destination-candidate-agent.md` | required | Produces candidate destination regions |
| Activity Candidate Agent spec | `docs/09-pre-implementation-design/agents/activity-candidate-agent.md` | required | Produces family-appropriate activities |
| Route and Fatigue Agent spec | `docs/09-pre-implementation-design/agents/route-fatigue-agent.md` | required | Evaluates distance, traffic, parking and fatigue |
| Accommodation Candidate Agent spec | `docs/09-pre-implementation-design/agents/accommodation-candidate-agent.md` | required | Evaluates lodging candidates and constraints |
| Budget Agent spec | `docs/09-pre-implementation-design/agents/budget-agent.md` | required | Evaluates cost and budget feasibility |
| Day Planner Agent spec | `docs/09-pre-implementation-design/agents/day-planner-agent.md` | required | Builds daily plan alternatives |
| Final Plan Composer spec | `docs/09-pre-implementation-design/agents/final-plan-composer.md` | required | Produces final readable plan with evidence and warnings |

## 5. Contract and schema artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Agent contract standard | `ai-agent-architecture-handbook/04-agent-contract-standard.md` | existing generic | Defines generic contract rules |
| ACP envelope schema | `docs/09-pre-implementation-design/contracts/acp-envelope-schema.md` | required | Defines agent-to-orchestrator communication envelope |
| Request normalization schema | `docs/09-pre-implementation-design/contracts/request-normalization-schema.md` | required | Defines normalized trip request structure |
| Agent response schema | `docs/09-pre-implementation-design/contracts/agent-response-schema.md` | required | Defines standard agent result format |
| Error schema | `docs/09-pre-implementation-design/contracts/error-schema.md` | required | Defines error code and display behavior |
| Evidence envelope schema | `docs/09-pre-implementation-design/contracts/evidence-envelope-schema.md` | required | Defines evidence metadata in outputs |
| Confidence schema | `docs/09-pre-implementation-design/contracts/confidence-schema.md` | required | Defines confidence level and reason fields |
| Candidate scoring schema | `docs/09-pre-implementation-design/contracts/candidate-scoring-schema.md` | required | Defines soft ranking and score explanation |
| Rejection schema | `docs/09-pre-implementation-design/contracts/rejection-schema.md` | required | Defines hard constraint rejection output |

## 6. Memory and privacy artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Memory Platform Boundary | `docs/08-architecture-baseline/memory-platform-boundary.md` | existing | Defines memory ownership boundary |
| Memory disclosure handbook | `ai-agent-architecture-handbook/06-memory-disclosure-and-privacy.md` | existing generic | Defines generic memory disclosure rules |
| Family memory model | `docs/09-pre-implementation-design/memory/family-memory-model.md` | required | Defines family profile and preference data categories |
| Memory disclosure package schema | `docs/09-pre-implementation-design/memory/memory-disclosure-package-schema.md` | required | Defines what each agent may receive |
| Sensitive data classification | `docs/09-pre-implementation-design/memory/sensitive-data-classification.md` | required | Defines privacy-sensitive travel/family fields |
| Memory write candidate policy | `docs/09-pre-implementation-design/memory/memory-write-candidate-policy.md` | required | Defines when a new memory may be proposed |
| Redaction and audit policy | `docs/09-pre-implementation-design/memory/redaction-and-audit-policy.md` | required | Defines logging redaction and audit behavior |

## 7. Tool and capability artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Tool capability handbook | `ai-agent-architecture-handbook/07-tool-capability-and-adapter-model.md` | existing generic | Defines generic capability and adapter model |
| Capability registry design | `docs/09-pre-implementation-design/tools/capability-registry-design.md` | required | Defines Tatil Modu capability IDs |
| Tool Gateway design | `docs/09-pre-implementation-design/tools/tool-gateway-design.md` | required | Defines gateway enforcement and routing |
| Mock provider strategy | `docs/09-pre-implementation-design/tools/mock-provider-strategy.md` | required | Defines fake/weather/maps/hotel/public authority data sources for design testing |
| Provider adapter boundary | `docs/09-pre-implementation-design/tools/provider-adapter-boundary.md` | required | Defines live provider replacement boundaries |
| Freshness and cache policy | `docs/09-pre-implementation-design/tools/freshness-and-cache-policy.md` | required | Defines time-sensitive data handling |
| Prompt injection and untrusted source policy | `docs/09-pre-implementation-design/tools/prompt-injection-untrusted-source-policy.md` | required | Defines how web/provider content is treated |

## 8. Evidence, verification and confidence artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Evidence handbook | `ai-agent-architecture-handbook/08-evidence-verification-and-confidence.md` | existing generic | Defines generic evidence semantics |
| Verification Platform boundary | `docs/08-architecture-baseline/verification-platform-boundary.md` | existing | Defines verification ownership |
| Evidence source taxonomy | `docs/09-pre-implementation-design/evidence/evidence-source-taxonomy.md` | required | Classifies user input, provider data, public authority data and inferred claims |
| Verification status registry | `docs/09-pre-implementation-design/evidence/verification-status-registry.md` | required | Defines verification status values |
| Confidence ownership map | `docs/09-pre-implementation-design/evidence/confidence-ownership-map.md` | required | Defines who may assign or change confidence |
| Conflict handling policy | `docs/09-pre-implementation-design/evidence/conflict-handling-policy.md` | required | Defines source conflicts and fallback behavior |
| Decision impact classification | `docs/09-pre-implementation-design/evidence/decision-impact-classification.md` | required | Defines low/medium/high decision impact levels |

## 9. Policy and hard constraint artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Policy and hard constraints handbook | `ai-agent-architecture-handbook/09-policy-hard-constraints-and-safety.md` | existing generic | Defines generic hard constraint rules |
| Public Authority Layering | `docs/08-architecture-baseline/public-authority-layering.md` | existing | Defines official-source layering |
| Hard constraint taxonomy | `docs/09-pre-implementation-design/policy/hard-constraint-taxonomy.md` | required | Defines user, safety, legal, official and operational hard constraints |
| Soft preference taxonomy | `docs/09-pre-implementation-design/policy/soft-preference-taxonomy.md` | required | Defines preferences that may influence ranking |
| Candidate rejection policy | `docs/09-pre-implementation-design/policy/candidate-rejection-policy.md` | required | Defines rejection before scoring |
| Conservative/privacy-sensitive travel policy | `docs/09-pre-implementation-design/policy/conservative-privacy-sensitive-travel-policy.md` | required | Defines women-only beach and privacy-sensitive travel handling |
| Child suitability policy | `docs/09-pre-implementation-design/policy/child-suitability-policy.md` | required | Defines age suitability, nap/rest and fatigue safety |

## 10. Fixture and evaluation artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Evaluation handbook | `ai-agent-architecture-handbook/10-evaluation-fixtures-and-regression.md` | existing generic | Defines fixture-first evaluation |
| Evaluation hierarchy | `docs/08-architecture-baseline/evaluation-standards-hierarchy.md` | existing | Defines evaluation gate order |
| Golden scenario catalog | `docs/09-pre-implementation-design/evaluation/golden-scenario-catalog.md` | required | Defines first canonical scenarios |
| Kocaeli-Bursa family trip fixture | `docs/09-pre-implementation-design/evaluation/fixtures/kocaeli-bursa-family-trip.md` | required | Defines first detailed test scenario |
| Kocaeli-Balikesir family trip fixture | `docs/09-pre-implementation-design/evaluation/fixtures/kocaeli-balikesir-family-trip.md` | required | Defines second detailed test scenario |
| Agent evaluation rubric | `docs/09-pre-implementation-design/evaluation/agent-evaluation-rubric.md` | required | Defines per-agent evaluation criteria |
| Final plan evaluation rubric | `docs/09-pre-implementation-design/evaluation/final-plan-evaluation-rubric.md` | required | Defines end-to-end output quality criteria |
| Regression acceptance matrix | `docs/09-pre-implementation-design/evaluation/regression-acceptance-matrix.md` | required | Defines pass/fail gates before implementation |

## 11. Observability and audit artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Observability handbook | `ai-agent-architecture-handbook/11-observability-errors-and-audit.md` | existing generic | Defines trace, audit and error rules |
| Error code registry | `docs/08-architecture-baseline/error-code-registry.md` | existing | Defines central error code registry |
| Run trace schema | `docs/09-pre-implementation-design/observability/run-trace-schema.md` | required | Defines trace/run/step IDs |
| Agent call log schema | `docs/09-pre-implementation-design/observability/agent-call-log-schema.md` | required | Defines agent execution logs |
| Tool call audit schema | `docs/09-pre-implementation-design/observability/tool-call-audit-schema.md` | required | Defines capability and provider audit events |
| User-facing error display policy | `docs/09-pre-implementation-design/observability/user-facing-error-display-policy.md` | required | Defines which errors are shown to users |
| Decision trace policy | `docs/09-pre-implementation-design/observability/decision-trace-policy.md` | required | Defines how plan decisions remain explainable |

## 12. Data model and store boundary artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Travel Knowledge Store boundary | `docs/08-architecture-baseline/travel-knowledge-store-boundary.md` | existing | Defines travel knowledge ownership |
| Data Source and Trust policy | `docs/01-architecture/data-source-trust-policy.md` | pre-freeze reference | Defines data trust starting point |
| Travel data entity map | `docs/09-pre-implementation-design/data/travel-data-entity-map.md` | required | Defines destination, POI, activity, hotel, route and plan entities |
| Store ownership matrix | `docs/09-pre-implementation-design/data/store-ownership-matrix.md` | required | Defines which store owns which data |
| Data lifecycle and freshness map | `docs/09-pre-implementation-design/data/data-lifecycle-freshness-map.md` | required | Defines stale, cached, verified and expired data semantics |
| Offline fixture data model | `docs/09-pre-implementation-design/data/offline-fixture-data-model.md` | required | Defines deterministic design/test data shape |

## 13. Prompt and response composition artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Prompt catalog | `docs/15-prompts/` | existing/pre-freeze | Holds prompt references |
| Prompt boundary policy | `docs/09-pre-implementation-design/prompts/prompt-boundary-policy.md` | required | Defines what prompts may and may not decide |
| Agent prompt contract map | `docs/09-pre-implementation-design/prompts/agent-prompt-contract-map.md` | required | Maps agent specs to prompt responsibilities |
| Final answer style guide | `docs/09-pre-implementation-design/prompts/final-answer-style-guide.md` | required | Defines user-facing travel plan tone and structure |
| Explanation and uncertainty policy | `docs/09-pre-implementation-design/prompts/explanation-and-uncertainty-policy.md` | required | Defines how uncertainty is shown to user |

## 14. Governance and decision record artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Governance README | `docs/00-governance/README.md` | existing | Defines governance foundation |
| Architecture terminology registry | `docs/08-architecture-baseline/architecture-terminology-registry.md` | existing | Defines canonical terms |
| Architecture dependency index | `docs/08-architecture-baseline/architecture-dependency-index.md` | existing | Defines document dependencies |
| Open design risk register | `docs/09-pre-implementation-design/governance/open-design-risk-register.md` | required | Tracks unresolved design risks |
| Deferred decision log | `docs/09-pre-implementation-design/governance/deferred-decision-log.md` | required | Tracks decisions intentionally deferred |
| Pre-code decision record | `docs/09-pre-implementation-design/governance/pre-code-decision-record.md` | required | Records final no-code-until-design-complete decision |

## 15. Pre-code freeze artifacts

| Artifact | Path | Status | Purpose |
|---|---|---|---|
| Pre-code freeze checklist | `docs/09-pre-implementation-design/10-pre-code-freeze-checklist.md` | required | Final gate before any coding/prototype discussion |
| Design completion report | `docs/09-pre-implementation-design/design-completion-report.md` | required | Summarizes all completed design artifacts |
| Implementation permission decision | `docs/09-pre-implementation-design/implementation-permission-decision.md` | required later | Explicitly decides whether coding may begin after design completion |

## Minimum artifact package before coding

At minimum, coding remains blocked until the following are complete:

```text
01-design-completion-assessment.md
02-system-blueprint-gap-analysis.md
03-required-design-artifact-map.md
04-agent-specification-workplan.md
05-contract-schema-workplan.md
06-fixture-and-evaluation-workplan.md
07-tool-and-capability-workplan.md
08-memory-and-privacy-workplan.md
09-ui-ux-flow-workplan.md
10-pre-code-freeze-checklist.md
```

In addition, the workplans must produce enough concrete artifact files for:

- first-phase agent specifications,
- communication schemas,
- memory disclosure,
- capability registry,
- hard constraint policy,
- golden scenarios,
- evaluation rubrics,
- observability and audit,
- final plan output format.

## Priority order

The next design work should proceed in this order:

1. agent specification workplan,
2. contract and schema workplan,
3. fixture and evaluation workplan,
4. tool and capability workplan,
5. memory and privacy workplan,
6. UX flow workplan,
7. pre-code freeze checklist.

## Design completion rule

```text
If a future implementation decision cannot point to a written artifact in this map, implementation is not allowed yet.
```

## Current status

```yaml
artifact_map_state: created
implementation_allowed: false
prototype_allowed: false
next_document: 04-agent-specification-workplan.md
```
