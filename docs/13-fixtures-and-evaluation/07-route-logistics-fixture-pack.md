# 07 — Route Logistics Fixture Pack

**Doküman türü:** route logistics fixture design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nun rota, mesafe, trafik, otopark, mola, öğle dinlenmesi ve çocuk yorgunluğu risklerini doğru taşıyıp taşımadığını ölçmek için kullanılacak fixture setini tanımlar.

Bu dosya test runner değildir.

Bu dosya harita entegrasyonu, canlı trafik kontrolü, rota API çağrısı, CI veya runtime evaluator implementation içermez.

## Ana karar

```yaml
fixture_pack_id: route_logistics_fixture_pack
fixture_pack_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/07-route-logistics-fixture-pack.md
related_golden_scenarios:
  - GS-001
  - GS-004
  - GS-005
  - GS-007
```

## Bu fixture pack neyi ölçer?

Route Logistics Fixture Pack şu davranışları ölçer:

```yaml
measured_behaviors:
  - 150 km radius kuralının görünür kalması
  - radius dışı aday için istisna gerekçesi istenmesi
  - 2 yaş çocukla uzun yolun fatigue risk üretmesi
  - route/traffic/parking bilgilerinin evidence olmadan kesin sunulmaması
  - öğle dinlenmesi ile yol planının çakışmaması
  - aynı gün uzun sürüş + yoğun aktivite kombinasyonunun uyarılması
  - mola ihtiyacının çocuk profiline göre taşınması
  - otopark/erişim belirsizliğinin final cevapta disclosure edilmesi
```

## İlgili agent/contract kapsamı

```yaml
covered_agents:
  - destination_candidate_agent
  - route_logistics_agent
  - family_suitability_agent
  - day_plan_composer_agent
  - verification_evidence_agent
  - final_response_composer_agent
covered_contracts:
  - destination-candidate-contract.md
  - route-logistics-contract.md
  - family-suitability-contract.md
  - day-plan-contract.md
  - verification-evidence-contract.md
  - final-response-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
```

## Fixture required fields

Her route logistics fixture aşağıdaki alanları taşımalıdır:

```yaml
required_fixture_fields:
  - fixture_id
  - source_golden_scenario
  - user_request
  - route_context
  - expected_destination_behavior
  - expected_route_logistics_behavior
  - expected_family_suitability_behavior
  - expected_day_plan_behavior
  - expected_evidence_behavior
  - expected_final_response_behavior
  - forbidden_outputs
  - evaluation_notes
```

## RL-001 — 150 km dışı aday istisna gerekçesi olmadan önerilemez

```yaml
fixture_id: RL-001
source_golden_scenario: GS-001
user_request: >
  Kocaeli çevresinde 5 günlük çocuklu aile tatili planla. 150 km civarında olsun,
  ama gerçekten değerse daha uzak yerleri de düşünebiliriz.
route_context:
  origin: Kocaeli
  default_radius_km: 150
  candidate_type: out_of_radius
expected_destination_behavior:
  out_of_radius_candidate_allowed_only_with_exception_reason: true
  exception_reason_required: true
expected_route_logistics_behavior:
  distance_band_required: true
  drive_burden_required: true
  child_fatigue_risk_required: true
expected_family_suitability_behavior:
  toddler_fatigue_warning_required: true
expected_final_response_behavior:
  must_explain_why_out_of_radius_candidate_is_worth_it: true
forbidden_outputs:
  - out_of_radius_candidate_without_exception_reason
  - far_candidate_presented_as_normal_radius
  - exact_drive_time_without_evidence
```

## RL-002 — 2 yaş çocukla uzun tek gün sürüşü

```yaml
fixture_id: RL-002
source_golden_scenario: GS-007
user_request: >
  2 ve 6 yaş çocukla sabah yola çıkıp aynı gün uzak bir yere gidip gezip dönmek istiyoruz.
  Çok fazla vakit kaybetmeden yoğun bir gün olsun.
route_context:
  family_has_toddler: true
  same_day_round_trip_requested: true
  likely_long_drive: true
expected_route_logistics_behavior:
  same_day_round_trip_burden: high
  rest_stop_need: required
  child_fatigue_risk: high
expected_family_suitability_behavior:
  toddler_rest_need: required
  parent_burden_warning_required: true
expected_day_plan_behavior:
  must_soften_or_split_plan: true
  overnight_option_should_be_considered: true
expected_final_response_behavior:
  must_disclose_high_fatigue_risk: true
forbidden_outputs:
  - high_fatigue_round_trip_as_easy_plan
  - no_rest_stop_need
  - no_parent_burden_warning
```

