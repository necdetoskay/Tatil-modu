# 14 — Universal Layered Test & Evaluation Framework (ULTEF)

> A reusable, project-agnostic testing and evaluation standard for software systems, AI-enabled products, agentic systems, services, automation tools and interactive applications.

## Purpose

ULTEF exists to make testing a first-class architecture capability rather than a late UI-level activity.

The framework separates **what is being built** from **how deeply it has been proven**.

Core rule:

```text
CODE COMPLETE ≠ TEST PASS
TEST WRITTEN ≠ EXECUTION PASS
EXECUTION EVIDENCE + REQUIRED GATE PASS → PROGRESSION
```

ULTEF is intentionally generic. Each project adopts the same baseline levels and adds project-specific extensions only where necessary.

## Canonical naming

```text
Framework: Universal Layered Test & Evaluation Framework
Short name: ULTEF
Baseline levels: L0-L9
Project-specific extensions: PX-* or project-defined named gates
```

The framework level is not the same as a sprint number.

Example:

```text
H5 = implementation sprint / delivery stage
L3 = test and evaluation level
```

A project may use any sprint naming scheme while keeping ULTEF levels stable.

## Design goals

ULTEF should ensure that:

- critical behavior can be tested without using the UI,
- components can be tested independently,
- deterministic tests do not depend on live providers,
- external systems can be replaced with mocks, fakes, fixtures or local adapters,
- end-to-end behavior is tested with realistic golden scenarios,
- regressions become permanent automated tests,
- adversarial and failure scenarios are explicit,
- real provider/model quality is measured separately from deterministic CI,
- UI E2E validates user journeys but does not carry all business-logic responsibility,
- every critical requirement can be traced to implementation and test evidence.

## Baseline level model

| Level | Name | Main question |
|---|---|---|
| L0 | Contract & Schema | Are inputs, outputs, events and persisted shapes valid and version-compatible? |
| L1 | Domain Rules & Invariants | Are business rules, hard constraints and deterministic state rules correct? |
| L2 | Infrastructure & Boundary | Are repositories, adapters, persistence, capability boundaries and side effects controlled? |
| L3 | Component / Engine / Agent | Does each major component behave correctly in isolation? |
| L4 | Integration & Orchestration | Do multiple components collaborate correctly? |
| L5 | Verification & Quality | Is the output trustworthy, internally consistent and policy/quality compliant? |
| L6 | Golden Headless E2E | Does a realistic complete workflow succeed without relying on the UI? |
| L7 | Adversarial & Regression | Does the system resist edge cases and preserve previously fixed behavior? |
| L8 | Real Provider / Model Evaluation | How do live models/providers perform on quality, cost, latency and reliability? |
| L9 | UI / Browser E2E | Can users complete critical journeys through the real interface? |

## L0 — Contract & Schema

Validate:

- API request/response contracts,
- event contracts,
- persistence schemas,
- serialization and deserialization,
- required fields,
- enums,
- version compatibility,
- migration compatibility where relevant.

L0 failures are normally blocking because higher-level tests cannot safely reason about invalid contracts.

## L1 — Domain Rules & Invariants

Validate:

- business rules,
- deterministic calculations,
- hard constraints,
- state transition rules,
- domain invariants,
- permission invariants,
- validation logic,
- impossible states.

Rule:

```text
Critical domain behavior must not be verified only through E2E or UI tests.
```

## L2 — Infrastructure & Boundary

Validate:

- database repositories,
- cache adapters,
- filesystem adapters,
- queue/event adapters,
- external service adapters,
- capability gateways,
- persistence ownership,
- architectural dependency rules,
- unauthorized network or provider access,
- test isolation.

Deterministic L2 should use local, fake, mock or fixture-backed dependencies whenever practical.

## L3 — Component / Engine / Agent

Each major component should be independently testable.

Canonical pattern:

```text
fixture input
+ mock/fake dependencies
+ optional state snapshot
→ one component / engine / agent
→ structured output
→ assertions
```

Test dimensions should include:

- typical valid input,
- boundary input,
- incomplete input,
- invalid input,
- conflicting input,
- dependency failure,
- deterministic repeatability,
- forbidden side effects,
- ownership/boundary violations.

For AI agents, scripted/fake model adapters may be used so deterministic L3 does not require a live LLM.

## L4 — Integration & Orchestration

