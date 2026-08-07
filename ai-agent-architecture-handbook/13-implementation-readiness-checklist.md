# 13 — Implementation Readiness Checklist

> Generic gate for deciding whether an AI agent system is ready to move from architecture into implementation.

## Canonical principle

Implementation should not begin because the idea feels clear.

Implementation begins when the system has enough architectural certainty to prevent uncontrolled agent growth, hidden privacy leaks, untestable behavior, provider lock-in and fragile prompt-only logic.

```text
No implementation before readiness.
No agent before specification.
No workflow before orchestration.
No tool use before capability policy.
No recommendation before evidence and constraint gates.
```

## What this checklist is for

This checklist answers one question:

```text
Can we start implementing this agentic system safely and coherently?
```

It is not a product launch checklist.

It is a pre-implementation architecture gate.

## Readiness states

Use the following states:

```text
readiness_state: blocked | partial | ready_for_prototype | ready_for_implementation
```

| State | Meaning |
|---|---|
| `blocked` | Architecture is too ambiguous to implement safely |
| `partial` | Some areas are ready, but important gaps remain |
| `ready_for_prototype` | A controlled prototype may be implemented with mock tools and fixtures |
| `ready_for_implementation` | Agent contracts, gates, fixtures and operational rules are ready enough for real implementation |

## Gate 1 — Product and user goal clarity

The system must define:

- primary user goal,
- target users,
- success criteria,
- non-goals,
- unacceptable outcomes,
- example scenarios,
- first reference implementation.

A system is not ready if the expected output changes every time the problem is described.

## Gate 2 — Component taxonomy clarity

The system must classify each component as one of:

- agent,
- planner,
- module,
- platform,
- service,
- store,
- registry,
- gateway,
- adapter,
- evaluator.

Do not implement a component whose type is unclear.

## Gate 3 — Orchestration model readiness

The system must define:

- who owns workflow coordination,
- which component may call which component,
- whether agents can run sequentially or in parallel,
- how retries work,
- how partial failures are handled,
- how decisions are reconciled,
- how the final response is composed.

Minimum rule:

```text
Expert agents do not call each other directly.
The Orchestrator owns workflow coordination.
```

## Gate 4 — Agent specification readiness

Every first-phase agent must have a written specification containing:

- purpose,
- scope,
- non-goals,
- input contract,
- output contract,
- allowed tools,
- memory disclosure package,
- evidence requirements,
- policy / hard constraint rules,
- failure behavior,
- evaluation fixtures,
- observability requirements,
- acceptance criteria.

No agent should be implemented from a vague prompt alone.

## Gate 5 — Contract and schema readiness

The system must define:

- canonical request envelope,
- canonical response envelope,
- error response format,
- evidence envelope,
- confidence representation,
- lifecycle fields,
- versioning rules,
- backward compatibility expectations.

If contracts are not stable enough, begin with fixtures and mocks before real provider integration.

## Gate 6 — Memory and privacy readiness

The system must define:

- what memory types exist,
- who owns canonical memory,
- what agents are allowed to see,
- disclosure package shape,
- redaction rules,
- sensitive data categories,
- consent requirements,
- memory write candidate workflow,
- audit requirements.

Minimum rule:

```text
Agents do not read or write canonical memory directly.
```

## Gate 7 — Tool and capability readiness

The system must define:

- capability registry,
- tool gateway responsibilities,
- provider adapter boundaries,
- permission policy,
- online/offline/mock modes,
- timeout and retry policy,
- cache and freshness rules,
- error mapping,
- prompt injection handling,
- cost and rate limit controls.

Minimum rule:

```text
Agents request capabilities.
Adapters call providers.
```

## Gate 8 — Evidence, verification and confidence readiness

The system must define:

- what counts as evidence,
- source metadata,
- retrieval and publication timestamps,
- verification statuses,
- confidence levels,
- conflict handling,
- freshness policy,
- user input evidence handling,
- decision impact levels.

A recommendation without evidence metadata is not implementation-ready.

## Gate 9 — Policy, hard constraints and safety readiness

The system must define:

- safety gates,
- legal/regulatory/public-authority constraints,
- user hard constraints,
- strong preferences,
- soft preferences,
- candidate rejection model,
- planner override rules,
- user-facing explanation for rejected candidates.

Minimum rule:

```text
Hard constraints are checked before ranking and optimization.
```

## Gate 10 — Evaluation readiness

The system must define:

- golden scenarios,
- unit fixtures,
- integration fixtures,
- adversarial fixtures,
- regression fixtures,
- evaluation gates,
- rubric scoring rules,
- pass/fail thresholds,
- structured evaluation report format.

