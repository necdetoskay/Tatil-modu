# Implementation Sequence and Dependency Plan

## Prensip
Katmanlar yalnız teknik bağımlılığa göre değil, **test edilebilirlik bağımlılığına** göre uygulanır. Bir üst katman başlamadan alt katmanın ilgili gate'i PASS olmalıdır.

## Fazlar
### Phase A — Foundation
1. contracts + validators
2. domain primitives
3. error/reason code registry
4. observability trace primitives

Gate: L0 PASS.

### Phase B — Deterministic Core
5. policy engine
6. capability interfaces/gateway
7. mock providers
8. memory interfaces + in-memory implementation
9. verification core

Gate: L1–L2 PASS.

### Phase C — Agent Layer
10. Trip Intake
11. Constraint/Policy-facing agent adapter if canonical spec requires
12. candidate/research agents
13. logistics/family/accommodation/activity agents
14. day-plan composer
15. final response composer headless output

Her agent individually L3 PASS olmadan orchestrator entegrasyonuna alınmaz.

### Phase D — Coordination
16. orchestrator state model
17. routing/dependency graph
18. retry/fallback
19. quality feedback loop
20. terminal/finalization

Gate: L4 PASS.

### Phase E — Evaluation Core
21. quality engine implementation
22. executable golden fixtures
23. rubric/assertion runners
24. coverage/traceability report

Gate: L5–L6 PASS.

### Phase F — Resilience
25. adversarial fixtures
26. regression baseline
27. fault injection
28. deterministic repeatability checks

Gate: L7 PASS.

### Phase G — Real Model/Provider Evaluation
29. model adapters/evaluation-only provider mode
30. repeated benchmark runs
31. cost/latency/quality comparison

L8 production dependency değildir; model/provider seçim kanıtıdır.

## Dependency lock
```text
L0 → L1/L2 → L3 → L4 → L5/L6 → L7 → UI unlock review
```
Hiçbir sprint üst gate'i bypass edemez.
