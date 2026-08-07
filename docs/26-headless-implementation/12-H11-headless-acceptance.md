# H11 — Headless Core Acceptance

**Durum:** planned  
**Requires:** L0–L7 PASS  
**Karar:** UI Unlock eligibility

## Amaç
Bütün headless çekirdeğin canonical özellikleri kapsadığını ve UI geliştirmesine geçmenin mimari/test açısından güvenli olduğunu resmi gate ile değerlendirmek.

## Zorunlu gate seti
```yaml
L0_contract_schema: PASS
L1_policy_domain: PASS
L2_capability_memory: PASS
L3_agents: PASS
L4_orchestrator: PASS
L5_verification_quality: PASS
L6_golden_e2e: PASS
L7_adversarial_regression: PASS
p0_failures: 0
```

## Coverage closure
Kod coverage tek başına yeterli değildir.

Her canonical requirement için:
```text
requirement
→ owner module
→ fixture
→ test
→ assertion
→ result
```
bağı bulunmalıdır.

P0 requirement trace coverage `%100` olmak zorundadır.

## Required acceptance evidence
- test run IDs / CI links
- commit SHA
- environment versions
- fixture catalog version
- requirement coverage report
- P0/P1/P2 summary
- known limitations
- flaky test report
- deterministic replay report
- unresolved blocker list

## Automatic FAIL conditions
- herhangi bir P0 failure
- skipped P0 test
- missing P0 trace
- flaky P0 test
- unauthorized network call
- UI code already introduced
- hard constraint bypass
- privacy leakage
- invalid final contract in golden suite

## Decision
```yaml
headless_core_accepted: true | false
ui_readiness_review_allowed: true | false
ui_development_allowed: false
```
H11 PASS doğrudan UI kodlamayı başlatmaz; yalnız ayrı UI readiness review'u açar.

## Principle
Testleri geçmek için test beklentisini gevşetmek yasaktır. Canonical requirement değişecekse önce design/ADR değişikliği gerekir.