A system is not ready if it can only be tested manually by reading one output.

## Gate 11 — Observability, errors and audit readiness

The system must define:

- trace IDs,
- run IDs,
- step IDs,
- agent call logs,
- tool call logs,
- decision traces,
- error code registry,
- severity levels,
- user display policy,
- redaction policy,
- audit event schema,
- operational metrics.

Minimum rule:

```text
Important decisions must be explainable after the run finishes.
```

## Gate 12 — Prototype boundary

Before production implementation, define a prototype boundary:

- which workflow will be prototyped first,
- which agents are included,
- which tools are mocked,
- which fixtures are used,
- what success means,
- what will intentionally not be built yet.

Prototype should validate architecture, not become uncontrolled production code.

## Gate 13 — Implementation sequencing

Implementation order should be:

1. contracts and schemas,
2. fixtures and mock providers,
3. orchestration skeleton,
4. one agent specification,
5. one agent implementation,
6. evaluation harness,
7. tool gateway integration,
8. memory disclosure integration,
9. evidence / verification integration,
10. final response composer,
11. observability and audit,
12. regression suite.

Avoid starting with UI polish or provider integrations before contracts and fixtures exist.

## Gate 14 — Documentation readiness

Before implementation, the repository should contain:

- architecture overview,
- component taxonomy,
- orchestration model,
- agent specification template,
- first agent specs,
- contract specs,
- fixture plan,
- error code registry,
- evaluation checklist,
- implementation backlog.

## Gate 15 — Decision record readiness

Major unresolved choices must be either:

- decided,
- explicitly deferred,
- tracked as known risk,
- blocked with owner and next action.

Hidden uncertainty creates implementation debt.

## Readiness checklist table

| Gate | Status | Required before implementation |
|---|---|---|
| Product goal clarity | pending | Product goal, non-goals, success criteria |
| Component taxonomy | pending | Agent/planner/module/platform/store/registry/gateway/adapter split |
| Orchestration model | pending | Workflow owner, routing, retries, reconciliation |
| Agent specifications | pending | Written specs for first-phase agents |
| Contracts and schemas | pending | Request/response/error/evidence/confidence envelopes |
| Memory and privacy | pending | Disclosure package and no-direct-memory-write rule |
| Tools and capabilities | pending | Capability registry, gateway, adapters, mock mode |
| Evidence and confidence | pending | Evidence metadata, verification, conflict handling |
| Policy and safety | pending | Hard constraint gate and candidate rejection model |
| Evaluation | pending | Fixtures, golden scenarios, regression gates |
| Observability and audit | pending | Trace IDs, error codes, audit events |
| Prototype boundary | pending | Controlled first implementation slice |
| Implementation sequencing | pending | Contracts/fixtures before UI/provider polish |
| Documentation | pending | Required architecture docs exist |
| Decision records | pending | Open risks tracked |

## Tatil Modu reference example

For Tatil Modu, readiness means:

- Travel Orchestrator scope is defined,
- first-phase travel agents are specified,
- family memory disclosure is scoped,
- travel tools are accessed through capability gateway,
- public authority and hard constraints are enforced before ranking,
- recommendations carry evidence and confidence,
- Bursa/Kocaeli family trip fixture exists,
- conservative/privacy-sensitive constraints are testable,
- final plan output can explain rejected alternatives,
- run traces show why the plan was produced.

Tatil Modu should not move into full implementation until these items are at least `ready_for_prototype`.

## Final readiness decision format

Use this format:

```yaml
readiness_state: ready_for_prototype
reason: "Core architecture, contract direction and evaluation fixture plan are clear enough for a controlled prototype."
allowed_scope:
  - "single golden scenario"
  - "mock tool providers"
  - "one orchestrator skeleton"
  - "one or two first-phase agents"
blocked_scope:
  - "production provider integration"
  - "persistent canonical memory writes"
  - "large-scale automated planning"
required_next_actions:
  - "write first agent specs"
  - "define ACP envelope schema"
  - "create golden fixture"
```

## Checklist

Before implementation starts:

- [ ] product goal and non-goals are clear,
- [ ] component taxonomy is stable,
- [ ] orchestration model is written,
- [ ] first agent specs exist,
- [ ] contracts and schemas are drafted,
- [ ] memory disclosure rules are defined,
- [ ] capability gateway model is defined,
- [ ] evidence and confidence rules are defined,
- [ ] hard constraints are non-negotiable,
- [ ] evaluation fixtures exist,
- [ ] observability and audit rules exist,
- [ ] prototype scope is intentionally small,
- [ ] open risks are tracked.
