# Accommodation Fit Contract

**Contract ID:** `accommodation_fit_contract`  
**Durum:** canonical contract design  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Schema code durumu:** kapalı

## 1. Purpose

Accommodation Fit Contract, konaklama adaylarının çocuklu aile seyahati açısından hangi alanlarla taşınacağını ve hangi doğrulama ihtiyaçlarını içereceğini tanımlar.

Bu contract'ın temel amacı şudur:

```text
Konaklama adaylarının aile uygunluğu, tesis özellikleri, lokasyon, otopark, bütçe ve doğrulama gereksinimlerini downstream agent'lara güvenli ve izlenebilir şekilde aktarmak.
```

Bu dosya runtime schema değildir.

Bu dosya TypeScript type, Zod schema veya JSON Schema değildir.

## 2. Producer

Birincil producer:

```yaml
producer_agent: accommodation_fit_agent
```

Dolaylı input kaynakları:

```yaml
upstream_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
  - destination-candidate-contract.md
  - route-logistics-contract.md
```

## 3. Consumer

Bu contract aşağıdaki consumer'lara aktarılabilir:

```yaml
consumer_agents:
  - day_plan_composer_agent
  - verification_evidence_agent
  - final_response_composer_agent
```

## 4. Input fields

Beklenen input alanları:

```yaml
input_fields:
  - travel_request
  - constraint_policy_result
  - family_suitability_profile
  - destination_candidates
  - route_logistics_profile
  - accommodation_candidates
```

`accommodation_candidates` kesin rezervasyon veya canlı müsaitlik iddiası taşımaz.

## 5. Output fields

Ana output:

```yaml
output_type: accommodation_fit_result
```

Beklenen output alanları:

```yaml
accommodation_fit_result:
  contract_id: accommodation_fit_contract
  contract_version: v0.1
  producer_agent: accommodation_fit_agent
  accommodation_summary:
    candidate_count: 0
    recommended_candidate_count: 0
    blocked_candidate_count: 0
  accommodation_profiles: []
  excluded_accommodation_candidates: []
  budget_fit_summary: {}
  family_fit_summary: {}
  facility_verification_needs: []
  price_verification_needs: []
  parking_verification_needs: []
  location_verification_needs: []
  clarification_requirements: []
  validation_status: pending
  confidence:
    value: medium
    reasons: []
```

## 6. Required fields

Her accommodation profile için minimum alanlar:

```yaml
required_fields:
  - accommodation_candidate_id
  - destination_candidate_id
  - accommodation_label
  - accommodation_type
  - family_fit_band
  - budget_fit_band
  - rest_fit_band
  - location_fit_band
  - verification_status
  - confidence
```

Örnek `accommodation_type` değerleri:

```yaml
accommodation_type_examples:
  - hotel
  - thermal_hotel
  - family_resort
  - apartment_hotel
  - pension
  - unknown
```

## 7. Optional fields

Opsiyonel alanlar:

```yaml
optional_fields:
  - pool_presence_claim
  - thermal_spa_claim
  - family_room_claim
  - breakfast_claim
  - parking_claim
  - stroller_accessibility_claim
  - distance_to_primary_activity_band
  - cancellation_policy_claim
  - noise_or_crowd_risk
  - indoor_rest_option
  - nearby_evening_walk_option
```

Opsiyonel alanlar evidence olmadan kesin bilgi gibi taşınamaz.

## 8. Forbidden fields

Bu contract içinde bulunmaması gereken alanlar:

```yaml
forbidden_fields:
  - booking_confirmation
  - payment_information
  - credit_card_information
  - user_identity_document
  - provider_api_secret
  - exact_live_price_without_evidence
  - exact_live_availability_without_evidence
  - final_user_message
```

Bu contract rezervasyon yapmaz.

Bu contract ödeme bilgisi taşımaz.

Bu contract nihai kullanıcı cevabı üretmez.

## 9. Evidence requirements

Evidence gerektiren claim türleri:

```yaml
evidence_required_for:
  - price_claim
  - availability_claim
  - pool_presence_claim
  - thermal_spa_claim
  - family_room_claim
  - parking_claim
  - breakfast_claim
  - child_facility_claim
  - location_distance_claim
  - cancellation_policy_claim
```

Evidence yoksa claim şu şekilde işaretlenmelidir:

```yaml
verification_status:
  value: needs_verification
  reason: claim_requires_live_or_source_evidence
```

## 10. Confidence rules

Confidence kuralları:

```yaml
high:
  conditions:
    - accommodation_candidate_source_known
    - family_fit_reasoning_clear
    - budget_band_available
    - key_claims_marked_with_evidence_or_verification_need

medium:
  conditions:
    - family_fit_reasoning_clear
    - price_or_facility_claims_need_verification

low:
  conditions:
    - candidate_name_or_location_ambiguous
    - major_facility_claims_unverified
    - budget_fit_unclear
```

