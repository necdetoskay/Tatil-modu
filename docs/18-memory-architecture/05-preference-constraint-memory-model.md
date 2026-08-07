# 05 — Preference and Constraint Memory Model

**Doküman türü:** preference and constraint memory model design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Tatil Modu'nun kullanıcı tercihleri ile gerçek hard constraint'leri memory içinde nasıl ayıracağını tanımlar.

## Ana karar

```yaml
preference_constraint_memory_model_state: drafted
soft_preference_and_hard_constraint_separation_required: true
inferred_preference_cannot_be_hard_constraint: true
implementation_allowed: false
```

## Preference memory nedir?

Preference memory, kullanıcının tatil planlarında genellikle sevdiği veya tercih ettiği unsurları ifade eder.

```yaml
preference_memory_examples:
  - low_fatigue_plan
  - child_friendly_activities
  - zoo_or_nature_liked
  - midday_rest_preferred
  - parking_convenience_matters
  - conservative_family_facilities_preferred
  - indoor_fallback_useful
```

## Constraint memory nedir?

Constraint memory, kullanıcının açıkça zorunlu tuttuğu ve planın geçerliliğini etkileyen kısıttır.

```yaml
constraint_memory_examples:
  - sea_suggestion_requires_women_only_beach
  - avoid_noon_heavy_activity_with_toddler
  - budget_must_not_exceed_user_stated_limit_for_trip
```

## Ayrım kuralları

| Sinyal | Memory tipi | Hard constraint olabilir mi? |
|---|---|---:|
| Açık kullanıcı ifadesi: “mutlaka” | hard constraint candidate | evet, confidence yeterliyse |
| Tek seferlik beğeni | preference candidate | hayır |
| Tekrarlayan tercih | preference memory | genellikle hayır |
| Düşük güvenli çıkarım | assumption | hayır |
| Belirli geziye özel bütçe | trip-specific constraint | sadece o gezi için |

## Confidence gereksinimi

```yaml
constraint_confidence_policy:
  explicit_must_statement:
    can_be_constraint: true
  repeated_pattern_without_must:
    can_be_constraint: false
    can_be_preference: true
  inferred_from_context:
    can_be_constraint: false
    can_be_preference: low_confidence
```

## Women-only beach örneği

Kullanıcı birden fazla kez “deniz önerisi varsa kadınlar plajı mutlaka olmalı” diyorsa bu memory şöyle taşınır:

```yaml
memory_entry_example:
  type: privacy_sensitive_constraint_memory
  claim: sea_recommendation_requires_women_only_beach_verification
  scope: travel_planning_when_sea_or_beach_is_suggested
  confidence: high
  user_visibility_required: true
```

## Yasaklar

```yaml
forbidden_behavior:
  soft_preference_upgraded_to_hard_constraint_without_user_signal: forbidden
  one_time_activity_like_becomes_permanent_constraint: forbidden
  stale_budget_used_as_current_trip_limit: forbidden
  inferred_privacy_preference_hidden_from_user: forbidden
```

## Kapanış kararı

Preference memory planı yönlendirir; constraint memory planı kilitleyebilir. Bu ikisi aynı şey değildir.
