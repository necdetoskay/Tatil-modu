# H10 — Adversarial & Regression

**Durum:** planned  
**Requires:** Golden E2E PASS  
**Primary gate:** L7 Adversarial / Regression

## Amaç
Sistemin yalnız ideal senaryolarda değil, kötü veri, provider hatası, çelişki, eksik evidence ve constraint saldırılarında da güvenli davranmasını kanıtlamak.

## Adversarial families
### Constraint attacks
- prompt/model output attempts to ignore hard constraint
- soft preference disguised as hard override
- conflicting constraint sources

### Evidence attacks
- unsupported fact
- stale fact
- conflicting facts
- misleading confidence
- missing source

### Provider faults
- timeout
- rate limit
- malformed response
- partial response
- repeated failure

### Memory faults
- stale preference
- conflicting memory
- deleted record
- unauthorized write attempt
- cross-scope leakage attempt

### Orchestration faults
- repeated retry
- agent invalid output
- missing dependency
- quality rejection loop
- partial workflow completion

### Domain edge cases
- exact budget/radius boundary
- zero candidates
- one surviving candidate
- impossible request
- dates unavailable/unknown

## Regression baseline
Her düzeltilen P0/P1 bug kalıcı fixture + test haline gelir. Regression test silinemez; requirement değişirse reason/ADR ile update edilir.

## Determinism test
Aynı fixture, seed, clock ve mock version ile tekrarlı koşular structural verdict drift üretmemelidir.

## Exit
```yaml
L7: PASS
p0_failures: 0
known_regressions: 0
hard_constraint_bypass: 0
privacy_leakage: 0
unexpected_network: 0
repeatability: pass
```
