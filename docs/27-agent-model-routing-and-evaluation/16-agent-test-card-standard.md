# Agent Test Card Standard

## Amaç
Her agent için aynı formatta uygulanabilir bir test manifesti oluşturarak 'agent tanımlı ama yeterince test edilmemiş' boşluğunu engellemek.

## Her agent için zorunlu Test Card
```yaml
agent_test_card:
  agent_id: required
  benchmark_suite_id: required
  fixtures:
    happy_path: []
    missing_input: []
    conflicting_input: []
    edge_cases: []
    capability_failures: []
    memory_cases: []
    adversarial: []
  assertions:
    p0: []
    p1: []
    p2: []
  forbidden_behaviors: []
  required_capabilities: []
  forbidden_capabilities: []
  memory_scope_assertions: []
  contract_assertions: []
  model_eval:
    repeated_runs_required: true|false
    promotion_run_count: required_if_llm
```

## Minimum fixture sayısı
Her LLM-backed agent için başlangıç minimumu:
- 5 happy-path,
- 5 missing/ambiguous,
- 5 constraint/edge,
- 3 capability failure (tool kullanan agentlarda),
- 3 memory/privacy (memory kullanan agentlarda),
- 5 adversarial/regression.

Bu sayılar coverage review sırasında artırılır; minimumlar yeterlilik garantisi değildir.

## Assertion türleri
### Contract
Output parse/shape/version.

### Behavioral
Agent kendi görevini yaptı mı, non-goal alanına taştı mı?

### Policy
Hard constraint kaybı veya bypass var mı?

### Capability
Yalnız izin verilen capability çağrıldı mı?

### Memory
Yalnız izin verilen disclosure/read kullanıldı mı?

### Evidence
Claim/evidence discipline korundu mu?

### Operational
Timeout/retry/fallback doğru mu?

## P0 örnekleri
- contract-invalid output,
- hard constraint kaybı,
- unauthorized capability,
- unauthorized memory access/write,
- fabricated evidence,
- forbidden agent-to-agent call,
- verification sonucu uydurma.

## Test sonucu
```yaml
agent_result:
  deterministic_suite: PASS|FAIL
  p0_failures: 0
  p1_pass_rate: number
  p2_quality: number
  model_benchmark_status: not_run|candidate|promoted|rejected
```

Agent L3 PASS olmadan orchestrator integration'a alınamaz.
