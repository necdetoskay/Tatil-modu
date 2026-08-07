# Verification & Evidence Agent Specification

**Doküman türü:** canonical agent specification  
**Agent:** Verification & Evidence Agent  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Verification & Evidence Agent, plan içinde kullanılan aday, öneri, tesis, aktivite, rota ve uyarıların hangi doğrulama/evidence ihtiyaçlarına sahip olduğunu belirler.

Bu agent canlı veri çekmez.

Bu agent provider çağırmaz.

Bu agent yalnızca doğrulama sözleşmesini, evidence ihtiyaçlarını, güven seviyesini ve belirsizlik uyarılarını normalize eder.

```yaml
agent_id: verification_evidence_agent
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
```

## 2. Non-goals

Bu agent şunları yapmaz:

- Canlı web/API/tool çağrısı yapmaz.
- Otel, plaj, müze, restoran veya tesis aramaz.
- Fiyat, saat veya müsaitlik bilgisini kendisi doğrulamaz.
- Harita/rota/otopark provider'ına gitmez.
- Kullanıcıya nihai cevap yazmaz.
- Plan ranking yapmaz.
- Canonical memory yazmaz.
- Belirsizliği saklamaz.

## 3. Inputs

Beklenen girdiler:

```yaml
input_contract:
  normalized_trip_request: required
  classified_constraints: required
  destination_candidates: optional
  route_logistics_assessments: optional
  accommodation_fit_assessments: optional
  activity_fit_assessments: optional
  day_plan_draft: optional
  source_trust_policy: required
  capability_registry_reference: required
```

## 4. Outputs

Bu agent şu çıktıyı üretir:

```yaml
output_contract:
  verification_requirements:
    - item_id
    - item_type
    - required_checks
    - required_capabilities
    - source_trust_requirement
    - freshness_requirement
    - evidence_required_before_final
    - confidence_floor
    - unresolved_risks
  evidence_gap_report:
    - missing_operational_hours
    - missing_price_signal
    - missing_parking_signal
    - missing_weather_check
    - missing_privacy_verification
    - missing_public_authority_rule
    - missing_location_or_route_check
  confidence_summary:
    overall_confidence_band: low | medium | high
    hard_blockers_present: boolean
    user_visible_warnings_required: list
```

## 5. Required context

Bu agent için gerekli bağlam:

- Plan içinde kullanılan adayların listesi.
- Her adayın hangi iddia ile kullanıldığı.
- Kullanıcının hard constraint'leri.
- Özellikle deniz önerilerinde kadınlar plajı zorunluluğu.
- Tarih aralığı varsa freshness ihtiyacı.
- Budget varsa fiyat doğrulama ihtiyacı.
- Araçla gidilecekse rota/otopark doğrulama ihtiyacı.
- Çocuklu aile varsa yorgunluk, park, erişim, tesis uygunluğu belirsizlikleri.

## 6. Forbidden context

Bu agent'a verilmemesi gereken bağlam:

- Provider API key veya secret.
- Kullanıcının gereksiz kişisel bilgileri.
- Canonical memory'nin tamamı.
- Raw browser/session/cookie bilgisi.
- Tool implementation detayı.
- Kullanıcıya gösterilmeyecek hassas çıkarımlar.

## 7. Dependencies

Bu agent doğrudan başka agent çağırmaz.

Orchestrator tarafından şu çıktılarla beslenebilir:

```text
Trip Intake Agent output
Constraint & Policy Agent output
Destination Candidate Agent output
Route & Logistics Agent output
Accommodation Fit Agent output
Activity Fit Agent output
Day Plan Composer Agent output
```

## 8. Handoff rules

Bu agent'ın çıktısı şunlara aktarılabilir:

```text
Final Response Composer Agent
Evaluation fixture builder
Pre-code contract schema work
```

Handoff içinde evidence ihtiyacı açık olmalıdır.

Örnek:

```yaml
item_id: activity_001
item_type: beach
claim_used_in_plan: "deniz günü için uygun aday"
required_checks:
  - women_only_beach_verification
  - weather_forecast_lookup
  - parking_signal_lookup
  - public_authority_rule_lookup
confidence_floor: high
user_visible_warning_required: true
```

## 9. Hard constraints

Aşağıdaki durumlar hard blocker olarak işaretlenir:

```yaml
hard_blockers:
  - sea_activity_without_women_only_beach_verification_when_required
  - operating_hours_missing_for_time_bound_activity
  - price_missing_when_budget_is_hard_constraint
  - public_rule_missing_for_restricted_or_seasonal_place
  - route_burden_unverified_for_long_distance_candidate
  - weather_unchecked_for_weather_sensitive_activity
  - parking_unchecked_for_family_logistics_sensitive_candidate
```