Validate collaboration between components such as:

- API + domain,
- service + repository,
- engine + persistence,
- agent + capability platform,
- orchestrator + multiple agents,
- event producer + consumer,
- workflow state transitions,
- retries and fallbacks.

L4 should reveal integration defects without requiring a full browser journey.

## L5 — Verification & Quality

Use when the system produces outputs that require quality, trust or policy evaluation.

Possible checks:

- evidence support,
- internal consistency,
- safety/policy compliance,
- confidence semantics,
- unsupported claims,
- ranking quality,
- plan coherence,
- explainability,
- domain-specific quality rubric,
- required warnings and disclosures.

For non-AI projects, L5 may be reduced or adapted to domain quality verification.

## L6 — Golden Headless E2E

Run realistic complete system journeys without relying on UI interaction wherever possible.

Canonical pattern:

```text
realistic input fixture
→ application entry point / API / command / workflow
→ domain processing
→ components / engines / agents
→ persistence / state changes
→ final output
→ assertions across the full journey
```

Golden scenarios should validate important properties, not fragile exact text unless exact text is itself a contract.

Each project should maintain a small set of high-value golden scenarios representing its most important behaviors.

## L7 — Adversarial & Regression

Adversarial coverage should include applicable cases such as:

- malformed input,
- contradictory data,
- duplicate requests/events,
- stale state,
- corrupted state,
- partial dependency failures,
- timeout,
- retry exhaustion,
- concurrency race conditions,
- unexpected ordering,
- permission violations,
- prompt injection or malicious external content in AI systems,
- extreme boundary values.

Regression law:

```text
Every meaningful bug fix should add or strengthen a regression test or fixture.
```

A fixed bug should be difficult to reintroduce silently.

## L8 — Real Provider / Model Evaluation

L8 is deliberately separate from deterministic CI.

Use it for live dependencies whose behavior or cost changes over time, such as:

- LLMs,
- image generation models,
- TTS/STT,
- embedding models,
- search providers,
- external APIs,
- cloud services.

Measure where relevant:

- correctness,
- quality,
- consistency across repeated runs,
- latency,
- cost,
- token/resource usage,
- failure rate,
- retry rate,
- provider/model drift.

Use the same benchmark fixtures when comparing alternative providers or models.

## L9 — UI / Browser E2E

L9 validates the real user-facing surface.

Typical coverage:

- authentication,
- navigation,
- critical forms,
- primary user journeys,
- frontend/backend integration,
- accessibility smoke checks,
- responsive/mobile critical flows,
- visible error states.

Rule:

```text
UI E2E must not be the only proof of critical domain behavior.
```

Business logic should already be covered at lower levels so L9 can focus on the interface and full delivery path.

## Deterministic Core Mode

Every project should define a deterministic mode wherever feasible.

Recommended controls:

- no live network,
- fixed clock,
- fixed random seed,
- deterministic UUID/id provider,
- mock/fake external services,
- fake/scripted AI model,
- deterministic database or isolated test database,
- deterministic filesystem sandbox,
- controlled environment variables.

This suite should be suitable for regular CI execution.

## Evaluation Mode

Evaluation mode is separate from deterministic core mode.

It may use:

- real models,
- real providers,
- external services,
- repeated runs,
- stochastic scoring,
- cost and latency tracking,
- benchmark comparison.

Evaluation mode should not make basic correctness CI dependent on live providers.

## Fixture taxonomy

Projects should support a reusable fixture taxonomy:

| Fixture | Purpose |
|---|---|
| minimal-valid | smallest valid case |
| typical | normal expected usage |
| complex | realistic multi-condition case |
| boundary | limits and edge values |
| invalid | deliberately invalid input/state |
| conflicting | contradictory information |
| dependency-failure | tool/provider/storage failure |
| regression | previously failing behavior |
| golden | critical end-to-end reference scenario |

Fixtures should be human-readable where practical: JSON, YAML or typed source objects.

## Critical Journey Matrix

Every project should maintain a matrix that maps important journeys to test levels.

Example:

| Journey | L0 | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|---|---|
| primary workflow | ✓ | ✓ | ✓ | ✓ | ✓ | optional | ✓ | ✓ | optional | ✓ |

No critical journey should depend exclusively on L9.

## Requirement traceability

Coverage percentage is useful but insufficient.

Critical requirements should be traceable as:

