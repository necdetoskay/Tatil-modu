# Model Routing Principles

## Purpose
Model routing'in agent ownership, policy safety ve maliyet kontrolünü bozmadan çalışmasını sağlamak.

## Invariants
1. Model hiçbir zaman agent'ın canonical scope'unu genişletemez.
2. Agent'ın capability yetkisi model değişince değişmez.
3. Memory visibility modelden bağımsızdır.
4. Model provider'a doğrudan erişmez; agent runtime yalnız model adapter üzerinden model çağırır.
5. Policy engine ve contract validator sonuçları model çıktısından üstündür.
6. Model seçimi görev riskine, reasoning ihtiyacına, structured-output başarısına ve maliyet/latency profiline göre yapılır.
7. Aynı agent farklı request complexity seviyelerinde farklı tier kullanabilir.
8. Routing kararı trace edilebilir olmalıdır.

## Routing inputları
```yaml
routing_inputs:
  agent_id: required
  task_complexity: low|medium|high|exceptional
  risk_class: low|medium|high|critical
  required_capabilities: []
  structured_output_required: true|false
  context_size_class: small|medium|large
  latency_budget_ms: optional
  cost_budget: optional
  previous_attempt_status: optional
```

## Routing outputu
```yaml
routing_decision:
  model_tier: T0|T1|T2|T3|T4
  candidate_profile_id: required_when_llm
  fallback_profile_id: optional
  max_attempts: required
  reason_codes: []
```

## Forbidden routing
- P0-critical deterministic policy işini LLM'e devretmek
- yalnız model daha güçlü diye capability access genişletmek
- fallback sırasında hard constraint gevşetmek
- structured-output başarısızlığını parse hack ile sessizce kabul etmek
- provider outage nedeniyle doğrulanmamış bilgiyi fact üretmek
