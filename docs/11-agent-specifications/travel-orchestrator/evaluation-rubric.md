# TM-ORCH-001 — Evaluation Rubric

## Evaluation principle

Orchestrator quality is primarily structural and deterministic. Semantic evaluation cannot override graph, authority, handoff, context, retry or state-gate failures.

## R0 Contract
PASS requires:
- registry entry and contract hash present,
- input/output schemas valid,
- policy refs present,
- 16 specialist IDs resolvable.

## R1 Deterministic
PASS requires:
- valid dependency DAG,
- no node before required dependencies,
- every conditional node has disposition,
- every graph mutation has GraphRevision,
- bounded retry and repair loops,
- frozen context attempt semantics,
- invalid handoff blocked,
- Verification PASS required before final composition/state commit.

## R2 Fixture orchestration
PASS requires expected node path, handoffs, repair loops and terminal status for recorded scenarios.

## R3 Integration
Evaluate Agent Harness/ToolGateway/checkpoint/state-gate integration and normalized failure propagation.

## R4 Semantic workflow quality
Only after structural PASS, evaluate whether optional capability selection is efficient and appropriate. Semantic score cannot excuse mandatory-node omission.

Suggested 1–5 dimensions:
- capability selection efficiency,
- unnecessary work avoidance,
- repair routing precision,
- user-intent continuity.

## R5 Adversarial
Must cover:
- malformed graph/registry,
- stale/missing knowledge,
- provider failures,
- conflicting event evidence,
- budget exhaustion,
- context mismatch,
- repair cascade,
- state commit attacks.

## R6 Authority
Any direct domain tool call, specialist-decision takeover or unverified state commit = FAIL.

## R7 Live
Controlled E2E only after fixture/integration gates. Report latency/cost/tool calls and no hidden fixture fallback.

## R8 Regression
Every confirmed orchestration defect becomes a replayable workflow fixture.

## Key metrics

- selected node count vs required node count,
- unnecessary node executions,
- invalid handoffs forwarded (target 0),
- authority violations (target 0),
- unbounded retries/loops (target 0),
- state commit violations (target 0),
- graph revisions missing provenance (target 0),
- failure attribution completeness (target 100%),
- context-manifest coverage per attempt (target 100%).

## Final verdict

`PASS` only if all blocking deterministic/authority conditions pass. A high workflow-quality score with a structural failure is still FAIL.