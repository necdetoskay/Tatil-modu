# Tool Architecture Test Standard

## 1. Contract test

- request schema,
- result schema,
- capability version,
- required metadata,
- additionalProperties politikası.

## 2. Adapter test

- valid response,
- empty response,
- partial response,
- invalid provider schema,
- timeout,
- rate limit,
- authentication,
- source mapping,
- cost mapping,
- secret redaction.

## 3. Gateway behavioral test

- cache first,
- provider selection,
- denied provider,
- budget exceeded,
- retry limit,
- fallback,
- stale data,
- trace propagation.

## 4. Execution mode test

- fixture dış çağrı yapmaz,
- hybrid doğru capability'yi live çalıştırır,
- live secret yoksa fail,
- replay deterministik sonuç verir.

## 5. Non-functional test

- latency,
- concurrency,
- rate-limit safety,
- circuit breaker,
- memory,
- log volume,
- cost accuracy.

## 6. Kritik geçme koşulları

- secret leakage = 0,
- schema validity = %100,
- fixture determinism = %100,
- retry policy violation = 0,
- policy denied çağrı gerçekleşmez,
- bütçe üstü çağrı gerçekleşmez,
- fallback sessizce yapılmaz.
