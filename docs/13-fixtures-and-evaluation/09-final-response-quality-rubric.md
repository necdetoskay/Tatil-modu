# 09 — Final Response Quality Rubric

**Doküman türü:** final response quality rubric design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu'nun kullanıcıya sunduğu nihai tatil planı cevabının kalite değerlendirme rubric'ini tanımlar.

Bu dosya evaluator implementation değildir.

Bu dosya test runner, prompt, CI workflow, script veya runtime scoring kodu içermez.

## Ana karar

```yaml
rubric_id: final_response_quality_rubric
rubric_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/09-final-response-quality-rubric.md
related_contracts:
  - final-response-contract.md
  - verification-evidence-contract.md
  - day-plan-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
```

## Rubric'in amacı

Final cevap yalnızca güzel yazılmış bir metin olduğu için başarılı sayılmaz.

Final cevap şu üç şeyi aynı anda başarmalıdır:

```text
Kullanıcıya uygulanabilir plan vermek,
Kısıt ve belirsizlikleri saklamamak,
Çocuklu aile seyahatini güvenli ve anlaşılır hale getirmek.
```

## Evaluation hiyerarşisi

Final response değerlendirmesinde öncelik sırası değişmez:

```text
Safety / Policy Gate
> Contract Validation
> Hard Constraint Compliance
> Evidence / Verification Quality
> Domain Quality
> Plan Coherence / Usability
> Cost / Latency
> Regression / Golden Fixture
```

Bu yüzden final cevap çok güzel yazılmış olsa bile hard constraint ihlali veya doğrulanmamış claim'i kesin bilgi gibi sunuyorsa başarısızdır.

## Rubric scoring modeli

Bu dosya runtime scoring kodu değildir; ancak tasarım seviyesinde 0-3 ölçeğini tanımlar.

```yaml
score_scale:
  0: failed_or_missing
  1: weak_or_partial
  2: acceptable
  3: strong
```

## Rubric kategorileri

| Kategori | Ağırlık | Gate tipi |
|---|---:|---|
| Hard constraint visibility | critical | blocking |
| Evidence and uncertainty disclosure | critical | blocking |
| Family suitability explanation | high | quality |
| Day plan usability | high | quality |
| Alternatives and fallbacks | high | quality |
| Route, traffic and parking caution | medium | quality |
| Budget clarity | medium | quality |
| Tone and readability | medium | quality |
| Next-step clarity | low | quality |

## FRQ-001 — Hard constraint visibility

```yaml
rubric_item_id: FRQ-001
category: hard_constraint_visibility
gate_type: blocking
score_0:
  description: Hard constraint yok sayılır veya final cevapta görünmez.
score_1:
  description: Hard constraint kısmen görünür ama plan davranışını etkilemez.
score_2:
  description: Hard constraint görünür ve planı genel olarak etkiler.
score_3:
  description: Hard constraint açık, gerekçeli, plan kararlarına bağlı ve kullanıcıya anlaşılır biçimde sunulur.
automatic_fail_conditions:
  - women_only_beach_requirement_hidden_when_sea_recommended
  - toddler_rest_need_ignored
  - out_of_radius_candidate_presented_without_exception_reason
  - hard_blocker_missing_from_final_response
```

## FRQ-002 — Evidence and uncertainty disclosure

```yaml
rubric_item_id: FRQ-002
category: evidence_uncertainty_disclosure
gate_type: blocking
score_0:
  description: Doğrulanmamış fiyat, saat, hava, yol, otopark veya privacy iddiası kesin bilgi gibi sunulur.
score_1:
  description: Bazı belirsizlikler belirtilir ama kritik claim'ler hâlâ kesin gibi görünür.
score_2:
  description: Kritik belirsizlikler görünür ve kullanıcıya doğrulama gereği anlatılır.
score_3:
  description: Her önemli claim evidence/confidence seviyesine uygun biçimde sunulur; belirsizlikler planın uygulanmasına yardımcı olacak şekilde açıklanır.
automatic_fail_conditions:
  - exact_price_without_evidence
  - exact_opening_hours_without_evidence
  - exact_drive_time_without_evidence
  - parking_availability_without_evidence
  - weather_claim_without_evidence
  - women_only_beach_claim_without_evidence_as_fact
```

## FRQ-003 — Family suitability explanation

```yaml
rubric_item_id: FRQ-003
category: family_suitability_explanation
gate_type: quality
score_0:
  description: Çocuk yaşları ve aile profili final cevapta etkisizdir.
score_1:
  description: Çocuklardan bahsedilir ama plan kararlarıyla bağlantı zayıftır.
score_2:
  description: 2 ve 6 yaş çocukların ihtiyaçları plan kararlarına yansır.
score_3:
  description: 2 yaş dinlenme/yorgunluk ihtiyacı, 6 yaş ilgi ihtiyacı ve ebeveyn yükü açık şekilde dengelenir.
expected_visible_elements:
  - child_ages_referenced
  - toddler_rest_logic
  - older_child_engagement_logic
  - parent_burden_warning_when_needed
```

## FRQ-004 — Day plan usability

```yaml
rubric_item_id: FRQ-004
category: day_plan_usability
gate_type: quality
score_0:
  description: Plan gün bloklarına ayrılmamış veya uygulanabilir değil.
score_1:
  description: Günler var ama tempo, dinlenme ve geçişler belirsiz.
score_2:
  description: Sabah/öğle/öğleden sonra/akşam akışı çoğunlukla anlaşılırdır.
score_3:
  description: Her gün uygulanabilir bloklara ayrılır; dinlenme, geçiş ve alternatif mantığı açıkça görünür.
expected_visible_elements:
  - morning_block
  - lunch_rest_block
  - afternoon_block
  - evening_block_when_relevant
  - daily_fatigue_note
```

