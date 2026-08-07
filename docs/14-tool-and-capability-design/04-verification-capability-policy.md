# 04 — Verification Capability Policy

**Doküman türü:** canonical verification capability policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Live tool çağrısı:** kapalı

## Purpose

Bu dosya, Tatil Modu içinde hangi bilgi türlerinin capability doğrulaması gerektirdiğini ve doğrulanamayan bilginin nasıl evidence gap, warning veya blocker olarak taşınacağını tanımlar.

Bu dosya gerçek API çağrısı, adapter kodu, scraping, provider entegrasyonu veya runtime verification değildir.

## Ana karar

```yaml
verification_capability_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/04-verification-capability-policy.md
related_contracts:
  - docs/12-contracts/common-evidence-envelope.md
  - docs/12-contracts/common-error-envelope.md
  - docs/12-contracts/verification-evidence-contract.md
  - docs/12-contracts/final-response-contract.md
related_fixtures:
  - docs/13-fixtures-and-evaluation/05-evidence-gap-fixture-pack.md
  - docs/13-fixtures-and-evaluation/06-privacy-sensitive-beach-fixture-pack.md
  - docs/13-fixtures-and-evaluation/07-route-logistics-fixture-pack.md
```

## Verification policy'nin amacı

Tatil planında bazı iddialar sabit bilgi gibi yazılamaz.

Örneğin:

```text
Giriş ücreti 250 TL.
Bugün açık.
Otopark var.
Yol 1 saat 20 dakika sürer.
Kadınlar plajı mevcut.
Otel müsait.
Hava yağmursuz olacak.
```

Bu tür iddialar capability doğrulaması veya açık uncertainty disclosure gerektirir.

## Verification gerektiren claim türleri

```yaml
verification_required_claim_types:
  price:
    examples:
      - giriş ücreti
      - otel gecelik fiyatı
      - toplam tahmini bütçe
    required_capabilities:
      - place_price_information
      - accommodation_price_signal
      - cost_estimation
  opening_hours:
    examples:
      - bugün açık
      - kapanış saati
      - özel gün çalışma durumu
    required_capabilities:
      - place_opening_hours
      - official_source_lookup
  availability:
    examples:
      - otel müsait
      - rezervasyon yapılabilir
      - tesis hizmet veriyor
    required_capabilities:
      - accommodation_availability
      - official_source_lookup
  route_distance_and_time:
    examples:
      - kilometre
      - dakika/saat bazlı yol süresi
      - rota uygunluğu
    required_capabilities:
      - maps_distance_and_route
      - traffic_estimation
  traffic:
    examples:
      - trafik rahat olur
      - dönüşte yoğunluk beklenmez
      - hafta içi akıcıdır
    required_capabilities:
      - traffic_estimation
  parking:
    examples:
      - otopark var
      - park sorunu olmaz
      - çocukla kolay erişilir
    required_capabilities:
      - parking_information
      - review_signal_lookup
  weather:
    examples:
      - hava açık
      - yağmur yok
      - denize uygun
    required_capabilities:
      - weather_forecast
      - seasonal_suitability
  women_only_beach_or_privacy:
    examples:
      - kadınlar plajı var
      - mahremiyet uygun
      - aile için privacy uyumlu
    required_capabilities:
      - women_only_beach_verification
      - official_source_lookup
      - source_cross_check
  facility_features:
    examples:
      - havuz var
      - spa/termal var
      - çocuk oyun alanı var
      - bebek yatağı var
    required_capabilities:
      - accommodation_facility_verification
      - official_source_lookup
      - review_signal_lookup
  age_restriction:
    examples:
      - 2 yaş çocuk için uygun
      - yaş sınırı yok
      - bebek arabasıyla uygun
    required_capabilities:
      - place_age_restriction
      - family_safety_signal_lookup
```

## Verification zorunluluk seviyeleri

```yaml
verification_requirement_levels:
  mandatory_before_verified_claim:
    description: "Kesin iddia yazılmadan önce doğrulama gerekir."
    applies_to:
      - price
      - opening_hours
      - availability
      - women_only_beach_or_privacy
      - route_distance_and_time
      - weather
  recommended_before_strong_recommendation:
    description: "Öneriyi güçlendirmeden önce doğrulama gerekir; doğrulanmazsa uncertainty görünür olmalıdır."
    applies_to:
      - parking
      - facility_features
      - age_restriction
      - review_signal
  optional_contextual_signal:
    description: "Planı destekler ama tek başına kesin karar üretmez."
    applies_to:
      - review_signal_lookup
      - seasonal_suitability
      - family_safety_signal_lookup
```

## Doğrulanamayan bilgi davranışı

Capability sonucu yoksa, başarısızsa veya güven seviyesi düşükse sistem şu davranışlardan birini üretmelidir:

