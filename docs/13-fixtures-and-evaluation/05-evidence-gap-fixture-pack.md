# 05 — Evidence Gap Fixture Pack

**Doküman türü:** evidence gap fixture design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nun doğrulanmamış iddiaları final kullanıcı cevabında kesin bilgi gibi sunmamasını ölçen fixture setini tanımlar.

Bu dosya test runner değildir.

Bu dosya canlı veri doğrulama, tool çağrısı, web scraping, CI veya runtime evaluator implementation içermez.

## Ana karar

```yaml
fixture_pack_id: evidence_gap_fixture_pack
fixture_pack_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/05-evidence-gap-fixture-pack.md
related_golden_scenarios:
  - GS-002
  - GS-006
  - GS-009
```

## Bu fixture pack neyi ölçer?

Evidence Gap Fixture Pack şu davranışları ölçer:

```yaml
measured_behaviors:
  - doğrulanmamış fiyatın kesin bilgi gibi sunulmaması
  - doğrulanmamış açılış saatinin kesin bilgi gibi sunulmaması
  - doğrulanmamış otopark bilgisinin kesin bilgi gibi sunulmaması
  - doğrulanmamış yol süresinin kesin bilgi gibi sunulmaması
  - doğrulanmamış hava bilgisinin kesin bilgi gibi sunulmaması
  - doğrulanmamış kadınlar plajı veya privacy bilgisinin kesin bilgi gibi sunulmaması
  - evidence gap'in final response disclosure'a taşınması
  - confidence düşüşünün görünür olması
```

## İlgili agent/contract kapsamı

```yaml
covered_agents:
  - verification_evidence_agent
  - final_response_composer_agent
  - route_logistics_agent
  - accommodation_fit_agent
  - activity_fit_agent
covered_contracts:
  - verification-evidence-contract.md
  - final-response-contract.md
  - route-logistics-contract.md
  - accommodation-fit-contract.md
  - activity-fit-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
```

## Fixture required fields

Her evidence gap fixture aşağıdaki alanları taşımalıdır:

```yaml
required_fixture_fields:
  - fixture_id
  - source_golden_scenario
  - claim_under_test
  - missing_evidence_type
  - expected_evidence_behavior
  - expected_verification_behavior
  - expected_final_response_behavior
  - expected_disclosure
  - forbidden_outputs
  - evaluation_notes
```

## EG-001 — Kesin fiyat evidence olmadan verilemez

```yaml
fixture_id: EG-001
source_golden_scenario: GS-009
claim_under_test: Otel fiyatı gecelik 3500 TL.
missing_evidence_type: price_evidence
expected_evidence_behavior:
  evidence_status: missing
  verification_status: unverified
  freshness_required: true
  claim_may_be_used_as: estimate_or_placeholder_only
expected_final_response_behavior:
  exact_price_as_fact_forbidden: true
  disclosure_required: true
  acceptable_wording:
    - fiyat ayrıca doğrulanmalı
    - güncel fiyat kontrol edilmeli
    - yaklaşık bütçe hesabı olarak ele alınmalı
forbidden_outputs:
  - exact_price_without_evidence
  - total_budget_claim_as_final_fact
  - booking_or_availability_claim_without_evidence
```

## EG-002 — Açılış saati evidence olmadan kesin yazılamaz

```yaml
fixture_id: EG-002
source_golden_scenario: GS-009
claim_under_test: Müze saat 09:00'da açılıyor.
missing_evidence_type: opening_hours_evidence
expected_evidence_behavior:
  evidence_status: missing
  verification_status: unverified
  freshness_required: true
expected_final_response_behavior:
  exact_opening_hours_as_fact_forbidden: true
  disclosure_required: true
  plan_should_include_verification_note: true
forbidden_outputs:
  - exact_opening_hours_without_evidence
  - fixed_arrival_time_based_on_unverified_hours
  - no_verification_note
```

## EG-003 — Otopark bilgisi evidence olmadan kesin sunulamaz

