# 05 — Evidence Confidence Decision Policy

**Doküman türü:** evidence confidence decision policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, evidence ve confidence bilgilerinin karar sürecinde nasıl kullanılacağını tanımlar.

Amaç, doğrulanmamış veya düşük güvenli bilgilerin kesin plan kararına dönüşmesini engellemektir.

## Ana karar

```yaml
evidence_confidence_decision_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/05-evidence-confidence-decision-policy.md
```

## Evidence karar bandları

```yaml
evidence_status_decisions:
  verified:
    decision_effect: may_support_fact_or_constraint
  partially_verified:
    decision_effect: may_support_warning_or_conditional_plan
  unverified:
    decision_effect: cannot_support_certain_fact
  contradicted:
    decision_effect: blocks_or_requires_fallback
  unavailable:
    decision_effect: evidence_gap_or_clarification
```

## Confidence karar bandları

```yaml
confidence_bands:
  high:
    allowed_use: primary_decision_if_evidence_supports
  medium:
    allowed_use: conditional_decision_or_warning
  low:
    allowed_use: assumption_only_not_hard_rule
  unknown:
    allowed_use: disclose_gap
```

## Critical claim types

Aşağıdaki claim türleri evidence olmadan kesin bilgiye dönüşemez:

```yaml
critical_claim_types:
  - opening_hours
  - price
  - availability
  - route_duration
  - traffic
  - parking
  - weather
  - women_only_beach_or_privacy
  - official_closure_status
  - age_restriction
  - facility_presence
```

## Decision outcomes

```yaml
decision_outcomes:
  allow_as_fact:
    required: verified_or_high_confidence_with_source
  allow_with_disclosure:
    required: partially_verified_or_medium_confidence
  downgrade_to_suggestion:
    required: unverified_but_non_critical
  require_verification:
    required: critical_claim_unverified
  block_candidate:
    required: contradicted_or_hard_constraint_evidence_missing
  request_clarification:
    required: conflicting_evidence_or_user_constraint_ambiguity
```

## Evidence gap davranışı

Evidence gap planı her zaman durdurmaz.

Fakat evidence gap final response'ta görünür olmalıdır.

```yaml
evidence_gap_visibility:
  hard_constraint_related: blocker_or_clear_warning
  non_critical_detail: disclosure
  alternative_detail: note
  final_fact: forbidden_without_evidence
```

## Confidence ve language policy

Confidence düşükse final response dili kesin olamaz.

```yaml
language_mapping:
  high_verified: "doğrulanmış bilgiye göre"
  medium_partial: "muhtemel / kontrol edilmeli"
  low_unverified: "doğrulanmadı / kesinleştirilmemeli"
```

## Forbidden behavior

```yaml
forbidden:
  - unverified_price_as_exact
  - unverified_opening_hours_as_certain
  - traffic_estimate_as_live_fact_without_source
  - weather_assumption_as_forecast
  - women_only_beach_unverified_as_satisfied
  - low_confidence_assumption_as_hard_constraint
```
