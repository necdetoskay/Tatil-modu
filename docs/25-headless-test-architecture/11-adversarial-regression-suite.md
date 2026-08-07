# Adversarial and Regression Suite

## Amaç
Headless core'un yalnız happy-path senaryolarda değil, çelişkili, eksik, yanıltıcı ve geçmişte problem üretmiş girdilerde de canonical sınırları koruduğunu doğrulamak.

## Adversarial sınıflar
- contradictory user constraints,
- misleading provider payload,
- stale evidence,
- malformed tool result,
- prompt-injection-like untrusted source content,
- memory conflict,
- extreme budget/radius combination,
- repeated retry failure,
- partial agent output,
- quality score masking attempt.

## Regression kaynakları
1. Golden scenario davranışları,
2. production öncesi bulunan bug'lar,
3. model/provider değişiminde bozulan invariant'lar,
4. contract migration regressions,
5. policy precedence regressions.

## P0 kuralı
Geçmişte kapatılmış bir P0 bug tekrar ortaya çıkarsa release/readiness gate otomatik FAIL olur.

## Gate
```yaml
suite: L7_adversarial_regression
p0_pass_rate: 100%
known_regressions_allowed: 0
ui_unlock_blocking: true
```
