# Contract and Schema Test Suite

## Amaç
Canonical request/response/evidence/error/policy/memory contract'larının runtime'da güvenli ve versioned şekilde uygulanacağını doğrulamak.

## Zorunlu test sınıfları
- valid payload acceptance,
- missing required field rejection,
- unknown/forbidden field policy,
- enum/status validation,
- version compatibility,
- backward compatibility expectations,
- malformed evidence rejection,
- invalid confidence/verification combination,
- invalid lifecycle transition,
- serialization/deserialization round-trip.

## P0 örnekleri
```yaml
p0_contract_invariants:
  - invalid_hard_constraint_result_cannot_pass
  - evidence_without_required_provenance_rejected
  - unsupported_contract_version_rejected
  - invalid_memory_disclosure_scope_rejected
  - blocker_status_cannot_be_serialized_as_pass
```

## Gate
```yaml
suite: L0_contract_schema
required_pass_rate: 100%
ui_unlock_blocking: true
```
