# Individual Agent Test Suite

## Amaç
Her agent'ın görevini diğer agent'lardan ve gerçek provider'lardan izole şekilde doğrulamak.

## Test modeli
Her agent için:
- canonical input fixture,
- mocked memory disclosure,
- mocked capability responses,
- expected contract invariants,
- forbidden behavior assertions,
- evidence/confidence expectations,
- failure behavior,
- observability event expectations
bulunur.

## Agent bazlı zorunlu testler
Her canonical agent en az şu sınıflarda test edilir:
1. happy path,
2. missing optional input,
3. missing blocking input,
4. conflicting input,
5. evidence gap,
6. tool/capability failure,
7. hard constraint interaction,
8. contract-invalid downstream prevention,
9. deterministic fixture regression,
10. prompt/model variation semantic invariant.

## Exact-text yasağı
LLM tabanlı agent testlerinde varsayılan assertion tam metin eşleşmesi değildir. Şunlar doğrulanır:
```yaml
semantic_assertions:
  - output_contract_valid
  - required_facts_preserved
  - forbidden_claims_absent
  - evidence_refs_present_when_required
  - hard_constraints_preserved
  - reason_codes_valid
```

## Gate
```yaml
suite: L3_individual_agents
p0_pass_rate: 100%
p1_target_pass_rate: >=98%
known_systematic_failures: 0
ui_unlock_blocking: true
```
