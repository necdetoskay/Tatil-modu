# 05 — Family Suitability and Logistics Workflow

**Doküman türü:** family suitability + logistics workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya çocuk yaşları, yorgunluk, öğle dinlenmesi, rota yükü, otopark ve ebeveyn yükünün plan kararlarına nasıl bağlanacağını tanımlar.

## Ana karar

```yaml
workflow_id: family_suitability_logistics_workflow
workflow_state: drafted
implementation_allowed: false
live_map_allowed: false
source_of_truth: docs/16-workflows/05-family-suitability-logistics-workflow.md
```

## Flow

```text
1. Candidate package alınır.
2. Route Logistics Agent mesafe/yol yükü/otopark/trafik risklerini sınıflar.
3. Family Suitability Agent çocuk yaşları ve ebeveyn yükünü değerlendirir.
4. Öğle dinlenmesi ve düşük tempo gereksinimi kontrol edilir.
5. Aşırı yorucu adaylar uyarı, fallback veya blocker'a dönüşür.
6. Day Plan Composer'a family-aware planning package gönderilir.
```

## Family/logistics signals

```yaml
signals:
  toddler_fatigue_risk: required
  older_child_interest_fit: required
  parent_burden: required
  rest_block_need: required
  parking_risk: required_when_own_car
  traffic_risk: required_when_route_sensitive
  return_day_fatigue: required_when_return_drive_exists
```

## Decision rules

```yaml
decision_rules:
  long_drive_with_toddler: warn_or_lighten_plan
  arrival_day_after_long_drive: avoid_overpacked_day
  return_day_drive: keep_day_light
  parking_unknown: disclose_uncertainty
  traffic_unknown: avoid_exact_claim
  no_midday_rest_with_toddler: fail_day_plan_gate
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - two_year_old_fatigue_ignored
  - no_lunch_rest_for_toddler_without_reason
  - long_drive_day_overpacked
  - guaranteed_parking_without_evidence
  - exact_drive_time_without_evidence
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 06-day-plan-composition-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
