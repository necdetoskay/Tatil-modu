# 04 — Family Profile Memory Model

**Doküman türü:** family profile memory model design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Tatil Modu'nun aile yapısı, çocuk yaşları, çocuk ihtiyaçları ve ebeveyn yükü bağlamını nasıl memory olarak ele alacağını tanımlar.

## Ana karar

```yaml
family_profile_memory_model_state: drafted
family_profile_memory_allowed: true
requires_confidence_and_freshness: true
child_age_memory_requires_update_awareness: true
implementation_allowed: false
```

## Family profile memory alanları

```yaml
family_profile_memory_fields:
  family_party_pattern:
    examples:
      - two_adults_two_children
    canonical_allowed: true
  child_ages:
    examples:
      - 2
      - 6
    canonical_allowed: true
    freshness_requirement: age_sensitive
  child_rest_needs:
    examples:
      - midday_rest_needed
      - low_fatigue_preferred
    canonical_allowed: true
  child_activity_fit_notes:
    examples:
      - zoo_liked
      - indoor_fallback_useful
    canonical_allowed: conditional
  parent_burden_preference:
    examples:
      - avoid_heavy_transfers
      - parking_convenience_matters
    canonical_allowed: conditional
```

## Çocuk yaşı özel kuralı

Çocuk yaşı zamanla değişir.

Bu nedenle child age memory şu bilgileri taşımalıdır:

```yaml
child_age_memory_requirements:
  age_value_required: true
  captured_at_required: true
  confidence_required: true
  age_band_derivation_allowed: true
  stale_age_warning_required_when_old: true
```

## Aile profili hard constraint olur mu?

Çocuk yaşları ve bebek/toddler ihtiyaçları plan kararlarında hard context olarak ele alınabilir.

Fakat çıkarıma dayalı aile bilgisi hard constraint yapılamaz.

```yaml
hard_context_rules:
  explicit_child_age: can_affect_hard_constraints
  inferred_child_age: cannot_be_hard_constraint
  explicit_midday_rest_need: can_be_hard_constraint
  inferred_rest_preference: soft_or_warning_only
```

## Disclosure örneği

Family Suitability Agent'a verilecek disclosure şuna benzer tasarlanır:

```yaml
family_profile_disclosure:
  party:
    adults: 2
    children:
      - age: 2
        age_band: toddler
      - age: 6
        age_band: young_child
  planning_implications:
    - midday_rest_should_be_preserved
    - avoid_high_fatigue_dense_days
    - prefer_parking_and_easy_access
  hidden_fields_excluded: true
```

## Yasaklar

```yaml
forbidden_family_memory_behavior:
  store_child_data_without_user_signal: forbidden
  infer_sensitive_family_status_as_fact: forbidden
  expose_unnecessary_child_details_to_all_agents: forbidden
  use_family_memory_for_non_travel_purpose: forbidden
```

## Kapanış kararı

Family profile memory, Tatil Modu için değerlidir; ancak sadece minimum gerekli disclosure ile agent'lara taşınır.
