# 09 — Policy, Hard Constraints and Safety

> Safety, policy and hard constraints are gates, not preferences.

## Purpose

This section defines how agentic systems must handle safety policies, legal or operational rules, user-declared hard constraints and non-negotiable decision gates.

The goal is to prevent optimization, ranking or model creativity from overriding constraints that must remain binding.

## Canonical principle

```text
Safety and hard constraints are evaluated before scoring, ranking or optimization.
They cannot be compensated by better quality, lower cost, higher confidence or user delight.
```

Agents may suggest alternatives, but they must not relax a hard constraint.

## Constraint categories

| Category | Meaning | Example | Can be optimized away? |
|---|---|---|---|
| `safety_policy` | System or platform safety rule | harmful, illegal or unsafe request | No |
| `legal_rule` | Law, official rule or public authority requirement | permit, age rule, road closure, restricted area | No |
| `user_hard_constraint` | Explicit non-negotiable user requirement | no flights, wheelchair access required, women-only beach required | No |
| `operational_blocker` | Practical impossibility | closed venue, unavailable slot, route blocked | No |
| `strong_preference` | Strong but negotiable user preference | prefers quiet hotel, prefers low walking | Sometimes |
| `soft_preference` | Optional optimization signal | likes scenic views | Yes |
| `advisory_warning` | Warning that should be explained | heavy traffic expected | Not by itself |

## Gate order

Policy and hard constraints must be evaluated before lower-level quality scoring.

```text
1. Safety / Policy Gate
2. Legal / Public Authority Gate
3. User Hard Constraint Gate
4. Operational Feasibility Gate
5. Evidence / Verification Gate
6. Domain Quality Scoring
7. Preference Ranking
8. Cost / Latency Optimization
```

A failure at a higher gate blocks or downgrades the candidate before lower gates are considered.

## Hard constraint representation

Every hard constraint should be represented as structured data:

```json
{
  "constraint_id": "HC-001",
  "constraint_type": "user_hard_constraint",
  "source": "user_request",
  "statement": "Sea plans must include a women-only beach option.",
  "scope": "sea_activity_recommendations",
  "severity": "blocking",
  "verification_required": true,
  "decision_effect": "reject_candidate_if_missing",
  "explanation_required": true
}
```

## Constraint ownership

| Responsibility | Owner |
|---|---|
| Extract user hard constraints | Intake / Profile Agent |
| Classify hard vs soft | Policy / Constraint Layer or Orchestrator |
| Verify external rule | Verification / Data Source & Trust layer |
| Apply gate to candidates | Planner / Orchestrator |
| Explain rejection or alternative | Final Composer |
| Audit decision | Runtime / Observability |

No single agent should silently decide that a hard constraint can be ignored.

## Safety / policy gate

The safety gate decides whether a request, tool call, plan candidate or generated output is allowed.

Safety gate outcomes:

| Outcome | Meaning | Required behavior |
|---|---|---|
| `allowed` | No blocking issue | Continue |
| `allowed_with_warning` | Allowed but needs warning | Continue with explanation |
| `needs_clarification` | Missing safety-critical detail | Ask or route for clarification |
| `blocked` | Not allowed | Stop that candidate/action |
| `redacted` | Sensitive detail removed | Continue only with redacted context |

## Public authority and official rules

External authority rules must be treated as evidence-bound claims, not prompt text.

Examples:

- official opening rule,
- restricted area rule,
- age or safety requirement,
- road closure,
- local regulation,
- venue-specific official rule.

These claims must carry:

- source identity,
- retrieved time,
- published time if available,
- validity window,
- verification status,
- confidence,
- decision effect.

## User hard constraints

User hard constraints must be preserved through the whole workflow.

Examples:

```text
No airplane travel.
Must stay within budget.
Must include women-only beach option if sea is proposed.
Must be suitable for a 2-year-old child.
Must avoid long walking.
```

If a plan cannot satisfy a hard constraint, the system must not silently output the plan. It must either reject the candidate, propose a compliant alternative or explain why no compliant option was found.

## Strong preference vs hard constraint

A common failure mode is treating every user preference as hard.

The system should distinguish:

```text
"I prefer quiet hotels"            → strong_preference
"Do not recommend noisy hotels"    → user_hard_constraint
"Budget around 30,000 TL"          → strong_preference or budget_target
"Budget must not exceed 30,000 TL" → user_hard_constraint
```

When ambiguous, the Orchestrator may classify conservatively or request clarification if the decision impact is high.

## Candidate rejection model

A candidate rejected by a hard constraint must carry rejection metadata:

```json
{
  "candidate_id": "hotel_option_3",
  "decision_state": "rejected",
  "rejection_reason": "violates_user_hard_constraint",
  "constraint_id": "HC-004",
  "explanation": "The option exceeds the declared maximum budget.",
  "alternative_required": true
}
```

## Agent behavior rules

Agents must:

- preserve hard constraints in outputs,
- flag possible constraint conflicts,
- avoid scoring a candidate as high quality if it violates a hard constraint,
- return uncertainty when they cannot verify compliance,
- produce structured constraint evidence where relevant.

Agents must not:

- ignore constraints to make a better-looking answer,
- downgrade hard constraints to soft preferences,
- hide constraint violations in natural language,
- rely on unsupported assumptions for safety-critical claims.

## Planner behavior rules

Planners must:

- apply hard gates before ranking,
- reject non-compliant candidates,
- keep traceability from rejection to constraint,
- preserve alternatives that satisfy constraints,
- expose trade-offs only among compliant candidates.

Planners must not:

- average constraint violations into a score,
- compensate a blocked option with lower cost or higher popularity,
- produce a final plan with unresolved blocking constraints.

## Orchestrator behavior rules

The Orchestrator must:

- maintain the active constraint set for the run,
- route verification requests for external constraints,
- pass only relevant constraints to each agent,
- reconcile conflicts between agent outputs and constraints,
- block final composition if unresolved hard violations remain.

## Final composer behavior rules

The final response should:

- show important constraints that shaped the answer,
- explain rejected options only when useful,
- surface uncertainty clearly,
- avoid overloading the user with internal policy details,
- provide safe and compliant alternatives.

## Tatil Modu reference example

Generic rule:

```text
If the user says a sea plan must include a women-only beach option,
then sea-related recommendations must be checked against that requirement before ranking.
```

Tatil Modu mapping:

```text
- Trip Profile Agent extracts "women-only beach option required if sea is proposed".
- Policy / Constraint Layer classifies it as user_hard_constraint.
- Activity Discovery searches sea options and women-only beach options separately.
- Verification checks freshness and source confidence.
- Day Planner cannot output a sea day without a compliant option or explicit no-option explanation.
- Final Composer explains the constraint in user-friendly language.
```

## Checklist

Before implementation, every agent system should answer:

- Are hard constraints represented separately from preferences?
- Are safety and policy gates evaluated before scoring?
- Are official rules evidence-bound and verified?
- Can a planner reject a candidate with structured reason metadata?
- Can the final response explain blocked or changed recommendations?
- Is there an audit trail for hard constraint decisions?

## Status

```text
document_status: draft
scope: generic
reference_implementation: Tatil Modu
```
