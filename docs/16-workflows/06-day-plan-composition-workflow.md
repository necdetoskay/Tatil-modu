# 06 — Day Plan Composition Workflow

**Doküman türü:** day plan composition workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya sabah, öğle dinlenmesi, öğleden sonra, akşam bloklarının ve günlük alternatiflerin nasıl birleştirileceğini tanımlar.

## Ana karar

```yaml
workflow_id: day_plan_composition_workflow
workflow_state: drafted
implementation_allowed: false
runtime_planner_allowed: false
source_of_truth: docs/16-workflows/06-day-plan-composition-workflow.md
```

## Flow

```text
1. Gate-approved candidate package alınır.
2. Family suitability ve route burden sonuçları uygulanır.
3. Her gün morning / lunch_rest / afternoon / evening blokları kurulur.
4. Her gün için 2-3 alternatif üretilir.
5. Weather, parking, price, privacy ve opening-hours evidence gap'leri görünür bağlanır.
6. Day plan coherence gate çalışır.
7. Final Response Composer'a coherent day plan package aktarılır.
```

## Block rules

```yaml
block_rules:
  morning_block: primary_low_to_medium_effort_activity
  lunch_rest_block: required_when_toddler_present
  afternoon_block: lighter_or_fallback_activity
  evening_block: optional_low_effort_family_time
```

## Alternative rules

```yaml
alternative_rules:
  alternatives_per_day: 2_to_3
  bad_weather_fallback: required_when_weather_sensitive
  privacy_sensitive_fallback: required_when_sea_or_beach_uncertain
  budget_sensitive_fallback: required_when_price_uncertain
  low_fatigue_fallback: required_when_toddler_or_long_drive
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - no_lunch_rest_with_two_year_old
  - single_option_day_when_alternatives_required
  - overpacked_arrival_day
  - beach_day_without_privacy_status
  - weather_sensitive_day_without_fallback
  - final_day_overpacked_before_return_drive
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 07-final-response-assembly-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
