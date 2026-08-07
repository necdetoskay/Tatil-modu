# 26 — Headless Implementation Execution

**Doküman türü:** canonical implementation execution plan  
**Amaç:** H0–H12 sprintlerinin gerçek kod, test ve execution evidence durumunu yönetmek.  
**Plan seti:** complete  
**Execution:** H1 in progress

## Current state
```yaml
current_sprint: H1_contracts_and_domain
implementation_state: in_progress
implementation_plan_H0_H12: complete
H0_repository_foundation: PASS
H1_L0_overall: in_progress
H1_validated_slices:
  - travel_request_contract
  - common_evidence_envelope
  - common_error_envelope
  - constraint_policy_contract
H1_next_slice: family_suitability_contract
ui_development_allowed: false
h2_execution_allowed: false
```

## Canonical sprint seti
| # | Sprint | Belge | Gate |
|---:|---|---|---|
| 1 | H0 Repository Foundation | `01-H0-repository-foundation.md` | PASS |
| 2 | H1 Contracts & Domain | `02-H1-contracts-domain.md` | L0 — in progress |
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

## H0 evidence
`pnpm test:h0` zinciri gerçek GitHub Actions koşusunda install + typecheck + boundary + Vitest PASS vermiştir.

## H1 validated evidence
### Slice 1 — Travel Request
- runtime Zod schema
- domain primitives
- canonical JSON fixture
- positive/negative assertions
- CI PASS

### Slice 2 — Shared contracts + policy handoff
- Common Evidence Envelope
- Common Error Envelope
- Constraint Policy Contract
- canonical JSON fixtures
- P0 assertions
- CI run `31208968177` PASS

## H1 henüz tamamlanmadı
L0 ancak kalan canonical contracts runtime schema + fixture + negative tests + version/trace coverage ile PASS olduğunda kapanacaktır.

## Global progression
```text
H0 PASS
 ↓
H1 / L0 — ACTIVE
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
