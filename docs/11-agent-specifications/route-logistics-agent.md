# Route & Logistics Agent Specification

**Doküman türü:** canonical agent specification  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Route & Logistics Agent, aday destinasyon veya rota seçeneklerini çocuklu aile seyahati açısından lojistik olarak değerlendirir.

Bu agent'ın amacı, rota ve ulaşım yükünü görünür hale getirmektir:

- mesafe yükü,
- tahmini yol süresi kategorisi,
- çocuklu aile için yorgunluk riski,
- trafik riski,
- park riski,
- mola ihtiyacı,
- günü çok yorucu hale getirme riski,
- sabah/öğle/akşam bloklarına uygunluk.

Bu agent plan üretmez. Yalnızca rota/lojistik uygunluk değerlendirmesi üretir.

## 2. Non-goals

Route & Logistics Agent şunları yapmaz:

- final tatil planı yazmaz,
- kullanıcıya doğrudan cevap üretmez,
- canlı harita, trafik veya navigasyon provider'ı çağırmaz,
- araç rotası hesaplamaz,
- kesin süre garantisi vermez,
- konaklama seçmez,
- aktivite seçmez,
- bütçe hesaplamaz,
- canonical memory yazmaz,
- diğer agent'ları çağırmaz.

## 3. Inputs

Beklenen input kaynakları:

```yaml
input_sources:
  - normalized_travel_request
  - constraint_policy_result
  - family_suitability_result
  - destination_candidate_set
  - optional_route_context
```

Minimum input alanları:

```yaml
required_input_fields:
  origin:
    type: string
    example: Kocaeli
  destination_candidates:
    type: list
  travel_group:
    adults: number
    children:
      - age: number
  trip_duration_days:
    type: number_or_unknown
  transport_mode:
    type: enum
    values:
      - private_car
      - public_transport
      - unknown
  logistics_preferences:
    midday_rest_required: boolean_or_unknown
    low_fatigue_preferred: boolean_or_unknown
    max_radius_km: number_or_unknown
```

## 4. Outputs

Agent output'u rota/lojistik değerlendirmesidir:

```yaml
route_logistics_result:
  agent_id: route_logistics_agent
  status: completed | needs_clarification | blocked
  evaluated_routes:
    - candidate_id: string
      origin: string
      destination_label: string
      route_burden_level: low | medium | high | very_high | unknown
      estimated_distance_band: near | moderate | far | out_of_radius | unknown
      estimated_drive_time_band: short | moderate | long | very_long | unknown
      child_fatigue_risk: low | medium | high | unknown
      parking_risk: low | medium | high | unknown
      traffic_risk: low | medium | high | unknown
      rest_stop_need: none | optional | required | unknown
      day_block_fit:
        morning_departure: good | acceptable | risky | unknown
        afternoon_return: good | acceptable | risky | unknown
        same_day_round_trip: good | risky | not_recommended | unknown
      logistics_warnings:
        - code: string
          severity: info | warning | hard_block_candidate
          message: string
      confidence: high | medium | low
```

## 5. Required context

Bu agent'a verilmesi gereken context:

- çıkış noktası,
- aday destinasyonlar,
- çocuk yaşları,
- ulaşım modu,
- gün sayısı,
- radius kuralı,
- yorgunluk tercihi,
- öğle dinlenmesi gereksinimi,
- varsa daha önce belirlenmiş hard constraint sonuçları.

## 6. Forbidden context

Bu agent'a verilmemesi gereken context:

- gereksiz kişisel memory,
- ödeme bilgisi,
- kimlik bilgisi,
- provider API key,
- canlı booking bilgisi,
- kullanıcıya gösterilecek final metin taslağı,
- agent runtime implementation detayı.

## 7. Dependencies

Mantıksal bağımlılıklar:

```yaml
depends_on:
  - trip-intake-agent.md
  - constraint-policy-agent.md
  - family-suitability-agent.md
  - destination-candidate-agent.md
```

Ancak bu agent diğer agent'ları doğrudan çağırmaz. Travel Orchestrator tarafından sıralı olarak çalıştırılır.

## 8. Handoff rules

Route & Logistics Agent şu bilgileri sonraki agent'lara taşır:

```yaml
handoff_to:
  accommodation_fit_agent:
    - route_burden_level
    - arrival_day_risk
    - parking_risk
    - same_day_round_trip_fit
  activity_fit_agent:
    - child_fatigue_risk
    - day_block_fit
    - rest_stop_need
    - traffic_risk
  day_plan_composer_agent:
    - route_burden_level
    - recommended_departure_window
    - rest_requirements
    - logistics_warnings
```

## 9. Hard constraints

