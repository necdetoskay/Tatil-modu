# TM-ORCH-001 — Travel Orchestrator Specification

| Alan | Değer |
|---|---|
| Orchestrator ID | TM-ORCH-001 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 |
| Tarih | 2026-08-27 |

## 1. Purpose

Travel Orchestrator, `TripRequest` ve workflow state'i kanonik capability graph'a dönüştürür; specialist agent'ları dependency sırasıyla çalıştırır, handoff'ları doğrular, retry/repair/recheck akışlarını yönetir ve yalnız Verification PASS sonrasında durable state advancement'a izin verir.

```text
TripRequest
→ resolve registry/policies
→ build capability graph
→ assemble minimal agent contexts
→ execute specialist nodes
→ validate handoffs
→ verification / targeted repair loops
→ verified state gate
→ explanation / final composition
→ terminal orchestration result
```

Orchestrator domain specialist değildir.

## 2. Core authority invariant

Normal external-world access:

```text
Orchestrator
→ Specialist Agent
→ ToolGateway
→ Domain Tool
```

Forbidden:

```text
Orchestrator → Places / Routes / Weather / Accommodation / Review / Price / Web domain tool
```

Direct domain-tool call = authority violation.

## 3. Inputs

- `TripRequest` ref
- current workflow/trip working-state refs
- AgentRegistry snapshot
- orchestration policy snapshot
- **harness policy/baseline snapshot** (`harnessPolicySnapshotId`)
- run budget/timeout/quota policy
- product feature flags/preferences
- optional prior workflow/checkpoint ref
- `contextManifestId` for orchestrator-level non-domain context

Harness policy snapshot is required so graph/handoff/context/state-gate behavior can be replayed against the exact orchestration/harness rules used by that run.

## 4. Output

Ana çıktı: `OrchestrationResult.v1`.

```yaml
orchestrationRunId: string
workflowId: string
tripRequestRef: string
registrySnapshotId: string
orchestrationPolicySnapshotId: string
harnessPolicySnapshotId: string
initialGraphHash: string
finalGraphHash: string
graphRevisions: []
nodeSelections: []
nodeRuns: []
handoffs: []
retryEvents: []
repairLoops: []
contextManifestRefs: []
failureAttributions: []
budgetUsage: object
authorityViolations: []
stateTransitions: []
stateCommitAttempts: []
finalVerificationRef: string|null
finalPlanRef: string|null
finalStatus: COMPLETED | BLOCKED | FAILED
```

## 5. Capability graph

Each node binds a specialist contract version/hash.

```yaml
CapabilityNode:
  nodeId: string
  agentId: string
  contractVersion: string
  contractHash: string
  dependencyNodeRefs: []
  requiredInputRefs: []
  conditionRefs: []
  status: PENDING | READY | RUNNING | SUCCEEDED | FAILED | BLOCKED | SKIPPED | DEFERRED
```

Graph must be acyclic unless an explicit bounded repair-loop edge type is used outside the static dependency DAG.

## 6. Node selection trace

Every potential/conditional node gets a disposition:
- `SELECTED`
- `SKIPPED`
- `DEFERRED`

with `reasonCodes[] + policyRefs[] + featureRefs[]`.

This makes it possible to answer:

> Why did Weather run? Why was Review skipped? Why did event verification appear only for this trip?

## 7. Graph revision lineage

Initial graph is frozen by hash. Runtime repair/recheck may add or reactivate nodes, but every graph change creates a revision:

```yaml
GraphRevision:
  revision: integer
  priorGraphHash: string
  newGraphHash: string
  reasonCode: string
  triggerRefs: []
  addedNodeRefs: []
  removedNodeRefs: []
  changedEdgeRefs: []
```

Silent graph mutation is forbidden.

## 8. Specialist execution

Each selected node executes through Agent Contract Harness:

```text
node READY
→ ContractLoader
→ ContextAssembler
→ FROZEN ContextManifest
→ ExecutionAdapter
→ ToolGateway if needed
→ EvaluatorPipeline
→ node result
→ validated handoff
```

Orchestrator cannot bypass Agent Harness and call the underlying model/tool directly for domain work.

