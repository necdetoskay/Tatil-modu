# 09 — Privacy Sensitive Travel Workflow

**Doküman türü:** privacy-sensitive workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya kadınlar plajı, mahremiyet, aile hassasiyeti ve privacy-sensitive deniz/plaj önerilerinin workflow içinde nasıl taşınacağını tanımlar.

## Ana karar

```yaml
workflow_id: privacy_sensitive_travel_workflow
workflow_state: drafted
implementation_allowed: false
live_verification_allowed: false
source_of_truth: docs/16-workflows/09-privacy-sensitive-travel-workflow.md
```

## Flow

```text
1. Trip Intake privacy veya kadınlar plajı koşulunu yakalar.
2. Constraint Policy conditional veya hard constraint olarak sınıflar.
3. Destination/Activity adayları privacy verification need taşır.
4. Verification Evidence Agent privacy claim durumunu belirler.
5. Doğrulanmamış privacy claim finalde kesin bilgi olmaz.
6. Deniz zorunlu değilse non-sea fallback planı korunur.
```

## Privacy constraint types

```yaml
privacy_constraint_types:
  women_only_beach_required_if_sea:
    gate_behavior: conditional_hard_constraint
  women_only_beach_required_absolute:
    gate_behavior: hard_constraint
  privacy_preferred:
    gate_behavior: soft_preference_with_visible_verification_need
  sea_optional:
    gate_behavior: non_sea_fallback_allowed
```

## Decision rules

```yaml
decision_rules:
  beach_candidate_without_privacy_status: cannot_be_presented_as_verified
  privacy_required_and_unverified: block_or_fallback
  sea_optional_and_privacy_unverified: use_non_sea_family_plan
  far_privacy_match: requires_route_burden_warning
  privacy_match_with_child_fatigue: cannot_hide_family_risk
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - women_only_beach_requirement_hidden
  - unverified_women_only_beach_claim_as_fact
  - sea_forced_when_sea_optional
  - privacy_match_overrides_child_fatigue
  - far_beach_without_exception_reason
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 10-workflow-observability-audit-design.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
