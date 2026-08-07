# 06 — Family Suitability Decision Policy

**Doküman türü:** family suitability decision policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, çocuk yaşları, dinlenme ihtiyacı, yorgunluk, ebeveyn yükü ve aile konforunun karar sürecinde nasıl ele alınacağını tanımlar.

Aile uygunluğu sadece kalite puanı değildir; bazı durumlarda planı bloke eden veya yeniden düzenleten karar girdisidir.

## Ana karar

```yaml
family_suitability_decision_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/06-family-suitability-decision-policy.md
```

## Family suitability decision inputs

```yaml
inputs:
  - child_ages
  - toddler_fit
  - older_child_fit
  - fatigue_risk
  - rest_fit
  - parent_burden
  - route_burden
  - activity_duration
  - weather_sensitivity
  - stroller_access_or_walk_load
```

## Decision bands

```yaml
family_suitability_bands:
  suitable:
    decision: allow
  suitable_with_adjustment:
    decision: allow_with_plan_adjustment
  caution:
    decision: warning_or_alternative_required
  unsuitable:
    decision: block_or_replace
  unknown:
    decision: require_assumption_or_clarification
```

## Toddler-specific rules

2 yaş çocuk için şu durumlar yüksek öncelikli karar girdisidir:

```yaml
toddler_rules:
  midday_rest_needed:
    policy: preserve_or_explain_exception
  long_unbroken_drive:
    policy: require_rest_stop_or_adjustment
  dense_multi_stop_day:
    policy: downgrade_or_split_day
  late_evening_activity:
    policy: warning_or_optional_only
  high_walking_load:
    policy: caution_or_replace
```

## 6-year-old fit rules

6 yaş çocuk için ilgi ve hareket ihtiyacı dikkate alınır; fakat 2 yaş çocuğun dinlenme ihtiyacıyla çakışırsa toddler/rest policy üstün gelir.

```yaml
older_child_rules:
  interactive_activity: positive_signal
  long_passive_waiting: negative_signal
  educational_activity: positive_if_duration_reasonable
  intense_full_day_activity: caution
```

## Family suitability blocker examples

```yaml
blocker_examples:
  - no_midday_rest_in_five_day_plan_with_toddler
  - very_long_drive_plus_dense_afternoon
  - beach_day_without_rest_or_shade_consideration
  - multiple_remote_transfers_in_one_day
  - late_night_activity_as_required_block
```

## Adjustment examples

```yaml
adjustments:
  - split_activity_into_morning_only
  - add_lunch_rest_block
  - move_heavy_activity_to_next_day
  - provide_indoor_low_fatigue_alternative
  - make_evening_plan_optional
```

## Final response visibility

Aile uygunluğu kararı final response'ta sade şekilde görünür olmalıdır.

```yaml
visibility:
  - why_plan_is_low_fatigue
  - where_midday_rest_is_protected
  - which_options_are_optional_due_to_children
  - which_options_are_rejected_due_to_fatigue
```

## Forbidden behavior

```yaml
forbidden:
  - treating_child_ages_as_minor_preference
  - ignoring_toddler_rest_for_more_places
  - marking_dense_plan_as_family_friendly_without_adjustment
  - hiding_parent_burden_warning
  - using_review_score_to_override_fatigue_risk
```
