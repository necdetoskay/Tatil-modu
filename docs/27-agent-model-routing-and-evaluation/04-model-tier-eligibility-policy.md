# Model Tier and Eligibility Policy

## Tier definitions
### T0 — No LLM
Deterministic code. Policy enforcement, validation, routing counters, authorization and hard-fail checks.

### T1 — Fast / Small
Low-risk extraction, classification and normalization. Must support stable structured outputs.

### T2 — Balanced
Moderate reasoning, comparison, suitability and evidence-grounded synthesis.

### T3 — Strong Reasoning
Complex multi-constraint planning, reconciliation and difficult verification.

### T4 — Fallback / Judge
Exceptional cases only. Expensive/slow operation acceptable when justified by quality or recovery need.

## Eligibility requirements
Bir model profile belirli tier için ancak aşağıdakileri benchmark ile karşılıyorsa eligible olur:
```yaml
requirements:
  contract_output_support: required
  p0_failures: 0
  instruction_following: threshold_pass
  tool_grounding: threshold_pass_when_applicable
  repeated_run_stability: threshold_pass
  latency_within_tier_budget: required_or_documented_exception
  cost_within_tier_budget: required_or_documented_exception
```

## Tier ceiling
Agent spec varsayılan tier'ın üstüne yalnız escalation policy ile çıkabilir. Tier düşürme yalnız benchmark P0/P1 gate'lerini koruyorsa yapılabilir.

## Critical restrictions
- T4 bile policy engine yerine geçemez.
- Judge modeli kendi ürettiği cevabı tek başına doğrulayamaz; deterministic assertions ve evidence gate kalır.
- Local model, cloud model veya provider markası tier tanımı değildir; benchmark sonucu tier eligibility belirler.
