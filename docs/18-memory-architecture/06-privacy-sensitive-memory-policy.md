# 06 — Privacy Sensitive Memory Policy

**Doküman türü:** privacy-sensitive memory policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Tatil Modu içinde mahremiyet, kadınlar plajı, aile hassasiyeti ve benzeri privacy-sensitive bilgilerin memory içinde nasıl ele alınacağını tanımlar.

## Ana karar

```yaml
privacy_sensitive_memory_policy_state: drafted
privacy_sensitive_memory_allowed: conditional
requires_user_visibility: true
requires_minimum_disclosure: true
cannot_be_inferred_as_fact: true
implementation_allowed: false
```

## Privacy-sensitive memory örnekleri

```yaml
privacy_sensitive_memory_examples:
  women_only_beach_requirement:
    sensitivity: high
    user_visibility_required: true
  conservative_family_facility_preference:
    sensitivity: medium_to_high
    user_visibility_required: recommended
  private_pool_or_spa_preference:
    sensitivity: medium
  avoid_mixed_beach_context:
    sensitivity: high
```

## Saklama kararı

Privacy-sensitive bilgi canonical memory olabilmesi için açık kullanıcı sinyali gerektirir.

```yaml
privacy_memory_commit_requirements:
  explicit_user_statement_required: true
  inferred_signal_allowed: false
  confidence_required: high
  scope_required: true
  user_visible_disclosure_required: true
```

## Scope zorunluluğu

Privacy-sensitive memory her zaman scope ile tutulmalıdır.

Örnek:

```yaml
scoped_privacy_memory:
  claim: sea_recommendation_requires_women_only_beach
  scope: only_when_sea_or_beach_is_recommended
  not_scope: all_travel_plans
```

Bu sayede deniz önerisi olmayan bir kültür/kaplıca planı gereksiz yere kilitlenmez.

## Disclosure kuralı

Privacy-sensitive memory tüm agent'lara verilmez.

```yaml
privacy_disclosure_rules:
  trip_intake_agent: limited_if_relevant
  constraint_policy_agent: yes_if_constraint_relevant
  destination_candidate_agent: yes_if_sea_candidate
  activity_fit_agent: yes_if_beach_activity
  day_plan_composer_agent: summarized_constraint_only
  final_response_composer_agent: user_visible_summary_only
```

## Final response görünürlüğü

Privacy-sensitive memory final cevaba şu şekilde taşınmalıdır:

```text
Deniz/plaj önerisi yapılırsa kadınlar plajı şartının doğrulanması gerektiğini dikkate aldım.
Bu bilgi doğrulanmadan deniz önerisini kesin uygun olarak sunmuyorum.
```

## Yasaklar

```yaml
forbidden_privacy_memory_behavior:
  infer_privacy_preference_from_family_status: forbidden
  hide_privacy_constraint_from_user: forbidden
  send_full_sensitive_memory_to_all_agents: forbidden
  use_privacy_memory_outside_travel_scope: forbidden
  convert_privacy_preference_to_global_user_label: forbidden
```

## Kapanış kararı

Privacy-sensitive memory, sistemin en dikkatli taşıması gereken memory türüdür. Scope, confidence, disclosure ve user visibility olmadan kullanılmaz.
