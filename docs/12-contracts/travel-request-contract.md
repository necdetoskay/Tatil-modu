# Travel Request Contract

**Contract id:** `travel_request_contract`  
**Contract version:** `v1`  
**Producer:** `trip_intake_agent`  
**Primary consumers:** `constraint_policy_agent`, `destination_candidate_agent`, `family_suitability_agent`  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu contract, kullanıcının serbest metin tatil isteğinin yapılandırılmış ve agent'lar arası taşınabilir biçimini tanımlar.

Bu contract plan üretmez.

Bu contract rota, otel, aktivite, fiyat, hava durumu veya rezervasyon sonucu üretmez.

Amaç, sonraki agent'ların aynı kullanıcı isteğini farklı yorumlamasını önlemek ve eksik bilgileri açık şekilde taşımaktır.

## Producer

```yaml
producer_agent: trip_intake_agent
producer_spec: docs/11-agent-specifications/trip-intake-agent.md
```

## Consumers

İlk tüketiciler:

```yaml
primary_consumers:
  - constraint_policy_agent
  - destination_candidate_agent
  - family_suitability_agent
secondary_consumers:
  - route_logistics_agent
  - accommodation_fit_agent
  - activity_fit_agent
  - day_plan_composer_agent
```

## Non-goals

Bu contract şunları yapmaz:

```yaml
final_plan_generation: false
activity_recommendation: false
hotel_recommendation: false
route_calculation: false
live_data_lookup: false
price_verification: false
weather_verification: false
booking_action: false
memory_write: false
```

## Top-level envelope

Her travel request payload'u envelope ile taşınır:

```yaml
envelope:
  contract_id: travel_request_contract
  contract_version: v1
  producer_agent: trip_intake_agent
  trace_id: required
  created_at: required
  source_language: required
  validation_status: required
  confidence: required
  evidence_summary: optional
  payload: required
```

## Payload alanları

```yaml
payload:
  original_user_request: required
  normalized_request: required
  travel_party: required
  origin: required_if_known
  target_area: required_if_known
  duration: required_if_known
  date_window: optional
  transport_mode: optional
  budget: optional
  accommodation_expectations: optional
  activity_preferences: optional
  privacy_preferences: optional
  family_constraints: optional
  logistics_preferences: optional
  hard_constraint_candidates: optional
  soft_preference_candidates: optional
  missing_information: required
  ambiguity_notes: required
  assumptions: required
  out_of_scope_notes: optional
```

## Required fields

Aşağıdaki alanlar her payload'da bulunmalıdır:

```yaml
required_fields:
  - original_user_request
  - normalized_request
  - travel_party
  - missing_information
  - ambiguity_notes
  - assumptions
```

`origin`, `target_area`, `duration` gibi alanlar kullanıcı tarafından verilmediyse `unknown` veya `not_provided` olarak taşınmalıdır; tamamen yok edilmemelidir.

## Field definitions

### original_user_request

Kullanıcının serbest metin isteği korunur.

```yaml
field: original_user_request
type: text
required: true
redaction_allowed: only_for_sensitive_data
```

Bu alan agent reasoning için değil, trace ve açıklanabilirlik için tutulur.

### normalized_request

Kullanıcı isteğinin kısa, yapılandırılmış özeti.

```yaml
field: normalized_request
type: text
required: true
```

Örnek:

```text
Kocaeli çıkışlı, 2 yetişkin ve 2 çocuklu aile için 3 günlük, düşük yorgunluklu, alternatifli tatil planı isteniyor.
```

### travel_party

Seyahat edecek kişi bilgisi.

```yaml
travel_party:
  adults:
    count: required_if_known
  children:
    count: required_if_known
    ages: required_if_known
  special_needs:
    value: optional
    confidence: required_when_present
```

Çocuk yaşları biliniyorsa ayrı ayrı taşınır.

```yaml
children:
  - age: 6
  - age: 2
```

### origin

Çıkış noktası.

```yaml
origin:
  label: required_if_known
  type: city | district | exact_location | unknown
  confidence: required
```

Örnek:

```yaml
origin:
  label: Kocaeli
  type: city
  confidence: high
```

### target_area

Hedef il, bölge veya destinasyon.

```yaml
target_area:
  label: required_if_known
  type: city | region | open_choice | unknown
  radius_km: optional
  allow_nearby_regions: optional
  confidence: required
```

Kullanıcı sadece il verdiyse hedef tipi `city` olur. Kullanıcı "çevresini de değerlendir" dediyse `allow_nearby_regions: true` taşınır.

