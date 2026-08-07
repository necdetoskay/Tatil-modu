# H2 Policy Core Validation Record

## Status
```yaml
slice: policy_core_foundation
execution_status: pending_ci
primary_gate: L1
p0_failures_allowed: 0
```

## Scope
- Policy Decision Result
- hard constraint gate
- soft preference penalty path
- deterministic precedence resolver
- source precedence among equal-strength constraints
- evidence-required gate for hard constraints
- deterministic repeatability
- typecheck + package boundaries + Vitest

## P0 invariants
1. Hard constraint soft preference tarafından override edilemez.
2. Hard constraint mismatch `ineligible` üretir.
3. Hard constraint için missing/unverified evidence `eligible` üretemez.
4. Soft preference mismatch tek başına `ineligible` üretemez.
5. Explicit user constraint aynı strength'teki memory/default değerini ezer.
6. Aynı input aynı deterministic sonucu üretir.

## Completion rule
Bu kayıt yalnız GitHub Actions `Headless Core Gate` PASS sonrası `execution_status: pass` olarak güncellenir.
