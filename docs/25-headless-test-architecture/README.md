# 25 — Headless Test Architecture

**Doküman türü:** canonical headless core test architecture  
**Durum:** first phase tamamlandı  
**UI development:** locked  
**Production readiness:** kapalı

## Amaç
Tatil Modu'nun UI olmadan, arka plandaki tüm kritik katmanlarını bağımsız ve E2E olarak doğrulayacak test mimarisini tanımlar.

Bu klasör test runner implementation değildir; test suite kapsamını, seviye/gate modelini, coverage beklentisini, model/provider evaluation yaklaşımını ve UI Unlock Gate'i kanonik hale getirir.

## Test kapsamı
```yaml
covered_layers:
  - contracts_and_schemas
  - domain_and_policy
  - tool_and_capability
  - memory
  - agents
  - orchestrator
  - verification_and_evidence
  - quality_and_evaluation
  - observability_contracts
  - golden_e2e
  - adversarial_and_regression
  - model_and_provider_evaluation
```

## Test seviyesi zinciri
```text
L0 Contract & Schema Tests
→ L1 Pure Domain / Policy Tests
→ L2 Tool / Capability + Memory Tests
→ L3 Individual Agent Tests
→ L4 Orchestrator Integration Tests
→ L5 Verification / Quality Evaluation Tests
→ L6 Golden Scenario Headless E2E
→ L7 Adversarial / Regression Suite
→ L8 Real Model / Provider Benchmark
→ Headless Core Acceptance Gate
→ UI Readiness Review
```

## Severity sınıfları
```yaml
P0:
  meaning: critical_invariant
  required_pass_rate: 100%
  tolerated_failures: 0
P1:
  meaning: core_correctness
  target_pass_rate: >=98%
  tolerated_blocker_regression: 0
P2:
  meaning: quality_and_optimization
  threshold: rubric_defined
```

## UI Unlock ana kuralı
```yaml
ui_development_allowed: false
headless_core_accepted: false
unlock_readiness_when:
  l0_contract_suite: pass
  l1_policy_suite: pass
  l2_tool_memory_suite: pass
  l3_agent_suite: pass
  l4_orchestrator_suite: pass
  l5_quality_verification_suite: pass
  l6_golden_e2e_suite: pass
  l7_regression_suite: pass
  p0_failures: 0
```

## First-phase artifact seti
| # | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Test Architecture Principles | `01-test-architecture-principles.md` | completed |
| 2 | Test Layer and Suite Matrix | `02-test-layer-suite-matrix.md` | completed |
| 3 | Severity, Gate and Threshold Policy | `03-severity-gate-threshold-policy.md` | completed |
| 4 | Contract and Schema Test Suite | `04-contract-schema-test-suite.md` | completed |
| 5 | Policy and Domain Test Suite | `05-policy-domain-test-suite.md` | completed |
| 6 | Tool, Capability and Memory Test Suite | `06-tool-capability-memory-test-suite.md` | completed |
| 7 | Individual Agent Test Suite | `07-individual-agent-test-suite.md` | completed |
| 8 | Orchestrator Integration Test Suite | `08-orchestrator-integration-test-suite.md` | completed |
| 9 | Verification and Quality Test Suite | `09-verification-quality-test-suite.md` | completed |
| 10 | Golden E2E Scenario Suite | `10-golden-e2e-scenario-suite.md` | completed |
| 11 | Adversarial and Regression Suite | `11-adversarial-regression-suite.md` | completed |
| 12 | Model and Provider Evaluation Harness | `12-model-provider-evaluation-harness.md` | completed |
| 13 | Coverage and Traceability Matrix | `13-coverage-traceability-matrix.md` | completed |
| 14 | Test Data and Fixture Governance | `14-test-data-fixture-governance.md` | completed |
| 15 | Headless Core Acceptance Gate | `15-headless-core-acceptance-gate.md` | completed |
| 16 | Headless Test Architecture Completion Checklist | `16-headless-test-architecture-completion-checklist.md` | completed |

## Current status
```yaml
headless_test_architecture_first_phase_completed: true
ui_development_allowed: false
headless_core_accepted: false
next_stage: docs/24-implementation-readiness/
next_goal: complete_headless_implementation_readiness
```