## 9. Context lifecycle

Each node receives only minimal task context.

Orchestrator must not dump whole workflow state into every agent.

Rules:
- each attempt has a `contextManifestRef`,
- frozen context cannot mutate during attempt,
- retry with changed context creates a new manifest,
- excluded/redacted context remains traceable in ContextManifest metadata,
- agent sees only authority-permitted context.

## 10. Handoff validation

Before downstream node becomes READY:
- producer succeeded,
- output schema valid,
- expected object type/version valid,
- required refs exist,
- producer/consumer snapshot compatibility valid,
- handoff authority/policy valid.

Every handoff carries at least:

```yaml
producerNodeRunRef: string
producerAgentId: string
consumerNodeRef: string
consumerAgentId: string
objectRef: string
objectType: string
objectVersion: string
objectHash: string
schemaRef: string
```

Invalid handoff cannot reach downstream.

## 11. Parallel execution

Independent branches may run concurrently only when dependency and state rules permit.

Typical safe branch after Destination Research:
- TM-AG-004 Place Intelligence
- TM-AG-005 Accommodation
- TM-AG-006 Food & Local Taste

Outputs are immutable/versioned refs; join occurs only after all required dependencies succeed or are policy-validly skipped.

## 12. Retry policy

Retry is bounded and failure-class aware.

Canonical failure classes come from Harness FailureAttributor:
- CONTRACT
- SCHEMA
- DETERMINISTIC_RULE
- CONTEXT_ASSEMBLY / CONTEXT_SCOPE
- PROMPT / MODEL
- TOOL_SELECTION / TOOL_POLICY / TOOL_PROVIDER / TOOL_ADAPTER
- NORMALIZATION
- AUTHORITY
- HANDOFF
- ORCHESTRATION
- VERIFICATION
- EVALUATOR
- STATE_COMMIT
- UNKNOWN

Blind retry is forbidden.

Examples:
- transient provider failure → retry may be allowed,
- changed context → new ContextManifest,
- schema-invalid deterministic output → targeted upstream repair/fix path, not blind same retry,
- authority violation → no retry that repeats forbidden action,
- hard policy conflict → block/clarify/repair route.

Retry lineage binds the prior node run, next attempt, failure attribution and any new context manifest.

## 13. Workflow budgets

Orchestrator enforces configurable:
- max wall-clock/timeouts,
- max attempts per node,
- max repair loops,
- tool-call budget,
- provider/API cost budget,
- model token/cost budget.

Budget exhaustion cannot silently skip a mandatory verification or hard-constraint owner. Required stage unavailable → `BLOCKED/FAILED` according to policy.

## 14. Verification loop

Initial planning path:

```text
TM-AG-009 Route Planner
→ TM-AG-010 Budget
→ TM-AG-014 Verification
```

If Verification = `REPAIR`:
1. required owner rechecks run if needed,
2. TM-AG-013 mutates itinerary only where required,
3. affected route/budget/weather/official facts rechecked,
4. Verification reruns,
5. loop bounded by repair-loop policy.

`AdaptiveRepairResult.REPAIRED` is not final verified state.

## 15. Verified state gate

Durable canonical trip state advances only when:

```text
VerificationResult.status = PASS
AND verification binds candidate snapshot hash
```

Otherwise commit is blocked.

State commit attempt records:
- candidate state ref,
- candidate snapshot hash,
- verification ref,
- decision `COMMITTED | BLOCKED | REJECTED`,
- reason codes.

## 16. Explanation and composition path

Only after Verification PASS:

```text
TM-AG-015 Explanation
→ TM-AG-016 Final Composer
```

If Explanation/Final Composer structural validation fails:
- retry/render repair may occur within their own contract,
- verified domain snapshot is not mutated,
- domain specialists are not rerun unless verified snapshot itself changes.

## 17. Issue #49 — multi-city journey routing

If journey enrichment requested/enabled:

```text
TM-AG-008 corridor discovery
→ TM-AG-003 corridor-city value research
→ user/policy stop selection context
→ TM-AG-004/005/006 enrichment for selected stops as required
→ TM-AG-008 stop-sequence recalculation
→ TM-AG-009 JourneyPlan/DailyPlan
```

