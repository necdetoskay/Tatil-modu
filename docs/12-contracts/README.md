# 12 — Contracts

**Doküman türü:** canonical contract design alanı  
**Durum:** first phase tamamlandı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu klasör, Tatil Modu agent specification setinden çıkan input/output sözleşmelerini koddan önce tasarlamak için kullanılır.

Bu alan runtime schema implementation değildir.

Bu alanın amacı şudur:

```text
Agent'lar hangi veri yapısını alır, hangi veri yapısını üretir, hangi evidence ve validation kurallarıyla handoff yapar?
```

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
schema_code_allowed: false
contract_design_required_before_coding: true
source_of_truth: docs/12-contracts/
input_source: docs/11-agent-specifications/
contract_design_first_phase_completed: true
next_stage: docs/13-fixtures-and-evaluation/
```

Bu klasörde TypeScript type, Zod schema, JSON Schema dosyası veya runtime validator yazılmaz.

Önce contract tasarımı yapılır.

## İlk-phase contract seti

| Sıra | Contract | Dosya | Durum |
|---:|---|---|---|
| 1 | Travel Request Contract | [`travel-request-contract.md`](travel-request-contract.md) | drafted |
| 2 | Constraint Policy Contract | [`constraint-policy-contract.md`](constraint-policy-contract.md) | drafted |
| 3 | Family Suitability Contract | [`family-suitability-contract.md`](family-suitability-contract.md) | drafted |
| 4 | Destination Candidate Contract | [`destination-candidate-contract.md`](destination-candidate-contract.md) | drafted |
| 5 | Route Logistics Contract | [`route-logistics-contract.md`](route-logistics-contract.md) | drafted |
| 6 | Accommodation Fit Contract | [`accommodation-fit-contract.md`](accommodation-fit-contract.md) | drafted |
| 7 | Activity Fit Contract | [`activity-fit-contract.md`](activity-fit-contract.md) | drafted |
| 8 | Day Plan Contract | [`day-plan-contract.md`](day-plan-contract.md) | drafted |
| 9 | Verification Evidence Contract | [`verification-evidence-contract.md`](verification-evidence-contract.md) | drafted |
| 10 | Final Response Contract | [`final-response-contract.md`](final-response-contract.md) | drafted |
| 11 | Common Evidence Envelope | [`common-evidence-envelope.md`](common-evidence-envelope.md) | drafted |
| 12 | Common Error Envelope | [`common-error-envelope.md`](common-error-envelope.md) | drafted |
| 13 | Contract Completion Checklist | [`contract-completion-checklist.md`](contract-completion-checklist.md) | completed |

## Contract standardı

Her contract dosyası aşağıdaki başlıkları içermelidir:

1. Purpose
2. Producer
3. Consumer
4. Input fields
5. Output fields
6. Required fields
7. Optional fields
8. Forbidden fields
9. Evidence requirements
10. Confidence rules
11. Validation rules
12. Failure modes
13. Clarification states
14. Example payload sketch
15. Fixture requirements
16. Backward compatibility notes
17. Open design questions

## Ortak envelope kararı

Bütün agent handoff'ları çıplak veri taşımaz.

Her contract aşağıdaki üst seviye envelope mantığıyla uyumlu olmalıdır:

```yaml
envelope_required: true
contract_version_required: true
producer_agent_required: true
consumer_agent_required: true
trace_id_required: true
evidence_summary_required_when_claims_exist: true
confidence_required: true
validation_status_required: true
```

## Evidence kuralı

Plan, rota, saat, fiyat, otopark, hava, kadınlar plajı, tesis özelliği veya resmi kural içeren her iddia evidence ihtiyacı taşımalıdır.

```yaml
claim_without_evidence_marker: forbidden
unverified_claim_as_fact: forbidden
missing_evidence_must_be_visible: true
```

## Validation kuralı

Contract validation sadece şekil kontrolü değildir.

Validation şunları da kontrol eder:

```text
Hard constraint ihlali var mı?
Evidence eksikliği karar kalitesini düşürüyor mu?
Agent kendisine yasak alan üretmiş mi?
Final kullanıcı cevabına taşınmaması gereken iç alan var mı?
```

## Contract yazım ilkeleri

1. Contract isimleri agent isimlerine benzeyebilir ama agent'ın iç prompt'unu kopyalamaz.
2. Contract sadece aktarılacak veriyi tanımlar.
3. Runtime provider, API, database, UI component veya framework seçimi içermez.
4. Evidence, confidence ve validation alanları contract'ın parçasıdır.
5. Her contract fixture üretilebilir olacak kadar net yazılır.
6. Geriye dönük uyumluluk için version alanı zorunludur.
7. Clarification gerektiren durumlar explicit state olarak taşınır.

## Contract completion

Tamamlanma kararı `contract-completion-checklist.md` içinde kayıt altına alınmıştır.

```yaml
contract_completion_checklist: contract-completion-checklist.md
contract_design_first_phase_completed: true
```

## Current status

```yaml
contract_design_state: first_phase_completed
completed_contracts:
  - travel-request-contract.md
  - constraint-policy-contract.md
  - family-suitability-contract.md
  - destination-candidate-contract.md
  - route-logistics-contract.md
  - accommodation-fit-contract.md
  - activity-fit-contract.md
  - day-plan-contract.md
  - verification-evidence-contract.md
  - final-response-contract.md
  - common-evidence-envelope.md
  - common-error-envelope.md
  - contract-completion-checklist.md
next_stage: docs/13-fixtures-and-evaluation/
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
```
