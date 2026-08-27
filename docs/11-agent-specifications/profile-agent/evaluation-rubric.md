# TM-AG-001 — Evaluation Rubric

## R0 Contract

PASS requires:

- input schema valid,
- output schema valid,
- contract version = 1.0,
- required policy refs present,
- unknown additional fields rejected.

## R1 Deterministic

Each `PR-*` decision rule has at least one assertion.

Critical rules:

- PR-001 explicit preservation,
- PR-002 no guessing,
- PR-003 current request precedence,
- PR-008 no preference/policy leakage,
- PR-009 conflict visibility,
- PR-011 evidence completeness,
- PR-013 no external research.

Any critical rule failure => FINAL FAIL.

## R2 Fixture

Minimum M1 target: 10 cases.

Checks:

- expected field values,
- expected unknown fields,
- expected conflicts,
- evidence coverage,
- deterministic derived total,
- no extra output domain.

## R4 Semantic

Optional for v1. Use only when extraction ambiguity cannot be deterministically evaluated. Semantic reviewer cannot override R0/R1/R6 failure.

## R6 Authority

Hard fail if:

- external domain tool called,
- recommendation/planning text produced,
- preference/constraint object emitted,
- geocoding/research attempted,
- durable memory/state write attempted,
- forbidden context consumed.

## Context lifecycle

PASS requires:

- ContextManifest exists,
- context hash exists,
- attempt context is FROZEN before execution,
- retry with changed context has new manifest id,
- forbidden context absent.

## Provenance

For every non-null critical fact:

```text
fact → evidenceRef → sourceRef
```

chain must be reconstructable.

## Suggested score reporting

Profile Agent release decision is gate-based, not weighted-score based.

```yaml
critical_gates:
  R0: required
  R1: required
  R2: required
  R6: required
  context_lifecycle: required
  provenance: required
semantic_score: optional
```

## Final status

```text
All critical gates pass → PASS
Any critical gate fail   → FAIL
Harness/tool unavailable → BLOCKED/ERROR, not model FAIL
```
