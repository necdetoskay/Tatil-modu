# 12 — Agent Specification Template

> A reusable specification template for defining an AI agent before implementation.

## Canonical principle

Every agent must have a written specification before it is implemented.

A valid agent specification defines:

```text
purpose
scope
non-goals
input contract
output contract
allowed tools
memory disclosure
policy constraints
evidence requirements
evaluation fixtures
observability requirements
failure behavior
ownership
```

If an agent cannot be specified clearly, it should not be implemented yet.

## Template metadata

```yaml
agent_id: <stable_agent_id>
agent_name: <human_readable_name>
component_type: agent
spec_status: draft | review | approved | deprecated
owner: <team_or_person>
version: 0.1.0
last_reviewed: YYYY-MM-DD
applies_to_products:
  - <product_or_reference_implementation>
depends_on:
  - orchestrator
  - memory_platform
  - capability_platform
  - evaluation_platform
```

## 1. Purpose

```text
This agent exists to...
```

The purpose must be narrow enough that the agent can be tested independently.

Bad example:

```text
Helps with travel planning.
```

Better example:

```text
Evaluates hotel candidates against family constraints, budget, location, child suitability, privacy preferences, evidence freshness and operational risks.
```

## 2. Scope

Define what the agent is responsible for.

```yaml
responsibilities:
  - <responsibility_1>
  - <responsibility_2>
  - <responsibility_3>
```

A scope item should produce observable output.

## 3. Non-goals

Define what the agent must not do.

```yaml
non_goals:
  - Does not orchestrate other agents.
  - Does not directly call providers.
  - Does not write canonical memory.
  - Does not relax hard constraints.
  - Does not make final user-facing decisions unless explicitly assigned.
```

Non-goals prevent agent sprawl.

## 4. Upstream caller

```yaml
called_by:
  - orchestrator
  - planner
allowed_direct_callers:
  - <component_id>
```

By default, expert agents should be called by the orchestrator or a planner, not by peer agents.

## 5. Input contract

```yaml
input_contract:
  schema_id: <schema_id>
  schema_version: 0.1.0
  required_fields:
    - request_id
    - run_id
    - task
    - constraints
    - disclosure_package
    - evidence_context
  optional_fields:
    - candidate_set
    - user_preferences
    - prior_results
```

Input must be structured enough to support validation and fixture tests.

## 6. Output contract

```yaml
output_contract:
  schema_id: <schema_id>
  schema_version: 0.1.0
  required_fields:
    - agent_id
    - execution_state
    - findings
    - recommendations
    - rejected_candidates
    - evidence
    - confidence
    - warnings
    - errors
  optional_fields:
    - memory_write_candidates
    - follow_up_questions
    - debug_notes
```

Outputs must not rely on free-form prose alone.

## 7. Capabilities and tools

```yaml
allowed_capabilities:
  - capability_id: <capability>
    purpose: <why_it_is_needed>
    mode: online | offline | mock
    requires_permission: true | false
    evidence_required: true | false

forbidden_capabilities:
  - <capability_id>
```

The agent asks for capabilities. It does not call raw providers directly.

## 8. Memory disclosure

```yaml
memory_disclosure:
  disclosure_scope: none | minimal | scoped | extended
  allowed_memory_types:
    - user_preference
    - household_profile
    - prior_decision
  forbidden_memory_types:
    - unrelated_sensitive_context
  retention_policy: no_agent_retention
```

The agent receives only the minimum necessary context.

## 9. Policy and hard constraints

```yaml
policy_constraints:
  hard_constraints:
    - <constraint_id>
  safety_gates:
    - <gate_id>
  public_authority_rules:
    - <rule_id>
  escalation_rules:
    - <condition>
```

The agent must reject or flag candidates that violate hard constraints.

## 10. Evidence requirements

```yaml
evidence_requirements:
  minimum_evidence_level: none | user_assertion | tool_result | verified_source | official_source
  freshness_required: true | false
  conflict_policy: reject | warn | escalate | allow_with_disclosure
  confidence_model: evidence_bound
```

The agent must clearly separate claims from verified facts.

## 11. Failure behavior

