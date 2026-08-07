# 10 — Cost Latency and Quota Policy

**Doküman türü:** cost, latency ve quota policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime ölçüm:** kapalı

## Purpose

Bu dosya, Tatil Modu capability kullanımında maliyet, gecikme ve kota etkilerinin tasarım seviyesinde nasıl görünür tutulacağını tanımlar.

Bu dosya gerçek ölçüm, tracing, monitoring, quota enforcement, cache implementation veya provider billing entegrasyonu içermez.

## Ana karar

```yaml
artifact_id: cost_latency_and_quota_policy
artifact_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_monitoring_allowed: false
provider_billing_integration_allowed: false
source_of_truth: docs/14-tool-and-capability-design/10-cost-latency-and-quota-policy.md
```

## Neden gerekli?

Tatil Modu planlama sırasında çok sayıda değişken bilgiye ihtiyaç duyabilir.

Her bilgiyi her zaman canlı doğrulamak iyi fikir değildir.

```text
Bazı claim'ler kesin doğrulama ister.
Bazı claim'ler yalnızca uyarı/disclosure ile taşınabilir.
Bazı capability çağrıları pahalı veya yavaş olabilir.
```

Bu nedenle capability kullanımı tasarımda maliyet ve gecikme bilinci taşımalıdır.

## Cost sınıfları

```yaml
cost_classes:
  zero_or_internal:
    meaning: yerel/önceden bilinen veri veya kullanıcı girdisi
  low_cost:
    meaning: ucuz veya sınırlı dış sorgu
  medium_cost:
    meaning: dikkatli kullanılacak dış sorgu
  high_cost:
    meaning: yalnızca gerekli claim için kullanılacak sorgu
  unknown_cost:
    meaning: provider seçilmeden kesin bilinmez
```

## Latency sınıfları

```yaml
latency_classes:
  instant:
    expected_use: internal classification or already available data
  short:
    expected_use: simple structured lookup
  medium:
    expected_use: external verification or cross-check
  long:
    expected_use: multi-source verification or slow provider
  unknown:
    expected_use: provider not selected yet
```

## Quota risk sınıfları

```yaml
quota_risk_classes:
  none:
    meaning: quota riski yok veya önemsiz
  low:
    meaning: normal kullanımda sorun beklenmez
  medium:
    meaning: batch veya çoklu alternatifte dikkat gerekir
  high:
    meaning: sınırlı, pahalı veya rate-limit hassas capability
  unknown:
    meaning: provider seçimi yapılmadan bilinmez
```

## Capability bazlı maliyet yaklaşımı

```yaml
capability_cost_policy:
  maps_distance_and_route:
    likely_cost: medium
    likely_latency: medium
    quota_risk: medium
    use_when: route_claim_or_radius_policy_matters
  traffic_estimation:
    likely_cost: medium
    likely_latency: medium
    quota_risk: medium
    use_when: live_or_time_sensitive_route_claim_needed
  weather_forecast:
    likely_cost: low_or_medium
    likely_latency: short
    quota_risk: low_or_medium
    use_when: weather_sensitive_activity_or_date_specific_plan
  place_opening_hours:
    likely_cost: low_or_medium
    likely_latency: short_or_medium
    quota_risk: medium
    use_when: plan_depends_on_place_being_open
  place_price_information:
    likely_cost: medium
    likely_latency: medium
    quota_risk: medium
    use_when: budget_or_exact_price_claim_needed
  accommodation_availability:
    likely_cost: medium_or_high
    likely_latency: medium_or_long
    quota_risk: high
    use_when: availability_claim_needed
  women_only_beach_verification:
    likely_cost: medium
    likely_latency: medium_or_long
    quota_risk: medium
    use_when: privacy_hard_or_conditional_constraint_active
```

Bu değerler runtime ölçüm değildir; tasarım önceliklendirmesidir.

## Çağrı minimizasyon ilkesi

```yaml
call_minimization_principles:
  - do_not_verify_everything_by_default
  - verify_hard_constraints_first
  - verify_claims_that_affect_final_action
  - prefer_batching_when_design_allows
  - avoid_rechecking_same_claim_without_reason
  - do_not_call_live_capability_for_final_response_wording_only
  - use_evidence_gap_when_verification_is_not_available
```

## Hard constraint önceliği

```yaml
verification_priority_order:
  1_safety_policy_and_hard_constraints:
    examples:
      - women_only_beach_requirement
      - child_age_restriction
      - availability_if_plan_depends_on_it
  2_time_sensitive_operational_claims:
    examples:
      - opening_hours
      - weather
      - traffic
  3_budget_affecting_claims:
    examples:
      - exact_price
      - accommodation_cost
  4_quality_signals:
    examples:
      - reviews
      - family_experience_signals
```

## Degrade policy

Capability pahalı, yavaş veya kota riskli ise sistem güvenli şekilde degrade olur.

```yaml
degrade_policy:
  hard_constraint_claim:
    degrade_to: blocker_or_verification_needed
  exact_price_claim:
    degrade_to: budget_uncertainty_warning
  route_time_claim:
    degrade_to: drive_time_band_or_uncertainty
  parking_claim:
    degrade_to: parking_risk_warning
  review_signal_claim:
    degrade_to: omit_or_soft_signal
```

Degrade etmek, doğrulanmamış bilgiyi kesinleştirmek değildir.

## Cache tasarım notu

Bu dosya cache implementation tanımlamaz.

Ancak tasarımda cachelenebilirlik görünür olmalıdır.

```yaml
cacheability_design:
  weather_forecast:
    cacheability: short_lived
  opening_hours:
    cacheability: medium_lived_but_holiday_sensitive
  price:
    cacheability: short_or_medium_lived
  route_distance:
    cacheability: medium_lived
  live_traffic:
    cacheability: very_short_lived
  reviews:
    cacheability: medium_lived
  privacy_status:
    cacheability: medium_lived_but_requires_recheck_when_critical
```

## Final response etkisi

```yaml
final_response_cost_latency_rules:
  do_not_expose_internal_cost_details_by_default: true
  expose_uncertainty_when_not_verified: true
  do_not_claim_live_verification_if_not_done: true
  do_not_delay_plan_for_low_value_claims: true
  prioritize_actionable_disclosures: true
```

Kullanıcıya provider maliyeti değil, doğrulama durumu ve güvenilirlik gösterilir.

## Forbidden behavior

```yaml
forbidden_behavior:
  - verify_low_value_claim_before_hard_constraint
  - spend_high_cost_capability_on_final_text_polish
  - hide_quota_failure
  - present_skipped_verification_as_verified
  - call_live_capability_when_contract_does_not_need_it
  - use_cost_reason_to_ignore_hard_constraint_without_disclosure
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 11-tool-capability-completion-checklist.md
implementation_allowed: false
prototype_allowed: false
runtime_monitoring_allowed: false
provider_billing_integration_allowed: false
```
