# Gate, Policy and Quality Observability

## Amaç
Decision Policy Engine ve Quality Engine sonuçlarının nedenleriyle birlikte görünür olmasını sağlar; bu katman karar üretmez veya yeniden puanlama yapmaz.

## Gate observability
Her gate evaluation için en az:
```yaml
gate_observation:
  gate_id: required
  gate_type: required
  outcome: pass|conditional_pass|revise|block
  reason_codes: []
  decision_ref: required
  stage_id: required
  correlation_id: required
```

## İzlenecek sinyaller
- gate evaluations total
- block rate by gate type
- revise rate by gate type
- conditional pass rate
- hard constraint blocker count
- privacy-sensitive blocker count
- budget hard-limit blocker count

## Quality observability
Quality Engine sonucu için:
- review outcome
- blocker count
- warning count
- dimension scores referansı
- revision target stage
- repeated regression flag
- finalization eligibility

## Kritik ayrım
Observability quality score üretmez. Quality Engine'in ürettiği quality report'a referans verir.

## Revision trace
Quality kaynaklı revision şu zinciri korumalıdır:
```text
quality_report_ref
→ blocker/reason code
→ target stage
→ revision execution
→ new quality report
```

## Kurallar
1. Hard blocker oranları görünür olmalıdır.
2. Aynı reason code'un tekrarlanan görülmesi regression sinyali olabilir.
3. Policy outcome ile Orchestrator route action birlikte trace edilebilir olmalıdır.
4. Quality score telemetry dashboard için kopyalanabilir ama canonical kaynak quality report'tur.
5. Privacy-sensitive reason code raw preference içeriğini taşımamalıdır.
