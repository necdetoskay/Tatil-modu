# 11 — Quality Report Contract Design

**Doküman türü:** quality report contract design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Quality Engine'in değerlendirme sonucunu hangi yapısal alanlarla raporlayacağını tasarlar.

Bu dosya schema code, Zod validator veya runtime contract değildir.

## Quality report ana yapısı

```yaml
quality_report:
  report_id: string
  evaluated_artifact: string
  evaluation_scope: enum
  overall_decision: enum
  overall_confidence: enum
  blockers: list
  warnings: list
  dimension_results: list
  evidence_gaps: list
  regression_flags: list
  revision_recommendations: list
  final_response_readiness: enum
```

## Overall decision değerleri

```yaml
overall_decision_values:
  pass:
    meaning: "çıktı kalite açısından kabul edilebilir"
  pass_with_warnings:
    meaning: "çıktı verilebilir ama uyarılar görünmelidir"
  needs_revision:
    meaning: "çıktı revize edilmelidir"
  blocked:
    meaning: "çıktı bu haliyle kullanılamaz"
```

## Dimension result yapısı

```yaml
dimension_result:
  dimension_id: string
  score_band: enum
  confidence: enum
  blockers: list
  warnings: list
  notes: string
  required_revision: string_or_null
```

## Blocker yapısı

```yaml
blocker:
  blocker_id: string
  blocker_type: enum
  severity: hard_blocker
  affected_claim_id: string_or_null
  affected_contract: string_or_null
  user_visible_summary: string
  required_revision: string
  final_response_allowed: false
```

## Warning yapısı

```yaml
warning:
  warning_id: string
  warning_type: enum
  affected_claim_id: string_or_null
  user_visible_summary: string
  recommended_disclosure: string
  final_response_allowed: true
```

## Evidence gap yapısı

```yaml
evidence_gap:
  claim_type: enum
  claim_text: string
  required_evidence: string
  current_status: missing_or_stale_or_low_trust
  user_visible_disclosure_required: boolean
```

## Revision recommendation yapısı

```yaml
revision_recommendation:
  recommendation_id: string
  target_artifact: string
  reason: string
  required_change: string
  priority: enum
```

## Final response readiness

```yaml
final_response_readiness:
  ready: "final response verilebilir"
  ready_with_disclosures: "final response verilebilir ama disclosure zorunlu"
  revise_before_final: "final response öncesi revizyon gerekir"
  blocked: "final response bu haliyle verilemez"
```

## Kapanış

Quality Report Contract Design, kalite değerlendirmesinin nasıl raporlanacağını tanımlar; runtime schema implementation değildir.
