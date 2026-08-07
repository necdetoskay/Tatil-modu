# 02 — Capability Taxonomy

**Doküman türü:** canonical capability taxonomy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Adapter entegrasyonu:** kapalı

## Purpose

Bu doküman, Tatil Modu'nun dış dünyadan doğrulama veya bilgi alma ihtiyacı duyduğu capability sınıflarını tanımlar.

Bu dosya provider listesi değildir.

Bu dosya adapter kodu, tool çağrısı, API entegrasyonu, scraping veya runtime implementation değildir.

## Ana karar

```yaml
capability_taxonomy_state: drafted
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/02-capability-taxonomy.md
```

## Capability taxonomy neden gerekli?

Tatil Modu için kritik bilgiler sık değişir, doğrulama ister veya kaynağa bağlı güven seviyesi taşır.

Bu nedenle sistem provider adıyla değil, capability ihtiyacıyla düşünmelidir.

```text
Yanlış yaklaşım:
Google Maps çağır.

Doğru yaklaşım:
maps_distance_and_route capability'si ile mesafe/yol yükü claim'ini evidence-aware şekilde doğrula.
```

## Capability category map

```yaml
capability_categories:
  route_and_mobility:
    purpose: "mesafe, rota, yol süresi, trafik ve mola ihtiyacını değerlendirmek"
  place_information:
    purpose: "mekan, aktivite, tesis, saat, fiyat, yaş kısıtı ve erişim bilgilerini doğrulamak"
  weather_and_seasonality:
    purpose: "hava durumu, mevsimsel uygunluk ve indoor fallback ihtiyacını değerlendirmek"
  accommodation:
    purpose: "konaklama adayları, aile uygunluğu, fiyat, müsaitlik ve tesis olanaklarını değerlendirmek"
  privacy_and_family_safety:
    purpose: "kadınlar plajı, mahremiyet, çocuk güvenliği ve aile hassasiyetlerini doğrulamak"
  official_and_trust_sources:
    purpose: "resmi kaynak, belediye, tesis sayfası ve yüksek güvenli doğrulama sinyallerini toplamak"
  review_and_experience_signals:
    purpose: "aile deneyimi, pratik sorunlar, kalabalık, temizlik, otopark ve kullanıcı yorumu sinyallerini değerlendirmek"
  budget_and_cost:
    purpose: "tahmini maliyet, fiyat aralığı, giriş ücreti ve bütçe uyumunu değerlendirmek"
```

## Route and mobility capabilities

```yaml
route_and_mobility:
  maps_distance_and_route:
    capability_id: maps_distance_and_route
    purpose: "iki nokta arası mesafe, rota bandı ve yol yükü üretmek"
    claim_types:
      - distance_band
      - route_burden
      - drive_time_band
    requires_freshness: medium
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - exact_drive_time
      - exact_distance
    primary_consumers:
      - route_logistics_agent
      - destination_candidate_agent
      - verification_evidence_agent

  traffic_estimation:
    capability_id: traffic_estimation
    purpose: "trafik yoğunluğu ve zaman belirsizliği riskini değerlendirmek"
    claim_types:
      - traffic_risk
      - time_uncertainty
    requires_freshness: high
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - traffic_will_be_empty
      - exact_arrival_time
    primary_consumers:
      - route_logistics_agent
      - verification_evidence_agent

  rest_stop_discovery:
    capability_id: rest_stop_discovery
    purpose: "çocuklu aile için mola ihtiyacını ve muhtemel mola bölgelerini değerlendirmek"
    claim_types:
      - rest_stop_need
      - toddler_drive_break_need
    requires_freshness: low_to_medium
    evidence_required_for_exact_claim: true
    primary_consumers:
      - route_logistics_agent
      - family_suitability_agent
```

## Place information capabilities

```yaml
place_information:
  place_opening_hours:
    capability_id: place_opening_hours
    purpose: "aktivite veya tesis açılış/kapanış bilgisi doğrulamak"
    claim_types:
      - opening_hours
      - closure_warning
    requires_freshness: high
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - exact_opening_hours
      - open_today
    primary_consumers:
      - activity_fit_agent
      - verification_evidence_agent

  place_price_information:
    capability_id: place_price_information
    purpose: "giriş ücreti, kişi başı ücret veya fiyat aralığı doğrulamak"
    claim_types:
      - price
      - budget_fit
    requires_freshness: high
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - exact_ticket_price
      - exact_total_cost
    primary_consumers:
      - activity_fit_agent
      - accommodation_fit_agent
      - verification_evidence_agent

  place_age_restriction:
    capability_id: place_age_restriction
    purpose: "çocuk yaşı, minimum yaş veya güvenlik kısıtı olup olmadığını doğrulamak"
    claim_types:
      - age_restriction
      - child_safety_constraint
    requires_freshness: medium
    evidence_required_for_exact_claim: true
    primary_consumers:
      - activity_fit_agent
      - family_suitability_agent
```

## Weather and seasonality capabilities

```yaml
weather_and_seasonality:
  weather_forecast:
    capability_id: weather_forecast
    purpose: "plan günü hava durumu ve outdoor/indoor fallback ihtiyacını değerlendirmek"
    claim_types:
      - weather_risk
      - outdoor_suitability
      - indoor_fallback_need
    requires_freshness: high
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - weather_will_be_good
      - no_rain_expected
    primary_consumers:
      - activity_fit_agent
      - day_plan_composer_agent
      - verification_evidence_agent

  seasonal_suitability:
    capability_id: seasonal_suitability
    purpose: "mevsime bağlı deniz, açık alan, termal veya doğa aktivitesi uygunluğunu değerlendirmek"
    claim_types:
      - seasonal_fit
      - seasonal_warning
    requires_freshness: medium
    evidence_required_for_exact_claim: false
    primary_consumers:
      - destination_candidate_agent
      - activity_fit_agent
```

