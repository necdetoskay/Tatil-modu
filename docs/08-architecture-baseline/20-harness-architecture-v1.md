# Tatil Modu — Harness Architecture v1

**Document type:** Canonical architecture decision and implementation baseline addendum  
**Technical name:** `tatil_modu_harness`  
**Version:** 1.0  
**Status:** Canonical candidate / implementation gate  
**Issue:** #35  

## 1. Purpose

This document updates the Tatil Modu execution architecture using patterns promoted after the original architecture baseline was written. It keeps the existing contract-first, ACP, evidence, verification and provider-independent capability design, but makes the harness a first-class production control-plane rather than treating a harness only as a test utility.

This document supersedes conflicting orchestration/runtime assumptions in `17-end-to-end-execution-pipeline.md` and `19-implementation-blueprint.md`. Their domain flow remains valid unless explicitly changed here.

## 2. Adopted external standards

Tatil Modu adopts the following canonical Engineering Standards as project requirements:

- `STD-AI-003` — Agent Capability & Tool Boundary Standard
- `STD-AI-004` — AI Memory & Context Standard
- `STD-AI-010` — Agent Harness & Capability Qualification Standard
- `STD-TEST-005` — Independent Behavioral Verification Standard

The project continues to use its own ACP, evidence, verification and test standards where they are stricter or domain-specific.

## 3. DeepSeek Harness decision

DeepSeek Harness is **not** adopted as the Tatil Modu production runtime or orchestrator dependency in v1.

Status:

`WATCH + PATTERN ADOPTION`

Adopted patterns:

1. plugin-oriented harness composition
2. explicit context/session lifecycle
3. system-level provenance at observable boundaries
4. harness-quality evaluation separated from base-model evaluation

A future direct dependency requires an independent qualification decision under `STD-AI-010`, pinned source/runtime provenance, representative task benchmarks, compatibility tests, rollback validation and security review.

## 4. Core architectural decision

The production execution boundary is:

```text
User / API
    |
    v
Request Gateway
    |
    v
+--------------------------------------------------+
|                TATIL MODU HARNESS                |
|                                                  |
| Run Manager                                      |
| Workflow Engine / Coordinator                    |
| Deterministic Context Builder                    |
| Task-aware Harness Provisioner                   |
| Capability Registry + Qualification Gate         |
| Agent Runner                                     |
| Model Router                                     |
| State / Checkpoint Store                         |
| Evidence / Provenance Store                      |
| Retry / Recovery / Fallback                      |
| Observability                                    |
+----------------------+---------------------------+
                       |
          +------------+-------------+
          |                          |
          v                          v
       Agents                    Platforms
          |                          |
          +------------+-------------+
                       v
              Structured Handoffs
                       |
                       v
             Independent Verifiers
                       |
                       v
                Final Composer
```

The **Orchestrator is not the whole harness**. It is the workflow coordination function inside the harness.

## 5. Harness responsibilities

### 5.1 Run Manager

Owns:

- `run_id`, `request_id`, `trace_id`, `trip_id`
- lifecycle state
- cancellation
- resumability
- run budget
- execution mode (`fixture`, `hybrid`, `live`)

Does not own domain planning decisions.

### 5.2 Workflow Engine

Runs versioned workflow artifacts.

It decides:

- next executable step
- dependency readiness
- parallelizable steps
- retry/recovery transitions
- bounded continuation after verification

It does not invent travel recommendations.

### 5.3 Context Builder

Context assembly must be deterministic where possible.

Responsibilities:

- select the minimum necessary data for a task
- enforce source authority precedence
- preserve evidence anchors and provenance
- exclude stale or unauthorized context
- enforce token/context budgets
- distinguish domain truth from derived/conversation state

### 5.4 Harness Provisioner

Selects the smallest task-appropriate bundle of:

- context classes
- capabilities
- model tier
- permissions
- verification policy
- token/cost budget

Provision may expand only through an explicit escalation rule. Capability escalation must not silently become permission escalation.

### 5.5 Capability Registry

The existing provider-independent capability boundary remains canonical.

Each production-capable provider/extension adds qualification metadata and follows:

