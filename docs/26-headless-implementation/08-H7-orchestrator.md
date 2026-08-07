# H7 — Orchestrator

**Durum:** planned  
**Requires:** integrated agents individually L3 PASS  
**Primary gate:** L4 Orchestrator Integration

## Amaç
Agent'ları doğrudan birbirine bağlamadan canonical workflow, routing, state transition, retry/fallback ve finalization davranışını tek orchestration katmanında yürütmek.

## Responsibilities
- workflow state
- dependency graph
- agent invocation
- capability context injection
- trace propagation
- retry budget
- fallback routing
- blocker handling
- clarification transition
- quality feedback routing
- terminal states
- final structured result

## State machine principle
State transition'lar explicit ve test edilebilir olmalıdır. Gizli prompt akışı orchestration state'i olamaz.

Örnek:
```text
received
→ normalized
→ researching
→ planning
→ verifying
→ quality_review
→ finalized
```
Yan yollar:
```text
→ needs_clarification
→ blocked
→ degraded
→ failed
```

## P0 invariants
1. Ineligible candidate downstream plan'a taşınamaz.
2. Failed verification verified state'e dönüşemez.
3. Retry budget sonsuz olamaz.
4. Agent başka agent'ı bypass ederek çağıramaz.
5. Trace id handoff boyunca kaybolamaz.
6. Hard blocker finalization ile gizlenemez.
7. Quality rejection bypass edilerek final üretilemez.

## Integration fixtures
- happy path
- clarification path
- capability timeout
- one agent failure
- recoverable degradation
- hard blocker
- verification rejection
- quality feedback loop
- retry exhaustion
- partial candidate survival

## Deterministic execution
Fake agent adapters ve mock capabilities ile aynı workflow fixture'ı aynı state transition sequence'ını üretmelidir.

## Definition of Done
```yaml
L4: PASS
p0_failures: 0
illegal_transitions: 0
infinite_retry_possible: false
trace_loss: 0
direct_agent_to_agent_calls: 0
terminal_state_coverage: complete
```