## Accommodation capabilities

```yaml
accommodation:
  accommodation_search:
    capability_id: accommodation_search
    purpose: "konaklama adayları ve aile uygunluğu sinyalleri bulmak"
    claim_types:
      - accommodation_candidate
      - family_room_signal
      - facility_signal
    requires_freshness: high
    evidence_required_for_exact_claim: true
    primary_consumers:
      - accommodation_fit_agent
      - verification_evidence_agent

  accommodation_availability:
    capability_id: accommodation_availability
    purpose: "belirli tarih aralığı için müsaitlik doğrulama ihtiyacını temsil etmek"
    claim_types:
      - availability_status
      - booking_risk
    requires_freshness: very_high
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - room_available
      - exact_booking_price
    primary_consumers:
      - accommodation_fit_agent
      - verification_evidence_agent

  accommodation_facility_verification:
    capability_id: accommodation_facility_verification
    purpose: "havuz, spa, termal, otopark, aile odası gibi tesis olanaklarını doğrulamak"
    claim_types:
      - facility_status
      - family_facility_fit
    requires_freshness: high
    evidence_required_for_exact_claim: true
    primary_consumers:
      - accommodation_fit_agent
      - verification_evidence_agent
```

## Privacy and family safety capabilities

```yaml
privacy_and_family_safety:
  women_only_beach_verification:
    capability_id: women_only_beach_verification
    purpose: "kadınlar plajı veya privacy uyumunu doğrulamak"
    claim_types:
      - privacy_requirement_status
      - women_only_beach_status
    requires_freshness: high
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - women_only_beach_available
      - privacy_requirement_satisfied
    primary_consumers:
      - activity_fit_agent
      - verification_evidence_agent

  family_safety_signal_lookup:
    capability_id: family_safety_signal_lookup
    purpose: "çocuk güvenliği, kalabalık, erişim zorluğu veya aile için pratik riskleri değerlendirmek"
    claim_types:
      - child_safety_signal
      - parent_burden_signal
    requires_freshness: medium
    evidence_required_for_exact_claim: false
    primary_consumers:
      - family_suitability_agent
      - activity_fit_agent
```

## Official and trust source capabilities

```yaml
official_and_trust_sources:
  official_source_lookup:
    capability_id: official_source_lookup
    purpose: "belediye, müze, tesis veya resmi sayfa bilgisini bulmak"
    claim_types:
      - official_source_presence
      - high_trust_verification
    requires_freshness: high
    evidence_required_for_exact_claim: true
    primary_consumers:
      - verification_evidence_agent

  source_cross_check:
    capability_id: source_cross_check
    purpose: "aynı claim için birden fazla kaynak arasında tutarlılık kontrolü yapmak"
    claim_types:
      - source_consistency
      - conflicting_sources
    requires_freshness: high
    evidence_required_for_exact_claim: true
    primary_consumers:
      - verification_evidence_agent
```

## Review and experience signal capabilities

```yaml
review_and_experience_signals:
  review_signal_lookup:
    capability_id: review_signal_lookup
    purpose: "aile uygunluğu, temizlik, kalabalık, park ve pratik deneyim sinyali almak"
    claim_types:
      - review_signal
      - family_experience_signal
      - parking_experience_signal
    requires_freshness: medium
    evidence_required_for_exact_claim: false
    final_fact_claim_allowed: false
    primary_consumers:
      - family_suitability_agent
      - activity_fit_agent
      - accommodation_fit_agent
```

Review sinyali resmi doğrulama yerine geçmez.

Review sinyali ancak destekleyici uyarı veya pratik deneyim sinyali olarak kullanılabilir.

## Budget and cost capabilities

```yaml
budget_and_cost:
  cost_estimation:
    capability_id: cost_estimation
    purpose: "yakıt, geçiş, konaklama, aktivite ve yemek gibi tahmini maliyet kalemlerini sınıflandırmak"
    claim_types:
      - cost_band
      - budget_risk
    requires_freshness: medium
    evidence_required_for_exact_claim: true
    exact_claims_forbidden_without_evidence:
      - exact_total_trip_cost
    primary_consumers:
      - day_plan_composer_agent
      - final_response_composer_agent
      - verification_evidence_agent
```

## Capability naming rules

```yaml
capability_naming_rules:
  use_snake_case: true
  include_purpose_not_provider: true
  provider_name_forbidden: true
  action_verb_preferred_when_clear: true
  examples_allowed:
    - maps_distance_and_route
    - weather_forecast
    - women_only_beach_verification
  examples_forbidden:
    - google_maps
    - booking_com
    - accuweather
```

Provider isimleri taxonomy seviyesinde kullanılmaz.

Provider isimleri daha sonra adapter boundary içinde mapping adayı olarak değerlendirilebilir; canonical capability kimliği değişmez.

## Capability output rule

Her capability sonucu doğrudan final cevaba yazılamaz.

Önce evidence-aware contract alanlarına dönüştürülür:

```yaml
capability_output_rule:
  raw_provider_output_to_final_response: forbidden
  capability_result_to_evidence_envelope: required
  evidence_gap_when_failed: required
  uncertainty_disclosure_when_unverified: required
```

## Current status

```yaml
capability_taxonomy_state: drafted
next_artifact: 03-agent-capability-access-matrix.md
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
