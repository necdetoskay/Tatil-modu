# Fixture Envelope Standard

## Canonical shape
```yaml
fixture:
  fixture_id: required
  fixture_version: required
  suite_id: required
  agent_id: optional
  scenario_type: happy_path|missing_input|conflict|edge|capability_failure|memory_privacy|adversarial|regression|golden_e2e
  severity: P0|P1|P2
  deterministic: true
  clock: ISO-8601
  seed: integer
  input: {}
  memory_snapshot_ref: optional
  capability_bundle_ref: optional
  expected_assertions_ref: required
  traceability:
    canonical_docs: []
    test_card_ids: []
    requirement_ids: []
  tags: []
```

## Kurallar
1. `fixture_id` immutable kimliktir.
2. Input dışında saklı beklenen cevap bulunmaz.
3. P0 fixture deterministic olmalıdır.
4. Fixture canlı network'e bağımlı olamaz.
5. Relative date kullanılan senaryoda fixed clock zorunludur.
6. Mock capability sonucu fixture'dan bağımsız gizli state kullanamaz.
7. Sensitive gerçek kullanıcı verisi fixture'a konmaz.

## Bundle
Bir E2E fixture birden fazla alt artifact'i referanslayabilir:
```yaml
bundle:
  request_fixture: ...
  memory_snapshot: ...
  capability_responses: []
  expected_assertions: ...
```

## Loader expectation
Fixture loader bilinmeyen field, unsupported version veya missing reference durumunda fail-fast davranmalıdır.
