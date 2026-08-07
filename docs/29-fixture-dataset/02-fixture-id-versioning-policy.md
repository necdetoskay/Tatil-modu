# Fixture ID & Versioning Policy

## ID format
```text
TM-<SUITE>-<CATEGORY>-<NNN>
```
Examples:
- `TM-TI-HP-001`
- `TM-CP-P0-004`
- `TM-DP-EDGE-003`
- `TM-E2E-GOLD-001`

## Version
Fixture content semantiği değişirse version artar.
```yaml
fixture_id: TM-TI-HP-001
fixture_version: 1.0.0
```

## Change rules
### Patch
Expected assertion açıklaması veya metadata düzeltmesi; davranış değişmez.

### Minor
Yeni optional input/assertion eklenir; eski behavior korunur.

### Major
Scenario meaning veya expected verdict değişir.

## Immutable history
Regression veya promotion sonucunda kullanılan fixture version sonradan sessizce değiştirilmez. Benchmark result fixture version ile birlikte saklanır.

## Deprecation
Fixture kaldırılmak yerine deprecated işaretlenir ve replacement ID gösterilir.

## Dataset version
Bütün fixture catalogu ayrıca dataset version taşır:
```yaml
dataset_id: tatil-modu-headless-fixtures
dataset_version: 1.0.0
```

## Naming ownership
Suite kodları:
```text
TI Trip Intake
CP Constraint/Policy
FS Family Suitability
DC Destination Candidate
RL Route Logistics
AF Accommodation Fit
AT Activity Fit
DP Day Plan
VE Verification Evidence
FR Final Response
E2E Golden/Integration
```