Bu agent hard constraint kararını tek başına vermez; fakat hard constraint adayı üretebilir.

Örnekler:

```yaml
hard_constraint_candidates:
  - code: route_too_far_for_day_trip_with_toddler
    condition: "2 yaş çocuk + uzun rota + günübirlik dönüş"
    recommendation: reject_or_require_overnight
  - code: midday_rest_impossible
    condition: "öğle dinlenmesi gerekli ama rota/süre bunu imkansız hale getiriyor"
    recommendation: require_plan_change
  - code: parking_risk_unacceptable
    condition: "yüksek park riski + küçük çocuk + yoğun sezon"
    recommendation: warn_or_reject_candidate
```

## 10. Evidence requirements

Bu agent canlı veri çağırmaz; ancak hangi evidence gerektiğini işaretler.

Gerekli evidence türleri:

```yaml
evidence_requirements:
  route_distance:
    required_for: distance_band
    source_type: map_or_route_provider
  estimated_drive_time:
    required_for: drive_time_band
    source_type: map_or_route_provider
  traffic_risk:
    required_for: traffic_risk
    source_type: traffic_provider_or_historical_pattern
  parking_risk:
    required_for: parking_risk
    source_type: poi_parking_source_or_human_verified_note
```

Evidence yoksa output `confidence: low` olmalıdır.

## 11. Confidence rules

```yaml
confidence_rules:
  high:
    condition: "mesafe, süre, trafik ve park bilgisi güvenilir kaynakla desteklenmiş"
  medium:
    condition: "mesafe/süre yaklaşık, park veya trafik bilgisi kısmi"
  low:
    condition: "rota değerlendirmesi varsayıma dayanıyor veya canlı veri yok"
```

Route & Logistics Agent kesin navigasyon sonucu gibi konuşamaz.

## 12. Failure modes

```yaml
failure_modes:
  missing_origin:
    result: needs_clarification
  missing_destination_candidate:
    result: blocked
  unknown_transport_mode:
    result: needs_clarification
  missing_child_age:
    result: needs_clarification
  insufficient_route_evidence:
    result: completed_with_low_confidence
```

## 13. Clarification triggers

Kullanıcıdan clarification gerekebilir:

- çıkış noktası bilinmiyorsa,
- araç var mı bilinmiyorsa,
- günübirlik mi konaklamalı mı bilinmiyorsa,
- çocuk yaşları eksikse,
- maksimum yol süresi tercihi çok önemli ama bilinmiyorsa,
- öğle dinlenmesi zorunlu mu bilinmiyorsa.

## 14. Fixture requirements

Bu agent için fixture setleri:

```yaml
fixtures:
  - id: TM-ROUTE-001
    name: Kocaeli çıkışlı Bursa günübirlik rota
    expected: medium_route_burden
  - id: TM-ROUTE-002
    name: Kocaeli çıkışlı Balıkesir 3 günlük rota
    expected: high_but_acceptable_with_overnight
  - id: TM-ROUTE-003
    name: 2 yaş çocukla çok uzak günübirlik rota
    expected: hard_constraint_candidate
  - id: TM-ROUTE-004
    name: Kadınlar plajı var ama park/trafik riski yüksek rota
    expected: warning_required
```

## 15. Evaluation rubric

Başarılı output şu kriterleri karşılamalıdır:

- rota yükünü görünür hale getirir,
- çocuk yorgunluğu riskini açıkça taşır,
- park ve trafik riskini ayrı ayrı işler,
- öğle dinlenmesi ile rota uyumunu değerlendirir,
- uzak ama değerli adayları koşullu tutar,
- canlı veri yoksa düşük confidence verir,
- plan üretmez,
- final cevap yazmaz.

## 16. Example contract sketch

```yaml
agent_id: route_logistics_agent
input_contract: route_logistics_request_v1
output_contract: route_logistics_result_v1
requires_evidence: true
may_emit_hard_constraint_candidates: true
may_emit_clarification_questions: true
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
```

## 17. Open design questions

Açık sorular:

1. Yol yorgunluğu skoru sayısal mı kategorik mi olacak?
2. 2 yaş çocuk için maksimum önerilen tek yön yol süresi nasıl tanımlanacak?
3. Park riski canlı veri olmadan ne kadar güvenle tahmin edilebilir?
4. Tatil planında uzun yol ilk gün mü son gün mü daha kabul edilebilir?
5. Trafik riski hafta içi/hafta sonu ayrımı hangi contract alanında taşınacak?

## Final decision

```yaml
agent_id: route_logistics_agent
spec_status: drafted
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
next_agent_spec: accommodation-fit-agent.md
```
