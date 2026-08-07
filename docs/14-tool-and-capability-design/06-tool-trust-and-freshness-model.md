# 06 — Tool Trust and Freshness Model

**Doküman türü:** tool trust ve freshness design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Adapter entegrasyonu:** kapalı

## Purpose

Bu dosya, Tatil Modu capability sonuçlarının güvenilirlik ve tazelik açısından nasıl sınıflandırılacağını tanımlar.

Bu dosya canlı kaynak doğrulama, API entegrasyonu, scraping, cache implementation veya runtime freshness hesaplama değildir.

Bu dosya şu soruyu cevaplar:

```text
Bir capability sonucu geldiğinde sistem bu bilginin ne kadar güvenilir ve ne kadar taze olduğunu nasıl tasarım seviyesinde yorumlamalıdır?
```

## Ana karar

```yaml
artifact_id: tool_trust_and_freshness_model
document_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/06-tool-trust-and-freshness-model.md
```

## Trust modeli

Tool veya provider adı tek başına güven kaynağı değildir.

Güven; kaynak tipi, claim tipi, kaynak güncelliği, cross-check durumu ve kullanıcıya etkisiyle birlikte değerlendirilir.

```yaml
trust_dimensions:
  - source_authority
  - source_directness
  - source_freshness
  - source_specificity
  - cross_check_status
  - claim_sensitivity
  - user_impact
```

## Trust level sınıfları

```yaml
trust_levels:
  official_primary:
    description: "Resmi kurum, tesis, müze, belediye, otel veya hizmet sağlayıcının birincil kaynağı"
    default_confidence_band: high
    examples:
      - official_municipality_page
      - official_hotel_page
      - official_museum_page
      - official_beach_facility_page
  official_secondary:
    description: "Resmi ama doğrudan işletmeci olmayan kaynak"
    default_confidence_band: medium_high
    examples:
      - tourism_board_page
      - official_city_guide
  provider_structured:
    description: "Harita, hava, konaklama veya yer bilgisi sağlayan yapılandırılmış provider sonucu"
    default_confidence_band: medium
    examples:
      - maps_place_data
      - weather_provider_data
      - booking_platform_listing_data
  user_review_signal:
    description: "Kullanıcı yorumu, puan, aile deneyimi veya pratik sinyal"
    default_confidence_band: low_to_medium
    examples:
      - review_summary
      - family_comment_signal
      - parking_user_comment
  inferred_or_derived:
    description: "Birden fazla veriden sistemin türettiği yorum veya risk sınıflaması"
    default_confidence_band: depends_on_inputs
    examples:
      - fatigue_risk
      - route_burden_level
      - parking_risk_level
  unknown_or_unverified:
    description: "Kaynak yok, kaynak belirsiz veya doğrulama başarısız"
    default_confidence_band: low
```

## Freshness modeli

Freshness, bilginin claim tipiyle birlikte değerlendirilir.

Aynı kaynak tarihi, farklı claim türleri için farklı anlam taşır.

Örneğin otelin adı uzun süre geçerli olabilir; fakat fiyat ve müsaitlik çok hızlı değişir.

```yaml
freshness_dimensions:
  - claim_type
  - source_last_updated
  - observed_at
  - seasonality
  - event_sensitivity
  - operational_volatility
  - user_trip_date_distance
```

## Claim tipi bazlı freshness beklentisi

```yaml
freshness_expectations:
  weather_forecast:
    required_freshness: very_fresh
    stale_risk: very_high
    final_response_if_stale: disclose_or_fallback
  live_traffic:
    required_freshness: very_fresh
    stale_risk: very_high
    final_response_if_stale: do_not_present_as_current
  exact_drive_time:
    required_freshness: fresh
    stale_risk: high
    final_response_if_stale: present_as_estimate_only
  parking_availability:
    required_freshness: fresh
    stale_risk: high
    final_response_if_stale: disclose_uncertainty
  opening_hours:
    required_freshness: fresh
    stale_risk: medium_high
    final_response_if_stale: verify_before_visit_warning
  ticket_or_entry_price:
    required_freshness: fresh
    stale_risk: high
    final_response_if_stale: price_unverified_warning
  accommodation_price:
    required_freshness: very_fresh
    stale_risk: very_high
    final_response_if_stale: do_not_present_exact_price
  accommodation_availability:
    required_freshness: very_fresh
    stale_risk: very_high
    final_response_if_stale: do_not_present_as_available
  women_only_beach_status:
    required_freshness: fresh_and_authoritative
    stale_risk: high
    final_response_if_stale: privacy_status_unverified
  facility_features:
    required_freshness: fresh
    stale_risk: medium_high
    final_response_if_stale: verify_facility_before_booking
  location_identity:
    required_freshness: stable
    stale_risk: low
    final_response_if_stale: acceptable_with_low_risk
```

