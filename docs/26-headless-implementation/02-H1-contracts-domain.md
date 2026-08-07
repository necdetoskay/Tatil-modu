# H1 — Contracts & Domain

**Durum:** planned / locked by H0  
**Primary gate:** L0 Contract & Schema  
**P0 tolerance:** 0

## Amaç
`docs/12-contracts/` altında freeze edilmiş canonical sözleşmeleri executable runtime schema ve framework-bağımsız domain primitive'lerine dönüştürmek.

H1 business planning yapmaz; yalnız sistemin hangi veriyi güvenle taşıyabileceğini tanımlar.

## Implementation scope
### `packages/contracts`
- contract version primitive
- common handoff envelope
- travel request schema
- constraint policy schema
- family suitability schema
- destination candidate schema
- route logistics schema
- accommodation fit schema
- activity fit schema
- day plan schema
- verification evidence schema
- final response schema
- common evidence envelope
- common error envelope
- runtime validators
- parse/result helpers

### `packages/domain`
- IDs: trace, request, trip, candidate, evidence, claim, fixture
- date/time and duration primitives
- money/currency primitive
- distance primitive
- age/family primitives
- geographic radius primitive
- hard/soft constraint representation
- confidence representation
- evidence status
- verification status
- validation status
- clarification state
- reason/error code registry

## Contract implementation rule
Canonical docs değiştirilmeden runtime schema keyfi alan ekleyemez. Uyuşmazlık görülürse implementation hack yapılmaz; design amendment/ADR açılır.

## Runtime validation layers
```text
shape validation
→ semantic validation
→ forbidden-field validation
→ version validation
→ envelope validation
```

Policy kararı H1'in görevi değildir. H1 yalnız policy'nin kullanacağı veriyi temsil eder.

## L0 test suites
### Positive
Her canonical contract için minimum bir valid fixture parse edilmelidir.

### Negative
- required field missing
- invalid enum/state
- malformed evidence
- missing version
- missing trace id
- unsupported version
- forbidden internal field
- invalid confidence range
- impossible primitive values

### Round-trip
Fixture → parse → normalized representation → serialize → parse davranışı veri kaybı yaratmamalıdır.

## P0 examples
| ID | Beklenti |
|---|---|
| H1-P0-001 | hard constraint alanı soft'a sessizce dönüşemez |
| H1-P0-002 | claim varsa evidence durumu temsil edilebilir olmalı |
| H1-P0-003 | unverified durum `verified=true` olarak normalize edilemez |
| H1-P0-004 | contract version olmadan handoff kabul edilemez |
| H1-P0-005 | trace id olmadan canonical handoff kabul edilemez |
| H1-P0-006 | para birimi olmadan parasal değer canonical amount sayılamaz |

## Fixture deliverables
`packages/test-fixtures` içinde:
```text
contracts/valid/
contracts/invalid/
contracts/versioning/
domain/boundaries/
```

Fixture'lar insan okunabilir ve stable ID'li olmalıdır.

## Traceability
Her schema/test şu bağı kurar:
```text
canonical contract section
→ runtime schema
→ fixture id
→ test id
→ result
```

## Definition of Done
```yaml
all_canonical_contracts_implemented: true
runtime_validation_available: true
positive_fixtures_pass: true
negative_fixtures_rejected: true
version_tests_pass: true
p0_failures: 0
L0: PASS
```

## Explicitly out of scope
- policy evaluation
- provider calls
- memory persistence
- agent prompts
- orchestration
- UI
