# 29 — Executable Fixture Dataset

**Doküman türü:** canonical executable fixture dataset design alanı  
**Durum:** first phase in progress  
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

## İlk-phase artifact seti
| # | Artifact | Dosya |
|---:|---|---|
| 1 | Fixture Envelope Standard | `01-fixture-envelope-standard.md` |
| 2 | Fixture ID and Versioning Policy | `02-fixture-id-versioning-policy.md` |
| 3 | Input Payload Standard | `03-input-payload-standard.md` |
| 4 | Mock Capability Response Standard | `04-mock-capability-response-standard.md` |
| 5 | Memory Snapshot Standard | `05-memory-snapshot-standard.md` |
| 6 | Expected Assertion Manifest | `06-expected-assertion-manifest.md` |
| 7 | Trip Intake Executable Fixtures | `07-trip-intake-executable-fixtures.md` |
| 8 | Policy and Family Executable Fixtures | `08-policy-family-executable-fixtures.md` |
| 9 | Research and Logistics Executable Fixtures | `09-research-logistics-executable-fixtures.md` |
| 10 | Accommodation and Activity Executable Fixtures | `10-accommodation-activity-executable-fixtures.md` |
| 11 | Plan, Verification and Final Response Fixtures | `11-plan-verification-final-response-fixtures.md` |
| 12 | Golden HS-001 Full Fixture Bundle | `12-HS-001-golden-fixture-bundle.md` |
| 13 | Dataset Coverage and Traceability Matrix | `13-dataset-coverage-traceability-matrix.md` |
| 14 | Dataset Completion Checklist | `14-fixture-dataset-completion-checklist.md` |

## Runtime target
Doküman formatları daha sonra `packages/test-fixtures/` altında JSON/YAML fixture dosyalarına ve `packages/test-harness/` loader/assertion koduna dönüştürülecektir.

## Current state
```yaml
fixture_dataset_design: in_progress
executable_fixture_code: not_started
ui_development_allowed: false
```
