# TM-AG-002 — Evaluation Rubric

## Gate order

1. R0 Contract
2. R1 Deterministic rules
3. R2 Fixture replay
4. R4 Semantic quality (yalnız gerektiğinde)
5. R5 Adversarial
6. R6 Authority
7. R8 Regression

R3/R7 external tool testleri bu agent için **N/A**; dış tool erişimi yoktur.

## Hard-fail conditions

- schema invalid,
- hard→soft downgrade,
- soft→hard invention,
- conditional constraint condition'ının düşmesi,
- provenance eksikliği,
- privacy over-inference,
- conflict'in sessiz çözülmesi,
- planning leakage,
- external tool call,
- direct agent call.

## Deterministic scoring

| Alan | Ağırlık |
|---|---:|
| Schema/contract | 20% |
| Strength classification | 25% |
| Condition preservation | 20% |
| Conflict/clarification | 15% |
| Provenance/minimum disclosure | 10% |
| Authority compliance | 10% |

Her hard-fail genel skordan bağımsız olarak `FAIL` üretir.

## Semantic reviewer use

LLM reviewer yalnız şu durumlarda kullanılabilir:

- belirsiz doğal dilde strength interpretation,
- birden fazla preference arasındaki semantic conflict,
- kullanıcı cümlesinin condition scope'unun doğru anlaşılması.

LLM reviewer tek başına PASS veremez.

## Release threshold

```yaml
schema_pass: 100%
critical_rules_pass: 100%
authority_pass: 100%
fixture_pass: 100% for golden critical fixtures
semantic_score_min: 0.85 when semantic review is used
```
