# 01 — Purpose and Scope

## Purpose

The AI Agent Architecture Handbook is a generic guide for building reliable AI agent systems.

Its purpose is to turn an agent idea into an implementation-ready architecture before coding starts.

A good agent architecture should answer these questions clearly:

- What is an agent allowed to do?
- What is outside the agent's responsibility?
- Which component orchestrates the workflow?
- Which component plans decisions?
- Which component only evaluates a domain signal?
- Which data can the agent see?
- Which tools can it call?
- Which evidence must support its output?
- Which constraints are non-negotiable?
- How is the result tested?
- How are errors and uncertainty surfaced?

## Generic scope

This handbook is intentionally generic.

It can be applied to:

- travel planning systems,
- product recommendation agents,
- internal IT automation,
- educational simulation systems,
- research and tool discovery agents,
- enterprise workflow assistants,
- multi-agent planning systems.

The examples may reference Tatil Modu, but the rules should not depend on travel-specific concepts.

## Out of scope

This handbook does not define:

- a mandatory programming language,
- a mandatory web framework,
- a mandatory model provider,
- a single cloud provider,
- a fixed vector database,
- a UI design system,
- business-specific product requirements.

Those belong to each implementation project.

## Canonical distinction

```text
AI Agent Architecture Handbook = reusable architecture standard
Implementation project = product-specific application of the standard
Reference implementation = worked example showing the standard in use
```

For this repository:

```text
Generic handbook:
ai-agent-architecture-handbook/

Tatil Modu product documentation:
docs/

Tatil Modu as example implementation:
ai-agent-architecture-handbook/examples/tatil-modu-reference-implementation.md
```

## Success criteria

The handbook is useful if it helps a project team:

1. define agent boundaries before coding,
2. avoid large unbounded prompts,
3. test each agent independently,
4. make handoffs contract-based,
5. keep private memory access minimal,
6. make tool usage auditable,
7. attach evidence to important claims,
8. enforce hard constraints before ranking,
9. evaluate outputs with fixtures and regression tests,
10. move from architecture to implementation with fewer surprises.
