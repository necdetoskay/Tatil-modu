# Structured Event Envelope Design

## Amaç
Tüm observability event'lerinin ortak ve makinece işlenebilir bir envelope yapısıyla taşınmasını tasarlar. Bu belge runtime schema veya logging implementation değildir.

## Mantıksal envelope
```yaml
observability_event:
  event_id: required
  event_name: required
  event_class: required
  timestamp: required
  severity: required
  correlation_id: required
  workflow_id: required
  execution_id: required
  stage_id: optional
  component_id: required
  outcome: optional
  reason_codes: []
  duration_ms: optional
  attempt: optional
  artifact_refs: []
  evidence_refs: []
  decision_refs: []
  quality_report_ref: optional
  cost_ref: optional
  error_class: optional
  redaction_state: required
  attributes: {}
```

## Kurallar
1. Serbest metin message tek canonical veri kaynağı değildir.
2. Outcome ve reason code mümkün olduğunca enum/taxonomy tabanlıdır.
3. Büyük domain payload event içine kopyalanmaz; referansla bağlanır.
4. Sensitive payload varsayılan olarak event attributes içine alınmaz.
5. Event envelope versionlanabilir olmalıdır.
6. Unknown field veya schema evolution eski telemetry consumer'larını sessizce bozmamalıdır.
7. Error stack veya provider cevabı raw biçimde canonical telemetry sayılmaz; privacy/redaction policy uygulanır.

## Minimum viable event
Her kritik event en az `event_name`, `timestamp`, `correlation_id`, `execution_id`, `component_id` ve `redaction_state` taşımalıdır.