Orchestrator chooses capability path; it does not decide tourism value or stop role itself.

## 18. Issue #50 — knowledge-first routing

Orchestrator may route based on **knowledge availability/freshness metadata**, not domain truth:
- `KNOWLEDGE_HIT`
- `TARGETED_REFRESH`
- `FULL_DISCOVERY`

Examples:
- known province/entity/source refs reduce discovery work,
- stale V2/V3 facts route to owner-agent refresh,
- knowledge store never bypasses Verification.

Background TM-BG-001 subsystem is separate lifecycle; runtime Orchestrator does not masquerade as background curator.

## 19. Issue #51 — date/event/season routing

Trip date/preferences may select conditional capabilities:
- seasonal context via Destination/Place/Weather flows,
- exact event occurrence verification via TM-AG-011,
- experiential crowd signals via TM-AG-012 when material,
- route/traffic facts via TM-AG-008,
- date-aware schedule via TM-AG-009.

`SEEK | AVOID | NEUTRAL` affects which evidence/capabilities are required but Orchestrator does not decide whether event is good/bad.

## 20. Agent-to-agent boundary

Specialists do not directly invoke each other.

All handoffs are mediated/validated through OrchestrationRunner using structured refs.

## 21. Failure attribution / RIVE

On failure:

```text
workflow
→ node/handoff
→ harness component
→ contract/rule/adapter
→ minimal reproducer
```

Orchestration output keeps failure attribution refs so RIVE descent can start without reconstructing the run manually.

## 22. Terminal statuses

### COMPLETED
- final Verification PASS exists,
- allowed state commit succeeded or policy-valid ephemeral completion chosen,
- FinalTravelPlan validation succeeded.

### BLOCKED
- required user input/evidence/provider/cost policy prevents safe completion,
- no unsupported fallback used.

### FAILED
- non-recoverable workflow/harness/integrity failure.

## 23. Failure modes

- `ORCHESTRATOR_DOMAIN_TOOL_LEAKAGE`
- `INVALID_HANDOFF_FORWARDED`
- `DEPENDENCY_ORDER_VIOLATION`
- `CONTEXT_SCOPE_LEAKAGE`
- `FROZEN_CONTEXT_MUTATED`
- `BLIND_RETRY`
- `UNBOUNDED_REPAIR_LOOP`
- `SILENT_GRAPH_MUTATION`
- `MANDATORY_STAGE_SKIPPED_FOR_BUDGET`
- `UNVERIFIED_STATE_COMMIT`
- `SPECIALIST_AUTHORITY_TAKEN_OVER`
- `FINAL_COMPOSITION_BEFORE_PASS`
- `MISSING_FAILURE_ATTRIBUTION`
- `MISSING_ORCHESTRATION_PROVENANCE`

## 24. Harness binding

- R0 graph/registry/contract schemas
- R1 dependency/handoff/retry/state-gate deterministic rules
- R2 full fixture orchestration
- R3 Agent Harness/ToolGateway integration
- R4 workflow quality only after structural gates
- R5 provider/context/conflict/budget/cascade adversarial cases
- R6 direct domain-tool/specialist-ownership/context leakage
- R7 controlled live E2E
- R8 workflow regressions

## 25. Golden fixture coverage

```yaml
behavior_cases: 20
authority_cases: 9
tool_policy_cases: 9
context_lifecycle_cases: 6
provenance_cases: 9
journey_issue_49_cases: 4
knowledge_issue_50_cases: 5
event_season_issue_51_cases: 5
state_gate_cases: 5
```

Fixture-driven contract gaps closed:
- orchestration runtime policy/baseline provenance → `harnessPolicySnapshotId`
- handoff lineage → `producerAgentId + consumerAgentId + objectType + objectVersion + objectHash`

## 26. Current status

```yaml
orchestrator_spec_status: golden_v1
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
all_16_specialist_packages_required: true
all_16_specialist_packages_ready: true
cross_contract_reconciliation_audit: pending
runtime_tests: pending
```
