# 02 — Policy Priority Hierarchy

**Doküman türü:** policy priority hierarchy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, Tatil Modu kararlarının hangi öncelik sırasıyla değerlendirileceğini tanımlar.

Amaç, skor, tercih, uygunluk, verification ve hard constraint çakıştığında sistemin tutarlı karar verebilmesidir.

## Ana karar

```yaml
policy_priority_hierarchy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/02-policy-priority-hierarchy.md
```

## Öncelik sırası

```yaml
priority_hierarchy:
  1_safety_policy:
    priority: absolute
    can_be_overridden: false
  2_hard_constraints:
    priority: blocking
    can_be_overridden: false
  3_evidence_verification:
    priority: blocking_or_disclosure
    can_be_overridden: false_for_critical_claims
  4_family_suitability:
    priority: high
    can_be_overridden: only_with_safe_adjustment
  5_route_logistics_fatigue:
    priority: high
    can_be_overridden: only_with_alternative_or_warning
  6_budget:
    priority: medium_high
    can_be_overridden: only_if_user_allows_range
  7_soft_preferences:
    priority: ranking_only
    can_be_overridden: yes
  8_presentation_quality:
    priority: final_layer
    can_be_overridden: no_for_disclosures
```

## Safety / policy gate

Bu gate çocuk güvenliği, kullanıcı adına işlem yapma, ödeme, rezervasyon, hassas veri ve açıkça riskli davranışları kapsar.

Bu gate başarısızsa downstream ranking veya plan composition çalışmaz.

## Hard constraint gate

Hard constraint örnekleri:

```yaml
hard_constraint_examples:
  - children_ages
  - women_only_beach_if_sea_required
  - max_distance_radius_when_explicit
  - travel_duration
  - origin_city
  - user_budget_when_strict
  - midday_rest_when_required_for_toddler
```

Hard constraint soft preference ile telafi edilemez.

## Evidence / verification gate

Değişken ve doğrulama gerektiren claim'lerde evidence yoksa sistem üç karardan birini üretir:

```yaml
evidence_decisions:
  - block_if_claim_is_hard_constraint
  - allow_with_disclosure_if_non_critical
  - require_fallback_if_plan_depends_on_claim
```

## Family suitability gate

Aile uygunluğu yalnızca keyif metriği değildir.

2 yaş çocukla öğle dinlenmesi, kısa transferler, yorucu yürüyüşler ve akşam yorgunluğu karar girdisidir.

## Route / logistics gate

Yol, trafik, park ve mesafe belirsizliği plan kalitesini değil, plan uygulanabilirliğini etkiler.

## Budget gate

Bütçe sıkı verilmişse bütçe aşımı warning değil blocker olabilir.

Bütçe aralık veya tahmini verilmişse açıklanmış esneklikle warning olabilir.

## Soft preference ranking

Soft preference yalnızca uygun adaylar arasında sıralama yapar.

Soft preference örnekleri:

```yaml
soft_preference_examples:
  - havuzlu_otelde_kalmak
  - doğa_aktivitesi_tercihi
  - az_kalabalık_mekan
  - manzaralı_akşam_yemeği
  - yakın_ama_çok_iyi_alternatif
```

## Presentation layer

Final response hiçbir policy sonucunu gizleyemez.

Blocker, warning, assumption ve evidence gap kullanıcıya görünür olmalıdır.

## Forbidden precedence inversions

```yaml
forbidden_precedence_inversions:
  - high_rating_overrides_missing_women_only_beach_verification
  - cheap_price_overrides_child_fatigue_risk
  - short_distance_overrides_closed_place_warning
  - nice_hotel_overrides_budget_blocker
  - confident_language_overrides_missing_evidence
  - user_review_overrides_official_closure_status
```