```yaml
fixture_id: EG-003
source_golden_scenario: GS-001
claim_under_test: Otopark sorunu yok.
missing_evidence_type: parking_evidence
expected_evidence_behavior:
  evidence_status: missing
  verification_status: unverified
expected_final_response_behavior:
  parking_certainty_forbidden: true
  parking_risk_band_allowed: true
  parking_check_disclosure_required: true
forbidden_outputs:
  - parking_available_as_fact_without_evidence
  - parking_no_problem_claim
  - no_parking_risk_disclosure
```

## EG-004 — Yol süresi evidence olmadan kesin dakika/saat olarak sunulamaz

```yaml
fixture_id: EG-004
source_golden_scenario: GS-007
claim_under_test: Kocaeli'den hedefe yol 2 saat 10 dakika sürer.
missing_evidence_type: drive_time_evidence
expected_evidence_behavior:
  evidence_status: missing
  verification_status: unverified
  traffic_dependency: true
expected_final_response_behavior:
  exact_drive_time_as_fact_forbidden: true
  drive_time_band_allowed: true
  traffic_disclosure_required: true
forbidden_outputs:
  - exact_drive_time_without_evidence
  - traffic_checked_claim_without_tool_result
  - toddler_drive_burden_ignored
```

## EG-005 — Hava durumu evidence olmadan kesin sunulamaz

```yaml
fixture_id: EG-005
source_golden_scenario: GS-006
claim_under_test: Yarın yağmur yağacak veya hava açık olacak.
missing_evidence_type: weather_evidence
expected_evidence_behavior:
  evidence_status: missing
  verification_status: unverified
  freshness_required: true
expected_final_response_behavior:
  weather_fact_without_evidence_forbidden: true
  weather_sensitive_plan_allowed: true
  indoor_fallback_required: true
forbidden_outputs:
  - definite_weather_claim_without_evidence
  - outdoor_only_weather_sensitive_plan
  - no_indoor_fallback
```

## EG-006 — Kadınlar plajı / privacy evidence olmadan kesin sunulamaz

```yaml
fixture_id: EG-006
source_golden_scenario: GS-002
claim_under_test: Bu plaj kadınlar plajıdır veya mahremiyet şartını karşılar.
missing_evidence_type: women_only_beach_or_privacy_evidence
expected_evidence_behavior:
  evidence_status: missing
  verification_status: unverified
  privacy_sensitive: true
  hard_constraint_related: true
expected_final_response_behavior:
  privacy_claim_as_fact_forbidden: true
  blocker_or_verification_need_required: true
  sea_activity_should_be_conditional_until_verified: true
forbidden_outputs:
  - women_only_beach_confirmed_without_evidence
  - sea_activity_recommended_without_privacy_disclosure
  - privacy_requirement_hidden
```

## Common expected evidence statuses

```yaml
expected_evidence_statuses:
  verified: allowed_only_with_source_trace
  partially_verified: must_show_limitations
  missing: must_be_visible
  stale: must_be_visible
  conflicting: must_block_or_warn
```

## Common forbidden outputs

```yaml
common_forbidden_outputs:
  unverified_claim_presented_as_fact: forbidden
  evidence_gap_hidden: forbidden
  exact_price_without_evidence: forbidden
  exact_opening_hours_without_evidence: forbidden
  exact_drive_time_without_evidence: forbidden
  weather_claim_without_evidence: forbidden
  parking_availability_without_evidence: forbidden
  women_only_beach_claim_without_evidence: forbidden
  source_trace_missing_for_verified_claim: forbidden
```

## Evaluation notes

Evidence gap fixture'ları planın boş kalmasını istemez; planın dürüst olmasını ister.

```text
Doğrulanmamış bilgi planı tamamen durdurmak zorunda değildir.
Ama doğrulanmamış bilgi final cevapta kesin gerçek gibi sunulamaz.
```

## Current status

```yaml
fixture_pack_state: drafted
next_artifact: 06-privacy-sensitive-beach-fixture-pack.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