```yaml
unverified_information_behavior:
  evidence_gap:
    use_when: "Bilgi faydalı ama doğrulanmamış."
    final_response_behavior: "Kesin iddia olarak değil, kontrol edilmesi gereken bilgi olarak yazılır."
  soft_warning:
    use_when: "Plan uygulanabilir ama dikkat gerektirir."
    final_response_behavior: "Kullanıcıya kısa uyarı verilir."
  hard_blocker:
    use_when: "Hard constraint doğrulanamıyor veya ihlal riski yüksek."
    final_response_behavior: "Plan kesin öneri olarak sunulmaz."
  fallback_needed:
    use_when: "Ana öneri doğrulanamadığı için alternatif rota/aktivite gerekir."
    final_response_behavior: "Alternatif açıkça sunulur."
```

## Hard constraint ve verification ilişkisi

Hard constraint doğrulanmadan kesin karşılanmış kabul edilemez.

```yaml
hard_constraint_verification_rules:
  women_only_beach_required_when_sea_recommended:
    verification_required: true
    if_unverified: hard_blocker_or_non_sea_fallback
  max_radius_or_exception_policy:
    verification_required: true
    if_unverified: radius_uncertainty_warning_or_exclusion
  toddler_midday_rest_required:
    verification_required: false
    reason: "Kullanıcı/family profile kaynaklı planlama kuralıdır; live tool gerektirmez."
  exact_budget_fit:
    verification_required: true
    if_unverified: budget_uncertainty_disclosure
```

## Capability result to evidence status

```yaml
capability_result_to_evidence_status:
  verified:
    required_conditions:
      - source_available
      - claim_supported
      - freshness_acceptable
      - confidence_medium_or_high
  partially_verified:
    required_conditions:
      - source_available
      - claim_partially_supported
      - uncertainty_exists
  unverified:
    required_conditions:
      - no_source_available
      - source_untrusted
      - source_outdated
      - confidence_low
  conflicting:
    required_conditions:
      - multiple_sources_disagree
      - official_source_and_review_signal_conflict
  unavailable:
    required_conditions:
      - capability_failed
      - provider_unavailable
      - rate_limited
      - access_denied
```

## Source priority policy

```yaml
source_priority_policy:
  highest:
    - official_source_lookup
    - facility_or_municipality_source
  high:
    - structured_maps_or_place_provider
    - weather_forecast_provider
  medium:
    - reputable_travel_platform
    - accommodation_platform_signal
  low:
    - user_review_signal
    - blog_or_unstructured_article
  not_sufficient_alone_for_hard_constraint:
    - review_signal_lookup
    - social_media_post
    - outdated_blog
```

Review sinyali pratik bilgi için faydalıdır; fakat hard constraint doğrulaması için tek başına yeterli değildir.

## Freshness policy

```yaml
freshness_policy:
  same_day_or_current:
    claim_types:
      - weather
      - traffic
      - availability
  recent_required:
    claim_types:
      - opening_hours
      - price
      - parking
      - facility_features
  stable_but_check_if_sensitive:
    claim_types:
      - route_distance
      - general_place_location
      - seasonal_suitability
  always_sensitive:
    claim_types:
      - women_only_beach_or_privacy
      - official_closure
      - age_restriction
```

## Forbidden verification behavior

```yaml
forbidden_behaviors:
  - unverified_price_as_fact
  - unverified_opening_hours_as_fact
  - unverified_weather_as_fact
  - unverified_drive_time_as_fact
  - unverified_parking_as_fact
  - unverified_women_only_beach_as_fact
  - review_signal_used_as_hard_constraint_proof
  - provider_error_hidden_from_evidence
  - stale_source_presented_as_current
  - capability_failure_replaced_by_model_guess
```

## Agent responsibilities

```yaml
agent_responsibilities:
  route_logistics_agent:
    must_mark_verification_needs_for:
      - route_distance_and_time
      - traffic
      - parking
  accommodation_fit_agent:
    must_mark_verification_needs_for:
      - price
      - availability
      - facility_features
      - parking
  activity_fit_agent:
    must_mark_verification_needs_for:
      - opening_hours
      - price
      - weather
      - age_restriction
      - women_only_beach_or_privacy
  verification_evidence_agent:
    owns:
      - evidence_status_assignment
      - source_trust_assessment
      - freshness_assessment
      - blocker_or_warning_classification
  final_response_composer_agent:
    must_not:
      - call_capability
      - upgrade_unverified_to_verified
      - hide_evidence_gap
```

## Final response rule

Final cevapta doğrulanmamış bilgi şu şekilde sunulmalıdır:

```text
Kesin: "Burası 18:00'e kadar açık."  -> sadece verified ise kullanılabilir.
Güvenli: "Açılış saatini güncel kaynaktan kontrol etmek gerekir; bu nedenle bunu doğrulama ihtiyacı olarak işaretliyorum."
```

## Current status

```yaml
verification_capability_policy_state: drafted
next_artifact: 05-evidence-emission-mapping.md
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
