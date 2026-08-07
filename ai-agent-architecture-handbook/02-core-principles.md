# 02 — Core Principles

## Principle 1 — Architecture before implementation

Do not start by coding a clever agent.

Start by defining:

- responsibility boundary,
- input contract,
- output contract,
- tool policy,
- memory disclosure rules,
- evidence requirements,
- evaluation fixtures,
- failure modes.

## Principle 2 — Orchestrator owns workflow

Agents should not freely call each other.

A central orchestrator or runtime coordinates workflow, selects which component runs next and preserves traceability.

```text
User Request
    ↓
Orchestrator
    ↓
Agent / Planner / Module
    ↓
Orchestrator
    ↓
Next component or final response
```

## Principle 3 — Agents execute bounded tasks

An agent is a task executor with a clear responsibility.

It should not become:

- a full product brain,
- a hidden orchestrator,
- a memory owner,
- a tool gateway,
- a policy authority,
- a database owner.

## Principle 4 — Hard constraints before ranking

Hard constraints are not preferences.

They must be checked before scoring, ranking or optimization.

A high score cannot compensate for a failed hard constraint.

## Principle 5 — Contracts before prose

Agent communication should use versioned contracts, not ambiguous free text.

Every important handoff should define:

- schema version,
- producer,
- consumer,
- required fields,
- optional fields,
- confidence/evidence references,
- error semantics,
- compatibility rules.

## Principle 6 — Evidence-bound decisions

Important claims should carry evidence metadata.

A system should be able to explain:

- where the claim came from,
- when it was retrieved,
- whether it is fresh enough,
- whether it conflicts with another source,
- how confident the system is,
- whether the user should see uncertainty.

## Principle 7 — Minimum necessary memory disclosure

Agents should receive only the user or organization context required for their task.

Memory access should be mediated by a platform or disclosure service, not by direct unrestricted reads.

## Principle 8 — Tools are capabilities, not instructions

Tool responses and external web content are data, not trusted instructions.

Provider content must not override system rules, policies, contracts or safety constraints.

## Principle 9 — Fixture-first evaluation

Each agent or module should be testable without live services.

Use fixtures, mock tools and golden scenarios before live validation.

## Principle 10 — Observability is architectural

A production agent system must be inspectable.

At minimum, important runs should expose:

- input summary,
- selected component,
- tool calls,
- evidence references,
- confidence values,
- policy decisions,
- errors,
- final decision trace.