Düşük confidence, accommodation adayını otomatik elemek zorunda değildir.

Fakat final response içinde kesin öneri gibi sunulamaz.

## 11. Validation rules

Validation kuralları:

```yaml
validation_rules:
  booking_claim_without_evidence: forbidden
  exact_price_without_evidence: forbidden
  exact_availability_without_evidence: forbidden
  over_budget_without_user_approval: blocked_or_needs_clarification
  family_hard_constraint_violation: blocked
  missing_verification_marker_for_facility_claim: invalid
  final_user_message_present: invalid
```

Örnek hard blocker:

```text
Kullanıcı otoparkı zorunlu belirtmişse ve adayın otopark durumu bilinmiyorsa, aday kesin uygun gibi sunulamaz; verification veya clarification gerekir.
```

## 12. Failure modes

Olası failure mode'lar:

```yaml
failure_modes:
  - accommodation_location_ambiguous
  - price_band_missing
  - availability_unknown
  - pool_or_spa_claim_unverified
  - parking_claim_unverified
  - family_room_claim_unverified
  - over_budget_risk
  - inaccessible_for_toddler_or_stroller
```

## 13. Clarification states

Clarification gerektiren durumlar:

```yaml
clarification_states:
  - accommodation_budget_limit_unclear
  - pool_or_thermal_spa_required_vs_preferred_unclear
  - parking_required_unclear
  - same_hotel_all_nights_vs_split_stay_unclear
  - family_room_required_unclear
```

Örnek clarification:

```text
Konaklamada havuz/kaplıca zorunlu mu, yoksa olursa iyi olur mu?
```

## 14. Example payload sketch

```yaml
contract_id: accommodation_fit_contract
contract_version: v0.1
producer_agent: accommodation_fit_agent
consumer_agent: day_plan_composer_agent
trace_id: trace_demo_001
output:
  accommodation_summary:
    candidate_count: 2
    recommended_candidate_count: 1
    blocked_candidate_count: 0
  accommodation_profiles:
    - accommodation_candidate_id: acc_001
      destination_candidate_id: dest_001
      accommodation_label: thermal_family_hotel_candidate
      accommodation_type: thermal_hotel
      family_fit_band: high
      budget_fit_band: medium
      rest_fit_band: high
      location_fit_band: medium
      facility_claims:
        pool_presence_claim:
          value: unknown
          verification_status: needs_verification
        thermal_spa_claim:
          value: claimed
          verification_status: needs_verification
        parking_claim:
          value: unknown
          verification_status: needs_verification
      risks:
        - price_may_exceed_budget
        - facility_claims_unverified
      confidence:
        value: medium
        reasons:
          - family_rest_need_supported
          - live_price_not_verified
  price_verification_needs:
    - acc_001_price_currentness
  facility_verification_needs:
    - acc_001_pool_and_spa_status
  parking_verification_needs:
    - acc_001_parking_status
  validation_status: pending
```

## 15. Fixture requirements

İlk fixture:

```yaml
fixture_id: TM-CONTRACT-ACCOMMODATION-001
name: Çocuklu aile için havuz/kaplıca konaklama adayları
input:
  family:
    adults: 2
    children_ages: [6, 2]
  budget:
    amount: 30000
    currency: TRY
  preferences:
    - pool_or_thermal_spa_preferred
    - low_fatigue
expected_output:
  must_include:
    - accommodation_profiles
    - budget_fit_band
    - family_fit_band
    - rest_fit_band
    - facility_verification_needs
    - price_verification_needs
  must_not_include:
    - booking_confirmation
    - payment_information
    - exact_live_price_without_evidence
```

## 16. Backward compatibility notes

```yaml
compatibility:
  contract_version_required: true
  additive_fields_allowed: true
  removing_required_fields_requires_new_major_version: true
  changing_fit_band_meaning_requires_new_major_version: true
```

Fit band değerleri başka contract'larla uyumlu tutulmalıdır.

## 17. Open design questions

```yaml
open_questions:
  - Havuz/kaplıca gibi tesis özellikleri ayrı facility claim listesi olarak mı tutulmalı?
  - Bütçe uygunluğu toplam tatil bütçesi üzerinden mi, gecelik band üzerinden mi hesaplanacak?
  - Otopark zorunluluğu default olarak soft preference mı kabul edilecek?
  - Aynı otelde kalma ve split-stay kararları hangi contract'ta kesinleşecek?
```

## Sonuç

Accommodation Fit Contract, konaklama adaylarının aileye uygunluk ve doğrulama ihtiyacını görünür hale getirir.

Bu contract rezervasyon yapmaz.

Bu contract canlı fiyat veya müsaitlik üretmez.

```yaml
contract_status: drafted
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
next_contract: activity-fit-contract.md
```
