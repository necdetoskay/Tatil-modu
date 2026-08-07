# 05 — Orchestration Model

**Document type:** Generic architecture handbook section  
**Scope:** Generic AI agent systems  
**Document status:** Draft  
**Applies to:** Multi-agent, planner-driven, tool-using AI systems

## Purpose

This section defines how workflow coordination should be handled in an AI agent system.

The core rule is simple:

```text
Agents do expert work.
Planners make bounded planning decisions.
Modules produce domain assessments.
The Orchestrator owns workflow coordination.
```

An agentic system should not allow every agent to call every other agent freely. Direct agent-to-agent calls create hidden dependencies, circular reasoning, unbounded cost, privacy leakage and hard-to-debug behavior.

## Canonical orchestration principle

The Orchestrator is the runtime component that receives a user goal, decomposes the work, calls the right agents/tools/modules in the right order, validates their outputs and assembles a traceable result.

The Orchestrator owns:

- workflow graph selection,
- task decomposition,
- dependency ordering,
- contract routing,
- retry and fallback strategy,
- partial failure handling,
- privacy disclosure scope,
- evaluation gate sequencing,
- audit trail and run trace,
- final handoff to user-facing composition.

The Orchestrator does not own every domain decision. It delegates bounded expert decisions to agents, planners and modules through explicit contracts.

## What the Orchestrator is not

The Orchestrator is not:

- a single giant prompt,
- a replacement for all agents,
- a hidden memory store,
- a domain knowledge database,
- a provider adapter,
- a final user-facing copywriter,
- a place where all business rules are casually mixed together.

If the Orchestrator becomes the only intelligent component, the system has silently collapsed back into a monolithic prompt.

## Generic layered flow

```text
User Request
        ↓
Input Normalization
        ↓
Orchestrator Run Plan
        ↓
Policy / Safety / Constraint Pre-check
        ↓
Agent / Planner / Module Calls
        ↓
Verification / Evidence / Confidence Gates
        ↓
Plan Assembly / Decision Reconciliation
        ↓
Final Composition
        ↓
Audit / Trace / Evaluation
```

This flow can be implemented synchronously, asynchronously, event-driven or batch-based. The architecture rule is independent of framework choice.

## Orchestration run plan

Before calling expert components, the Orchestrator should create a run plan.

A run plan should include at minimum:

| Field | Purpose |
|---|---|
| `run_id` | Unique execution identifier |
| `user_goal_summary` | Short description of the requested outcome |
| `workflow_type` | The selected workflow pattern |
| `required_components` | Agents, planners, modules or tools needed |
| `dependency_order` | Which components must run before others |
| `hard_constraints` | Constraints that cannot be relaxed |
| `privacy_scope` | Minimum user/memory data disclosure required |
| `verification_needs` | Claims or facts that require verification |
| `fallback_strategy` | What to do when a dependency fails |
| `evaluation_gates` | Gates that must pass before final output |

The run plan is not necessarily user-visible, but it should be auditable.

## Workflow patterns

### 1. Sequential pipeline

Use when each step depends on the previous step.

```text
Input Agent → Discovery Agent → Planner → Final Composer
```

Best for workflows where early normalization affects every later decision.

### 2. Parallel expert fan-out

Use when multiple expert components can evaluate independently.

```text
                 → Budget Module
User Goal → Orchestrator → Route Module
                 → Risk Module
                 → Experience Module
```

The Orchestrator later reconciles the outputs.

### 3. Planner-centered loop

Use when a planner needs multiple assessment signals before selecting an option.

```text
Candidate Options
        ↓
Assessment Modules
        ↓
Planner Decision
        ↓
Verification Gate
        ↓
Accepted / Alternative / Rejected
```

### 4. Verification-first gate

Use when unverified facts could cause unsafe, illegal, costly or misleading output.

```text
Claim Candidate
        ↓
Verification / Evidence Check
        ↓
Planning Allowed or Blocked
```

### 5. Human clarification gate

Use when the system cannot safely infer a required input.

