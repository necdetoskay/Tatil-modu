# AI Agent Architecture Handbook

> Generic, reusable architecture guide for designing, testing, operating and evolving AI agent systems.

This handbook is not specific to Tatil Modu. It captures reusable architectural rules that can be applied to multiple agentic products, including travel planning, PC building, educational worlds, tool discovery, enterprise automation and internal IT workflows.

Tatil Modu is the first reference implementation used to validate the handbook in a real product context.

## Purpose

The handbook defines how to design AI agent systems before implementation:

- how to separate agents, planners, modules, platforms, stores, registries, gateways and adapters,
- how agents communicate through versioned contracts,
- how orchestration owns workflow coordination,
- how tools are accessed safely,
- how memory is disclosed with minimum necessary context,
- how evidence, verification and confidence are represented,
- how hard constraints and policy gates are enforced,
- how fixtures, regression tests and evaluation gates are organized,
- how errors, audit, observability and lifecycle states are standardized.

## Scope

This handbook covers architecture and implementation readiness. It does not prescribe a specific framework, model provider, UI stack or hosting vendor.

It is intended to be used before coding an agentic system and again during implementation reviews.

## Structure

| Section | Purpose |
|---|---|
| [01 — Purpose and Scope](01-purpose-and-scope.md) | Defines what the handbook is and is not |
| [02 — Core Principles](02-core-principles.md) | Reusable design principles for agentic systems |
| [03 — Component Taxonomy](03-component-taxonomy.md) | Canonical meaning of agent, planner, module, platform, store, registry, gateway and adapter |
| [04 — Agent Contract Standard](04-agent-contract-standard.md) | Minimum contract rules for agent input, output and handoff |
| [05 — Orchestration Model](05-orchestration-model.md) | Defines how workflow coordination, routing, retries, privacy scope and decision reconciliation work |
| [06 — Memory Disclosure and Privacy](06-memory-disclosure-and-privacy.md) | Defines scoped memory disclosure packages, privacy gates, memory mutation rules and audit requirements |
| [07 — Tool Capability and Adapter Model](07-tool-capability-and-adapter-model.md) | Defines capability requests, tool gateway responsibilities, provider adapters, mock modes and tool evidence handoff |
| [08 — Evidence, Verification and Confidence](08-evidence-verification-and-confidence.md) | Defines evidence envelopes, verification status, confidence semantics, conflict handling and decision impact |
| [09 — Policy, Hard Constraints and Safety](09-policy-hard-constraints-and-safety.md) | Defines safety gates, hard constraint classification, candidate rejection rules and decision impact |
| [10 — Evaluation, Fixtures and Regression](10-evaluation-fixtures-and-regression.md) | Defines layered evaluation gates, fixture-first testing, golden scenarios, regression and structured evaluation reports |
| [Examples — Tatil Modu Reference Implementation](examples/tatil-modu-reference-implementation.md) | Shows how the generic handbook maps to the Tatil Modu project |

## Foundational rule

An AI agent system should not be designed as one large prompt that does everything.

A robust system separates:

```text
User Experience
        ↓
Orchestrator / Runtime
        ↓
Agents and Planners
        ↓
Domain Modules
        ↓
Knowledge / Memory / Data Stores
        ↓
Verification / Evidence / Trust
        ↓
Tool Gateway / Capability Platform
        ↓
Providers / Local / Offline / Fixtures
```

## Reference implementation

The first implementation used to test this handbook is Tatil Modu, a family travel planning system.

Tatil Modu-specific documents live under:

```text
docs/
```

The generic handbook lives at repository root:

```text
ai-agent-architecture-handbook/
```

This separation is intentional: the handbook is reusable; Tatil Modu is one product that applies it.

## Current status

```text
document_status: draft
scope: generic
reference_implementation: Tatil Modu
next_step: expand handbook sections into implementation-ready standards
```
