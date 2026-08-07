# 08 — Hard Constraint and Safety Prompting

**Doküman türü:** hard constraint and safety prompting design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, promptların hard constraint, aile güvenliği, mahremiyet ve doğruluk sınırlarını nasıl önceliklendireceğini tanımlar.

Bu dosya policy engine implementation değildir.

## Ana karar

```yaml
artifact_id: hard_constraint_and_safety_prompting
artifact_state: drafted
implementation_allowed: false
policy_engine_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/08-hard-constraint-and-safety-prompting.md
```

## Temel ilke

```text
Hard constraint, iyi yazılmış final cevap veya yüksek skor ile telafi edilemez.
```

## Hard constraint prompt rule

```text
Preserve hard constraints exactly as classified by the constraint policy layer.

Do not downgrade a hard constraint into a soft preference.

If a hard constraint cannot be satisfied or verified, emit a visible blocker, warning, or unresolved verification need according to the contract.
```

## Tatil Modu hard constraint örnekleri

```yaml
hard_constraint_examples:
  child_ages:
    rule: "2 ve 6 yaş çocuk profili plan temposunu zorunlu etkiler"
  midday_rest:
    rule: "2 yaş çocuk için öğle dinlenmesi korunur"
  women_only_beach_if_sea:
    rule: "deniz önerisi varsa kadınlar plajı/privacy şartı doğrulanmadan kesin deniz önerisi yapılmaz"
  radius_limit:
    rule: "150 km dışı aday ancak güçlü istisna gerekçesiyle taşınır"
  budget_limit:
    rule: "bütçe hard constraint ise aşım görünür olmalıdır"
```

## Safety prompt rule

```yaml
safety_prompt_rules:
  child_suitability_visible: true
  fatigue_risk_visible: true
  privacy_sensitive_claims_verified_or_disclosed: true
  route_burden_not_hidden: true
  unsafe_or_unfit_option_not_promoted: true
  unresolved_blocker_user_visible: true
```

## Soft preference ayrımı

```yaml
soft_preference_rules:
  can_influence_ranking: true
  cannot_override_hard_constraint: true
  cannot_become_hard_constraint_without_policy_confidence: true
  should_be_disclosed_when_used_for_tradeoff: true
```

## Forbidden prompt behavior

```yaml
forbidden_behavior:
  - ignore_child_age_for_plan_beauty
  - hide_long_drive_risk
  - present_unverified_privacy_match_as_verified
  - recommend_sea_without_women_only_beach_status_when_required
  - overload_days_to_maximize_activity_count
  - convert_user_sensitive_requirement_to_optional_note
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 09-prompt-versioning-and-change-policy.md
implementation_allowed: false
policy_engine_allowed: false
runtime_prompt_engine_allowed: false
```
