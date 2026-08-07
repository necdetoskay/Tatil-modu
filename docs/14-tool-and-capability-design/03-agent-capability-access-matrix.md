# 03 — Agent Capability Access Matrix

**Doküman türü:** canonical capability access matrix  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Adapter entegrasyonu:** kapalı

## Purpose

Bu dosya, Tatil Modu agent'larının hangi capability'lere hangi seviyede erişebileceğini tasarım seviyesinde tanımlar.

Bu dosya gerçek tool çağrısı, adapter kodu, provider entegrasyonu veya runtime authorization implementation değildir.

## Ana karar

```yaml
access_matrix_state: drafted
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/03-agent-capability-access-matrix.md
related_inputs:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/14-tool-and-capability-design/02-capability-taxonomy.md
```

## Erişim seviyeleri

```yaml
access_levels:
  none:
    meaning: "Agent capability kullanamaz ve capability sonucu talep edemez."
  indirect:
    meaning: "Agent capability sonucunu yalnız orchestrator veya verification agent çıktısı üzerinden görebilir."
  request_verification:
    meaning: "Agent doğrulama ihtiyacını işaretler; tool çağrısını kendisi yapmaz."
  direct_design_access:
    meaning: "Agent bu capability ailesine tasarım olarak erişebilir; gerçek runtime çağrı yine bu aşamada yoktur."
  verification_owner:
    meaning: "Capability sonucunu evidence envelope'a çevirme sorumluluğu bu agent'tadır."
```

## Genel kurallar

1. Trip Intake Agent live capability kullanmaz.
2. Constraint Policy Agent live capability kullanmaz.
3. Final Response Composer live capability kullanmaz.
4. Verification Evidence Agent, capability sonuçlarını evidence envelope'a dönüştüren merkezi doğrulama agent'ıdır.
5. Domain agent'lar çoğunlukla verification need üretir; doğrudan provider bilmez.
6. Capability erişimi provider adıyla değil capability kimliğiyle tanımlanır.
7. Booking, ödeme, rezervasyon, kullanıcı adına işlem yapma veya hesap erişimi hiçbir agent'a verilmez.
8. Capability başarısız olursa agent uydurma bilgi üretmez; evidence gap veya fallback üretir.

## Agent capability matrix

| Agent | Access level | Allowed capability families | Forbidden behavior |
|---|---|---|---|
| Trip Intake Agent | none | Yok | Kullanıcı isteğini doğrulanmış gerçek gibi zenginleştirmek |
| Constraint Policy Agent | none | Yok | Düşük güvenli çıkarımı hard constraint yapmak |
| Family Suitability Agent | indirect | family safety signal, weather sensitivity indicators | Live fiyat/saat/rota iddiası üretmek |
| Destination Candidate Agent | request_verification | maps distance band, official source lookup, privacy verification need | 150 km dışı adayı istisna gerekçesiz kesin önermek |
| Route Logistics Agent | direct_design_access | maps_distance_and_route, traffic_estimation, parking_information, rest_stop_discovery | Exact drive time veya traffic sonucunu evidence olmadan kesin sunmak |
| Accommodation Fit Agent | direct_design_access | accommodation_search, accommodation_availability, accommodation_facility_verification, cost_estimation | Müsaitlik veya fiyatı evidence olmadan kesinleştirmek |
| Activity Fit Agent | direct_design_access | place_opening_hours, place_price_information, place_age_restriction, weather_forecast, women_only_beach_verification | Açılış saati, fiyat, weather veya privacy bilgisini kesin gerçek gibi taşımak |
| Day Plan Composer Agent | indirect | verified route/activity/accommodation summaries | Doğrudan provider sonucu çağırmak veya doğrulanmamış iddiayı plan bloğuna kesin yazmak |
| Verification Evidence Agent | verification_owner | all verification capabilities | Evidence status, freshness veya confidence üretmeden claim geçirmek |
| Final Response Composer Agent | none | Yalnız orchestrator tarafından verilen verified/evidence-aware data | Tool çağırmak, kaynak uydurmak, doğrulanmamış claim'i kesin bilgi gibi sunmak |

## Capability family access by agent

