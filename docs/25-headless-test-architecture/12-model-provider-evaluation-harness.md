# Model and Provider Evaluation Harness

## Amaç
Gerçek LLM ve provider değişikliklerinin aynı canonical fixture/golden seti üzerinde kalite, güvenlik, maliyet ve latency açısından karşılaştırılmasını sağlar.

## İki mod
```text
Mode A — Deterministic CI
mock providers + fixed fixtures + deterministic/fake model outputs
her committe çalışabilir

Mode B — Controlled Evaluation
real model/provider
aynı golden/adversarial fixtures
tekrarlı koşular ve istatistiksel özet
```

## Ölçümler
- P0/P1/P2 pass rate,
- scenario success rate,
- quality rubric score,
- unsupported claim rate,
- contract failure rate,
- retry/fallback rate,
- average/p95 latency,
- token usage,
- estimated/actual cost,
- provider error rate.

## Tekrarlı LLM koşuları
Nondeterministic model değerlendirmesinde tek koşu yeterli değildir. Senaryonun karar etkisine göre örneğin 10/20/50 tekrar kullanılabilir; gerçek sayı implementation readiness sırasında bütçe ve güven hedefiyle belirlenir.

## Model promotion kuralı
Yeni model yalnız daha ucuz/hızlı olduğu için seçilmez. P0 failure = 0 olmalı; P1 ve quality threshold mevcut approved baseline'ın altına kontrollü istisna olmadan düşemez.

## Sonuç formatı
```yaml
model_eval_result:
  model_id: required
  fixture_set_version: required
  runs: required
  p0_failures: required
  p1_pass_rate: required
  quality_summary: required
  latency_summary: required
  token_summary: optional
  cost_summary: optional
  recommendation: promote|hold|reject
```
