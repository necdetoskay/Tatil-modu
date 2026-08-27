# TM-ORCH-001 — Tool Policy

## Allowed tools

Directly allowed:
- `TL-012` Schema Validator — graph/handoff/result contract checks.
- `TL-014` Cache — orchestration/checkpoint metadata only.

Harness/internal capabilities:
- AgentRegistry lookup,
- ContractLoader,
- ContextAssembler,
- OrchestrationRunner,
- TraceRecorder,
- FailureAttributor,
- VerifiedStateGate.

These are harness components, not domain research tools.

## Forbidden direct domain tools

The Orchestrator must never directly call:
- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-003` Geocoding
- `TL-004` Place Search
- `TL-005` Directions & Distance Matrix
- `TL-006` Weather Forecast
- `TL-007` Climate Normals
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price & Fee Lookup
- `TL-011` Calculator for domain calculations
- `TL-013` Rule Engine for specialist-owned domain decisions

The relevant specialist agent may call those tools through ToolGateway according to its own contract.

## Tool-call invariant

Every external domain tool trace must bind a specialist `agentId`, never `TM-ORCH-001`.

## Budget/quota behavior

Quota exhaustion cannot make the Orchestrator call a forbidden alternative tool or silently skip mandatory verification. It must route to retry/fallback policy or terminate BLOCKED/FAILED.

## Tests

R6 must assert:
- all domain tool requests from TM-ORCH-001 are blocked before adapter execution,
- the blocked request is traced as authority violation,
- a specialist-owned equivalent request remains allowed when its specialist policy allows it.