## Freshness band tanımları

Bu süreler implementation değeri değildir; tasarım seviyesinde karar bandıdır.

```yaml
freshness_bands:
  very_fresh:
    design_meaning: "Kısa zaman içinde değişebilen bilgi"
    examples:
      - weather_forecast
      - live_traffic
      - accommodation_availability
      - accommodation_price
  fresh:
    design_meaning: "Yakın dönemde kontrol edilmesi gereken operasyonel bilgi"
    examples:
      - opening_hours
      - parking_information
      - ticket_price
      - facility_feature_status
  recent:
    design_meaning: "Görece yavaş değişen ama yine de güncel kaynak isteyen bilgi"
    examples:
      - place_description
      - family_suitability_signal
      - route_distance_band
  stable:
    design_meaning: "Nadiren değişen temel kimlik bilgisi"
    examples:
      - city_name
      - place_name
      - general_location
```

## Trust ve freshness birleşik kararı

```yaml
combined_decision_rules:
  high_trust_but_stale:
    result: evidence_gap_or_warning
    final_response_rule: "Kaynak güvenilir olsa bile eski bilgi kesin gerçek gibi sunulamaz."
  fresh_but_low_trust:
    result: weak_signal
    final_response_rule: "Taze ama düşük güvenli bilgi destekleyici sinyal olabilir; hard constraint karşılamaz."
  high_trust_and_fresh:
    result: verified_or_supported_claim
    final_response_rule: "Claim confidence yüksek olabilir; yine de claim type hassassa user-visible source summary gerekir."
  low_trust_and_stale:
    result: unverified
    final_response_rule: "Final cevapta kesin bilgi olarak kullanılamaz."
```

## Privacy-sensitive trust rule

Kadınlar plajı veya mahremiyet iddiası yalnızca genel review veya düşük güvenli sinyalle karşılanmış sayılmaz.

```yaml
privacy_sensitive_trust_rule:
  claim_types:
    - women_only_beach_status
    - privacy_suitability
    - gender_segregated_facility
  minimum_expected_source:
    - official_primary
    - official_secondary_with_cross_check
  review_signal_only:
    hard_constraint_satisfied: false
    allowed_use: weak_signal_or_warning
```

## Review signal kullanımı

Review sinyalleri değerli ama sınırlıdır.

```yaml
review_signal_policy:
  can_support:
    - parent_burden_signal
    - parking_difficulty_signal
    - stroller_access_signal
    - crowding_signal
    - family_experience_signal
  cannot_alone_verify:
    - exact_price
    - official_opening_hours
    - accommodation_availability
    - women_only_beach_status
    - legal_or_policy_status
```

## Evidence envelope etkisi

Trust ve freshness modeli şu alanları etkiler:

```yaml
evidence_envelope_impact:
  source_summary: required
  evidence_status: derived_from_trust_and_freshness
  verification_status: derived_from_claim_sensitivity
  confidence: derived_from_trust_freshness_cross_check
  freshness: explicit
  user_visibility: required_for_sensitive_or_uncertain_claims
  warnings: emitted_when_stale_or_low_trust
  blockers: emitted_when_hard_constraint_depends_on_unverified_claim
```

## Final response kuralları

```yaml
final_response_rules:
  exact_price_stale_or_unverified:
    must_not_present_as_exact: true
  opening_hours_stale_or_unverified:
    must_include_verify_before_visit: true
  women_only_beach_unverified:
    must_not_present_as_satisfied: true
  traffic_stale:
    must_not_present_as_live_current: true
  accommodation_availability_unverified:
    must_not_present_as_available: true
```

## Common failure modes

```yaml
failure_modes:
  - official_but_stale_presented_as_current
  - review_signal_used_as_hard_verification
  - fresh_provider_result_used_without_source_visibility
  - women_only_beach_status_verified_from_low_trust_source
  - exact_price_claim_without_freshness
  - live_traffic_claim_from_static_source
  - accommodation_availability_presented_without_fresh_check
```

## Current status

```yaml
document_state: drafted
next_artifact: 07-provider-and-adapter-boundary.md
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
