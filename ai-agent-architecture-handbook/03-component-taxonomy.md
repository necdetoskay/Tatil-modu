# 03 — Component Taxonomy

## Purpose

Agentic systems fail when every component is called an agent.

This taxonomy defines reusable component names and ownership boundaries.

## Canonical component types

| Component type | Meaning | Owns | Does not own |
|---|---|---|---|
| Agent | Executes a bounded task | Task-specific reasoning/output | Global workflow, canonical memory, platform policy |
| Planner | Chooses or assembles a plan | Decision structure, alternatives, trade-offs | Tool gateway, raw provider access, memory mutation |
| Module | Produces domain assessment | Scores, risks, domain signals | Orchestration, final decisions, canonical data |
| Platform | Provides shared infrastructure | Cross-cutting capability | Product-specific business choice |
| Service | Runtime deployable capability | API/runtime behavior | Broad architecture category by itself |
| Store | Persists data | Stored entities and lifecycle | Business reasoning unless explicitly defined |
| Registry | Maintains canonical dictionary | Names, versions, allowed values | Runtime execution |
| Gateway | Normalizes access to many providers | Permission, routing, timeout, audit | Provider-specific parsing details |
| Adapter | Connects to one provider/system | Provider schema and failure mapping | Global tool policy |
| Orchestrator | Coordinates workflow | Execution order, handoff routing, trace | Domain expertise of every component |

## Agent

An agent performs a bounded cognitive or operational task.

Good agent examples:

- extract a structured profile from user input,
- compare candidate hotels against a contract,
- produce a shortlist of activities,
- summarize verified evidence,
- generate a final user-facing explanation.

Bad agent examples:

- one agent that plans the entire product end-to-end,
- an agent that silently decides policy,
- an agent that directly writes canonical memory,
- an agent that calls any tool without capability policy,
- an agent that invokes other agents without orchestration.

## Planner

A planner assembles decisions and alternatives.

A planner may use outputs from agents and modules, but should not own raw source verification or memory mutation.

## Module

A module produces a domain signal, not a full task result.

Examples:

- budget suitability,
- risk assessment,
- route fatigue score,
- quality rubric score,
- environmental suitability.

A module should be deterministic where possible and easy to test with fixtures.

## Platform

A platform provides shared infrastructure used by many components.

Examples:

- Memory Platform,
- Capability Platform,
- Evaluation Platform,
- Observability Platform,
- Data Source & Trust Platform.

Platforms should not be rewritten inside individual agents.

## Store vs Registry

A store persists entities or events.

A registry defines canonical names, versions and allowed values.

```text
Store = data lives here
Registry = vocabulary and version rules live here
```

## Gateway vs Adapter

A gateway is the controlled entry point to a capability area.

An adapter connects to one provider.

```text
Tool Gateway
    ↓
Provider Adapter A
Provider Adapter B
Provider Adapter C
```

Agents should call the gateway, not arbitrary provider adapters.

## Orchestrator

The orchestrator coordinates the flow.

It decides:

- which component runs,
- in what order,
- with which disclosure package,
- with which contract,
- how failures are handled,
- how traceability is preserved.

The orchestrator should not become a hidden mega-agent. Its job is coordination, not all domain reasoning.
