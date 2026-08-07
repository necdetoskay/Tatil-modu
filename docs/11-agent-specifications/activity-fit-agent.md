# Activity Fit Agent Specification

**Doküman türü:** canonical agent specification  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Activity Fit Agent, aday aktivite seçeneklerini çocuklu aile seyahati açısından değerlendirir.

Bu agent deniz, hayvanat bahçesi, müze, doğa, kaplıca, oyun alanı, tekne, yürüyüş, alışveriş, şehir merkezi ve benzeri aktivite adaylarını aşağıdaki açılardan sınıflandırır:

- çocuk yaşı uygunluğu,
- yorgunluk riski,
- günlük tempo uyumu,
- öğle dinlenmesi uyumu,
- mahremiyet / kadınlar plajı ihtiyacı,
- hava durumu hassasiyeti,
- park ve erişim riski,
- kanıt ve doğrulama ihtiyacı.

Bu agent nihai günlük plan üretmez.

Bu agent yalnızca aktivite adaylarının aileye uygunluk değerlendirmesini üretir.

## Non-goals

Activity Fit Agent şunları yapmaz:

- canlı veri çekmez,
- harita veya hava durumu provider çağırmaz,
- fiyat veya çalışma saati doğrulamaz,
- nihai kullanıcı cevabı üretmez,
- konaklama seçmez,
- rota planlamaz,
- gün bloklarını oluşturmaz,
- canonical memory'ye yazmaz,
- başka agent çağırmaz,
- provider ismi seçmez.

## Inputs

Beklenen girdiler:

```yaml
inputs:
  normalized_travel_request: TravelRequestNormalized
  constraint_policy_result: ConstraintPolicyResult
  family_suitability_profile: FamilySuitabilityProfile
  destination_candidates: DestinationCandidateSet
  route_logistics_summary: RouteLogisticsSummary
  activity_candidates:
    - activity_id: string
      name: string
      type: sea | beach | zoo | museum | nature | thermal | playground | shopping | city_walk | boat | other
      location_hint: string
      source_hint: optional
      estimated_duration_band: short | medium | long | unknown
      indoor_outdoor: indoor | outdoor | mixed | unknown
      walking_burden_hint: low | medium | high | unknown
      child_age_hint: toddler | child | family | unknown
      privacy_relevance: none | possible | required | unknown
      evidence_status: verified | needs_verification | unknown
```

## Outputs

Beklenen çıktı:

```yaml
outputs:
  activity_fit_result:
    activity_id: string
    activity_type: string
    family_fit_band: excellent | good | conditional | weak | reject
    toddler_fit: good | conditional | weak | unknown
    child_fit: good | conditional | weak | unknown
    fatigue_risk: low | medium | high | unknown
    weather_sensitivity: low | medium | high | unknown
    parking_or_access_risk: low | medium | high | unknown
    privacy_requirement_status: not_relevant | must_verify | likely_required | unknown
    suggested_day_part: morning | afternoon | evening | flexible | avoid
    needs_midday_rest_guard: boolean
    evidence_requirements:
      - operational_hours
      - price
      - parking
      - weather
      - privacy_or_women_only_beach
      - public_authority_rule
    rejection_reasons:
      - string
    warnings:
      - string
    confidence: low | medium | high
```

## Required context

Bu agent şu bağlamlara ihtiyaç duyar:

- çocuk yaşları,
- aile tempo tercihi,
- mahremiyet hassasiyeti,
- deniz önerisi varsa kadınlar plajı şartı,
- rota yorgunluğu özeti,
- aday destinasyon sınıfı,
- aktivite tipi,
- önerilen süre bandı,
- indoor/outdoor bilgisi,
- evidence ihtiyacı.

## Forbidden context

Bu agent'a verilmemesi gereken bağlam:

- kullanıcının gereksiz kişisel geçmişi,
- provider API anahtarı,
- canlı provider response detayları,
- ödeme veya rezervasyon bilgisi,
- canonical memory yazma yetkisi,
- final response template'i,
- başka agentların private reasoning içeriği.

## Dependencies

Bu agent aşağıdaki tasarım çıktılarına bağımlıdır:

```yaml
depends_on:
  - trip-intake-agent.md
  - constraint-policy-agent.md
  - family-suitability-agent.md
  - destination-candidate-agent.md
  - route-logistics-agent.md
```

Bu agent, Accommodation Fit Agent'a doğrudan bağımlı değildir.

Aktivite ve konaklama değerlendirmeleri daha sonra Day Plan Composer Agent tarafından birlikte ele alınır.

## Handoff rules

Activity Fit Agent çıktısı şu agentlara kullanılabilir veri sağlar:

```yaml
handoff_to:
  - day-plan-composer-agent.md
  - verification-evidence-agent.md
  - final-response-composer-agent.md
```

Bu handoff doğrudan agent çağrısı değildir.

Tüm akış Travel Orchestrator üzerinden yönetilir.

## Hard constraints

Aşağıdaki durumlar hard constraint veya reject adayıdır:

