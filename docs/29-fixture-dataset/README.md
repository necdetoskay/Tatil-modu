# 29 — Executable Fixture Dataset

**Doküman türü:** canonical executable fixture dataset design alanı  
**Durum:** first phase completed  
**UI:** locked

## Amaç
Agent Test Card ID'lerini gerçek, versioned ve makine tarafından çalıştırılabilir test verilerine dönüştürmek.

Bu klasör fixture'ların yapısını, ortak envelope'u, input payload'larını, mock capability cevaplarını, memory snapshot'larını, expected assertions'ları ve dataset versioning kurallarını tanımlar.

## Temel ilke
Bir Test Card ID ancak aşağıdaki parçalar mevcutsa executable kabul edilir:
```text
fixture metadata
+ canonical input
+ optional memory snapshot
+ optional mock capability responses
+ expected assertions
+ severity
+ traceability
```

## Artifact seti
| # | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Fixture Envelope Standard | `01-fixture-envelope-standard.md` | completed |
| 2 | Fixture ID and Versioning Policy | `02-fixture-id-versioning-policy.md` | completed |
| 3 | Input Payload Standard | `03-input-payload-standard.md` | completed |
| 4 | Mock Capability Response Standard | `04-mock-capability-response-standard.md` | completed |
| 5 | Memory Snapshot Standard | `05-memory-snapshot-standard.md` | completed |
| 6 | Expected Assertion Manifest | `06-expected-assertion-manifest.md` | completed |
| 7 | Trip Intake Executable Fixtures | `07-trip-intake-executable-fixtures.md` | completed |
| 8 | Policy and Family Executable Fixtures | `08-policy-family-executable-fixtures.md` | completed |
| 9 | Research and Logistics Executable Fixtures | `09-research-logistics-executable-fixtures.md` | completed |
| 10 | Accommodation and Activity Executable Fixtures | `10-accommodation-activity-executable-fixtures.md` | completed |
| 11 | Plan, Verification and Final Response Fixtures | `11-plan-verification-final-response-fixtures.md` | completed |
| 12 | Golden HS-001 Full Fixture Bundle | `12-HS-001-golden-fixture-bundle.md` | completed |
| 13 | Dataset Coverage and Traceability Matrix | `13-dataset-coverage-traceability-matrix.md` | completed |
| 14 | Dataset Completion Checklist | `14-fixture-dataset-completion-checklist.md` | completed |

## Runtime target
Doküman formatları implementation sırasında `packages/test-fixtures/` altında JSON/YAML fixture dosyalarına ve `packages/test-harness/` loader/assertion koduna dönüştürülecektir.

## Important distinction
```yaml
fixture_design_first_phase_completed: true
machine_readable_fixture_files_created: false
fixture_loader_implemented: false
assertion_runner_implemented: false
all_test_card_ids_materialized: false
```

Bu yüzden bu klasörün tamamlanması testlerin çalıştığı veya PASS olduğu anlamına gelmez.

## Current state
```yaml
fixture_dataset_design: first_phase_completed
next_implementation_dependency: H1_contracts_and_fixture_loader
headless_execution_gate: pending
ui_development_allowed: false
```
