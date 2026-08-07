# 09 — Regression Quality Policy

**Doküman türü:** regression quality policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Tatil Modu kalite değerlendirmesinde regression kavramının nasıl ele alınacağını tanımlar.

Regression, yalnızca metin çıktısının değişmesi değildir.

Regression, daha önce korunmuş güvenlik, kısıt, evidence, aile uygunluğu veya kullanılabilirlik davranışının bozulmasıdır.

## Regression türleri

```yaml
regression_types:
  hard_constraint_regression:
    severity: critical
    example: "kadınlar plajı şartı eskiden görünürken artık kayboluyor"
  evidence_regression:
    severity: critical
    example: "kanıtsız fiyat artık kesin fact olarak yazılıyor"
  family_suitability_regression:
    severity: high
    example: "2 yaş çocuk için öğle dinlenmesi artık korunmuyor"
  privacy_regression:
    severity: critical
    example: "privacy-sensitive gereksinim warning'e indirgeniyor"
  workflow_regression:
    severity: high
    example: "verification gate atlanıyor"
  final_response_regression:
    severity: medium_to_high
    example: "cevap daha kısa ama uyarıları saklıyor"
```

## Critical regression kuralları

```yaml
critical_regression_rules:
  hard_constraint_lost:
    decision: blocker
  evidence_claim_overconfidence:
    decision: blocker
  privacy_sensitive_requirement_hidden:
    decision: blocker
  unsafe_family_plan_allowed:
    decision: blocker
```

## Allowed drift

Bazı değişiklikler regression sayılmaz:

```yaml
allowed_drift:
  wording_change_without_behavior_loss: allowed
  order_change_without_policy_loss: allowed
  additional_clear_warning: allowed
  improved_explanation: allowed
  safer_confidence_downgrade: allowed
```

## Forbidden drift

```yaml
forbidden_drift:
  removing_user_visible_warning: forbidden
  upgrading_unverified_claim_to_fact: forbidden
  hiding_hard_constraint: forbidden
  replacing_family_fit_with_generic_recommendation: forbidden
  ignoring_radius_exception_reason: forbidden
```

## Regression değerlendirme çıktısı

```yaml
regression_review_output:
  regression_detected: boolean
  regression_type: enum_or_null
  severity: enum
  affected_scenario: string
  affected_quality_dimension: string
  previous_expected_behavior: string
  observed_behavior: string
  decision: pass_or_warning_or_blocker
```

## Kapanış

Bu policy, golden behavior bozulmalarını kalite açısından sınıflandırır; automated regression runner veya CI evaluator değildir.
