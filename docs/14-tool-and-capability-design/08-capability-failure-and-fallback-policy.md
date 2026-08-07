# 08 — Capability Failure and Fallback Policy

**Doküman türü:** capability failure ve fallback policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime retry:** kapalı

## Purpose

Bu dosya, Tatil Modu'nda capability sonucu alınamadığında, eksik geldiğinde, çelişkili olduğunda veya güven/tazelik açısından yetersiz kaldığında sistemin nasıl davranacağını tanımlar.

Bu dosya gerçek retry mekanizması, queue, circuit breaker, monitoring veya runtime fallback implementation içermez.

## Ana karar

```yaml
artifact_id: capability_failure_and_fallback_policy
artifact_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
retry_code_allowed: false
fallback_code_allowed: false
source_of_truth: docs/14-tool-and-capability-design/08-capability-failure-and-fallback-policy.md
```

## Failure türleri

```yaml
failure_types:
  provider_unavailable:
    meaning: provider yanıt vermedi veya erişilemedi
  timeout:
    meaning: provider beklenen sürede yanıt vermedi
  malformed_response:
    meaning: provider yanıtı beklenen şekilde yorumlanamadı
  empty_result:
    meaning: kaynakta ilgili bilgi bulunamadı
  stale_result:
    meaning: bilgi freshness eşiğini karşılamıyor
  low_trust_result:
    meaning: kaynak güven seviyesi claim için yetersiz
  conflicting_results:
    meaning: birden fazla kaynak birbiriyle çelişiyor
  partial_result:
    meaning: bilgi bir claim için kısmi ama kesin değil
  privacy_sensitive_unverified:
    meaning: mahremiyet/kadınlar plajı iddiası doğrulanamadı
```

## Failure sonucu neye dönüşür?

```yaml
failure_output_mapping:
  provider_unavailable:
    output: common_error_envelope
    final_response_effect: uncertainty_disclosure
  timeout:
    output: common_error_envelope
    final_response_effect: uncertainty_disclosure
  malformed_response:
    output: common_error_envelope
    final_response_effect: claim_not_verified
  empty_result:
    output: evidence_gap
    final_response_effect: gap_visible
  stale_result:
    output: stale_evidence_warning
    final_response_effect: not_certain_fact
  low_trust_result:
    output: low_confidence_warning
    final_response_effect: cannot_satisfy_hard_constraint
  conflicting_results:
    output: conflict_warning_or_blocker
    final_response_effect: conflict_disclosure
  privacy_sensitive_unverified:
    output: hard_or_conditional_blocker
    final_response_effect: privacy_gap_visible
```

## Fallback ilkeleri

Fallback, uydurma bilgi üretmek değildir.

```yaml
fallback_principles:
  - preserve_user_hard_constraints
  - prefer_safe_alternative_over_fake_certainty
  - disclose_unverified_claims
  - downgrade_exact_claim_to_range_or_unknown_when_needed
  - avoid_booking_payment_or_user_action_without_confirmation
  - keep_family_suitability_visible
  - keep_privacy_sensitive_gaps_visible
  - route_to_final_response_as_warning_or_blocker
```

## Claim tipi bazlı fallback

```yaml
claim_fallback_policy:
  exact_price:
    if_unverified: do_not_show_as_exact
    fallback: price_verification_needed
  opening_hours:
    if_unverified: do_not_show_as_open
    fallback: check_before_go_warning
  availability:
    if_unverified: do_not_show_as_available
    fallback: availability_verification_needed
  drive_time:
    if_unverified: use_band_or_uncertain_language
    fallback: traffic_route_verification_needed
  parking:
    if_unverified: do_not_show_as_guaranteed
    fallback: parking_uncertainty_warning
  weather:
    if_unverified: do_not_show_as_forecast_fact
    fallback: weather_sensitive_plan_with_indoor_option
  women_only_beach:
    if_unverified: do_not_show_as_requirement_satisfied
    fallback: non_sea_or_unverified_privacy_disclosure
```

## Blocker üretme kuralları

```yaml
blocker_rules:
  hard_constraint_unverified:
    blocker_required: true
  privacy_sensitive_hard_constraint_unverified:
    blocker_required: true
  exact_claim_required_but_unverified:
    blocker_required: conditional
  soft_preference_unverified:
    blocker_required: false
    warning_required: true
  evidence_conflict_on_hard_constraint:
    blocker_required: true
```

Hard constraint karşılandığı kanıtlanamıyorsa kesin karşılandı denmez.

## Warning üretme kuralları

```yaml
warning_rules:
  parking_unknown: warning_required
  traffic_uncertain: warning_required
  stale_price: warning_required
  stale_hours: warning_required
  low_trust_review_signal: warning_required
  weather_sensitive_activity_without_forecast: warning_required
  long_drive_with_children: warning_required
```

Warning planı otomatik iptal etmez; final cevapta görünür olur.

## Fallback örnekleri

```yaml
fallback_examples:
  beach_privacy_unverified:
    unsafe_output: "Kadınlar plajı var, denize gidebilirsiniz."
    safe_output: "Deniz alternatifi için kadınlar plajı doğrulaması gerekir; doğrulanamazsa non-sea aile alternatifi sunulur."
  price_unverified:
    unsafe_output: "Giriş 250 TL."
    safe_output: "Giriş ücreti için güncel doğrulama gerekir; bütçe hesabına kesin fiyat olarak yazılmaz."
  parking_unverified:
    unsafe_output: "Otopark kesin var."
    safe_output: "Otopark bilgisi doğrulanmadı; araçla gidilecekse park belirsizliği uyarısı gösterilir."
```

## Final response etkisi

```yaml
final_response_effects:
  blocker:
    must_be_visible: true
    can_be_hidden_in_details: false
  warning:
    must_be_visible_when_actionable: true
  evidence_gap:
    must_be_disclosed_if_claim_matters: true
  fallback_option:
    should_be_actionable: true
  uncertainty_language:
    required_for_unverified_claims: true
```

## Forbidden behavior

```yaml
forbidden_behavior:
  - fabricate_missing_tool_result
  - hide_provider_failure
  - treat_timeout_as_negative_result
  - treat_empty_result_as_confirmed_false
  - satisfy_hard_constraint_with_low_trust_signal
  - present_unverified_price_as_exact
  - present_unverified_women_only_beach_as_verified
  - remove_user_hard_constraint_to_make_plan_easier
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 09-privacy-sensitive-capability-policy.md
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
retry_code_allowed: false
fallback_code_allowed: false
```
