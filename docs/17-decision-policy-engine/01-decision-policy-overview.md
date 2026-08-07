# 01 — Decision Policy Overview

**Doküman türü:** decision policy overview  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, Tatil Modu karar politikasının genel modelini tanımlar.

Decision policy, agent çıktılarının nasıl sıralanacağını, hangi kararın önce geleceğini, hangi durumda planın duracağını, hangi durumda fallback üretileceğini ve hangi bilgilerin final response'ta görünür olması gerektiğini belirleyen tasarım katmanıdır.

Bu belge runtime policy engine değildir.

## Ana karar

```yaml
decision_policy_overview_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
rule_evaluator_code_allowed: false
source_of_truth: docs/17-decision-policy-engine/01-decision-policy-overview.md
```

## Policy neden ayrı bir katman?

Agent'lar kendi görev alanlarında uzmanlaşır; fakat global karar sırası agent'ların içinde dağınık durmamalıdır.

Örneğin:

```text
Activity Fit Agent bir plajı uygun görebilir.
Route Logistics Agent yolu makul görebilir.
Family Suitability Agent çocuk yorgunluğunu orta risk görebilir.
Verification Evidence Agent kadınlar plajı bilgisini doğrulanmamış görebilir.
```

Bu durumda nihai karar, tek bir agent'ın skoruna bırakılamaz.

Decision Policy Engine tasarımı, bu tür çakışmalarda hangi kararın üstün geleceğini belirler.

## Karar hiyerarşisi

```yaml
policy_priority_order:
  1_safety_and_policy_gate: highest
  2_hard_constraint_gate: blocking
  3_evidence_and_verification_gate: blocking_or_warning
  4_family_suitability_gate: blocking_or_adjustment
  5_route_and_fatigue_gate: blocking_or_adjustment
  6_budget_gate: blocking_or_warning
  7_soft_preference_ranking: non_blocking
  8_final_response_disclosure: mandatory_visibility
```

## Decision policy inputs

```yaml
inputs:
  - travel_request_contract
  - constraint_policy_contract
  - family_suitability_contract
  - destination_candidate_contract
  - route_logistics_contract
  - accommodation_fit_contract
  - activity_fit_contract
  - day_plan_contract
  - verification_evidence_contract
  - final_response_contract
  - common_evidence_envelope
  - common_error_envelope
```

## Decision policy outputs

```yaml
outputs:
  - allow_candidate
  - reject_candidate
  - require_clarification
  - require_verification
  - downgrade_to_alternative
  - convert_to_warning
  - convert_to_blocker
  - allow_with_disclosure
  - require_fallback
  - final_response_visibility_rule
```

## Core invariant

```text
Güzel plan, doğru olmayan veya doğrulanmamış kritik bilgiyi telafi edemez.
```

## Forbidden behavior

```yaml
forbidden:
  - soft_score_overrides_hard_constraint
  - unverified_claim_presented_as_fact
  - privacy_requirement_hidden_as_minor_note
  - toddler_rest_ignored_for_plan_density
  - low_confidence_assumption_becomes_hard_rule
  - final_response_hides_blocker
  - infinite_retry_loop
```

## Downstream relation

Decision policy tasarımı workflow tasarımını tamamlar.

Workflow, adımların sırasını tanımlar.

Decision policy, bu adımlarda verilen kararların öncelik ve geçerlilik kurallarını tanımlar.