```text
Missing Critical Input
        ↓
Clarification Request
        ↓
Updated Run Plan
```

Clarification should be reserved for decisions that materially affect correctness or safety. Minor gaps can use explicit assumptions.

## Agent-to-agent communication rule

Agents should not directly call each other by default.

Preferred pattern:

```text
Agent A → Contract Output → Orchestrator → Contract Input → Agent B
```

This allows the system to:

- validate outputs before reuse,
- filter sensitive memory before disclosure,
- log each handoff,
- apply retry/fallback policy,
- prevent circular calls,
- keep component ownership clear.

Direct agent-to-agent calls may be allowed only when explicitly modeled as a sub-orchestrated workflow with its own contract, limits, trace and evaluation gates.

## Orchestration state

The Orchestrator should track execution state using domain-specific lifecycle fields, not a vague generic `status` field.

Recommended states:

| Field | Example values |
|---|---|
| `execution_state` | `queued`, `running`, `succeeded`, `failed`, `cancelled`, `blocked` |
| `decision_state` | `accepted`, `alternative`, `deferred`, `requires_user_input`, `rejected` |
| `verification_status` | `verified`, `likely`, `uncertain`, `rejected`, `stale` |
| `evidence_status` | `fresh`, `usable`, `weak`, `conflicting`, `expired`, `missing` |

The Orchestrator may aggregate these states, but it should not redefine their meaning.

## Failure handling

An orchestrated workflow must distinguish between different failure types.

| Failure type | Example | Expected response |
|---|---|---|
| Contract failure | Agent output schema invalid | Retry or block component result |
| Tool failure | Provider timeout | Retry, fallback provider or use cached/fixture mode |
| Verification failure | Claim cannot be verified | Downgrade, flag uncertainty or reject decision |
| Hard constraint failure | Candidate violates non-negotiable rule | Reject candidate, do not compensate with score |
| Privacy failure | Agent requested too much memory | Deny disclosure and revise run plan |
| Runtime failure | Orchestrator step crashed | Mark execution failed and preserve trace |

Failure handling should be deterministic before asking an LLM to improvise.

## Decision reconciliation

When expert outputs conflict, the Orchestrator should not simply average the scores.

Recommended precedence:

```text
Safety / Policy
        ↓
Hard Constraints
        ↓
Verification / Evidence
        ↓
User Preferences
        ↓
Domain Quality
        ↓
Cost / Latency / Convenience
```

A high domain score must not compensate for a safety, policy or hard-constraint failure.

## Observability and audit

Each orchestrated run should produce a trace that can answer:

- what was requested,
- which workflow was selected,
- which components were called,
- what each component received,
- what each component returned,
- what was verified,
- what failed or was downgraded,
- which assumptions were made,
- why the final decision was selected.

This trace does not have to expose private chain-of-thought. It should expose structured decision evidence, contract outputs and audit metadata.

## Tatil Modu reference example

Generic rule:

```text
Hotel Agent does not directly call Activity Agent.
```

Tatil Modu mapping:

```text
User travel request
        ↓
Travel Orchestrator
        ↓
Trip Profile / Policy / Preference extraction
        ↓
Destination, Hotel, Activity, Route and Budget components
        ↓
Verification and Public Authority gates
        ↓
Day Planner / Final Plan Composer
```

The Travel Orchestrator decides which components run and in what order. Expert components return structured outputs; they do not secretly coordinate through free-form messages.

## Checklist

Before implementing an Orchestrator, confirm:

- [ ] The orchestrator has a documented workflow responsibility.
- [ ] Agents do not directly call each other by default.
- [ ] Every component handoff has a versioned contract.
- [ ] Privacy disclosure is decided before component calls.
- [ ] Hard constraints are checked before optimization.
- [ ] Verification gates exist for unstable or high-impact facts.
- [ ] Failure categories are mapped to deterministic responses.
- [ ] Run traces can be inspected without exposing private reasoning.
- [ ] Evaluation gates are ordered by precedence, not just score.
