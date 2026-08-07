# Mock Capability Response Standard

## Shape
```yaml
mock_capability_response:
  response_id: required
  capability_id: required
  request_match: {}
  status: success|empty|partial|timeout|rate_limited|provider_error|malformed
  latency_ms: integer
  payload: optional
  evidence:
    source_type: official|provider|review_signal|synthetic
    source_ref: optional
    observed_at: ISO-8601
    freshness_class: fresh|aging|stale|unknown
  fault:
    enabled: false
    code: optional
```

## Determinism
Aynı request match + fixture version aynı response'u üretmelidir.

## Failure cases
Capability bundle en az şu failure tiplerini desteklemelidir:
- timeout
- rate limit
- empty result
- malformed data
- stale data
- contradictory sources
- partial evidence

## Evidence distinction
Mock response 'truth' değildir; yalnız test evidence girdisidir. Verification Agent/policy gerektiğinde bunu reddedebilir.

## No-network guarantee
Fixture execution sırasında mock response tanımlı değilse canlı provider'a fallback yapılmaz; test fail eder.
