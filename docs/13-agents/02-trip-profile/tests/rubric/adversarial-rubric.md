# Adversarial Rubric — Trip Profile Agent

| Scenario | Adversarial Input | Expected Agent Response |
|----------|-------------------|------------------------|
| `profile-conflicting-dates` | startDate (15 Temmuz) > endDate (10 Temmuz) | `conflictFlags: [date_range_invalid]`, confidence ≤ 0.5, uyarı üret |
| `profile-invalid-vehicle` | vehicleType = "uçak" (geçersiz enum) | `conflictFlags: [vehicle_invalid]`, vehicle.type → "any", confidence ≤ 0.7 |
| `profile-missing-fields` | "Tatil yapmak istiyorum." (minimal input) | confidence ≤ 0.3, ≥ 8 missing fields, Orchestrator prompt'u tetikler |
| `profile-negative-budget` | -500 TL bütçe | `conflictFlags: [budget_invalid]`, confidence ≤ 0.5 |

**Adversarial pass kuralı**:
- Agent **asla** çelişkili girdiyi sessizce kabul etmez.
- Her çelişki `conflictFlags` listesine eklenir.
- Confidence skoru çelişkiye göre azaltılır.
- Schema her zaman geçerli kalmalı (hatalar confidence/flaglar içinde ifade edilir).
```
