# Test Pyramid and Fixture Execution Plan

## Amaç
`docs/25-headless-test-architecture/` tasarımını implementation koşularına dönüştürecek execution stratejisini belirlemek.

## Test piramidi
```text
çok sayıda hızlı deterministic test
  L0 contracts
  L1 policy/domain
  L2 capability/memory
  L3 agents
orta sayıda integration
  L4 orchestrator
  L5 verification/quality
az fakat kritik tam senaryo
  L6 golden E2E
  L7 adversarial/regression
ayrı ve kontrollü
  L8 real model/provider benchmark
```

## Çalıştırma profilleri
### `test:fast`
L0 + L1. Her local değişiklikte hedeflenir.

### `test:core`
L0–L3. PR açılmadan önce zorunlu.

### `test:integration`
L0–L5. PR CI zorunlu.

### `test:golden`
L0–L7. Merge gate.

### `test:model-eval`
L8. Scheduled/manual; merge için varsayılan zorunlu değil, provider/model release kararı için zorunlu olabilir.

## Fixture execution contract
Her fixture şunları taşır:
```yaml
fixture_id: required
version: required
severity: P0|P1|P2
layers: []
input_ref: required
mock_dataset_ref: optional
expected_assertions: []
forbidden_outcomes: []
repeatability_required: true|false
```

## Assertion türleri
- exact structural assertion
- invariant assertion
- set/membership assertion
- numeric/range assertion
- reason-code assertion
- trace/event assertion
- rubric threshold assertion

LLM text equality varsayılan assertion değildir.

## Flaky test politikası
P0 test quarantine edilemez. Flaky P0 = gate failure. P1/P2 flaky test geçici quarantine edilirse issue/reason/expiry zorunludur.

## Failure artifact
Her başarısız koşu minimum:
- fixture ID
- layer
- expected vs actual semantic diff
- trace ID
- reason code
- relevant artifacts
üretmelidir.
