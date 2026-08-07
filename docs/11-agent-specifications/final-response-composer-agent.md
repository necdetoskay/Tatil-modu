# Final Response Composer Agent Specification

**Doküman türü:** canonical agent specification  
**Agent:** Final Response Composer Agent  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Final Response Composer Agent, orchestrator tarafından sağlanan doğrulanmış plan iskeleti, alternatifler, evidence özeti, belirsizlikler ve kullanıcıya görünmesi gereken uyarıları anlaşılır bir nihai cevap formatına dönüştürür.

Bu agent plan keşfi yapmaz.

Bu agent canlı veri çekmez.

Bu agent yeni aday üretmez.

Bu agent, yalnızca kendisine verilen güvenli ve doğrulanmış içeriği kullanıcıya uygun dille sunar.

```yaml
agent_id: final_response_composer_agent
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: true
```

## 2. Non-goals

Bu agent şunları yapmaz:

- Canlı web/API/tool çağrısı yapmaz.
- Yeni destinasyon, otel veya aktivite adayı üretmez.
- Hard constraint ihlalini gizlemez.
- Evidence olmayan iddiayı kesin bilgi gibi sunmaz.
- Kullanıcı memory'sine yazmaz.
- Ranking kararını yeniden hesaplamaz.
- Planı doğrulama agent’ının uyarılarından bağımsız şekilde güvenli ilan etmez.
- API key, provider, adapter veya teknik runtime detayı yazmaz.

## 3. Inputs

Beklenen girdiler:

```yaml
input_contract:
  normalized_trip_request: required
  day_plan_draft: required
  ranked_or_selected_options: required
  verification_evidence_output: required
  user_visible_warnings: required
  constraints_summary: required
  family_suitability_summary: required
  route_logistics_summary: optional
  accommodation_summary: optional
  budget_summary: optional
  privacy_sensitivity_summary: optional
  language_and_tone_preferences: optional
```

## 4. Outputs

Bu agent şu çıktıyı üretir:

```yaml
output_contract:
  final_user_response:
    - short_assumption_summary
    - plan_overview
    - day_by_day_plan
    - alternatives_per_day
    - warnings_and_uncertainties
    - evidence_summary
    - budget_and_logistics_notes
    - next_decision_points
  response_metadata:
    confidence_band
    unresolved_hard_blockers
    user_confirmation_needed
    memory_update_suggestions_visible
```

## 5. Required context

Bu agent için gerekli bağlam:

- Kullanıcının istediği gün sayısı.
- Hedef il/çevre mantığı.
- Aile profili ve çocuk yaşları.
- Hard constraint listesi.
- Her gün için seçilmiş ana plan ve alternatifler.
- Uyarı gerektiren belirsizlikler.
- Evidence özeti.
- Doğrulanmamış alanlar.
- Kullanıcıya açıkça söylenmesi gereken varsayımlar.

## 6. Forbidden context

Bu agent'a verilmemesi gereken bağlam:

- Canonical memory'nin tamamı.
- Gizli kullanıcı profili çıkarımları.
- API key / provider secret.
- Tool raw response.
- Kullanıcıya gösterilmemesi gereken iç scoring detayı.
- Gereksiz hassas bilgi.
- Orchestrator iç karar günlükleri.

## 7. Dependencies

Bu agent doğrudan başka agent çağırmaz.

Orchestrator tarafından şu çıktılarla beslenebilir:

```text
Trip Intake Agent output
Constraint & Policy Agent output
Family Suitability Agent output
Destination Candidate Agent output
Route & Logistics Agent output
Accommodation Fit Agent output
Activity Fit Agent output
Day Plan Composer Agent output
Verification & Evidence Agent output
```

## 8. Handoff rules

Bu agent pipeline'ın son kullanıcıya görünen yüzüdür.

Handoff kuralları:

```yaml
handoff_rules:
  - Evidence gap varsa kullanıcıya görünür uyarı olarak taşınır.
  - Hard blocker varsa plan kesin öneri gibi sunulmaz.
  - Her gün için alternatif sayısı korunur.
  - Trafik, park, fiyat, saat gibi belirsizlikler açıkça belirtilir.
  - Kadınlar plajı gibi hassas gereksinimler kesin bilgi gibi yazılmadan önce evidence durumuna bakılır.
  - Kullanıcıya gereksiz teknik agent isimleri gösterilmez.
```

## 9. Hard constraints

Bu agent aşağıdaki kuralları ihlal edemez:

```yaml
hard_constraints:
  - do_not_hide_hard_constraint_violation
  - do_not_present_unverified_claim_as_fact
  - do_not_drop_women_only_beach_warning_when_required
  - do_not_remove_child_fatigue_warning
  - do_not_claim_price_or_hours_are_current_without_evidence
  - do_not_recommend_over_budget_plan_without_user_visible_note
  - do_not_invent_sources
```

