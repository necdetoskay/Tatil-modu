# 07 — Final Response Assembly Workflow

**Doküman türü:** final response assembly workflow design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya final kullanıcı cevabının hangi approved data package üzerinden oluşturulacağını ve hangi bilgilerin kesin/uyarı/evidence gap olarak yazılacağını tanımlar.

## Ana karar

```yaml
workflow_id: final_response_assembly_workflow
workflow_state: drafted
implementation_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/16-workflows/07-final-response-assembly-workflow.md
```

## Flow

```text
1. Coherent day plan package alınır.
2. Verification Evidence report uygulanır.
3. Hard blockers ve unresolved questions ayrılır.
4. Confidence ve disclosure summary hazırlanır.
5. Final Response Composer kullanıcıya dönük metni yazar.
6. Final response quality gate çalışır.
```

## Final response source rule

Final Response Composer yalnız orchestrator tarafından verilen veriyi kullanır.

```text
Yeni fiyat, yeni saat, yeni kaynak, yeni rota veya yeni otel bilgisi icat edemez.
```

## Required final sections

```yaml
required_sections:
  - executive_summary
  - assumptions_or_missing_info
  - daily_plan_cards
  - alternatives_and_fallbacks
  - evidence_disclosures
  - hard_blockers_or_warnings
  - confidence_summary
```

## Disclosure rules

```yaml
disclosure_rules:
  unverified_price: visible_warning
  unverified_opening_hours: visible_warning
  unverified_parking: visible_warning
  unverified_weather: visible_warning
  unverified_women_only_beach: hard_or_soft_block_depending_on_constraint
  out_of_radius_exception: visible_reason_required
```

## Forbidden outputs

```yaml
forbidden_outputs:
  - invented_source
  - exact_price_without_evidence
  - exact_opening_hours_without_evidence
  - hidden_hard_blocker
  - final_response_claiming_verified_when_unverified
  - too_polished_but_constraint_violating_answer
```

## Current status

```yaml
workflow_state: drafted
next_artifact: 08-error-retry-fallback-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
