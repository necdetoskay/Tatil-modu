# Tool Runtime Controls Test Standard

## Cache

- canonical key üretimi,
- TTL,
- stale_if_error,
- negative cache,
- invalidation,
- privacy-safe key.

## Rate limit

- bucket consumption,
- concurrency,
- queue deadline,
- provider header sync,
- retry storm prevention.

## Circuit breaker

- closed→open,
- open→half-open,
- half-open→closed,
- auth misconfiguration,
- schema incompatibility.

## Cost

- estimate,
- actual,
- budget gate,
- cache savings,
- provider pricing version.

## Permission

- allow,
- deny,
- consent,
- conditional constraints,
- no policy bypass.

## Health

- degraded provider score,
- unavailable provider exclusion,
- recovery,
- schema drift.

## Kritik kriterler

- policy denied çağrı sayısı: 0
- budget üstü çağrı sayısı: 0
- secret leakage: 0
- circuit açık provider çağrısı: 0
- fixture mode external call: 0