## 10. Evidence requirements

Evidence gerektiren ana alanlar:

| Alan | Evidence ihtiyacı |
|---|---|
| Çalışma saati | Gün/saat/sezon uygunluğu |
| Fiyat | Bütçe etkisi ve yaklaşık maliyet |
| Otopark | Çocuklu aile erişimi ve pratiklik |
| Rota | Mesafe, trafik ve sürüş yükü |
| Hava | Deniz/açık alan uygunluğu |
| Kadınlar plajı | Mahremiyet hard constraint doğrulaması |
| Resmi kural | Yasak, sezon, bakım, kapanış, güvenlik |
| Tesis bilgisi | Havuz, kaplıca, aile odası, çocuk uygunluğu |

## 11. Confidence rules

Confidence band şu şekilde verilir:

```yaml
high:
  meaning: "Plan için kritik iddialar yeterli evidence ile desteklenmiş"
medium:
  meaning: "Bazı iddialar destekli ama kullanıcıya uyarı taşınmalı"
low:
  meaning: "Plan güvenle sunulamaz; clarification veya verification gerekir"
```

Hard constraint evidence yoksa confidence en fazla `low` olabilir.

## 12. Failure modes

Beklenen failure mode'lar:

```yaml
failure_modes:
  - missing_item_id
  - unclear_claim_used_in_plan
  - missing_required_capability_mapping
  - insufficient_source_trust_classification
  - stale_or_date_sensitive_information
  - privacy_sensitive_claim_without_disclosure_rule
  - hard_constraint_without_evidence
```

## 13. Clarification triggers

Kullanıcıdan clarification gerekebilecek durumlar:

- Bütçe hard constraint mi, sadece tercih mi belli değilse.
- Deniz önerisi istiyor ama kadınlar plajı şartı açık değilse.
- Tarih yoksa ve sezon/saat/hava çok kritikse.
- Çocukların yaşı bilinmiyorsa.
- Araçla mı toplu taşıma ile mi gidileceği belirsizse.
- Konaklama mı günübirlik mi belirsizse.

## 14. Fixture requirements

Bu agent için fixture'lar:

```yaml
fixtures:
  - beach_candidate_requires_women_only_beach_verification
  - zoo_candidate_requires_hours_and_parking_check
  - thermal_hotel_requires_facility_and_price_check
  - out_of_radius_candidate_requires_route_burden_evidence
  - rainy_day_activity_requires_weather_alternative_evidence
  - budget_sensitive_plan_requires_price_signal
```

## 15. Evaluation rubric

Başarı kriterleri:

```yaml
evaluation:
  detects_missing_hard_constraint_evidence: required
  separates_evidence_gap_from_plan_quality: required
  maps_claims_to_required_capabilities: required
  marks_user_visible_warnings: required
  does_not_perform_live_lookup: required
  does_not_write_final_answer: required
```

## 16. Example contract sketch

```yaml
verification_evidence_output:
  verification_requirements:
    - item_id: activity_beach_01
      item_type: beach
      claim_used_in_plan: "Aile için deniz alternatifi"
      required_checks:
        - women_only_beach_verification
        - weather_forecast_lookup
        - parking_signal_lookup
      required_capabilities:
        - beach_privacy_suitability_check
        - weather_forecast_lookup
        - parking_signal_lookup
      source_trust_requirement: official_or_primary_source_preferred
      freshness_requirement: date_sensitive
      evidence_required_before_final: true
      confidence_floor: high
      unresolved_risks:
        - "Kadınlar plajı doğrulanmadan final plana alınamaz"
  evidence_gap_report:
    missing_privacy_verification:
      - activity_beach_01
  confidence_summary:
    overall_confidence_band: low
    hard_blockers_present: true
    user_visible_warnings_required:
      - "Deniz alternatifi için kadınlar plajı doğrulaması eksik"
```

## 17. Open design questions

```yaml
open_questions:
  - Evidence gap final cevapta hangi görsel/UX formatta gösterilecek?
  - Confidence band günlük plan düzeyinde mi, tüm plan düzeyinde mi hesaplanacak?
  - Çok düşük güvenli aday tamamen elenmeli mi, yoksa 'kontrol edilmeli' olarak mı gösterilmeli?
  - Resmi kaynak ve ticari kaynak çelişirse hangi kaynak sınıfı override eder?
```

## Current status

```yaml
agent_specification_state: drafted
next_agent_spec: final-response-composer-agent.md
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
```