### duration

Tatil süresi.

```yaml
duration:
  days: required_if_known
  nights: optional
  confidence: required
```

### date_window

Tarih bilgisi veya esneklik.

```yaml
date_window:
  exact_dates: optional
  flexible_window: optional
  weekday_preference: optional
  season_hint: optional
  confidence: required_when_present
```

Belirsiz tarih, doğrulanmış tarih gibi davranmaz.

### transport_mode

Ulaşım biçimi.

```yaml
transport_mode:
  mode: own_car | public_transport | flight | mixed | unknown
  confidence: required
```

### budget

Bütçe bilgisi.

```yaml
budget:
  amount: optional
  currency: optional
  scope: total_trip | per_day | accommodation_only | unknown
  flexibility: strict | flexible | unknown
  confidence: required_when_present
```

### accommodation_expectations

Konaklama tercihleri.

```yaml
accommodation_expectations:
  required: optional
  types: optional
  pool_required: optional
  thermal_spa_preferred: optional
  family_room_preferred: optional
  parking_preferred: optional
  midday_rest_support_needed: optional
```

### activity_preferences

Aktivite tercihleri.

```yaml
activity_preferences:
  sea: optional
  zoo: optional
  museum: optional
  nature: optional
  thermal_spa: optional
  playground: optional
  indoor_backup: optional
  low_fatigue: optional
```

### privacy_preferences

Mahremiyet ve kadınlar plajı gibi hassas tercihler.

```yaml
privacy_preferences:
  women_only_beach_required_when_sea_recommended:
    value: optional
    sensitivity: sensitive_preference
    persistence_allowed_without_user_approval: false
  conservative_family_environment_preferred:
    value: optional
    sensitivity: sensitive_preference
    persistence_allowed_without_user_approval: false
```

Bu alanlar kullanıcı onayı olmadan canonical memory'ye yazılamaz.

### family_constraints

Aile seyahati açısından kısıt adayları.

```yaml
family_constraints:
  toddler_friendly_required: optional
  low_fatigue_required: optional
  midday_rest_required: optional
  stroller_friendly_preferred: optional
  short_walk_preferred: optional
  toilet_access_important: optional
```

### logistics_preferences

Rota ve operasyon kolaylığı beklentileri.

```yaml
logistics_preferences:
  parking_considered: optional
  traffic_considered: optional
  max_radius_km: optional
  far_option_requires_strong_justification: optional
```

### hard_constraint_candidates

Trip Intake Agent kesin karar vermez; hard constraint adayı taşır.

```yaml
hard_constraint_candidates:
  - id: string
    label: string
    source_text: string
    confidence: low | medium | high
    requires_policy_agent_confirmation: true
```

Örnek:

```yaml
- id: women_only_beach_required_when_sea_recommended
  label: Deniz önerisi yapılırsa kadınlar plajı mutlaka olmalı
  source_text: "eğer deniz önerisi verilecekse kadınlar plajı mutlaka olmalı"
  confidence: high
  requires_policy_agent_confirmation: true
```

### soft_preference_candidates

```yaml
soft_preference_candidates:
  - id: string
    label: string
    source_text: string
    confidence: low | medium | high
```

### missing_information

Eksik bilgiler explicit taşınır.

```yaml
missing_information:
  - field: string
    importance: low | medium | high | blocking
    reason: string
    suggested_clarification_question: optional
```

Örnek:

```yaml
- field: date_window
  importance: medium
  reason: Tarih verilmezse hava durumu ve çalışma saati doğrulaması yapılamaz.
```

### ambiguity_notes

Yorumlanabilecek veya belirsiz kalan ifadeler.

```yaml
ambiguity_notes:
  - note: string
    affected_fields: list
    confidence: low | medium | high
```

### assumptions

Agent tarafından yapılan varsayımlar.

```yaml
assumptions:
  - id: string
    statement: string
    risk_level: low | medium | high
    must_be_shown_to_user: boolean
```

## Forbidden fields

Travel Request Contract aşağıdaki alanları taşıyamaz:

```yaml
forbidden_fields:
  - final_itinerary
  - ranked_destinations
  - verified_prices
  - verified_weather
  - booking_links
  - hotel_recommendation_final
  - activity_recommendation_final
  - hidden_user_profile
  - canonical_memory_write
  - provider_response_raw
  - internal_chain_of_thought
```

## Evidence requirements

Bu contract çoğunlukla kullanıcı beyanına dayanır.

