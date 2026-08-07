# Final Response Contract

**Doküman türü:** canonical contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Final Response Contract, Tatil Modu içinde kullanıcıya gösterilecek nihai tatil planı cevabının hangi veri yapısından üretileceğini ve hangi bilgilerin nasıl görünür yapılacağını tanımlar.

Bu contract UI component, prompt implementation, rendering logic veya runtime schema değildir.

Amaç şudur:

```text
Plan kullanıcıya açık, uygulanabilir, aile odaklı ve doğrulanmamış iddiaları kesin bilgi gibi sunmadan nasıl aktarılır?
```

```yaml
contract_id: final_response_contract
producer_agent: final_response_composer_agent
primary_consumer: user_facing_interface
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
produces_user_visible_output: true
```

## 2. Producer

Bu contract'ın producer'ı:

```yaml
producer:
  agent_id: final_response_composer_agent
  source_spec: docs/11-agent-specifications/final-response-composer-agent.md
```

Producer şu kaynaklardan gelen çıktıları kullanır:

```yaml
producer_inputs:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
  - destination-candidate-contract.md
  - route-logistics-contract.md
  - accommodation-fit-contract.md
  - activity-fit-contract.md
  - day-plan-contract.md
  - verification-evidence-contract.md
```

## 3. Consumer

Bu contract'ın consumer'ları:

```yaml
consumers:
  - user_facing_interface
  - export_document_generator
  - human_review_process
  - evaluation_fixture_runner
```

Consumer için temel kural:

```text
Kullanıcıya gösterilecek metin, doğrulanmamış bilgileri kesin iddia olarak taşımamalıdır.
```

## 4. Input fields

Beklenen input alanları:

```yaml
input_fields:
  request_summary: object
  constraint_summary: object
  family_suitability_summary: object
  destination_summary: object
  route_logistics_summary: object
  accommodation_summary: object
  activity_summary: object
  day_plan_draft: object
  verification_evidence_report: object
  response_preferences: object
```

## 5. Output fields

Canonical output:

```yaml
final_response:
  response_title: string
  executive_summary: string
  assumption_notice: object
  plan_overview: object
  daily_plan_cards: list
  alternatives_summary: object
  family_fit_notes: list
  logistics_notes: list
  accommodation_notes: list
  activity_notes: list
  budget_notes: list
  verification_disclosures: list
  hard_blockers: list
  unresolved_questions: list
  user_action_checklist: list
  confidence_summary: object
  source_visibility_summary: object
```

## 6. Required fields

Zorunlu alanlar:

```yaml
required_fields:
  - response_title
  - executive_summary
  - plan_overview
  - daily_plan_cards
  - verification_disclosures
  - unresolved_questions
  - confidence_summary
```

`daily_plan_cards` minimum yapısı:

```yaml
daily_plan_cards:
  - day_number: number
    day_theme: string
    primary_plan:
      morning_block: object
      lunch_rest_block: object
      afternoon_block: object
      evening_block: object
    alternatives: list
    family_fit_notes: list
    verification_needed: list
    warnings: list
```

## 7. Optional fields

Opsiyonel alanlar:

```yaml
optional_fields:
  - estimated_budget_range
  - parking_tips
  - weather_backup_plan
  - indoor_backup_plan
  - conservative_family_notes
  - women_only_beach_notes
  - stroller_notes
  - toddler_rest_notes
  - export_ready_summary
```

## 8. Forbidden fields

Final kullanıcı cevabına taşınmaması gereken alanlar:

```yaml
forbidden_fields:
  - internal_agent_trace
  - full_memory_context
  - hidden_scoring_weights
  - private_policy_reasoning
  - provider_credentials
  - payment_details
  - raw_tool_credentials
  - unreviewed_internal_notes
```

Final cevapta yasak claim türleri:

```yaml
forbidden_claims:
  - exact_price_without_evidence
  - exact_opening_hours_without_evidence
  - exact_drive_time_without_evidence
  - parking_available_without_evidence
  - women_only_beach_active_without_evidence
  - hotel_available_without_evidence
  - weather_certain_without_evidence
  - ticket_available_without_evidence
```

## 9. Evidence requirements

Final cevap, verification evidence report ile uyumlu olmalıdır.

```yaml
evidence_rules:
  unverified_claim_as_fact: forbidden
  missing_evidence_must_be_visible: true
  hard_blocker_must_be_visible: true
  confidence_summary_required: true
```

Evidence gerektiren örnekler:

```yaml
evidence_required_for:
  - opening_hours
  - ticket_price
  - accommodation_price
  - accommodation_availability
  - route_drive_time
  - traffic_condition
  - parking_availability
  - weather_suitability
  - women_only_beach_status
  - facility_status
```

## 10. Confidence rules

Final cevap güven seviyesi şöyle taşınır:

```yaml
confidence_summary:
  overall_confidence: high | medium | low
  confidence_reasons: list
  low_confidence_sections: list
  user_should_verify_before_trip: list
```

Kurallar:

```yaml
confidence_rules:
  high_requires_no_hard_blockers: true
  medium_allows_verification_gaps: true
  low_requires_visible_warning: true
  unresolved_hard_constraint_requires_blocker: true
```

