# 11 — Observability, Errors and Audit

> AI agent systems must be observable, debuggable and auditable. A convincing answer is not enough; the system must explain what ran, what failed, what evidence was used and which decision path was taken.

## Canonical principle

```text
Every meaningful agent run must produce traceable execution metadata.
Errors must use stable error codes.
Sensitive data must be redacted.
Audit records must explain important decisions without exposing unnecessary private context.
```

Observability is not only for engineers. It supports:

- debugging,
- evaluation,
- regression analysis,
- user trust,
- cost control,
- policy review,
- incident investigation,
- model/provider comparison,
- reproducibility.

## What must be observable?

At minimum, an agentic system should record:

| Area | Required visibility |
|---|---|
| Run identity | `run_id`, `workflow_id`, `trace_id`, `parent_run_id` |
| Component identity | agent/planner/module/platform name and version |
| Contract identity | input/output schema version |
| Prompt identity | prompt template id and version, not necessarily full prompt text |
| Tool usage | capability id, adapter id, provider id, mock/live mode |
| Evidence | evidence ids, source type, freshness and verification status |
| Decisions | accepted/rejected/deferred decisions and reason codes |
| Errors | stable error code, severity, retry policy and user display policy |
| Cost | model/tool usage, token/call count, estimated cost where available |
| Latency | duration per component, tool call and total workflow |
| Privacy | disclosure package id, redaction policy and sensitive-field handling |

## Trace hierarchy

A robust system should use a hierarchical trace model:

```text
workflow_trace
  ├─ orchestrator_run
  │   ├─ agent_run
  │   ├─ planner_run
  │   ├─ module_run
  │   └─ tool_call
  └─ final_composition_run
```

Each child run should know its parent. This allows the system to answer:

- Which agent produced this claim?
- Which tool produced the supporting evidence?
- Which planner accepted or rejected a candidate?
- Which policy gate blocked the decision?
- Which final output sentence depends on which source?

## Run envelope

Every major component run should produce a minimal run envelope:

```json
{
  "run_id": "run_123",
  "trace_id": "trace_abc",
  "parent_run_id": "run_parent",
  "component_type": "agent",
  "component_id": "hotel_agent",
  "component_version": "1.0.0",
  "contract_version": "hotel_agent_input.v1",
  "execution_state": "succeeded",
  "started_at": "2026-08-07T07:00:00Z",
  "ended_at": "2026-08-07T07:00:04Z",
  "duration_ms": 4000,
  "input_summary": "family hotel search request",
  "output_summary": "5 hotel candidates returned",
  "error": null,
  "evidence_ids": ["ev_001", "ev_002"],
  "decision_ids": ["dec_001"],
  "audit_tags": ["travel_planning", "family_context"]
}
```

The run envelope should not automatically store full raw prompts, full private user memory or unredacted provider payloads.

## Error code standard

Errors must not be free-form strings only.

Each error should include:

```json
{
  "error_code": "CAP-TIMEOUT-001",
  "error_domain": "capability_platform",
  "severity": "recoverable",
  "message_internal": "Map provider timed out after configured limit.",
  "message_user_safe": "Route data could not be refreshed. I used a fallback estimate.",
  "retry_policy": "alternative_provider",
  "user_display_policy": "safe_summary",
  "audit_required": true
}
```

### Error domain examples

| Prefix | Domain |
|---|---|
| `ORCH` | Orchestrator / workflow |
| `AGT` | Agent execution |
| `PLAN` | Planner decision |
| `MOD` | Domain module |
| `ACP` | Agent communication protocol |
| `CAP` | Capability platform / tool gateway |
| `TAD` | Tool adapter |
| `DST` | Data Source & Trust |
| `VER` | Verification |
| `MEM` | Memory platform |
| `POL` | Policy / constraints |
| `SEC` | Security / prompt injection |
| `EVAL` | Evaluation |
| `CFG` | Configuration |
| `OBS` | Observability |

Projects may define their own central registry, but components must not invent one-off error codes inside prompts.

## Severity model

| Severity | Meaning | Typical action |
|---|---|---|
| `info` | Non-blocking metadata | Record only |
| `warning` | Degraded but usable result | Continue with explanation |
| `recoverable` | Retry or fallback possible | Retry/fallback/escalate |
| `blocking` | Current path cannot continue | Stop candidate/workflow path |
| `critical` | Safety/security/system integrity risk | Stop, alert, audit |

## User display policy

Not every error should be shown to the user in raw form.

| Policy | Meaning |
|---|---|
| `internal_only` | Keep inside logs/audit only |
| `safe_summary` | Show non-technical user-safe explanation |
| `action_required` | Ask user for missing permission/input/decision |
| `technical_detail_allowed` | Technical details may be shown to admin/developer user |

## Audit events

Audit logs are used to explain important system behavior later. They are not just debug logs.

Audit events should be created for:

- memory reads and disclosure package generation,
- memory write candidates,
- policy/hard constraint rejection,
- public authority rule application,
- provider/tool fallback,
- confidence downgrade,
- final plan decision acceptance/rejection,
- user-visible warning generation,
- safety/security gate activation,
- human override,
- evaluation failure.

## Audit event structure

```json
{
  "audit_event_id": "audit_001",
  "trace_id": "trace_abc",
  "run_id": "run_123",
  "event_type": "candidate_rejected",
  "component_id": "day_planner",
  "reason_code": "POL-HARD-001",
  "summary": "Candidate rejected because it violated a hard user constraint.",
  "evidence_ids": ["ev_021"],
  "decision_id": "dec_007",
  "sensitive_data_redacted": true,
  "created_at": "2026-08-07T07:00:10Z"
}
```

## Logging levels

| Level | Use |
|---|---|
| `debug` | Local development and fixture inspection |
| `info` | Normal run progress and summary events |
| `warning` | Degraded result, fallback or weak evidence |
| `error` | Failed component or rejected path |
| `critical` | Safety, security or system integrity event |

Production systems should avoid logging raw sensitive input at any level.

## Redaction rules

Observability must be privacy-aware.

Rules:

- Do not log full raw memory by default.
- Do not log unnecessary personal identifiers.
- Do not log secrets, API keys, tokens or credentials.
- Do not log full provider payloads if they contain private data.
- Store summaries, ids and redacted snippets where possible.
- Preserve enough metadata to debug without overexposing user context.

## Metrics

A generic agentic system should track:

| Metric | Purpose |
|---|---|
| `workflow_success_rate` | Overall reliability |
| `component_failure_rate` | Fragile agent/tool detection |
| `policy_rejection_rate` | Hard constraint and safety behavior |
| `fallback_rate` | Provider/tool quality monitoring |
| `verification_uncertain_rate` | Evidence quality monitoring |
| `average_latency_ms` | Runtime performance |
| `estimated_cost` | Budget control |
| `regression_pass_rate` | Release quality |
| `manual_intervention_rate` | Autonomy readiness |

## Decision traceability

Final user-facing outputs should be traceable back to internal decisions.

A final recommendation should be able to reference:

- the candidate id,
- the planner decision id,
- the evidence ids,
- the verification status,
- the confidence signal,
- the applied constraints,
- any warnings or assumptions.

This does not mean every internal detail must be displayed to the user. It means the system can explain itself when needed.

## Incident review

When a bad output, failed run or unsafe recommendation occurs, the system should support incident review:

```text
What was the user asking?
Which run produced the bad output?
Which agent/tool/provider contributed?
Was evidence missing, stale or conflicting?
Was a hard constraint ignored?
Was a policy gate bypassed?
Did a retry or fallback behave incorrectly?
Which fixture/regression test should be added?
```

## Agent behavior rules

Agents must:

- return structured errors when they fail,
- include evidence and decision ids when available,
- not invent error codes,
- not hide uncertainty,
- not silently ignore failed tool calls,
- not include private raw memory in logs,
- not treat logs as canonical memory.

## Orchestrator behavior rules

The Orchestrator must:

- assign trace/run ids,
- preserve parent-child run relationships,
- collect component outcomes,
- record retries and fallbacks,
- map errors to workflow decisions,
- ensure audit events are produced for important decisions,
- stop or degrade workflow according to severity and policy.

## Evaluator behavior rules

Evaluators must:

- consume run envelopes and audit events,
- detect missing evidence or unlogged decisions,
- fail tests when required observability is absent,
- compare regression traces across versions,
- distinguish answer quality failures from instrumentation failures.

## Tatil Modu reference example

Generic rule:

```text
Every final recommendation must be traceable to evidence, constraints and planner decisions.
```

Tatil Modu mapping:

```text
If the final plan recommends a beach:
- the activity candidate has an id,
- the source/evidence explains opening/availability if checked,
- women-only beach requirement is recorded as a constraint if relevant,
- route/parking uncertainty is recorded as a warning if weak,
- final output can explain why this option was selected or rejected.
```

If a route provider times out:

```text
error_code: CAP-TIMEOUT-001
severity: recoverable
retry_policy: alternative_provider
user_display_policy: safe_summary
final warning: Route time could not be freshly verified; use this as an estimate.
```

## Checklist

Before implementing an agentic system, verify:

- [ ] Every workflow has `trace_id`.
- [ ] Every component run has `run_id`.
- [ ] Parent-child run relationships are preserved.
- [ ] Error codes come from a central registry.
- [ ] Severity and retry policy are explicit.
- [ ] User-safe error display policy exists.
- [ ] Audit events exist for memory, policy, fallback and final decision events.
- [ ] Sensitive fields are redacted in logs.
- [ ] Cost and latency are measured.
- [ ] Final recommendations can be traced back to evidence and constraints.
- [ ] Regression tests can compare trace-level behavior, not only final text.