```text
Requirement
→ implementation
→ test(s)
→ fixture(s)
→ last execution
→ result
```

A critical requirement with no test trace is a delivery risk even if overall line coverage is high.

## Severity model

Projects should classify failures consistently.

Recommended baseline:

```text
P0 = critical/blocking; progression stops
P1 = high severity; release normally blocked
P2 = medium severity; tracked and risk-reviewed
P3 = low severity / improvement
```

Examples of P0 candidates:

- safety/security violation,
- hard constraint loss,
- corrupt canonical state,
- invalid critical contract,
- unauthorized data access/write,
- broken primary workflow,
- deterministic critical test flakiness.

## Quality gate progression

A project may define delivery stages independently, but progression should follow the rule:

```text
implementation complete
+ required fixtures
+ automated tests
+ execution evidence
+ P0 = 0
+ required ULTEF gate PASS
→ next stage eligible
```

## CI strategy

### PR Fast Gate

Recommended:

- lint/static checks,
- typecheck/compile,
- L0,
- L1,
- fast L2,
- selected critical L3,
- architecture/boundary tests.

### Main Deterministic Gate

Recommended:

- full deterministic L0-L7 subset applicable to the project,
- integration tests,
- golden headless E2E,
- regression suite.

### Nightly / Scheduled / Manual Evaluation

Recommended:

- L8 provider/model benchmarks,
- expensive extended L6/L7 scenarios,
- long-running compatibility tests,
- performance benchmarks.

### UI Gate

Run selected L9 journeys on PR/main according to execution cost and reliability.

## Stop-the-line conditions

Progression should stop when any applicable critical condition occurs:

1. P0 failure.
2. Critical contract/schema drift.
3. Critical requirement with no test trace.
4. Flaky critical test.
5. Unauthorized architectural dependency.
6. Unexpected network/provider call in deterministic mode.
7. Canonical state/persistence ownership violation.
8. Golden critical journey failure.
9. Security/privacy/safety gate failure.

## Project-specific extensions

ULTEF is a baseline, not a rigid one-size-fits-all checklist.

Projects may add extension gates while preserving the meaning of L0-L9.

Recommended notation:

```text
PX-<name>
```

Examples:

```text
PX-WORLD-SIMULATION
PX-DEVICE-DEPLOYMENT
PX-TRAVEL-EVIDENCE
PX-DATA-MIGRATION
PX-OFFLINE-RECOVERY
```

Extensions must document:

- purpose,
- dependencies,
- fixtures,
- pass/fail criteria,
- severity,
- CI cadence,
- execution evidence.

Project extensions should not silently redefine the baseline ULTEF levels.

## Adoption workflow for a new repository

When applying ULTEF to a project:

1. Analyze the repository before writing tests.
2. Build a System Under Test Map.
3. Inventory existing tests and tools.
4. Identify critical journeys and business rules.
5. Map current coverage to L0-L9.
6. Produce a Test Gap Analysis.
7. Define fixtures and mocks/fakes.
8. Define deterministic mode.
9. Define project-specific PX extensions.
10. Create Critical Journey Matrix.
11. Create requirement-to-test traceability.
12. Define CI gates.
13. Implement the smallest high-value missing slice first.
14. Execute the tests and record evidence.
15. Do not declare PASS based only on test code existing.

## Required project adoption artifacts

A project adopting ULTEF should eventually contain:

- System Under Test Map,
- Test Architecture Assessment,
- L0-L9 applicability matrix,
- Critical Journey Matrix,
- fixture catalog,
- mock/fake strategy,
- regression catalog,
- adversarial strategy,
- provider/model evaluation plan where applicable,
- UI E2E plan where applicable,
- CI gate definition,
- requirement traceability registry,
- execution evidence records,
- project-specific PX extensions.

## Generic Definition of Done

A tested delivery slice is complete only when applicable items exist:

```yaml
implementation_complete: true
positive_fixture: true
negative_or_failure_fixture: true
automated_test: true
required_level_passed: true
p0_failures: 0
traceability_recorded: true
execution_evidence_recorded: true
documentation_updated: true
```

## Final principle

ULTEF should answer a stronger question than:

```text
"Does the UI seem to work?"
```

It should answer:

```text
"Can we prove, layer by layer, that the important behaviors of this system are correct, resilient, traceable and still working after change?"
```
