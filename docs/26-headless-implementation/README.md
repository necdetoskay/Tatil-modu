# 26 — Headless Implementation Execution

**Doküman türü:** canonical implementation execution plan  
**Amaç:** H0–H12 sprintlerinin gerçek kod, test ve execution evidence durumunu yönetmek.  
**Plan seti:** complete  
**Execution:** H0 validation pending

## Current state
```yaml
current_sprint: H0_repository_foundation
implementation_state: code_complete_validation_pending
implementation_plan_H0_H12: complete
ui_development_allowed: false
h1_execution_allowed: false
```

## Canonical sprint seti
| # | Sprint | Belge | Gate |
|---:|---|---|---|
| 1 | H0 Repository Foundation | `01-H0-repository-foundation.md` | foundation execution |
| 2 | H1 Contracts & Domain | `02-H1-contracts-domain.md` | L0 |
| 3 | H2 Policy Core | `03-H2-policy-core.md` | L1 |
| 4 | H3 Capability & Mock Platform | `04-H3-capability-mock-platform.md` | L2 capability |
| 5 | H4 Memory Core | `05-H4-memory-core.md` | L2 memory |
| 6 | H5 Agent Batch A | `06-H5-agent-batch-A.md` | L3 |
| 7 | H6 Agent Batch B | `07-H6-agent-batch-B.md` | L3 |
| 8 | H7 Orchestrator | `08-H7-orchestrator.md` | L4 |
| 9 | H8 Verification & Quality | `09-H8-verification-quality.md` | L5 |
| 10 | H9 Golden Headless E2E | `10-H9-golden-e2e.md` | L6 |
| 11 | H10 Adversarial & Regression | `11-H10-adversarial-regression.md` | L7 |
| 12 | H11 Headless Acceptance | `12-H11-headless-acceptance.md` | L0–L7 closure |
| 13 | H12 Model & Provider Evaluation | `13-H12-model-provider-evaluation.md` | L8 |
| 14 | Master Test & Delivery Matrix | `14-master-test-and-delivery-matrix.md` | cross-sprint |

## Execution law
```text
DESIGN COMPLETE ≠ IMPLEMENTATION PASS
CODE COMPLETE ≠ SPRINT PASS
TEST WRITTEN ≠ TEST PASS
ONLY EXECUTION EVIDENCE + GATE PASS → NEXT STAGE
```

## H0 üretilen temel
- pnpm workspace
- strict TypeScript baseline
- Vitest deterministic baseline
- package boundary guard
- headless CLI skeleton
- canonical package skeletons
- H0 repository invariant tests
- GitHub Actions H0 gate
- PR-based CI validation attempt

## H0 kapanış şartı
```text
pnpm install
pnpm typecheck
pnpm test:boundaries
pnpm test
# veya birleşik:
pnpm test:h0
```

Connector üzerinden workflow run sonucu henüz görünür olmadığı için H0 PASS ilan edilmemiştir.

## Global progression
```text
H0
 ↓
H1 / L0
 ↓
H2 + H3 + H4 / L1-L2
 ↓
H5 + H6 / L3
 ↓
H7 / L4
 ↓
H8 / L5
 ↓
H9 / L6
 ↓
H10 / L7
 ↓
H11 Headless Acceptance
 ↓ PASS
UI Readiness Review
 ↓ PASS
UI implementation unlock
```

H12 real model/provider evaluation deterministic L0–L7 gate'lerinin yerine geçmez.

## Global rules
1. P0 failure varsa progression durur.
2. Her canonical P0 requirement test trace'ine sahip olmalıdır.
3. Agent provider'ı doğrudan çağıramaz.
4. Agent agent'ı doğrudan çağıramaz.
5. Policy hard constraint'leri deterministic olarak enforce eder.
6. Memory canonical write ownership'i Memory Platform'dadır.
7. Deterministic suite live network kullanmaz.
8. Gerçek model/provider testleri evaluation mode'dadır.
9. `apps/web` H11 + UI readiness review PASS öncesi oluşturulamaz.
10. Bir bug düzeltildiğinde regression fixture/test eklenir.
