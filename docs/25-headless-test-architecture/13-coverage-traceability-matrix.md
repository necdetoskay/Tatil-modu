# Coverage and Traceability Matrix

## Amaç
Her canonical requirement, agent responsibility, contract, policy, memory rule, capability, workflow gate ve quality invariant'ın en az bir test ile kapsandığını kanıtlamak.

## Traceability zinciri
```text
Requirement / Design Rule
→ canonical document + section/ref
→ test suite
→ fixture/scenario
→ assertion
→ severity (P0/P1/P2)
→ latest result
```

## Coverage boyutları
- product behavior coverage,
- agent responsibility coverage,
- non-goal/forbidden behavior coverage,
- contract field/transition coverage,
- capability permission/error coverage,
- memory read/write/privacy coverage,
- policy precedence/hard constraint coverage,
- workflow/routing/retry/fallback coverage,
- verification/evidence/confidence coverage,
- quality rubric/hard failure coverage,
- observability event/redaction coverage,
- golden journey coverage,
- adversarial failure-mode coverage.

## UI Unlock coverage kuralı
Bir canonical P0 requirement test trace'i olmadan UI Unlock Gate PASS olamaz.

```yaml
coverage_gate:
  p0_requirements_traced: 100%
  p0_requirements_tested: 100%
  p0_requirements_passing: 100%
  orphan_critical_requirements: 0
  orphan_p0_tests: 0
```

## Feature completeness matrisi
Her first-phase ürün özelliği en az:
1. owner,
2. contract,
3. workflow path,
4. fixture,
5. expected behavior,
6. failure behavior,
7. test suite,
8. acceptance result
ile ilişkilendirilmelidir.

Bu matris 'kod coverage %' ile aynı şey değildir. Kod coverage yardımcı metriktir; esas hedef canonical davranış coverage'ıdır.
