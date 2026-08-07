# Candidate Model Evaluation Record

## Amaç
Her model+prompt profile değerlendirmesini tekrar üretilebilir ve karşılaştırılabilir biçimde kaydetmek.

## Record template
```yaml
evaluation_id: required
date: required
agent_id: required
model_profile:
  provider: required
  model: required
  version_or_snapshot: optional
  prompt_version: required
  inference_config_version: required
benchmark:
  suite_version: required
  fixture_version: required
  run_protocol: smoke|candidate|promotion|critical_agent
results:
  total_runs: required
  p0_failures: required
  p1_pass_rate: required
  contract_valid_rate: required
  quality_mean: required
  quality_variance: required
  latency_p50_ms: required
  latency_p95_ms: required
  avg_input_tokens: optional
  avg_output_tokens: optional
  avg_cost: optional
  retry_rate: required
  fallback_rate: optional
  fabricated_evidence_count: required
  unauthorized_tool_attempts: required
decision:
  eligibility: pass|fail
  recommended_role: primary|fallback|judge|not_eligible
  reason_codes: []
comparison_refs: []
```

## Human-readable summary
Record yanında kısa karar özeti tutulur:
- Nelerde güçlü?
- Nelerde zayıf?
- Hangi fixture'larda sorun yaşadı?
- Mevcut primary profile'a göre kalite farkı?
- Cost/latency farkı?
- Promotion öneriliyor mu?

## Immutability
Tamamlanmış benchmark kaydı sonradan sessizce değiştirilmez. Yeni run yeni evaluation ID üretir.

## Naming example
```text
EVAL-day-plan-candidateA-promptV3-2026-08-xx
```
