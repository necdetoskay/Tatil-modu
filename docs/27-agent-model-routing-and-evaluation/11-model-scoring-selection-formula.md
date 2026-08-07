# Model Scoring and Selection Formula

## Amaç
Model seçimini subjektif izlenim yerine gate + weighted scoring yaklaşımına bağlamak.

## Stage 1 — Eligibility Gate
Bir model profile aşağıdakilerden herhangi birini ihlal ederse skor hesaplanmadan elenir:
```yaml
p0_failures: must_equal_0
contract_valid_rate: must_meet_agent_threshold
unauthorized_tool_attempts: must_equal_0
fabricated_evidence: must_equal_0
hard_constraint_loss: must_equal_0
```

## Stage 2 — Weighted Score
Eligibility geçen modeller agent bazlı ağırlıklarla puanlanır.

Önerilen genel çerçeve:
```yaml
correctness_and_P1: 0.35
quality: 0.25
stability: 0.15
latency: 0.10
cost: 0.10
retry_efficiency: 0.05
```

Ağırlıklar agent'a göre değişebilir.

### Verification & Evidence örneği
```yaml
correctness_and_P1: 0.45
quality: 0.25
stability: 0.20
latency: 0.05
cost: 0.05
```

### Trip Intake örneği
```yaml
correctness_and_P1: 0.40
quality: 0.15
stability: 0.15
latency: 0.15
cost: 0.15
```

## Pareto rule
İki model benzer correctness/quality sağlıyorsa daha düşük cost/latency profile tercih edilir.

## Selection result
```yaml
agent_id: required
selected_primary_profile: required
selected_fallback_profile: optional
eligible_alternatives: []
rejected_profiles:
  - profile_id
  - reason_codes
benchmark_record_ref: required
```

## Anti-pattern
Tek bir toplam skor, P0 failure'ı gizleyemez. Eligibility gate her zaman weighted score'dan önce gelir.
