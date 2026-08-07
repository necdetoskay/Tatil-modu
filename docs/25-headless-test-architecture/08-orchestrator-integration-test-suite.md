# Orchestrator Integration Test Suite

## Amaç
Agent'lar izole olarak doğrulandıktan sonra orchestration state, routing, gate application, retry/fallback ve stop conditions davranışlarını test etmek.

## Zorunlu senaryolar
- normal sequential flow,
- allowed parallel branches,
- prerequisite missing,
- contract-invalid agent output,
- verification-required reroute,
- retryable failure,
- non-retryable failure,
- fallback path,
- quality revise loop,
- hard blocker stop,
- degraded completion,
- finalization success,
- retry budget exhausted.

## P0 invariant'lar
```yaml
p0_invariants:
  - expert_agents_never_call_each_other_directly
  - blocker_cannot_be_bypassed
  - invalid_contract_never_reaches_downstream
  - retry_loop_is_bounded
  - privacy_requirement_survives_state_transitions
  - quality_blocker_prevents_finalization
```

## State assertions
Her senaryo yalnız final sonucu değil state transition zincirini de doğrular.

## Gate
```yaml
suite: L4_orchestrator_integration
p0_pass_rate: 100%
p1_target_pass_rate: >=98%
ui_unlock_blocking: true
```
