# Examples — Tatil Modu Reference Implementation

## Purpose

This file shows how the generic AI Agent Architecture Handbook maps to the Tatil Modu project.

Tatil Modu is not the source of the generic rules. It is the first reference implementation used to validate them.

## Product context

Tatil Modu is a family travel planning system.

It plans trips while considering:

- family profile,
- child ages,
- budget,
- distance,
- route fatigue,
- parking,
- activity suitability,
- hotel suitability,
- weather,
- public authority rules,
- privacy-sensitive preferences such as women-only beaches,
- daily alternatives and rest periods.

## Generic rule mapped to Tatil Modu

| Generic handbook concept | Tatil Modu mapping |
|---|---|
| Orchestrator owns workflow | Travel Orchestrator coordinates expert agents and planners |
| Agent executes bounded task | Trip Profile Agent extracts structured trip profile |
| Planner assembles decisions | Day Planner builds daily alternatives |
| Module evaluates domain signal | Budget Intelligence scores cost suitability |
| Store persists travel facts | Travel Knowledge Store stores POI/hotel/activity facts |
| Memory Platform owns user context | Family preferences are disclosed through controlled packages |
| Data Source & Trust evaluates sources | Public authority, freshness and conflict checks are handled outside agents |
| Verification Platform carries result | Runtime claim verification is consumed by planners |
| Capability Platform controls tools | Maps, weather, hotel and search tools are accessed through gateway rules |
| Evaluation uses hierarchy | Safety and hard constraints outrank quality or latency scores |

## Example flow

```text
User asks for a family trip
        ↓
Travel Orchestrator creates run
        ↓
Trip Profile Agent extracts structured profile
        ↓
Policy / Constraint layer identifies hard constraints
        ↓
Destination / Hotel / Activity components produce candidates
        ↓
Verification and Data Source & Trust validate claims
        ↓
Travel Intelligence Modules score suitability and risk
        ↓
Day Planner creates alternatives
        ↓
Final Plan Composer writes user-facing plan with explanations
```

## Example hard constraint

Generic rule:

```text
Hard constraints are filtered before ranking.
```

Tatil Modu example:

```text
If the user requires a women-only beach option for sea plans,
sea alternatives that cannot satisfy or clearly flag that requirement
must not be silently ranked as acceptable.
```

## Example memory rule

Generic rule:

```text
Agents receive minimum necessary memory disclosure.
```

Tatil Modu example:

```text
A hotel suitability component may need child ages and budget range.
It does not need the full long-term family memory or unrelated personal history.
```

## Example evidence rule

Generic rule:

```text
Important claims should carry evidence metadata.
```

Tatil Modu example:

```text
Opening hours, ticket prices, ferry schedules, parking availability and public authority rules should carry source, retrieved_at, freshness and verification status where possible.
```

## Example evaluation rule

Generic rule:

```text
Safety or hard constraint failure cannot be compensated by a high quality score.
```

Tatil Modu example:

```text
A beautiful activity is not acceptable if it is unsuitable for a 2-year-old, closed on the selected date, too far for the daily fatigue limit, or violates a declared hard family constraint.
```

## Boundary note

Tatil Modu-specific product and architecture documents remain under:

```text
docs/
```

Generic reusable standards remain under:

```text
ai-agent-architecture-handbook/
```
