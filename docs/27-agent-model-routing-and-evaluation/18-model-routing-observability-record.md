# Model Routing Observability Record

## Amaç
Bir agent run'ında hangi modelin neden seçildiğini, fallback olup olmadığını ve bunun kalite/maliyet/latency sonucunu sonradan analiz edilebilir hale getirmek.

## Run record
```yaml
model_routing_run:
  trace_id: required
  agent_id: required
  runtime_profile_version: required
  requested_tier: required
  selected_model_profile_id: required
  selection_reason: primary|fallback_same_tier|escalation|judge
  prompt_version: required
  dataset_or_runtime_mode: required
  capability_policy_version: required
  memory_policy_version: required
  attempt: required
  fallback_count: required
  latency_ms: required
  token_usage:
    input: optional
    output: optional
  estimated_cost: optional
  contract_valid: required
  p0_failure: required
  quality_result_ref: optional
  error_code: optional
```

## Privacy rule
Observability kaydı raw sensitive prompt, full memory disclosure veya provider credential içermez.

## Analizler
Bu kayıtlarla:
- agent/model P0 rate,
- fallback frequency,
- tier escalation rate,
- p95 latency,
- average cost,
- contract invalid rate,
- prompt-version regression,
- provider/model drift
izlenebilir.

## Alert candidates
- P0 > 0,
- contract-valid rate düşüşü,
- fallback rate anormal artışı,
- latency/cost budget aşımı,
- belirli model version sonrası kalite düşüşü.

## Deterministic test mode
Fake model run'larında da aynı record shape üretilir; model_profile_id `fake:*` namespace'i kullanabilir.