```yaml
hard_constraints:
  sea_activity_without_women_only_beach_when_required: reject_or_requires_clarification
  high_fatigue_for_toddler: reject_or_conditional
  midday_rest_impossible_with_young_child: reject_or_requires_replan
  unsafe_or_age_inappropriate_activity: reject
  outdoor_activity_in_weather_sensitive_context_without_verification: conditional
  no_parking_or_access_for_family_car_when_critical: conditional_or_reject
```

Bu agent hard constraint ihlalini skorla telafi edemez.

## Evidence requirements

Activity Fit Agent kanıt üretmez; kanıt ihtiyacını işaretler.

Özellikle şu alanlarda verification gerekir:

- çalışma saatleri,
- fiyat,
- yaş uygunluğu,
- otopark ve erişim,
- hava durumu,
- kadınlar plajı / mahremiyet statüsü,
- kamu kuralı veya işletme kuralı,
- sezonluk kapalılık.

```yaml
evidence_required_when:
  activity_type_is_sea_or_beach: true
  activity_is_weather_sensitive: true
  activity_has_age_or_safety_risk: true
  activity_requires_ticket_or_reservation: true
  activity_impacts_daily_schedule: true
```

## Confidence rules

Confidence şu şekilde yorumlanır:

```yaml
confidence:
  high: "Aktivite tipi, aile profili ve constraint eşleşmesi net; yine de canlı doğrulama gerekebilir."
  medium: "Genel uygunluk makul; bazı saat/fiyat/park/hava bilgileri doğrulanmalı."
  low: "Aileye uygunluk veya constraint etkisi belirsiz; verification veya clarification gerekir."
```

High confidence, canlı çalışma saati veya fiyat bilgisinin doğrulandığı anlamına gelmez.

## Failure modes

Olası failure mode'lar:

```yaml
failure_modes:
  missing_child_ages: clarification_required
  unknown_activity_type: classify_as_unknown_and_lower_confidence
  sea_activity_privacy_unclear: verification_required
  walking_burden_unknown: conditional
  weather_sensitivity_unknown: conditional
  activity_duration_unknown: schedule_risk
```

## Clarification triggers

Şu durumlarda kullanıcıdan açıklama gerekebilir:

- deniz önerisi isteniyor ama kadınlar plajı şartının seviyesi belirsizse,
- aktivite temposu tercihi belirsizse,
- çocuklardan biri için sağlık/özel ihtiyaç belirtilmiş ama detay yoksa,
- kullanıcı kapalı alan mı açık alan mı tercih ediyor bilinmiyorsa,
- yoğun yürüyüş veya doğa rotası istenip bebek arabası ihtiyacı bilinmiyorsa.

## Fixture requirements

Bu agent için minimum fixture seti:

```yaml
fixtures:
  - id: TM-ACTIVITY-001
    name: "2 ve 6 yaş çocukla hayvanat bahçesi sabah aktivitesi"
    expected: good_or_excellent
  - id: TM-ACTIVITY-002
    name: "Kadınlar plajı şartı varken sıradan halk plajı önerisi"
    expected: reject_or_requires_verification
  - id: TM-ACTIVITY-003
    name: "Öğle dinlenmesini bozan uzun doğa yürüyüşü"
    expected: conditional_or_reject
  - id: TM-ACTIVITY-004
    name: "Yağmurlu günde açık alan ağırlıklı aktivite"
    expected: weather_sensitive_conditional
```

## Evaluation rubric

Başarı kriterleri:

- Aktiviteyi plan üretmeden sınıflandırmalı.
- 2 yaş ve 6 yaş uygunluğunu ayrı değerlendirmeli.
- Kadınlar plajı şartını deniz aktivitelerinde görünür yapmalı.
- Hava, park, çalışma saati ve fiyat doğrulama ihtiyacını işaretlemeli.
- Hard constraint ihlalini skorla telafi etmemeli.
- Final kullanıcı cevabı üretmemeli.

## Example contract sketch

```yaml
activity_fit_result:
  activity_id: "act_bursa_zoo"
  activity_type: zoo
  family_fit_band: excellent
  toddler_fit: good
  child_fit: good
  fatigue_risk: medium
  weather_sensitivity: medium
  parking_or_access_risk: medium
  privacy_requirement_status: not_relevant
  suggested_day_part: morning
  needs_midday_rest_guard: true
  evidence_requirements:
    - operational_hours
    - price
    - parking
  warnings:
    - "Öğleden sonraya sarkarsa çocuk yorgunluğu artabilir."
  confidence: medium
```

## Open design questions

- Aktivite uygunluk bandı skorla mı, kural tabanlı band ile mi tutulmalı?
- Hava durumu hassasiyeti ayrı schema mı olacak?
- Kadınlar plajı için özel privacy suitability schema ayrıca yazılmalı mı?
- Aktivite süresi kesin bilinmediğinde Day Plan Composer nasıl davranmalı?
- Aktivite ve rota yorgunluğu aynı fixture içinde mi test edilmeli?

## Current status

```yaml
agent_id: activity_fit_agent
spec_status: drafted
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
next_agent_spec: day-plan-composer-agent.md
```