## FRQ-005 — Alternatives and fallbacks

```yaml
rubric_item_id: FRQ-005
category: alternatives_and_fallbacks
gate_type: quality
score_0:
  description: Kullanıcı alternatif istemesine rağmen tek seçenek verilir.
score_1:
  description: Alternatifler var ama yetersiz veya amaçsızdır.
score_2:
  description: Günlerin çoğunda anlamlı alternatifler vardır.
score_3:
  description: Her gün için 2-3 anlamlı alternatif, yağmur/yorulma/mahremiyet/bütçe gibi durumlara göre ayrıştırılır.
automatic_fail_conditions:
  - no_daily_alternatives_when_requested
  - no_rainy_day_fallback_when_weather_sensitive
  - no_non_sea_fallback_when_privacy_unverified
```

## FRQ-006 — Route, traffic and parking caution

```yaml
rubric_item_id: FRQ-006
category: route_traffic_parking_caution
gate_type: quality
score_0:
  description: Yol, trafik veya otopark iddiaları kesin ve kanıtsızdır.
score_1:
  description: Bazı uyarılar vardır ama karar davranışına etkisi zayıftır.
score_2:
  description: Yol/otopark/erişim riskleri uygun şekilde işaretlenir.
score_3:
  description: Rota yükü, çocuk molası, trafik riski, park belirsizliği ve gün temposu birlikte değerlendirilir.
expected_visible_elements:
  - route_burden_note
  - parking_uncertainty_note
  - traffic_uncertainty_note
  - child_break_or_rest_note
```

## FRQ-007 — Budget clarity

```yaml
rubric_item_id: FRQ-007
category: budget_clarity
gate_type: quality
score_0:
  description: Bütçe yok sayılır veya kesin fiyat uydurulur.
score_1:
  description: Bütçe anılır ama plan kararlarını net etkilemez.
score_2:
  description: Bütçe bandı ve doğrulama ihtiyacı genel olarak görünürdür.
score_3:
  description: Bütçe, konaklama/aktivite/yol seçeneklerini yönlendirir; kesin fiyat gerektiren noktalar açıkça doğrulama ihtiyacıyla sunulur.
automatic_fail_conditions:
  - exact_total_cost_without_evidence
  - booking_or_payment_claim_without_evidence
```

## FRQ-008 — Tone and readability

```yaml
rubric_item_id: FRQ-008
category: tone_and_readability
gate_type: quality
score_0:
  description: Cevap dağınık, teknik veya kullanıcı için uygulanamazdır.
score_1:
  description: Cevap anlaşılır ama fazla genel veya yorucudur.
score_2:
  description: Cevap düzenli, aile odaklı ve okunabilirdir.
score_3:
  description: Cevap sade, güven veren, karar vermeyi kolaylaştıran ve aile seyahatine uygun bir dildedir.
expected_visible_elements:
  - concise_summary
  - day_by_day_structure
  - clear_warnings
  - practical_notes
```

## FRQ-009 — Next-step clarity

```yaml
rubric_item_id: FRQ-009
category: next_step_clarity
gate_type: quality
score_0:
  description: Kullanıcı neyi doğrulaması veya nasıl seçim yapması gerektiğini anlayamaz.
score_1:
  description: Sonraki adımlar belirsiz veya çok genel kalır.
score_2:
  description: Kullanıcıya temel doğrulama ve seçim adımları verilir.
score_3:
  description: Kullanıcıya net seçim mantığı, hangi bilgilerin doğrulanacağı ve hangi durumda hangi alternatifin seçileceği açıklanır.
expected_visible_elements:
  - choose_between_options_guidance
  - verify_before_departure_list
  - what_changes_the_plan_note
```

## Automatic fail conditions

Aşağıdaki durumlar final cevap kalitesini otomatik başarısız yapar:

```yaml
automatic_fail_conditions:
  - hard_constraint_ignored
  - final_response_missing_hard_blocker
  - unverified_claim_presented_as_fact
  - women_only_beach_requirement_hidden_when_sea_recommended
  - toddler_rest_block_missing_for_age_2_child
  - exact_price_or_booking_claim_without_evidence
  - exact_opening_hours_without_evidence
  - exact_drive_time_without_evidence
  - no_daily_alternatives_when_requested
  - unsafe_or_impractical_family_plan_presented_as_best_choice
```

## Minimum acceptable final response

Bir final cevap kabul edilebilir sayılmak için şunları sağlamalıdır:

```yaml
minimum_acceptance:
  hard_constraints_visible: required
  evidence_gaps_visible: required
  child_ages_reflected: required
  day_plan_blocks_present: required
  alternatives_present_when_requested: required
  verification_disclosures_present: required
  no_unverified_claim_as_fact: required
```

## Strong final response characteristics

Güçlü final cevap şunları yapar:

```yaml
strong_response_characteristics:
  - planı aile yorgunluğuna göre dengeler
  - kullanıcı şartlarını açıkça görünür yapar
  - doğrulanmamış bilgileri saklamaz
  - her gün için anlamlı alternatif sunar
  - privacy-sensitive deniz önerilerini güvenli taşır
  - trafik/park/yol risklerini abartmadan ama gizlemeden anlatır
  - bütçe belirsizliklerini dürüstçe açıklar
  - kullanıcının karar vermesini kolaylaştırır
```

## Current status

```yaml
rubric_state: drafted
next_artifact: 10-regression-and-golden-baseline-policy.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