```yaml
failure_behavior:
  on_missing_required_input: return_contract_error
  on_tool_unavailable: return_degraded_result
  on_conflicting_evidence: escalate_to_orchestrator
  on_hard_constraint_violation: reject_candidate
  on_policy_failure: block_or_escalate
```

Failure behavior must be deterministic enough to test.

## 12. Evaluation fixtures

```yaml
evaluation:
  required_fixtures:
    - happy_path
    - missing_input
    - hard_constraint_violation
    - conflicting_evidence
    - degraded_tool_mode
    - privacy_boundary
  golden_scenarios:
    - <scenario_id>
  regression_suite: <suite_id>
```

Each agent needs fixtures before implementation is considered complete.

## 13. Observability and audit

```yaml
observability:
  trace_required: true
  run_id_required: true
  decision_trace_required: true
  audit_events:
    - agent_started
    - input_validated
    - capability_requested
    - candidate_rejected
    - recommendation_created
    - agent_completed
  redaction_required: true
```

The agent must be debuggable without exposing unnecessary private context.

## 14. Prompt contract

```yaml
prompt_contract:
  system_prompt_id: <prompt_id>
  prompt_version: 0.1.0
  allowed_context_blocks:
    - task
    - constraints
    - disclosure_package
    - evidence_context
  forbidden_context_blocks:
    - raw_untrusted_web_instruction
    - unrelated_user_memory
  output_format: strict_json | structured_markdown | typed_object
```

Prompts are implementation artifacts, but the specification must define their boundaries.

## 15. Acceptance criteria

```yaml
acceptance_criteria:
  - Input contract validates against schema.
  - Output contract validates against schema.
  - Agent rejects hard constraint violations.
  - Agent does not access forbidden memory.
  - Agent does not call raw providers directly.
  - Agent produces evidence-bound confidence.
  - Agent passes required fixtures.
  - Agent emits required audit events.
```

Acceptance criteria must be testable.

## 16. Example: generic agent skeleton

```yaml
agent_id: hotel_candidate_evaluator
agent_name: Hotel Candidate Evaluator
component_type: agent
spec_status: draft
owner: product_architecture
version: 0.1.0

purpose: >
  Evaluates hotel candidates against user constraints, family needs,
  budget, location, evidence freshness and operational risks.

non_goals:
  - Does not create the full trip plan.
  - Does not call hotel websites directly.
  - Does not write canonical memory.
  - Does not override policy or hard constraints.

input_contract:
  schema_id: hotel_candidate_evaluation_input
  schema_version: 0.1.0

output_contract:
  schema_id: hotel_candidate_evaluation_output
  schema_version: 0.1.0

allowed_capabilities:
  - capability_id: lodging_search
    purpose: Find candidate lodging options
    mode: online
    requires_permission: true
    evidence_required: true
  - capability_id: map_distance
    purpose: Estimate route distance and operational feasibility
    mode: online
    requires_permission: false
    evidence_required: true

memory_disclosure:
  disclosure_scope: scoped
  allowed_memory_types:
    - family_profile
    - travel_preference
    - budget_preference
  retention_policy: no_agent_retention
```

## 17. Tatil Modu reference example

For Tatil Modu, every travel-specific agent should be defined using this template before implementation.

Examples:

```text
travel_intake_agent
constraint_policy_agent
destination_discovery_agent
hotel_candidate_evaluator
activity_candidate_evaluator
route_feasibility_agent
budget_planner
family_day_planner
final_plan_composer
```

Each of these should have its own:

```text
specification
input schema
output schema
prompt contract
fixture suite
evaluation rubric
observability requirements
```

## Checklist

Before approving an agent specification:

```text
[ ] Purpose is narrow and testable.
[ ] Non-goals are explicit.
[ ] Input contract is versioned.
[ ] Output contract is versioned.
[ ] Tool/capability permissions are listed.
[ ] Memory disclosure is scoped.
[ ] Policy and hard constraints are declared.
[ ] Evidence and confidence requirements are explicit.
[ ] Failure behavior is deterministic.
[ ] Fixture requirements are defined.
[ ] Observability and audit events are defined.
[ ] Prompt boundaries are defined.
[ ] Acceptance criteria are testable.
```
