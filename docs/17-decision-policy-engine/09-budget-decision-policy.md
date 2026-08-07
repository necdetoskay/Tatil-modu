# 09 — Budget Decision Policy

**Doküman türü:** budget decision policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, bütçenin planlama kararlarında nasıl ele alınacağını tanımlar.

Amaç, bütçe bilgisinin ne zaman hard constraint, ne zaman soft preference, ne zaman açıklanması gereken belirsizlik olduğunu netleştirmektir.

## Ana karar

```yaml
budget_decision_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/09-budget-decision-policy.md
```

## Budget classification

```yaml
budget_classification:
  strict_budget:
    policy_role: hard_constraint
  target_budget:
    policy_role: strong_preference_with_warning
  flexible_budget:
    policy_role: soft_constraint
  missing_budget:
    policy_role: assumption_or_clarification
```

## Budget inputs

```yaml
budget_inputs:
  - total_trip_budget
  - accommodation_budget
  - transportation_cost
  - activity_ticket_cost
  - food_cost_band
  - parking_cost
  - buffer_or_unplanned_expense
```

## Evidence requirement

Fiyatlar değişken bilgi olduğu için exact price evidence gerektirir.

```yaml
price_evidence_policy:
  exact_price: requires_evidence
  price_band: may_use_estimate_with_disclosure
  old_price: stale_warning
  no_price: evidence_gap
```

## Decision outcomes

```yaml
decision_outcomes:
  within_strict_budget: allow
  exceeds_strict_budget: block_or_require_adjustment
  within_target_budget: allow
  slightly_exceeds_target_budget: warning_or_lower_cost_alternative
  missing_price_for_core_item: evidence_gap_or_verification_needed
  unknown_total_cost: cannot_claim_budget_fit
```

## Budget vs family comfort

Daha ucuz seçenek aile uygunluğunu bozuyorsa otomatik olarak daha iyi kabul edilmez.

```yaml
budget_family_tradeoff:
  cheap_but_high_fatigue: downgrade
  expensive_but_solves_rest_need: allow_if_budget_flexible
  strict_budget_conflict: require_alternative_or_clarification
```

## Final response visibility

```yaml
must_show:
  - budget_assumption
  - verified_price_vs_estimated_cost
  - likely_cost_drivers
  - budget_risk_warning
  - lower_cost_alternatives_when_needed
```

## Forbidden behavior

```yaml
forbidden:
  - exact_price_without_evidence
  - claiming_budget_fit_with_unknown_prices
  - choosing_cheapest_option_despite_child_fatigue_blocker
  - hiding_major_cost_uncertainty
  - treating_strict_budget_as_soft_preference
```
