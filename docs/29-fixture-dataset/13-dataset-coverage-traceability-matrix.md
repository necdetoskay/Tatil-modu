# Dataset Coverage & Traceability Matrix

## Amaç
Canonical requirement'ların hangi fixture ve assertion setiyle korunduğunu görünür hale getirmek.

| Requirement | Owner | Fixture examples | Severity |
|---|---|---|---|
| hard constraint preserved | Trip Intake / Policy | TM-TI-HP-001, TM-CP-P0-004 | P0 |
| women-only beach conditional gate | Policy / Activity / Verification | TM-CP-P0-001, TM-AT-P0-001/002, TM-VE-P0-002, TM-E2E-GOLD-001 | P0 |
| max radius respected | Policy / Destination / Logistics | TM-CP-P0-002/003, TM-DC-META-001, TM-E2E-GOLD-001 | P0 |
| budget cap respected | Policy / Accommodation / Plan | TM-CP-P0-005, TM-AF-P0-002, TM-E2E-GOLD-001 | P0 |
| toddler/rest requirement | Intake / Family / Plan | TM-TI-HP-001, TM-FS-P0-001, TM-DP-P0-001, TM-E2E-GOLD-001 | P0 |
| unknown stays unknown | Logistics / Accommodation / Verification | TM-RL-P0-002, TM-AF-EDGE-001, TM-VE-P0-003 | P0/P1 |
| no fabricated evidence | Verification / Final | TM-VE-P0-004, TM-FR-P0-001 | P0 |
| final composer no tool call | Final Response | TM-FR-P0-003 | P0 |
| no city fabrication in intake | Trip Intake | TM-TI-MISS-001, TM-TI-NOGOAL-001 | P0 |
| memory source and scope preserved | Trip Intake / Memory | TM-TI-MEM-001 | P0 |
| no direct provider fallback in deterministic tests | Capability platform | mock standard + fault bundles | P0 |
| policy-ineligible candidate absent from final | Policy / Plan / E2E | TM-DP-P0-002/003, TM-E2E-GOLD-001 | P0 |
| daily alternatives | Intake / Plan / E2E | TM-TI-HP-001, TM-DP-HP-001, TM-E2E-GOLD-001 | P1/P0 where explicit hard requirement |
| excessive travel load detectable | Family / Logistics / Plan | TM-FS-EDGE-002, TM-RL-EDGE-002, TM-DP-EDGE-001 | P1/P0 if hard low-fatigue |

## Coverage rule
P0 canonical requirement fixture veya executable assertion'a bağlanmamışsa dataset completion PASS olamaz.

## Test Card mapping
Her `docs/28-agent-test-cards/` ID'si implementation sırasında en az bir concrete fixture ID'ye map edilir. Catalog-level placeholder mapping execution için yeterli değildir.

## Coverage report target
```yaml
p0_requirement_trace_coverage: 100%
p0_orphan_fixtures: 0
p0_orphan_assertions: 0
unmapped_agent_test_cards: 0_before_H11
```

## Growth rule
Yeni capability, memory behavior, agent responsibility veya policy rule eklenirse aynı değişiklik seti fixture coverage impact kaydı içermelidir.
