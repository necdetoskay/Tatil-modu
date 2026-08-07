# 03 — Hard Constraint Gate Policy

**Doküman türü:** hard constraint gate policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, hard constraint olarak sınıflandırılan gereksinimlerin planlama sürecinde nasıl ele alınacağını tanımlar.

Hard constraint gate, ranking, öneri zenginliği, maliyet optimizasyonu veya yazım kalitesinden önce çalışır.

## Ana karar

```yaml
hard_constraint_gate_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/03-hard-constraint-gate-policy.md
```

## Hard constraint tanımı

Hard constraint, ihlal edildiğinde önerinin veya planın geçersiz sayılmasına neden olan kullanıcı, aile, güvenlik veya sistem kısıtıdır.

## Hard constraint kaynakları

```yaml
hard_constraint_sources:
  explicit_user_statement: highest
  derived_family_safety_requirement: high
  child_age_requirement: high
  privacy_sensitive_requirement: high
  legal_or_operational_blocker: high
  low_confidence_inference: not_allowed_as_hard_constraint
```

## Tatil Modu hard constraint örnekleri

```yaml
canonical_hard_constraints:
  - origin_city
  - date_or_duration_when_fixed
  - child_ages
  - women_only_beach_if_sea_suggestion_required
  - midday_rest_for_toddler_when_family_context_requires
  - strict_budget_limit
  - maximum_radius_when_explicit
  - no_booking_or_payment_without_user_action
  - verified_open_status_for_must_visit_place
```

## Gate kararları

```yaml
gate_decisions:
  pass:
    meaning: candidate_or_plan_satisfies_constraint
  fail_block:
    meaning: candidate_or_plan_cannot_continue
  needs_verification:
    meaning: claim_required_to_satisfy_constraint_lacks_evidence
  needs_clarification:
    meaning: constraint_is_ambiguous_or_conflicting
  downgrade_to_alternative:
    meaning: candidate_cannot_be_primary_but_may_be_disclosed_as_unverified_or_optional
```

## Hard constraint ile soft preference ayrımı

Hard constraint:

```text
Deniz önerisi varsa kadınlar plajı mutlaka olsun.
```

Soft preference:

```text
Mümkünse havuzlu otel olsun.
```

Soft preference hard constraint'i aşamaz.

## Evidence bağımlılığı

Bir hard constraint doğrulanabilir dış bilgiye bağlıysa, evidence olmadan karşılanmış kabul edilmez.

Örnek:

```yaml
women_only_beach_requirement:
  requires_evidence: true
  missing_evidence_decision: needs_verification_or_block
```

## Çakışma davranışı

```yaml
conflict_behavior:
  hard_vs_hard:
    decision: require_clarification_or_choose_safe_fallback
  hard_vs_soft:
    decision: hard_constraint_wins
  hard_vs_budget:
    decision: if_budget_is_hard_then_clarify_or_fallback
  hard_vs_evidence_gap:
    decision: block_or_disclose_as_unverified_alternative
```

## Final response visibility

Hard constraint ile ilgili şu durumlar final response'ta görünür olmalıdır:

```yaml
must_be_visible:
  - satisfied_hard_constraints_summary
  - unsatisfied_hard_constraints
  - hard_constraint_evidence_gaps
  - assumptions_used_for_constraint_interpretation
  - alternatives_excluded_due_to_hard_constraints
```

## Forbidden behavior

```yaml
forbidden:
  - hard_constraint_silently_ignored
  - hard_constraint_relabelled_as_preference
  - unverified_hard_constraint_marked_satisfied
  - low_confidence_assumption_promoted_to_hard_constraint
  - final_response_hides_hard_constraint_failure
```