`DISCOVERED -> REVIEWED -> QUALIFIED -> APPROVED -> ACTIVE -> DEPRECATED/REVOKED`

Only `ACTIVE` capability implementations may be selected in production mode.

### 5.6 Agent Runner

Executes one bounded agent task using:

- versioned input/output contract
- assigned harness profile
- allowed tools only
- selected model alias
- retry/fallback policy
- trace lineage

Agents cannot call arbitrary tools or other agents directly.

### 5.7 State / Checkpoint Store

Persists structured execution progress, not hidden model reasoning.

Every workflow checkpoint may record:

- step id/version
- input references
- context references
- agent/model identity
- capability calls
- output reference
- verification state
- retry/recovery state
- duration/cost
- classified result

### 5.8 Evidence / Provenance Store

Records observable system-level provenance:

`input sources -> normalized facts -> selected context -> policy/config -> model/tool execution -> output -> downstream effect`

Do not store or reconstruct private chain-of-thought. Store decisions, reason codes, evidence references and system-visible transitions.

### 5.9 Independent Verification

The producer agent or planner cannot be the sole authority declaring a critical journey successful.

Independent deterministic or isolated verification paths must cover applicable:

- schema/contract validity
- hard constraints
- route/time consistency
- evidence requirements
- tool/capability policy
- schedule feasibility
- family suitability
- final behavioral journey

## 6. Memory classes

Tatil Modu adopts M0-M5:

- **M0 Request Context** — transient user request/run context
- **M1 Execution Scratch State** — intermediate structured execution state; not domain truth
- **M2 Retrieval Context** — retrieved/indexed representation derived from sources
- **M3 Domain Memory** — canonical business facts and explicitly persisted user/trip data
- **M4 Derived AI Memory** — persistent AI-derived annotations/candidates with lineage, evidence, confidence and staleness policy
- **M5 Conversation Memory** — continuity context; never authoritative domain truth by default

Read precedence:

`M3 domain truth -> approved source material -> M2 retrieval -> M4 derived memory -> M1/M0/M5 execution/conversation context`

Sensitive preferences remain session-scoped unless explicitly approved for persistence.

## 7. Initial harness profiles

### `intake-minimal`

Context: M0 only, plus explicitly disclosed allowed M5 fields.  
Capabilities: none.  
Goal: normalize request without planning leakage.

### `constraint-policy`

Context: normalized request + allowed explicit preferences.  
Capabilities: none.  
Goal: deterministic hard/soft/conditional classification.

### `destination-research`

Context: request summary, family constraints, radius policy.  
Capabilities: `place_discovery` and evidence/authority lookup when required.  
No hotel/activity final selection.

### `family-suitability`

Context: family constraints + one candidate at a time.  
Capabilities: no broad discovery; only approved validation inputs.  
Goal: family fit and fatigue/safety evaluation.

### `route-logistics`

Context: origin, destination, family constraints, transport mode, relevant schedule state.  
Capabilities: `route_lookup`, `parking_lookup`, evidence lookup as required.  
No hotel/activity discovery.

### `activity-research`

Context: selected area/day block/family constraints.  
Capabilities: `activity_lookup`, `opening_hours_lookup`, `parking_lookup`, `beach_attribute_lookup` when applicable, evidence lookup.

### `accommodation-research`

Context: selected base area, dates, family constraints, route anchors.  
Capabilities: `accommodation_lookup`, `price_lookup`, `parking_lookup`, evidence lookup.

### `verification-strict`

Context: immutable references to candidate plan + evidence + contracts.  
Capabilities: validation/evidence reads only.  
Must not reuse producer self-assessment as verification evidence.

## 8. Workflow-as-artifact

Repeated multi-step planning procedures are versioned workflow artifacts, not prompt prose.

Initial canonical workflow:

`family_trip_planning.v1`

Expected high-level steps:

1. request intake
2. constraint policy
3. destination discovery
4. family suitability
5. route logistics
6. destination selection
7. activity discovery
8. accommodation discovery
9. day-plan construction
10. return-route baseline
11. return-route opportunity discovery
12. valuable-detour evaluation
13. evidence verification
14. constraint/schedule verification
15. final composition
16. independent behavioral verification

