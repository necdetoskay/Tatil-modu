# 11 — Final Response Decision Policy

**Doküman türü:** final response decision policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, karar politikası sonuçlarının final kullanıcı cevabına nasıl taşınacağını tanımlar.

Final response, yalnızca güzel yazılmış bir plan değildir; policy kararlarını, blocker'ları, uyarıları, evidence gap'leri ve varsayımları kullanıcıya anlaşılır şekilde gösteren son katmandır.

## Ana karar

```yaml
final_response_decision_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
final_response_runtime_allowed: false
source_of_truth: docs/17-decision-policy-engine/11-final-response-decision-policy.md
```

## Final response decision inputs

```yaml
inputs:
  - policy_priority_result
  - hard_constraint_gate_result
  - evidence_confidence_result
  - family_suitability_result
  - route_radius_result
  - budget_result
  - retry_fallback_result
  - final_response_contract
```

## Required visibility

Final response şu policy sonuçlarını saklayamaz:

```yaml
must_be_visible:
  - hard_constraint_failures
  - hard_constraint_assumptions
  - evidence_gaps
  - privacy_sensitive_verification_status
  - family_fatigue_warnings
  - route_or_parking_uncertainty
  - budget_uncertainty
  - fallback_reason
  - unresolved_questions
```

## Certainty language policy

```yaml
certainty_language:
  verified_claim:
    allowed_language: certain_with_source_context
  partially_verified_claim:
    allowed_language: cautious
  unverified_claim:
    allowed_language: not_confirmed_or_needs_check
  contradicted_claim:
    allowed_language: cannot_recommend_as_claimed
```

## Plan presentation decisions

```yaml
presentation_decisions:
  primary_plan:
    requires: no_blocking_policy_failure
  alternative_plan:
    allowed_when: has_warning_or_soft_uncertainty
  unverified_option:
    allowed_when: clearly_marked_not_primary
  excluded_option:
    show_when: useful_to_explain_hard_constraint_or_privacy_failure
```

## Privacy-sensitive wording

Kadınlar plajı veya mahremiyet gereksinimi varsa final response:

```yaml
privacy_wording_requirements:
  - acknowledge_requirement
  - show_verification_status
  - avoid_claiming_satisfied_if_unverified
  - offer_non_beach_or_verified_alternative_when_needed
```

## Family wording

Aile uygunluğu açıklaması sade, uygulanabilir ve yargılayıcı olmayan dille yazılmalıdır.

```yaml
family_wording_requirements:
  - explain_low_fatigue_structure
  - show_midday_rest_blocks
  - mark_optional_evening_items
  - avoid_overloading_children
```

## Forbidden final response behavior

```yaml
forbidden:
  - hiding_policy_blocker
  - presenting_unverified_claim_as_fact
  - omitting_privacy_evidence_gap
  - using_confident_language_for_estimates
  - making_plan_look_complete_when_required_data_missing
  - replacing_hard_constraint_failure_with_generic_note
```

## Final invariant

```text
Final cevap, kullanıcının güvenle karar verebilmesi için neyin kesin, neyin varsayım, neyin doğrulanmamış ve neyin engelleyici olduğunu açıkça göstermelidir.
```
