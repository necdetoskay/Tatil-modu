# Repeated Run and Statistical Evaluation Protocol

## Amaç
Stochastic model davranışını tek örnek yanıtla değil, tekrarlı ölçümle değerlendirmek.

## Run classes
```yaml
smoke:
  runs_per_case: 3
  purpose: fast screening
candidate:
  runs_per_case: 10
  purpose: shortlist comparison
promotion:
  runs_per_case: 30
  purpose: routing eligibility
critical_agent:
  runs_per_case: 50
  purpose: verification/day-planning/high-risk final decision
```

Kesin run sayısı maliyet analizine göre değiştirilebilir; P0 confidence düşürülemez.

## Fixed variables
Aynı comparison batch içinde mümkün olduğunca sabit tutulur:
- fixture version
- prompt version
- contract version
- capability fixture version
- memory snapshot
- temperature/reasoning configuration when supported
- timeout policy

## Recorded metrics
Her run için:
```yaml
model_profile
agent_id
case_id
run_id
contract_valid
p0_failures
p1_failures
quality_scores
latency_ms
input_tokens
output_tokens
estimated_cost
retry_count
fallback_used
```

## Aggregate metrics
- P0 failure count/rate
- contract-valid rate
- P1 pass rate
- mean/median quality
- quality variance
- p50/p95 latency
- mean/p95 cost
- retry rate
- consistency rate

## Acceptance order
1. P0 = 0
2. contract-valid threshold
3. core P1 threshold
4. quality distribution
5. stability
6. latency/cost

Maliyet avantajı üstteki correctness koşullarını telafi edemez.

## Comparative fairness
İki model farklı prompt optimizasyonu ile karşılaştırılabilir, fakat prompt version ayrı profile olarak kaydedilir. Model+prompt kombinasyonu değerlendirme birimidir.