Each step declares:

- input contract
- output contract
- dependencies
- harness profile
- allowed capabilities
- failure semantics
- retry semantics
- resumability
- verification gate

## 9. Golden Scenario 001

`Kocaeli -> Bursa-area, 2-day family trip` is the first representative harness task.

The domain acceptance checklist remains authoritative and is extended with harness checks:

- workflow id/version correct
- harness profile correct per step
- minimum necessary context supplied
- forbidden context absent
- only allowed capabilities exposed
- unqualified capabilities cannot become active
- model alias/version traceable
- tool/provider lineage traceable
- retries and fallbacks observable
- checkpoints resumable
- evidence references preserved
- producer and verifier separated
- harness failure and model/agent failure classified separately

Result classes remain:

- PASS
- FAIL
- PARTIAL
- NOT_IMPLEMENTED
- TOOL_FAILURE
- NO_DATA
- LOW_CONFIDENCE
- NOT_APPLICABLE

Add harness-specific failure classes in diagnostics, for example:

- WORKFLOW_SELECTION_ERROR
- HARNESS_PROFILE_VIOLATION
- CONTEXT_SCOPE_VIOLATION
- UNQUALIFIED_CAPABILITY
- CAPABILITY_POLICY_VIOLATION
- PROVENANCE_INCOMPLETE
- VERIFIER_NOT_INDEPENDENT

## 10. Evaluation separation

Evaluation reports must distinguish:

### Model quality

Same task/context/harness, compare model behavior.

### Harness quality

Measure context selection, tool provisioning, workflow compliance, retries, provenance, cost/latency and recovery independently from final prose quality.

### System quality

End-to-end user outcome including feasibility, correctness, family value and behavioral acceptance.

A high model score cannot compensate for a harness hard-gate violation.

## 11. Capability qualification evidence

Representative task qualification should record when applicable:

- success/completion rate
- deterministic verification pass rate
- latency
- token/cost consumption
- tool-call count
- retry/recovery count
- context growth
- failure classes
- security/permission findings
- human intervention count

Provider or harness version changes require requalification proportional to risk.

## 12. Implementation sequence

The previous implementation blueprint is amended as follows:

1. contracts and existing H0/H1 foundations
2. Golden Scenario 001 first-slice baseline
3. **Harness Architecture v1**
4. workflow/checkpoint contracts
5. harness profile + context/provenance contracts
6. capability qualification metadata/lifecycle
7. Golden Scenario migration to harness-aware checks
8. Route Logistics under the harness
9. subsequent planner/research steps
10. live provider qualification
11. full E2E and independent behavioral verification

Do not implement a large monolithic orchestrator before steps 4-7 are green.

## 13. Repository direction

Target package responsibilities:

```text
packages/
  contracts/        domain and handoff contracts
  agents/           bounded agent logic
  capabilities/     capability boundary + providers/qualification
  harness/          run manager, provisioning, context, checkpoint coordination
  orchestrator/     workflow coordinator/state-machine implementation
  memory/           memory gateway/classes/policies
  verification/     independent verification contracts/engines
  observability/    trace/provenance instrumentation
  test-fixtures/    deterministic scenario inputs
  test-harness/     test execution and evaluation tooling
```

`packages/harness` and `packages/test-harness` are distinct. The first is production execution infrastructure; the second evaluates the system.

## 14. Non-goals for v1

- no direct DeepSeek Harness runtime adoption
- no self-modifying production harness
- no automatic prompt/runtime mutation based only on self-evaluation
- no agent-to-agent free-form chat
- no capability permission self-escalation
- no hidden reasoning persistence

## 15. Exit gate before Route Logistics implementation

Route Logistics implementation may proceed when:

- this architecture is merged
- workflow/checkpoint contract exists
- `route-logistics` harness profile is defined in code/contract
- context scope is enforceable
- capability qualification status is representable
- trace/provenance fields are representable
- Golden Scenario can report harness failures separately from domain failures

Until then Route Logistics remains `NOT_IMPLEMENTED` in Golden Scenario 001.
