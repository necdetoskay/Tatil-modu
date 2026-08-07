# 09 — Privacy Sensitive Capability Policy

**Doküman türü:** privacy-sensitive capability policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Live verification:** kapalı

## Purpose

Bu dosya, Tatil Modu'nda mahremiyet, kadınlar plajı, aile güvenliği ve çocuk uygunluğu gibi hassas capability sonuçlarının nasıl ele alınacağını tanımlar.

Bu dosya gerçek kaynak doğrulaması, scraping, canlı harita/arama veya provider entegrasyonu içermez.

## Ana karar

```yaml
artifact_id: privacy_sensitive_capability_policy
artifact_state: drafted
implementation_allowed: false
prototype_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/09-privacy-sensitive-capability-policy.md
```

## Privacy-sensitive capability nedir?

Privacy-sensitive capability, yanlış veya eksik sunulduğunda kullanıcının mahremiyet beklentisini, aile güvenliğini veya çocuk uygunluğunu doğrudan etkileyebilecek capability'dir.

```yaml
privacy_sensitive_capabilities:
  - women_only_beach_verification
  - family_safety_signal_lookup
  - place_age_restriction
  - accommodation_family_room_privacy
  - accommodation_facility_verification
  - official_source_lookup_for_privacy_claim
```

## Özel hassas claim türleri

```yaml
privacy_sensitive_claim_types:
  women_only_beach_status:
    hard_constraint_possible: true
    official_or_high_trust_required: true
  family_safety_status:
    hard_constraint_possible: true
    cross_check_preferred: true
  age_restriction_status:
    official_or_structured_source_required: true
  private_family_facility_status:
    facility_source_preferred: true
  conservative_family_fit:
    should_not_be_overclaimed: true
```

## Kadınlar plajı kuralı

Kadınlar plajı veya mahremiyet şartı aktifse deniz/plaj önerisi özel doğrulama taşır.

```yaml
women_only_beach_policy:
  if_user_requires_when_sea_recommended:
    classify_as: conditional_hard_constraint
  if_user_requires_sea_and_women_only_beach:
    classify_as: hard_constraint
  verification_required: true
  low_trust_review_enough: false
  unverified_claim_can_satisfy_requirement: false
  final_response_disclosure_required: true
```

## Deniz şart değilse

Deniz şart değil, sadece deniz önerilirse kadınlar plajı isteniyorsa bu şart tüm tatil planını kilitlemez.

```yaml
conditional_privacy_rule:
  sea_optional: true
  women_only_required_only_if_beach_recommended: true
  non_sea_fallback_allowed: true
  entire_plan_blocked_by_missing_beach_evidence: false
```

## Source güven kuralı

```yaml
source_trust_for_privacy_claims:
  official_facility_or_municipality:
    preferred: true
    can_support_hard_constraint: true
  structured_place_provider:
    usable: conditional
    may_need_cross_check: true
  user_review_signal:
    usable_for_soft_warning: true
    can_support_hard_constraint: false
  blog_or_social_post:
    usable_for_discovery_only: true
    can_support_hard_constraint: false
```

## Evidence ve confidence kuralı

```yaml
privacy_evidence_rules:
  verified_high_trust:
    confidence_max: high
    can_satisfy_hard_constraint: true
  verified_medium_trust:
    confidence_max: medium
    can_satisfy_hard_constraint: conditional
  unverified:
    confidence_max: low
    can_satisfy_hard_constraint: false
  conflicting_sources:
    confidence_max: low
    blocker_required_if_hard_constraint: true
```

## Family fit ile birlikte değerlendirme

Privacy uyumu tek başına yeterli değildir.

```yaml
privacy_plus_family_fit:
  privacy_suitable_but_too_far:
    warning_required: true
  privacy_suitable_but_toddler_unfit:
    warning_or_exclusion_required: true
  privacy_suitable_but_parking_unknown:
    warning_required: true
  privacy_suitable_but_weather_sensitive:
    fallback_required: true
```

Kadınlar plajı uygun görünse bile çocuk yorgunluğu, rota yükü, otopark ve hava hassasiyeti ayrıca görünür kalır.

## Final response kuralları

```yaml
final_response_rules:
  privacy_requirement_must_be_visible: true
  unverified_privacy_claim_must_not_be_certainty: true
  verified_privacy_claim_requires_source_summary: true
  fallback_reason_must_be_explained: true
  hard_blocker_must_be_visible: true
```

## Güvenli ifade örnekleri

```yaml
safe_language_examples:
  unverified:
    text: "Bu deniz alternatifi için kadınlar plajı/mahremiyet doğrulaması gerekir. Doğrulanmadan kesin öneri olarak sunulmaz."
  conditional:
    text: "Deniz şart değilse, mahremiyet doğrulaması olmayan plaj yerine non-sea aile alternatifi tercih edilebilir."
  verified:
    text: "Mahremiyet/kadınlar plajı uyumu doğrulanmışsa, source summary ve güncellik bilgisiyle birlikte sunulur."
```

## Forbidden behavior

```yaml
forbidden_behavior:
  - present_women_only_beach_without_verification
  - hide_privacy_requirement_in_final_response
  - satisfy_privacy_hard_constraint_with_review_only
  - force_sea_when_sea_is_optional
  - block_entire_trip_when_only_conditional_beach_requirement_missing
  - ignore_child_fatigue_because_privacy_match_exists
  - use_sensitive_claim_without_source_summary
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 10-cost-latency-and-quota-policy.md
implementation_allowed: false
prototype_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