## 10. Evidence requirements

Final cevapta evidence şu seviyelerde gösterilir:

```yaml
evidence_display_levels:
  confirmed:
    meaning: "Doğrulama gereksinimi karşılanmış"
  needs_check:
    meaning: "Plan mantıklı ama kullanıcı gitmeden önce kontrol etmeli"
  blocker:
    meaning: "Bu bilgi doğrulanmadan öneri güvenli değil"
```

Evidence görünür olmalıdır ama kullanıcıyı boğmamalıdır.

Örnek dil:

```text
Bu seçenek çocuklu aile için uygun görünüyor; ancak çalışma saati ve otopark durumu gitmeden önce kontrol edilmeli.
```

## 11. Confidence rules

Final cevap confidence band kullanır:

```yaml
high:
  user_language: "Plan genel olarak güvenli ve uygulanabilir görünüyor."
medium:
  user_language: "Plan uygulanabilir; bazı noktalar gitmeden önce kontrol edilmeli."
low:
  user_language: "Plan taslak olarak sunulabilir; bazı kritik bilgiler doğrulanmadan kesin plan yapılmamalı."
```

Hard blocker varsa confidence `high` olamaz.

## 12. Failure modes

Beklenen failure mode'lar:

```yaml
failure_modes:
  - missing_day_plan_draft
  - missing_verification_summary
  - unresolved_hard_blocker_hidden
  - alternatives_dropped_without_reason
  - budget_warning_missing
  - child_fatigue_warning_missing
  - privacy_warning_missing
  - source_or_evidence_invented
  - overly_technical_response
```

## 13. Clarification triggers

Kullanıcıdan clarification gerekebilecek durumlar:

- Final plan için tarih hâlâ yok ve tarih kritikse.
- Bütçe hard constraint mi belirsizse.
- Deniz önerisinde kadınlar plajı şartı net değilse.
- Konaklama mı günübirlik mi belirsizse.
- Planın uzunluğu/formatı kullanıcının isteğiyle çelişiyorsa.
- Hard blocker çok fazlaysa ve güvenli final öneri üretilemiyorsa.

## 14. Fixture requirements

Bu agent için fixture'lar:

```yaml
fixtures:
  - three_day_family_trip_with_alternatives
  - five_day_city_plan_with_daily_options
  - plan_with_unverified_women_only_beach_warning
  - plan_with_weather_uncertainty
  - plan_with_over_budget_accommodation_warning
  - plan_with_long_route_fatigue_warning
  - plan_with_low_confidence_blockers
```

## 15. Evaluation rubric

Başarı kriterleri:

```yaml
evaluation:
  includes_assumptions: required
  includes_day_by_day_structure: required
  includes_2_to_3_alternatives_when_requested: required
  preserves_user_visible_warnings: required
  does_not_invent_evidence: required
  explains_why_recommendations_fit_family: required
  separates_plan_from_uncertainty: required
  avoids_runtime_or_provider_details: required
```

## 16. Example contract sketch

```yaml
final_response_output:
  final_user_response:
    short_assumption_summary:
      - "2 yetişkin, 2 çocuk; çocuklar 6 ve 2 yaşında kabul edildi."
      - "Araçla çıkış noktası Kocaeli kabul edildi."
    plan_overview:
      confidence_band: medium
      summary: "Düşük yorgunluk ve öğle dinlenmesi öncelikli 3 günlük aile planı."
    day_by_day_plan:
      - day: 1
        main_plan: "Sabah hafif aktivite, öğlen dinlenme, öğleden sonra kısa gezi"
        alternatives:
          - "Yağmur alternatifi"
          - "Daha düşük yorgunluk alternatifi"
    warnings_and_uncertainties:
      - "Bazı çalışma saatleri gitmeden önce kontrol edilmeli."
      - "Deniz seçeneği varsa kadınlar plajı bilgisi ayrıca doğrulanmalı."
    next_decision_points:
      - "Konaklama ister misiniz, yoksa günübirlik mi kalalım?"
  response_metadata:
    confidence_band: medium
    unresolved_hard_blockers: []
    user_confirmation_needed: false
```

## 17. Open design questions

```yaml
open_questions:
  - Final cevapta evidence tablosu her zaman gösterilmeli mi, yoksa sadece belirsizlik olduğunda mı?
  - Çok uzun planlarda günlük alternatifler kart/tablo formatında mı sunulmalı?
  - Kullanıcının 'zengin seçenek' isteği ile düşük yorgunluk ilkesi çelişirse hangi format en anlaşılır olur?
  - Memory update suggestions final cevapta ayrı bölüm mü olmalı?
```

## Current status

```yaml
agent_specification_state: drafted
first_phase_agent_specs_completed: true
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
```