```yaml
agent_capability_access:
  trip_intake_agent:
    route_and_mobility: none
    place_information: none
    weather_and_seasonality: none
    accommodation: none
    privacy_and_family_safety: none
    official_and_trust_sources: none
    review_and_experience_signals: none
    budget_and_cost: none

  constraint_policy_agent:
    route_and_mobility: none
    place_information: none
    weather_and_seasonality: none
    accommodation: none
    privacy_and_family_safety: none
    official_and_trust_sources: none
    review_and_experience_signals: none
    budget_and_cost: none

  family_suitability_agent:
    route_and_mobility: indirect
    place_information: indirect
    weather_and_seasonality: indirect
    accommodation: indirect
    privacy_and_family_safety: indirect
    official_and_trust_sources: none
    review_and_experience_signals: indirect
    budget_and_cost: none

  destination_candidate_agent:
    route_and_mobility: request_verification
    place_information: request_verification
    weather_and_seasonality: none
    accommodation: none
    privacy_and_family_safety: request_verification
    official_and_trust_sources: request_verification
    review_and_experience_signals: indirect
    budget_and_cost: none

  route_logistics_agent:
    route_and_mobility: direct_design_access
    place_information: request_verification
    weather_and_seasonality: indirect
    accommodation: none
    privacy_and_family_safety: none
    official_and_trust_sources: request_verification
    review_and_experience_signals: indirect
    budget_and_cost: none

  accommodation_fit_agent:
    route_and_mobility: indirect
    place_information: request_verification
    weather_and_seasonality: none
    accommodation: direct_design_access
    privacy_and_family_safety: request_verification
    official_and_trust_sources: request_verification
    review_and_experience_signals: indirect
    budget_and_cost: direct_design_access

  activity_fit_agent:
    route_and_mobility: indirect
    place_information: direct_design_access
    weather_and_seasonality: direct_design_access
    accommodation: none
    privacy_and_family_safety: direct_design_access
    official_and_trust_sources: request_verification
    review_and_experience_signals: indirect
    budget_and_cost: request_verification

  day_plan_composer_agent:
    route_and_mobility: indirect
    place_information: indirect
    weather_and_seasonality: indirect
    accommodation: indirect
    privacy_and_family_safety: indirect
    official_and_trust_sources: indirect
    review_and_experience_signals: indirect
    budget_and_cost: indirect

  verification_evidence_agent:
    route_and_mobility: verification_owner
    place_information: verification_owner
    weather_and_seasonality: verification_owner
    accommodation: verification_owner
    privacy_and_family_safety: verification_owner
    official_and_trust_sources: verification_owner
    review_and_experience_signals: verification_owner
    budget_and_cost: verification_owner

  final_response_composer_agent:
    route_and_mobility: none
    place_information: none
    weather_and_seasonality: none
    accommodation: none
    privacy_and_family_safety: none
    official_and_trust_sources: none
    review_and_experience_signals: none
    budget_and_cost: none
```

## Final Response Composer özel kuralı

Final Response Composer hiçbir zaman live capability çağırmaz.

```yaml
final_response_composer_rules:
  may_call_tool: false
  may_invent_source: false
  may_convert_unverified_claim_to_fact: false
  may_hide_hard_blocker: false
  may_use_verified_summary_from_orchestrator: true
  must_show_user_visible_disclosure: true
```

## Verification Evidence Agent özel kuralı

Verification Evidence Agent capability sonucunu doğrudan plan önerisine dönüştürmez.

```yaml
verification_evidence_agent_rules:
  output_type: evidence_envelope_or_error_envelope
  may_rank_destinations: false
  may_compose_day_plan: false
  may_write_final_answer: false
  must_emit_evidence_status: true
  must_emit_verification_status: true
  must_emit_confidence: true
  must_emit_freshness_when_time_sensitive: true
```

## Minimum access principle

Capability erişimi en geniş agent'a değil, en gerekli agent'a verilir.

```text
Aynı bilgi dolaylı aktarım ile güvenli taşınabiliyorsa doğrudan capability access verilmez.
```

## Current status

```yaml
agent_capability_access_matrix_state: drafted
next_artifact: 04-verification-capability-policy.md
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
