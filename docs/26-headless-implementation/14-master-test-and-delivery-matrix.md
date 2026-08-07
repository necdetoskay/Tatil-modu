# Headless Implementation — Master Test & Delivery Matrix

## Amaç
H0–H12 boyunca hangi sprintin hangi katmanı ürettiğini, hangi test gate'ine sahip olduğunu ve sonraki aşamayı neyin açtığını tek yerde göstermek.

| Sprint | Ana çıktı | Test level | P0=0 | Sonraki kilit |
|---|---|---|---|---|
| H0 | repo/workspace/test foundation | foundation | zorunlu | H1 |
| H1 | contracts + domain | L0 | zorunlu | H2/H3/H4 temel bağımlılıkları |
| H2 | deterministic policy | L1 | zorunlu | policy-dependent layers |
| H3 | capability + mocks | L2 | zorunlu | capability-dependent agents |
| H4 | memory core | L2 | zorunlu | memory-aware agents |
| H5 | agent batch A | L3 | zorunlu | integration eligibility |
| H6 | agent batch B | L3 | zorunlu | H7 |
| H7 | orchestrator | L4 | zorunlu | H8/H9 |
| H8 | verification + quality | L5 | zorunlu | H9 |
| H9 | golden E2E | L6 | zorunlu | H10 |
| H10 | adversarial/regression | L7 | zorunlu | H11 |
| H11 | headless acceptance | L0–L7 closure | zorunlu | UI readiness review |
| H12 | real model/provider benchmark | L8 | selection critical | provider/model decision |

## Global Definition of Done
Hiçbir sprint aşağıdakiler olmadan tamamlanmış sayılmaz:
- implementation
- positive fixture
- negative/failure fixture
- automated test
- P0 classification
- traceability
- execution evidence
- documentation update

## Test pyramid
```text
çok sayıda pure unit/invariant test
        ↓
contract/policy/capability/memory tests
        ↓
individual agent tests
        ↓
orchestrator integration
        ↓
golden E2E
        ↓
adversarial/regression
        ↓
real model/provider benchmark
```

## Two-mode rule
### Deterministic Core Mode
- no live network
- fixed clock
- fixed seed
- mock providers
- fake/scripted model where necessary
- every PR/commit eligible

### Evaluation Mode
- real LLM/provider
- repeated runs
- cost/latency tracked
- not required for basic deterministic CI

## Stop-the-line conditions
Aşağıdakilerden biri oluşursa progression durur:
1. P0 failure.
2. Contract/schema drift.
3. Canonical requirement without test trace.
4. Flaky critical test.
5. Direct agent→provider veya agent→agent dependency.
6. Unauthorized memory write/privacy leak.
7. Unexpected network call in deterministic suite.
8. UI implementation before unlock.

## UI lock
```text
H0 → H1 → H2/H3/H4 → H5/H6 → H7 → H8 → H9 → H10 → H11
                                                            ↓ PASS
                                                  UI readiness review
                                                            ↓ PASS
                                                    UI implementation
```
