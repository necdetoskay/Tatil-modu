# Day Plan Composer Agent Specification

**Doküman türü:** canonical agent specification  
**Agent:** Day Plan Composer Agent  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Day Plan Composer Agent, doğrulanmış veya doğrulama bekleyen aday destinasyon, aktivite, konaklama ve lojistik değerlendirmelerini kullanarak gün bazlı plan iskeleti oluşturur.

Bu agent'ın görevi nihai kullanıcı cevabı yazmak değildir.

Bu agent'ın görevi şudur:

```text
Her gün için sabah / öğle / öğleden sonra / akşam bloklarını, aile temposu ve kısıtlar ile uyumlu şekilde düzenlemek.
```

## 2. Non-goals

Bu agent şunları yapmaz:

- canlı veri çekmez,
- provider çağırmaz,
- fiyat veya müsaitlik doğrulamaz,
- otel rezervasyonu yapmaz,
- nihai kullanıcı cevabını yazmaz,
- kaynak güveni doğrulamaz,
- yeni destinasyon keşfetmez,
- yeni aktivite adayı üretmez,
- canonical memory yazmaz,
- hard constraint sınıflandırması yapmaz.

## 3. Inputs

Beklenen input paketleri:

```yaml
input_contracts:
  - structured_trip_request
  - classified_constraints
  - family_suitability_assessments
  - destination_candidate_assessments
  - route_logistics_assessments
  - accommodation_fit_assessments
  - activity_fit_assessments
```

## 4. Outputs

Bu agent aşağıdaki output'u üretir:

```yaml
output_contract: day_plan_composition_result
fields:
  plan_days:
    - day_index
    - day_theme
    - base_region
    - morning_block
    - lunch_rest_block
    - afternoon_block
    - evening_block
    - alternatives
    - fatigue_notes
    - constraint_notes
    - verification_needs
  rejected_combinations
  unresolved_questions
  confidence
```

## 5. Required context

Gerekli context:

```yaml
required_context:
  family_profile:
    children_ages: required
    toddler_present: required
    midday_rest_preference: required
  trip_shape:
    duration_days: required
    origin: required
    target_region_or_candidates: required
  constraints:
    hard_constraints: required
    soft_preferences: required
  assessed_candidates:
    destinations: required
    activities: required
    accommodation: optional
    logistics: required
```

## 6. Forbidden context

Bu agent'a verilmemesi gereken bilgiler:

```yaml
forbidden_context:
  provider_api_keys: forbidden
  raw_private_memory: forbidden
  payment_details: forbidden
  booking_credentials: forbidden
  unrelated_user_history: forbidden
  non_disclosed_sensitive_preferences: forbidden
```

## 7. Dependencies

Bu agent doğrudan başka agent çağırmaz.

Orchestrator tarafından hazırlanmış değerlendirme paketlerini alır.

```yaml
calls_other_agents: false
receives_orchestrator_packages: true
```

## 8. Handoff rules

Bu agent output'u sonraki agentlara şu şekilde devredilir:

```yaml
handoff_to:
  - verification_evidence_agent
  - final_response_composer_agent
handoff_payload:
  - draft_day_plan
  - alternatives
  - verification_needs
  - fatigue_notes
  - unresolved_questions
```

## 9. Hard constraints

Bu agent hard constraint ihlalini telafi edemez.

Örnek hard constraints:

```yaml
hard_constraints:
  women_only_beach_required_when_sea_recommended: must_respect
  toddler_rest_window: should_not_break_without_warning
  over_budget_without_user_approval: forbidden
  impossible_same_day_route: forbidden
  closed_or_unverified_critical_activity: requires_verification
```

## 10. Composition principles

Günlük plan şu prensiplerle oluşturulur:

```text
1. Güne ağır rota ile başlanmazsa çocuk yorgunluğu azalır.
2. Öğle saatlerinde dinlenme veya düşük yoğunluklu blok korunur.
3. Öğleden sonra daha hafif veya esnek aktivite tercih edilir.
4. Akşam planı çocuklu aile için kısa, yakın ve düşük riskli olmalıdır.
5. Her gün için 2-3 alternatif sunulmalıdır.
6. Alternatifler gerçek alternatif olmalı, aynı planın küçük varyasyonu olmamalıdır.
7. Belirsiz bilgi varsa plan içine uyarı olarak taşınmalıdır.
```

## 11. Day block model

Günlük blok modeli:

```yaml
day_block_model:
  morning_block:
    purpose: main_activity_or_route_start
    intensity: low_to_medium_preferred
  lunch_rest_block:
    purpose: food_and_child_rest
    intensity: low
    required_for_toddler: true
  afternoon_block:
    purpose: secondary_activity_or_pool_rest
    intensity: low_to_medium
  evening_block:
    purpose: light_walk_dinner_or_hotel_rest
    intensity: low
```

