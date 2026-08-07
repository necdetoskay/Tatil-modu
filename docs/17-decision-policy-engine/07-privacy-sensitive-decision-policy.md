# 07 — Privacy Sensitive Decision Policy

**Doküman türü:** privacy-sensitive decision policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, kadınlar plajı, aile mahremiyeti, hassas tesis özellikleri ve privacy-sensitive travel gereksinimlerinin karar sürecinde nasıl ele alınacağını tanımlar.

## Ana karar

```yaml
privacy_sensitive_decision_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/07-privacy-sensitive-decision-policy.md
```

## Privacy-sensitive claim types

```yaml
privacy_sensitive_claims:
  - women_only_beach
  - family_privacy_facility
  - gender_specific_access_hours
  - private_pool_or_spa_access
  - conservative_family_fit
  - dress_code_or_facility_rule
```

## Decision principles

1. Privacy-sensitive gereksinim açıkça verilmişse soft preference gibi ele alınamaz.
2. Deniz önerisi yapılacaksa kadınlar plajı şartı doğrulanmalıdır.
3. Doğrulanmamış privacy claim kesin karşılanmış sayılmaz.
4. Review sinyali tek başına privacy-sensitive hard constraint karşılamaz.
5. Final response, privacy verification durumunu saklamaz.

## Gate decisions

```yaml
privacy_gate_decisions:
  verified_satisfied:
    decision: allow
  partially_verified:
    decision: allow_with_clear_disclosure_or_alternative
  unverified:
    decision: require_verification_or_do_not_make_primary
  contradicted:
    decision: block
  not_applicable:
    decision: do_not_block_non_sea_plan
```

## Sea recommendation policy

Kullanıcı deniz veya plaj önerisi istemişse ya da sistem plaj alternatifi sunuyorsa:

```yaml
sea_recommendation_policy:
  women_only_beach_required:
    evidence_required: true
    unverified_decision: not_primary_or_block
  privacy_requirement_absent:
    evidence_required: normal_place_verification
  beach_not_in_plan:
    women_only_beach_gate: not_applicable
```

## Avoid overblocking

Kadınlar plajı şartı, sadece plaj/deniz önerileri üzerinde kilitleyici olmalıdır.

Deniz önerisi yapılmayan indoor, doğa, müze veya kaplıca planları bu şart yüzünden gereksiz engellenmez.

## Final response visibility

```yaml
must_show:
  - privacy_requirement_detected
  - verification_status
  - unverified_privacy_claims
  - excluded_beach_options
  - safe_non_beach_alternatives_when_needed
```

## Forbidden behavior

```yaml
forbidden:
  - presenting_unverified_women_only_beach_as_fact
  - hiding_privacy_gap_in_final_response
  - replacing_privacy_requirement_with_general_family_friendly_label
  - using_reviews_as_only_evidence_for_gender_specific_facility
  - blocking_all_non_beach_options_due_to_beach_privacy_requirement
```
