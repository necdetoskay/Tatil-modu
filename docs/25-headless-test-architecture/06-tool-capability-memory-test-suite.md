# Tool, Capability and Memory Test Suite

## Amaç
Tool Gateway, capability izinleri, provider adapter sınırları ve Memory Platform davranışlarını gerçek provider olmadan deterministic olarak doğrulamak.

## Tool / capability testleri
- capability permission allow/deny,
- unknown capability rejection,
- provider adapter selection boundary,
- timeout/error mapping,
- retryability classification,
- freshness metadata propagation,
- evidence envelope generation,
- fallback provider behavior,
- provider-specific payload leakage prevention.

## Memory testleri
- disclosure package scope,
- agent-specific read visibility,
- no direct canonical write by agent,
- write candidate creation,
- consent required paths,
- correction/deletion precedence,
- stale/conflicting memory behavior,
- privacy-sensitive field handling,
- session vs canonical memory separation.

## P0 invariant'lar
```yaml
p0_invariants:
  - agent_cannot_call_provider_directly
  - agent_cannot_write_canonical_memory_directly
  - unauthorized_memory_field_not_disclosed
  - sensitive_memory_not_committed_without_required_consent
  - tool_result_without_evidence_metadata_not_accepted_when_required
```

## Gate
```yaml
suite: L2_tool_capability_memory
required_p0_pass_rate: 100%
core_target_pass_rate: 100%
ui_unlock_blocking: true
```
