# 12 — Contracts

**Doküman türü:** canonical contract design alanı  
**Durum:** first phase tamamlandı  
**Runtime implementation durumu:** H1/L0 completion review in progress  
**UI durumu:** kapalı

## Amaç
Bu klasör Tatil Modu agent specification setinden çıkan canonical input/output sözleşmelerinin tasarım source-of-truth alanıdır.

Runtime schema implementation ayrı olarak `packages/contracts/` altında yürütülür. Bu klasördeki canonical semantics değişmeden runtime schema keyfi davranış ekleyemez.

## Ana karar
```yaml
contract_design_first_phase_completed: true
runtime_schema_implementation_started: true
runtime_schema_location: packages/contracts/
implementation_execution_records: docs/26-headless-implementation/
ui_development_allowed: false
source_of_truth: docs/12-contracts/
```

## İlk-phase contract seti
| Sıra | Contract | Dosya | Runtime H1 durumu |
|---:|---|---|---|
| 1 | Travel Request Contract | `travel-request-contract.md` | validated |
| 2 | Constraint Policy Contract | `constraint-policy-contract.md` | validated |
| 3 | Family Suitability Contract | `family-suitability-contract.md` | validated |
| 4 | Destination Candidate Contract | `destination-candidate-contract.md` | validated |
| 5 | Route Logistics Contract | `route-logistics-contract.md` | validated |
| 6 | Accommodation Fit Contract | `accommodation-fit-contract.md` | validated |
| 7 | Activity Fit Contract | `activity-fit-contract.md` | validated |
| 8 | Day Plan Contract | `day-plan-contract.md` | validated |
| 9 | Verification Evidence Contract | `verification-evidence-contract.md` | validated |
| 10 | Final Response Contract | `final-response-contract.md` | validated |
| 11 | Common Evidence Envelope | `common-evidence-envelope.md` | validated |
| 12 | Common Error Envelope | `common-error-envelope.md` | validated |
| 13 | Contract Completion Checklist | `contract-completion-checklist.md` | design complete / runtime review active |

## Ortak contract ilkeleri
Bütün runtime contract'lar version, producer/consumer semantics, traceability, evidence/confidence ve validation durumlarını canonical tasarımla uyumlu taşımalıdır.

```yaml
versioned_contracts_required: true
traceability_required: true
evidence_for_material_claims_required: true
unverified_claim_as_fact: forbidden
hard_blocker_visibility_required: true
hard_constraint_soft_preference_separation_required: true
privacy_sensitive_claims_visible: true
```

## Design → runtime governance
1. Canonical contract semantiği `docs/12-contracts/` içinde tanımlanır.
2. Runtime validator `packages/contracts/` altında uygulanır.
3. Her önemli runtime dilimi fixture + negative assertions + CI execution evidence alır.
4. Canonical doküman ile runtime schema çelişirse implementation değil design amendment/ADR düzeltilir.
5. H1/L0 PASS toplu completion review sonrası verilir.

## Current status
```yaml
contract_design_state: first_phase_completed
runtime_contract_slices_validated:
  - travel_request
  - common_evidence
  - common_error
  - constraint_policy
  - family_suitability
  - destination_candidate
  - route_logistics
  - accommodation_fit
  - activity_fit
  - day_plan
  - verification_evidence
  - final_response
L0_completion_review: in_progress
next_execution_stage_if_PASS: H2_deterministic_policy_core
ui_development_allowed: false
```
