# Agent Model Requirement Matrix

## Amaç
Her agent için modelden beklenen minimum yetenek seviyesini ve varsayılan tier'ı tanımlar. Bu tablo production model adı seçmez; yalnız gereksinimi sabitler.

| Agent | Ana iş | Varsayılan tier | Escalation | Kritik model özellikleri |
|---|---|---|---|---|
| Trip Intake Agent | request extraction, ambiguity, normalization | T1 | T2 | yüksek structured-output doğruluğu, düşük latency |
| Constraint & Policy Agent | constraint extraction/interpretation; final enforcement deterministic | T1 | T2 | instruction following, düşük hallucination; policy override yetkisi yok |
| Family Suitability Agent | yaş/aile bağlamı ve uygunluk analizi | T2 | T3 | contextual reasoning, conservative uncertainty handling |
| Destination Candidate Agent | candidate generation/synthesis | T2 | T3 | diversity, evidence-aware synthesis, tool result grounding |
| Route & Logistics Agent | rota/park/travel-load yorumlama | T2 | T3 | numeric/tool interpretation, low hallucination |
| Accommodation Fit Agent | aile uygunluğu ve trade-off | T2 | T3 | comparison, evidence use, constraint retention |
| Activity Fit Agent | aktivite/yaş/hava/privacy uygunluğu | T2 | T3 | multi-factor reasoning, evidence discipline |
| Day Plan Composer Agent | gün bazlı planlama ve pacing | T3 | T4 | strong planning, multi-constraint reasoning, coherence |
| Verification & Evidence Agent | claim/evidence reconciliation | T3 | T4 | very low hallucination, contradiction detection, calibrated uncertainty |
| Final Response Composer Agent | approved state'i kullanıcı çıktısına dönüştürme | T2 | T3 | faithful composition, no new facts, structure adherence |

## T0 kullanımı
Aşağıdaki işler agent modeli değildir ve T0 deterministic katmanda kalır:
- contract validation
- schema parsing
- hard constraint enforcement
- precedence resolution
- eligibility gates
- retry counters
- trace propagation
- memory authorization
- deterministic quality hard-fail rules

## Agent-specific acceptance emphasis
### Trip Intake
En önemli metrikler contract-valid extraction, ambiguity detection ve düşük cost/latency'dir.

### Verification & Evidence
En önemli metrik P0 hallucination/unsupported claim rate'tir. Cost ikinci plandadır.

### Day Plan Composer
En önemli metrik constraint preservation + coherence + family pacing kombinasyonudur.

### Final Response Composer
Yeni fact üretme oranı sıfır olmalıdır; yalnız approved structured state'i sunar.

## Escalation rule
Escalation yalnız tanımlı neden koduyla olur:
```yaml
allowed_escalation_reasons:
  - repeated_structured_output_failure
  - ambiguity_above_threshold
  - multi_constraint_complexity_high
  - evidence_conflict_high
  - quality_review_requires_replan
```
Daha güçlü model sırf mevcut diye otomatik seçilmez.
