# Provider Health Model

## 1. Amaç

Providerların kullanılabilirlik, gecikme, hata ve kota durumunu ortak modelle izlemek.

## 2. Health boyutları

```text
availability
latency
error_rate
rate_limit
authentication
schema_compatibility
freshness
cost_anomaly
```

## 3. ProviderHealth

```json
{
  "providerId": "example-provider",
  "capability": "directions",
  "status": "healthy",
  "score": 0.94,
  "checkedAt": "2026-08-06T13:00:00Z",
  "metrics": {
    "availability": 0.999,
    "p95LatencyMs": 420,
    "errorRate": 0.01,
    "rateLimitRemainingRatio": 0.82,
    "schemaCompatibility": 1.0
  },
  "warnings": []
}
```

## 4. Durumlar

```text
healthy
degraded
rate_limited
unavailable
misconfigured
schema_incompatible
unknown
```

## 5. Health score

Başlangıç modeli:

```text
availability        × 0.30
latency             × 0.20
errorRate           × 0.20
rateLimit           × 0.10
schemaCompatibility × 0.10
freshness           × 0.05
costStability       × 0.05
```

## 6. Provider selection etkisi

- healthy: normal seçim,
- degraded: ceza ve fallback hazırlığı,
- rate_limited: yeni çağrı sınırlı,
- unavailable: seçilmez,
- misconfigured: otomatik retry yok,
- schema_incompatible: adapter güncellenene kadar disabled.

## 7. Health check türleri

- passive telemetry,
- active probe,
- synthetic fixture validation,
- schema canary,
- pricing canary.

## 8. Testler

- latency degradation,
- error spike,
- quota exhaustion,
- auth failure,
- schema drift,
- recovery,
- cost anomaly.
