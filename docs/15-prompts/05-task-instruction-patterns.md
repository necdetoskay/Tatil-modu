# 05 — Task Instruction Patterns

**Doküman türü:** task instruction pattern design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, agent role prompt'tan ayrı olarak verilen göreve özel talimatların nasıl tasarlanacağını tanımlar.

Task instruction, agent'ın rolünü değiştirmez; yalnızca o çağrıdaki işi netleştirir.

## Ana karar

```yaml
artifact_id: task_instruction_patterns
artifact_state: drafted
implementation_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/05-task-instruction-patterns.md
```

## Task instruction ne yapar?

```yaml
task_instruction_responsibilities:
  - specific_goal
  - allowed_input_focus
  - expected_output_focus
  - constraints_to_apply
  - assumptions_to_preserve
  - missing_information_handling
  - evidence_gap_behavior
```

## Task instruction ne yapamaz?

```yaml
task_instruction_cannot:
  - override_agent_role
  - grant_live_tool_access
  - remove_evidence_requirement
  - change_output_contract
  - make_soft_preference_hard_constraint_without_policy
  - hide_hard_blockers
  - request_hidden_chain_of_thought
```

## Canonical task instruction pattern

```text
Task:
[Concrete task for this agent invocation]

Use only:
[Allowed input context]

Apply these constraints:
[Relevant hard constraints and soft preferences]

Produce:
[Expected output contract fields]

If information is missing:
[Missing info / clarification / evidence gap behavior]

Do not:
[Task-specific forbidden outputs]
```

## Tatil Modu task pattern örnekleri

```yaml
trip_intake_task:
  task: "Normalize the user's free-form travel request."
  do_not: "Do not recommend destinations, hotels, routes, or activities."
constraint_policy_task:
  task: "Classify hard constraints, soft preferences, warnings, and clarification needs."
  do_not: "Do not validate claims against live data."
verification_evidence_task:
  task: "Convert verification needs and capability outputs into evidence-aware claims."
  do_not: "Do not write final user-facing plan text."
final_response_task:
  task: "Compose the final user-facing response from orchestrator-provided verified/evidence-aware data."
  do_not: "Do not call tools or invent new facts."
```

## Missing information pattern

```yaml
missing_information_pattern:
  required_but_missing:
    output: "missing_information"
  useful_but_not_required:
    output: "assumption_or_soft_warning"
  needed_for_hard_constraint:
    output: "clarification_requirement_or_hard_blocker"
```

## Evidence gap pattern

```yaml
evidence_gap_pattern:
  claim_requires_verification_but_no_evidence:
    output: "evidence_gap"
    final_response_behavior: "do_not_present_as_fact"
  hard_constraint_claim_unverified:
    output: "hard_blocker_or_unresolved_verification_need"
    final_response_behavior: "visible_disclosure_required"
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 06-output-contract-prompting.md
implementation_allowed: false
runtime_prompt_engine_allowed: false
```