```yaml
evidence_requirements:
  user_statement_evidence: required
  external_source_evidence: not_required
  claim_evidence_marker: required_for_user_claims
```

Her kullanıcı beyanı kaynak türü olarak `user_statement` ile işaretlenir.

## Confidence rules

```yaml
confidence_rules:
  explicit_user_statement: high
  inferred_from_context: medium
  weak_inference: low
  missing_information: none
```

Trip Intake Agent düşük güvenli çıkarımı hard constraint gibi taşıyamaz.

## Validation rules

```yaml
validation_rules:
  original_user_request_present: required
  normalized_request_present: required
  travel_party_present: required
  missing_information_present: required
  assumptions_present: required
  no_final_plan_fields: required
  no_live_data_claims: required
  no_memory_write_fields: required
```

## Failure modes

```yaml
failure_modes:
  - missing_required_core_request
  - contradictory_user_request
  - unsafe_or_unfulfillable_request
  - unsupported_scope
  - too_ambiguous_for_downstream_agents
```

## Clarification states

```yaml
clarification_states:
  none_needed: Devam edilebilir.
  useful_but_not_blocking: Daha iyi plan için sorulabilir.
  blocking: Contract downstream agent'lara gönderilmeden önce kullanıcıdan bilgi alınmalı.
```

## Example payload sketch

Bu örnek schema code değildir.

```yaml
envelope:
  contract_id: travel_request_contract
  contract_version: v1
  producer_agent: trip_intake_agent
  trace_id: TM-TRACE-EXAMPLE-001
  created_at: 2026-08-07T11:23:00+03:00
  source_language: tr
  validation_status: valid_with_missing_non_blocking_info
  confidence: high
payload:
  original_user_request: "Kocaeli'den 3 günlük, 2 yetişkin 2 çocuk için Balıkesir tatili planlamak istiyorum."
  normalized_request: "Kocaeli çıkışlı çocuklu aile için 3 günlük Balıkesir odaklı tatil isteği."
  travel_party:
    adults:
      count: 2
    children:
      count: 2
      ages:
        - 6
        - 2
  origin:
    label: Kocaeli
    type: city
    confidence: high
  target_area:
    label: Balıkesir
    type: city
    allow_nearby_regions: true
    confidence: high
  duration:
    days: 3
    confidence: high
  transport_mode:
    mode: own_car
    confidence: high
  budget:
    amount: 30000
    currency: TRY
    scope: total_trip
    flexibility: flexible
    confidence: high
  privacy_preferences:
    women_only_beach_required_when_sea_recommended:
      value: true
      sensitivity: sensitive_preference
      persistence_allowed_without_user_approval: false
  logistics_preferences:
    parking_considered: true
    traffic_considered: true
    max_radius_km: 150
    far_option_requires_strong_justification: true
  hard_constraint_candidates:
    - id: women_only_beach_required_when_sea_recommended
      label: Deniz önerisi yapılırsa kadınlar plajı olmalı
      source_text: "eğer deniz önerisi verilecekse kadınlar plajı mutlaka olmalı"
      confidence: high
      requires_policy_agent_confirmation: true
  missing_information:
    - field: date_window
      importance: medium
      reason: Tarih verilmezse hava durumu ve çalışma saati doğrulaması yapılamaz.
  ambiguity_notes: []
  assumptions:
    - id: own_car_from_user_context
      statement: Kullanıcının kendi aracıyla seyahat edeceği varsayılmıştır.
      risk_level: low
      must_be_shown_to_user: true
```

## Fixture requirements

Bu contract için fixture seti şunları içermelidir:

```yaml
fixtures_required:
  - complete_family_trip_request
  - missing_date_window
  - missing_target_area
  - contradictory_budget_and_scope
  - sea_requested_without_privacy_preference
  - women_only_beach_required_when_sea_recommended
  - open_destination_with_radius
```

## Backward compatibility notes

```yaml
versioning:
  current_version: v1
  breaking_change_requires_new_version: true
  additive_optional_fields_allowed: true
  required_field_removal_forbidden: true
```

## Open design questions

```yaml
open_questions:
  - Travel party içindeki özel ihtiyaçlar hangi hassasiyet sınıfına girmeli?
  - Tarih bilgisi hiç yoksa verification agent hangi seviyede uyarı üretmeli?
  - Kullanıcı geçmişinden gelen tercihler payload'a mı disclosure package olarak ayrı mı taşınmalı?
```

## Current status

```yaml
contract_state: drafted
next_contract: constraint-policy-contract.md
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
```
