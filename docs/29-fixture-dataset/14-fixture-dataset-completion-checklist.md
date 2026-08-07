# Fixture Dataset Completion Checklist

## Standards
- [x] Fixture envelope standard defined.
- [x] ID/versioning policy defined.
- [x] Input payload standard defined.
- [x] Mock capability response standard defined.
- [x] Memory snapshot standard defined.
- [x] Assertion manifest standard defined.

## Agent coverage
- [x] Trip Intake concrete fixtures defined.
- [x] Policy concrete fixtures defined.
- [x] Family Suitability concrete fixtures defined.
- [x] Destination Candidate concrete fixtures defined.
- [x] Route & Logistics concrete fixtures defined.
- [x] Accommodation Fit concrete fixtures defined.
- [x] Activity Fit concrete fixtures defined.
- [x] Day Plan concrete fixtures defined.
- [x] Verification concrete fixtures defined.
- [x] Final Response concrete fixtures defined.

## E2E
- [x] HS-001 golden bundle defined.
- [x] Fixed clock/seed included.
- [x] Mock capability bundle included.
- [x] Uncertainty/fault conditions included.
- [x] Cross-layer assertions defined.

## Governance
- [x] P0 coverage traceability defined.
- [x] Dataset versioning defined.
- [x] Real-user-data prohibition defined.
- [x] Regression fixture growth rule defined.
- [x] No-network deterministic rule defined.

## Remaining implementation work
```yaml
fixture_design_first_phase_completed: true
machine_readable_fixture_files_created: false
fixture_loader_implemented: false
assertion_runner_implemented: false
all_test_card_ids_concretely_materialized: false
reason: implementation occurs during H1-H10
```

## Completion decision
Design-level fixture dataset foundation is complete. This does not mean the executable test suite has run or passed.

Before H11:
- every canonical Test Card ID must map to concrete JSON/YAML fixture(s),
- all P0 requirements must have executable assertions,
- fixture loader and assertion runner must pass validation,
- orphan/missing trace count must be zero.
