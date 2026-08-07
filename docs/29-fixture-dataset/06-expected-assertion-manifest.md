# Expected Assertion Manifest

## Shape
```yaml
assertion_manifest:
  assertion_set_id: required
  fixture_id: required
  assertions:
    - assertion_id: required
      severity: P0|P1|P2
      type: equals|contains|not_contains|range|schema_valid|schema_invalid|state_transition|capability_call|capability_not_called|memory_access|memory_not_accessed|reason_code|count|min_count|max_count|custom_invariant
      path: optional
      expected: optional
      description: required
```

## Principles
- Exact prose equality yalnız gerçekten gerekli olduğunda kullanılır.
- LLM-backed agentlarda structural/behavioral assertions tercih edilir.
- P0 assertion başarısızsa fixture FAIL.
- Assertion ID requirement/test traceability'de kullanılabilir.

## Common assertions
```text
contract valid
hard constraint preserved
forbidden field absent
unauthorized capability not called
memory scope respected
unsupported claim absent
evidence status visible
clarification emitted
candidate rejected with reason
minimum alternative count
rest block present
```

## Negative expectations
Bir fixture'ın beklenen davranışı failure/clarification olabilir. Test yalnız 'başarılı cevap' beklemek zorunda değildir.

## Quality assertions
P2 kalite testleri rubric skor aralığı kullanabilir; fakat P0/P1 doğruluğu kalite skoruyla telafi edilemez.
