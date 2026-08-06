# Tool Observability Event Standard

## 1. Amaç

Her capability invocation'ın uçtan uca izlenebilirliğini ve maliyet/kalite analizini sağlamak.

## 2. Event türleri

```text
tool.requested
tool.policy_evaluated
tool.cache_checked
tool.provider_selected
tool.started
tool.retry_scheduled
tool.fallback_selected
tool.completed
tool.failed
tool.cancelled
provider.health_changed
circuit.state_changed
budget.threshold_reached
schema.drift_detected
```

## 3. Ortak event alanları

```json
{
  "eventId": "uuid",
  "eventType": "tool.completed",
  "occurredAt": "2026-08-06T13:00:00Z",
  "traceId": "trace",
  "spanId": "span",
  "parentSpanId": null,
  "workflowId": "workflow",
  "agentId": "AG-002",
  "toolId": "TL-005",
  "capabilityId": "directions.matrix",
  "providerId": "provider",
  "executionMode": "live",
  "status": "success",
  "latencyMs": 420,
  "cacheHit": false,
  "estimatedCost": 0.004,
  "actualCost": 0.0038,
  "currency": "USD",
  "attemptCount": 1,
  "fallbackUsed": false,
  "sourceCount": 1,
  "warningCodes": [],
  "errorCode": null
}
```

## 4. Metric ailesi

### Latency

- p50, p95, p99 capability/provider bazında.

### Reliability

- success rate,
- partial rate,
- error rate,
- timeout rate,
- fallback rate.

### Cost

- estimated/actual,
- cache savings,
- failed call cost,
- workflow cost.

### Cache

- hit ratio,
- stale hit,
- negative hit,
- eviction/invalidation.

### Quality

- source coverage,
- freshness,
- provider health,
- schema drift,
- confidence impact.

## 5. Trace ilişkisi

```text
User Request Trace
  ↓ Agent span
    ↓ Tool Gateway span
      ↓ Provider Adapter span
```

Tool eventleri agent ve workflow trace'ine bağlanmalıdır.

## 6. Log seviyesi

```text
debug
info
warning
error
critical
```

Secret ve PII hiçbir seviyede yazılamaz.

## 7. Sampling

- error/critical: %100,
- policy denied: %100,
- live success: configurable,
- fixture regression: gerektiğinde tam,
- high-volume cache hit: sampling uygulanabilir.

## 8. Alert örnekleri

- provider error rate artışı,
- p95 latency eşiği,
- maliyet anomalisi,
- fallback oranı yükselmesi,
- schema drift,
- stale source oranı,
- permission violation denemesi.

## 9. Testler

- trace propagation,
- required event order,
- event schema,
- redaction,
- metrics aggregation,
- failure/fallback events,
- cancellation,
- sampling policy.
