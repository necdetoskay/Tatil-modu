# 07 — Evidence and Verification Prompting

**Doküman türü:** evidence and verification prompting design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya, promptların doğrulama ihtiyacı, evidence envelope, confidence, freshness ve disclosure davranışını nasıl taşıyacağını tanımlar.

Bu dosya canlı kaynak doğrulaması veya tool çağrısı içermez.

## Ana karar

```yaml
artifact_id: evidence_and_verification_prompting
artifact_state: drafted
implementation_allowed: false
live_tool_call_allowed: false
runtime_prompt_engine_allowed: false
source_of_truth: docs/15-prompts/07-evidence-and-verification-prompting.md
```

## Temel ilke

```text
Doğrulama isteyen bilgi prompt ile kesinleştirilemez.
Prompt yalnızca bu bilginin verification need, evidence gap, warning veya blocker olarak taşınmasını sağlar.
```

## Evidence instruction pattern

```text
If a claim requires verification and verified evidence is not provided, do not present it as a fact.

Mark it as an evidence gap, warning, unresolved verification need, or blocker according to the relevant contract.

Preserve confidence, freshness, source summary, and user visibility fields when available.
```

## Verification isteyen claim türleri

```yaml
verification_required_claims:
  - exact_price
  - availability
  - opening_hours
  - route_duration
  - traffic_status
  - parking_status
  - weather_forecast
  - facility_status
  - age_restriction
  - women_only_beach_or_privacy
  - official_closure_or_holiday_status
```

## Evidence-aware language

```yaml
evidence_language:
  verified:
    allowed_style: "verified but still source-aware"
  partially_verified:
    allowed_style: "qualified and cautious"
  unverified:
    allowed_style: "not a fact; disclose need"
  conflicting:
    allowed_style: "conflict visible; no confident final claim"
  unavailable:
    allowed_style: "evidence gap or fallback"
```

## Prompt yasakları

```yaml
forbidden_prompt_instructions:
  - assume_current_price
  - assume_opening_hours
  - assume_parking_available
  - assume_weather
  - assume_women_only_beach_exists
  - trust_user_review_as_official_fact
  - hide_evidence_gap_for_smoother_answer
```

## Final response etkisi

Final Response Composer için özel kural:

```text
Final response composer may explain evidence gaps, but must not resolve them by inventing facts.
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 08-hard-constraint-and-safety-prompting.md
implementation_allowed: false
live_tool_call_allowed: false
runtime_prompt_engine_allowed: false
```