## 11. Validation rules

Final response validation şu kontrolleri yapmalıdır:

```yaml
validation_rules:
  daily_plan_present: required
  alternatives_present_when_requested: required
  toddler_rest_preserved: required_if_toddler_present
  women_only_beach_disclosure_present: required_if_sea_plan_and_privacy_constraint
  verification_disclosures_present: required
  hard_blockers_visible: required
  final_text_no_unverified_fact_claim: required
  implementation_details_absent: required
```

Hard validation fail örnekleri:

```yaml
hard_fail_if:
  - final_response_hides_hard_blocker
  - final_response_claims_unverified_price_as_fact
  - final_response_claims_women_only_beach_verified_without_evidence
  - final_response_omits_toddler_rest_need
  - final_response_omits_requested_alternatives
  - final_response_exposes_internal_trace
```

## 12. Failure modes

Olası failure mode'lar:

```yaml
failure_modes:
  - missing_day_plan_draft
  - missing_verification_evidence_report
  - hard_blocker_present
  - privacy_constraint_unresolved
  - budget_constraint_unresolved
  - route_logistics_low_confidence
  - accommodation_availability_unknown
  - activity_opening_hours_unknown
  - final_response_not_safe_to_show
```

## 13. Clarification states

Kullanıcıya soru sorulması gereken durumlar:

```yaml
clarification_states:
  - required_hard_constraint_missing
  - privacy_requirement_unclear
  - budget_hard_limit_unclear
  - trip_date_missing_for_operational_checks
  - destination_choice_required
  - accommodation_preference_required
```

Final cevap clarification taşıyorsa şu şekilde görünür olmalıdır:

```text
Bu plan taslak olarak hazırlanabilir; ancak şu bilgi netleşirse daha doğru olur: ...
```

## 14. Example payload sketch

```yaml
final_response_contract:
  contract_version: 0.1.0
  producer_agent: final_response_composer_agent
  validation_status: pass_with_warnings
  final_response:
    response_title: "Kocaeli çıkışlı 3 günlük aile tatili taslağı"
    executive_summary: "2 yetişkin, 6 ve 2 yaş çocuk için düşük tempolu, öğle dinlenmeli bir plan taslağı."
    assumption_notice:
      assumptions:
        - "Özel araç kullanılacak."
        - "2 yaş çocuk için öğle dinlenmesi korunacak."
    plan_overview:
      duration_days: 3
      travel_style: family_low_fatigue
      alternatives_per_day_target: 2_to_3
    daily_plan_cards:
      - day_number: 1
        day_theme: "Varış ve hafif aktivite"
        primary_plan:
          morning_block:
            title: "Yola çıkış"
            verification_needed:
              - route_drive_time
          lunch_rest_block:
            title: "Otele geçiş ve dinlenme"
          afternoon_block:
            title: "Kısa çevre gezisi"
          evening_block:
            title: "Erken akşam yemeği"
        alternatives:
          - title: "Düşük yorgunluk alternatifi"
          - title: "Kapalı alan alternatifi"
        verification_needed:
          - accommodation_availability
          - parking_availability
    verification_disclosures:
      - "Fiyat ve müsaitlik canlı olarak doğrulanmadan kesin kabul edilmemelidir."
    unresolved_questions: []
    confidence_summary:
      overall_confidence: medium
      confidence_reasons:
        - "Operasyonel bilgiler canlı doğrulanmadı."
```

## 15. Fixture requirements

İlk fixture:

```yaml
fixture_id: TM-FINAL-001
name: 3 günlük çocuklu aile tatili final cevap contract fixture
must_check:
  - final response includes 3 daily plan cards
  - each day has alternatives
  - toddler lunch rest is visible
  - verification gaps are visible
  - unverified claims are not stated as facts
  - women-only beach requirement is disclosed when sea plan exists
```

## 16. Backward compatibility notes

```yaml
compatibility:
  contract_version_required: true
  additive_fields_allowed: true
  removing_required_fields_requires_major_version: true
  changing_evidence_semantics_requires_major_version: true
```

## 17. Open design questions

```yaml
open_questions:
  - Final cevapta tablo formatı mı, kart formatı mı ana format olacak?
  - Export edilecek PDF/Word çıktısı aynı contract'tan mı türetilecek?
  - Kullanıcıya gösterilecek confidence dili ne kadar teknik olmalı?
  - Verification eksikleri ayrı bölüm mü, her günün altında mı gösterilmeli?
  - Kadınlar plajı gibi hassas mahremiyet şartları final cevapta hangi dille ifade edilmeli?
```

## Sonuç

Final Response Contract, Tatil Modu'nun kullanıcıya göstereceği nihai cevabın güvenli, açıklanabilir ve aile odaklı olmasını sağlayan canonical contract tasarımıdır.

Bu contract kod değildir.

Bu contract UI değildir.

Bu contract runtime validator değildir.

Bu contract, final cevabın hangi bilgileri açıkça göstermesi ve hangi doğrulanmamış iddiaları kesin bilgi gibi sunmaması gerektiğini tanımlar.

```yaml
contract_status: drafted
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
next_contract: common-evidence-envelope.md
```
