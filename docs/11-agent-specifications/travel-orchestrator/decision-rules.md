# TM-ORCH-001 — Decision Rules

## Deterministic ordering

```text
OR-001 registry/contract completeness
OR-002 graph validity / acyclic dependency DAG
OR-003 node selection policy
OR-004 dependency readiness
OR-005 context manifest validity/freeze
OR-006 specialist execution through harness
OR-007 handoff validation
OR-008 retry/recheck classification
OR-009 repair-loop bound
OR-010 verification gate
OR-011 state-commit gate
OR-012 explanation/final composition eligibility
```

Soft workflow optimization cannot bypass any earlier rule.

## OR-001 Registry completeness
A selected node must bind `agentId + contractVersion + contractHash` from the frozen registry snapshot. Missing/mismatched contract → BLOCKED/FAILED.

## OR-002 Graph validity
The static dependency graph must be acyclic. Verification/repair repetitions are represented as bounded loop records, not hidden DAG cycles.

## OR-003 Node selection
Every conditional node receives `SELECTED | SKIPPED | DEFERRED` with reason/policy refs. Silent omission is forbidden.

## OR-004 Dependency readiness
A node becomes READY only if all required dependencies have succeeded or are explicitly policy-validly skipped. Optional dependencies cannot masquerade as required evidence.

## OR-005 Context lifecycle
Each node attempt must bind exactly one frozen ContextManifest. Changed context on retry requires a new manifest/ref/hash.

## OR-006 Harness-only execution
Specialist work executes through Agent Contract Harness. Direct underlying model/domain-tool execution by Orchestrator is forbidden.

## OR-007 Handoff validation
Before downstream execution:
- producer status valid,
- output schema valid,
- expected object/version valid,
- required refs resolvable,
- snapshot compatibility valid,
- authority policy valid.

Invalid handoff never reaches consumer.

## OR-008 Retry/recheck
Retry must be based on FailureAttribution. Blind identical retry is forbidden unless policy explicitly classifies the failure as transient and retryable.

Retry attempt increments and is bounded. Context/model/adapter changes are traceable.

## OR-009 Repair loop
Each repair loop records:
- verification ref,
- repair target refs,
- owner/recheck nodes activated,
- AdaptiveRepairResult ref,
- subsequent verification ref.

Maximum loop count is policy-bound. Exhaustion → BLOCKED/FAILED, never infinite regeneration.

## OR-010 Verification
Explanation/Final Composer may only run from `VerificationResult.status=PASS` bound to the candidate snapshot hash.

## OR-011 State commit
Durable commit:

```text
PASS + matching snapshot hash → COMMIT_ALLOWED
REPAIR/FAIL/missing/mismatch → COMMIT_BLOCKED
```

## OR-012 Terminal completion
`COMPLETED` requires:
- final verification PASS,
- FinalTravelPlan structurally valid,
- no unresolved mandatory workflow failure,
- commit outcome consistent with configured persistence policy.

## Parallelism
Nodes can run concurrently only if no dependency/state conflict exists. Parallel runs may not mutate shared frozen outputs.

## Graph revision
Any add/remove/reactivate/edge change after graph freeze creates an ordered GraphRevision with prior/new hash and trigger/reason refs.

## Issue #49
If enriched corridor is disabled, corridor-specific nodes may be SKIPPED with reason. If enabled, logistics/value/enrichment/recalculation sequence must preserve ownership.

## Issue #50
Knowledge freshness metadata may choose HIT/REFRESH/DISCOVERY routing, but stale dynamic knowledge must not suppress required specialist refresh/verification.

## Issue #51
Trip dates/event preferences may add event/season verification nodes. Recurring-event memory cannot satisfy exact-occurrence dependency.

## Failure oracles

- invalid DAG → FAIL
- dependency-order violation → FAIL
- invalid handoff forwarded → FAIL
- direct domain tool → FAIL
- identical blind retry without allowed transient class → FAIL
- repair loop exceeds max → BLOCKED/FAIL
- graph mutation without revision → FAIL
- state commit without PASS → FAIL
- Final Composer before PASS → FAIL
- missing failure attribution for failed node → FAIL