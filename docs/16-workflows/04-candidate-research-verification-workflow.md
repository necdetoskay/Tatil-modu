# 04 — Candidate Research and Verification Workflow

**Doküman türü:** candidate + verification workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya destinasyon, aktivite, konaklama ve rota adaylarının nasıl üretileceğini ve değişken bilgilerin verification/evidence sürecine nasıl bağlanacağını tanımlar.

## Ana karar

```yaml
workflow_id: candidate_research_verification_workflow
workflow_state: drafted
implementation_allowed: false
provider_call_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/16-workflows/04-candidate-research-verification-workflow.md
```

## Flow

```text
1. Gate-approved travel request alınır.
2. Destination Candidate Agent aday alanları üretir.
3. Activity Fit Agent aktivite adayları ve verification need üretir.
4. Accommodation Fit Agent konaklama adayları ve verification need üretir.
5. Route Logistics Agent rota/otopark/trafik verification need üretir.
6. Verification Evidence Agent claim bazlı evidence status üretir.
7. Evidence gap veya blocker downstream'e görünür aktarılır.
```

## Verification-needed claim types

```yaml
verification_needed_claims:
  - price
  - opening_hours
  - availability
  - route_duration
  - traffic
  - parking
  - weather
  - facility_status
  - women_only_beach_or_privacy
  - age_restriction
```

## Candidate statuses

```yaml
candidate_statuses:
  eligible_verified: can_be_used_with_confidence
  eligible_unverified: can_be_used_only_with_disclosure
  eligible_with_warning: can_be_used_with_visible_warning
  blocked_by_constraint: cannot_be_used
  needs_clarification: cannot_be_finalized
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - exact_price_claim_without_evidence
  - opening_hours_claim_without_evidence
  - verified_privacy_claim_without_source
  - route_duration_as_fact_without_verification
  - candidate_ranked_as_best_while_hard_blocked
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 05-family-suitability-logistics-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
