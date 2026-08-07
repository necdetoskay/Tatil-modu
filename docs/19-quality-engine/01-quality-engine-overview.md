# 01 — Quality Engine Overview

**Doküman türü:** quality engine overview  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Tatil Modu Quality Engine tasarımının genel sınırını ve sorumluluğunu tanımlar.

Quality Engine'in görevi plan üretmek değildir.

Quality Engine'in görevi, üretilen planın güvenli, kullanılabilir, aileye uygun, kanıt açısından dürüst ve contract/policy uyumlu olup olmadığını değerlendirmektir.

## Ana karar

```yaml
quality_engine_role: reviewer_and_risk_classifier
plan_generation_allowed: false
runtime_reviewer_allowed: false
scoring_engine_allowed: false
ci_evaluator_allowed: false
source_of_truth: docs/19-quality-engine/01-quality-engine-overview.md
```

## Quality Engine neyi kontrol eder?

```yaml
review_targets:
  - hard_constraint_compliance
  - policy_priority_compliance
  - family_suitability
  - toddler_rest_and_fatigue
  - privacy_sensitive_requirements
  - evidence_and_confidence_disclosure
  - route_logistics_realism
  - day_plan_coherence
  - alternative_quality
  - final_response_clarity
  - regression_risk
```

## Quality Engine ne yapmaz?

```yaml
not_allowed:
  - new_travel_plan_generation
  - hidden_replanning
  - live_tool_call
  - provider_lookup
  - memory_write
  - final_response_invention
  - policy_override
  - hard_constraint_relaxation
```

## Review yaklaşımı

Quality Engine, tek bir toplam puana indirgenmiş kalite anlayışını yeterli görmez.

Aşağıdaki yapı birlikte değerlendirilir:

```yaml
quality_assessment_parts:
  blockers: "final response veya planı durduran kritik ihlaller"
  warnings: "kullanıcıya görünmesi gereken kalite riskleri"
  scores: "boyut bazlı kalite sinyalleri"
  confidence: "değerlendirmenin güven seviyesi"
  evidence_gaps: "doğrulanamadığı için kesin yazılamayacak alanlar"
  regression_flags: "önceki golden davranışa göre bozulmalar"
```

## Kritik ilke

```text
Güzel yazılmış bir tatil planı, hard constraint ihlali veya kanıtsız kesin bilgi içeriyorsa kaliteli değildir.
```

## Downstream bağlantılar

```yaml
input_contracts:
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

output_artifacts:
  - quality_report
  - blocker_list
  - warning_list
  - revision_recommendations
  - final_response_readiness_decision
```

## Kapanış

Bu dosya Quality Engine'in plan üretmeyen, policy override etmeyen ve runtime implementation olmayan review katmanı olduğunu tanımlar.