## RL-003 — Trafik ve otopark evidence olmadan kesin sunulamaz

```yaml
fixture_id: RL-003
source_golden_scenario: GS-009
user_request: >
  Kocaeli'den arabayla gideceğiz. Trafik ve park yeri sorun olmayacak şekilde plan yap.
route_context:
  own_car: true
  traffic_and_parking_requested: true
  live_map_evidence_available: false
expected_route_logistics_behavior:
  traffic_risk_band_required: true
  parking_risk_band_required: true
  verification_needed_for_traffic: true
  verification_needed_for_parking: true
expected_evidence_behavior:
  traffic_claim_status: unverified
  parking_claim_status: unverified
expected_final_response_behavior:
  must_disclose_traffic_parking_uncertainty: true
forbidden_outputs:
  - traffic_will_be_empty_without_evidence
  - parking_is_guaranteed_without_evidence
  - exact_drive_time_without_evidence
```

## RL-004 — Öğle dinlenmesi ile yol planı çakışamaz

```yaml
fixture_id: RL-004
source_golden_scenario: GS-004
user_request: >
  Balıkesir için 3 günlük plan yap. Çocuklar 2 ve 6 yaşında. Öğlen otelde dinlenmek istiyoruz.
route_context:
  midday_rest_required: true
  family_has_toddler: true
expected_route_logistics_behavior:
  transfer_windows_must_respect_midday_rest: true
  long_midday_transfer_warning_required: true
expected_day_plan_behavior:
  lunch_rest_block_required: true
  midday_long_drive_forbidden_without_warning: true
expected_final_response_behavior:
  must_explain_rest_preserving_plan_structure: true
forbidden_outputs:
  - lunch_rest_block_removed_by_transfer
  - noon_to_afternoon_long_drive_without_warning
  - toddler_rest_need_ignored
```

## RL-005 — Bursa Zoo sabah sonrası uzak öğleden sonra transferi

```yaml
fixture_id: RL-005
source_golden_scenario: GS-005
user_request: >
  Bursa hayvanat bahçesine sabah gidelim. Öğleden sonra başka bir yer daha ekleyelim.
  Çocuklar 2 ve 6 yaşında.
route_context:
  morning_anchor: Bursa Zoo
  afternoon_addon_requested: true
  family_has_toddler: true
expected_route_logistics_behavior:
  post_morning_transfer_burden_required: true
  parking_access_uncertainty_required_if_unverified: true
  low_transfer_option_preferred: true
expected_family_suitability_behavior:
  post_zoo_fatigue_considered: true
  toddler_low_intensity_option_required: true
expected_day_plan_behavior:
  close_or_light_afternoon_option_required: true
expected_final_response_behavior:
  must_offer_light_option_before_far_option: true
forbidden_outputs:
  - far_afternoon_transfer_without_warning
  - no_low_fatigue_option
  - exact_parking_availability_without_evidence
```

## Common expected warnings

```yaml
expected_warnings:
  - long_drive_with_toddler
  - same_day_round_trip_high_burden
  - traffic_uncertainty
  - parking_uncertainty
  - route_time_needs_verification
  - rest_stop_needed
  - midday_rest_conflict
```

## Common forbidden outputs

```yaml
common_forbidden_outputs:
  exact_drive_time_without_evidence: forbidden
  guaranteed_parking_without_evidence: forbidden
  traffic_will_be_empty_without_evidence: forbidden
  out_of_radius_candidate_without_exception_reason: forbidden
  high_fatigue_route_without_warning: forbidden
  toddler_rest_ignored_for_route_decision: forbidden
  midday_rest_removed_without_disclosure: forbidden
```

## Evaluation notes

Route logistics değerlendirmesi, güzel adayları aile için uygulanabilir hale getiren güvenlik katmanıdır.

```text
Rota iyi görünse bile çocuk yorgunluğu, mola ihtiyacı, trafik/otopark belirsizliği ve öğle dinlenmesi uyumu görünür değilse plan tamamlanmış sayılmaz.
```

## Current status

```yaml
fixture_pack_state: drafted
next_artifact: 08-day-plan-coherence-fixture-pack.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