## 12. Alternatives model

Her gün için alternatifler şu şekilde sınıflandırılır:

```yaml
alternative_types:
  primary_plan: en_dengeli_plan
  bad_weather_alternative: hava_kötüyse
  low_fatigue_alternative: çocuklar_yorulursa
  privacy_sensitive_alternative: mahremiyet_öncelikliyse
  budget_sensitive_alternative: bütçe_baskısı_varsa
```

## 13. Evidence requirements

Bu agent doğrudan evidence doğrulamaz.

Fakat doğrulanması gereken noktaları işaretler:

```yaml
verification_needs:
  - business_hours
  - ticket_price
  - parking_availability
  - route_duration
  - weather_suitability
  - women_only_beach_status
  - accommodation_facility_status
```

## 14. Confidence rules

Confidence hesaplaması tasarım seviyesinde şu sinyallere bağlıdır:

```yaml
confidence_inputs:
  candidate_assessment_confidence: required
  logistics_confidence: required
  family_fit_confidence: required
  unresolved_verification_count: required
  hard_constraint_risk_count: required
```

Confidence seviyeleri:

```yaml
confidence_levels:
  high: hard_constraint_risk_low_and_verification_needs_minor
  medium: some_verification_needs_or_moderate_fatigue_risk
  low: many_unknowns_or_possible_hard_constraint_conflict
```

## 15. Failure modes

Beklenen failure mode'lar:

```yaml
failure_modes:
  no_valid_activity_for_day:
    action: return_unresolved_question_or_low_fatigue_fallback
  hard_constraint_conflict:
    action: block_plan_combination
  toddler_rest_impossible:
    action: flag_as_invalid_or_requires_user_approval
  too_many_unverified_items:
    action: mark_plan_as_low_confidence
  excessive_route_burden:
    action: reject_or_split_day
```

## 16. Clarification triggers

Kullanıcıdan netleştirme gerekebilecek durumlar:

```yaml
clarification_triggers:
  - duration_missing
  - origin_missing
  - children_ages_missing
  - budget_missing_for_paid_trip
  - privacy_requirement_ambiguous_for_sea_plan
  - accommodation_required_but_missing
  - date_sensitive_plan_without_date
```

## 17. Fixture requirements

Bu agent için fixture gereksinimleri:

```yaml
fixtures:
  - id: TM-DAYPLAN-001
    name: Kocaeli çıkışlı 3 gün çocuklu aile planı
    expects:
      - three_days
      - morning_lunch_afternoon_evening_blocks
      - two_or_three_alternatives_per_day
      - midday_rest_present
      - no_unverified_sea_privacy_claim
  - id: TM-DAYPLAN-002
    name: Yüksek rota yorgunluğu olan adayların elenmesi
    expects:
      - excessive_route_warning
      - low_fatigue_alternative
  - id: TM-DAYPLAN-003
    name: Hava belirsizliği olan açık alan aktivitesi
    expects:
      - bad_weather_alternative
      - verification_need
```

## 18. Evaluation rubric

Bu agent şu kriterlerle değerlendirilir:

```yaml
evaluation_rubric:
  block_structure_correctness: required
  hard_constraint_respect: required
  child_rest_preservation: required
  realistic_day_pacing: required
  alternatives_quality: required
  verification_need_visibility: required
  no_final_response_overreach: required
```

## 19. Example contract sketch

Örnek output taslağı:

```yaml
day_plan_composition_result:
  plan_days:
    - day_index: 1
      day_theme: "hafif başlangıç ve çocuk dostu aktivite"
      base_region: "Bursa"
      morning_block:
        candidate_id: "activity_zoo_bursa"
        intensity: medium
      lunch_rest_block:
        type: "hotel_or_nearby_rest"
        required: true
      afternoon_block:
        candidate_id: "low_fatigue_indoor_or_park_option"
        intensity: low
      evening_block:
        type: "short_dinner_near_accommodation"
        intensity: low
      alternatives:
        - type: bad_weather_alternative
        - type: low_fatigue_alternative
      verification_needs:
        - business_hours
        - parking_availability
  confidence: medium
```

## 20. Open design questions

Açık tasarım soruları:

```yaml
open_questions:
  - Günlük alternatif sayısı her zaman 2-3 mü olmalı, yoksa bazı günlerde 1 güçlü fallback yeterli mi?
  - Plan içinde öğle dinlenmesi zorunlu mu, yoksa çocuk yaşına göre ağırlıklandırılmış tercih mi?
  - Çok düşük confidence olan plan tamamen engellenmeli mi, yoksa kullanıcıya uyarılı taslak olarak gösterilmeli mi?
```

## 21. Status

```yaml
agent_specification_state: drafted
agent_id: day_plan_composer_agent
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
next_agent_spec: verification-evidence-agent.md
```
