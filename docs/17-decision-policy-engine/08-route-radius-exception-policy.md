# 08 — Route Radius Exception Policy

**Doküman türü:** route radius exception policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, hedef il çevresinde öneri üretirken mesafe, yol yükü, 150 km çevre sınırı ve istisna kararlarının nasıl ele alınacağını tanımlar.

## Ana karar

```yaml
route_radius_exception_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/08-route-radius-exception-policy.md
```

## Radius policy

Varsayılan tasarım ilkesi:

```yaml
radius_policy:
  default_radius_km: 150
  beyond_radius_allowed: only_with_strong_exception_reason
  exact_distance_requires_evidence: true
  travel_burden_must_be_considered: true
```

## Exception reason types

150 km dışı öneri ancak açık gerekçe ile alternatif olabilir.

```yaml
valid_exception_reasons:
  - uniquely_high_family_value
  - rare_activity_not_available_nearby
  - route_already_passes_near_location
  - multi_day_stay_reduces_burden
  - user_explicitly_accepts_longer_drive
```

## Invalid exception reasons

```yaml
invalid_exception_reasons:
  - simply_popular
  - high_review_score_only
  - agent_preference
  - generic_touristic_value
  - unverified_claim_of_being_worth_it
```

## Child fatigue interaction

150 km dışı öneri 2 yaş çocukla daha sıkı değerlendirilir.

```yaml
child_fatigue_interaction:
  toddler_present: stricter
  no_midday_rest_possible: block_or_downgrade
  long_drive_plus_dense_day: block
  overnight_stay: may_reduce_risk
```

## Parking and traffic interaction

Mesafe kısa olsa bile trafik ve park riski yüksekse rota kolay kabul edilmez.

```yaml
logistics_interaction:
  short_distance_high_traffic: caution
  long_distance_easy_route: still_requires_burden_assessment
  parking_unverified: warning_or_evidence_gap
  exact_drive_time_unverified: cannot_be_certain_fact
```

## Decision outcomes

```yaml
decision_outcomes:
  within_radius_low_burden: allow
  within_radius_high_burden: allow_with_warning_or_adjustment
  beyond_radius_strong_reason: alternative_only_or_conditional_primary
  beyond_radius_no_reason: reject
  exact_route_unverified: disclose_uncertainty
```

## Final response visibility

```yaml
must_show:
  - approximate_distance_or_distance_band
  - route_burden_level
  - why_beyond_radius_option_is_exceptional
  - parking_or_traffic_uncertainty
  - child_fatigue_warning_when_relevant
```

## Forbidden behavior

```yaml
forbidden:
  - beyond_radius_primary_without_exception_reason
  - exact_drive_time_without_evidence
  - ignoring_parking_traffic_for_city_centers
  - treating_distance_as_only_route_quality_factor
  - hiding_long_drive_burden_for_children
```
