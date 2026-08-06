# Scenario Rubric — Trip Profile Agent

| Scenario | Expected Behavior | Confidence Range | Conflict/Flags |
|----------|-------------------|-----------------|----------------|
| `profile-last-minute` | Tarih esnek, 2 günlük, 5000 TL → `flexibility=flexible_3days` veya `month` | 0.65–0.85 | budget may be low → `budget_unrealistic` flag olabilir |
| `profile-ev-child` | EV + çocuk yaş 2 + erişim → `chargingNeeded=true`, `accessibilityNeeds` dolu | 0.55–0.80 | Bütçe eksik → confidence penalty |
| `profile-unrealistic-budget` | 600 TL / 3 günlük butik → `budget_unrealistic` flag | ≤ 0.50 | `conflictFlags: [budget_unrealistic]` |
| `profile-elderly-accessibility` | 65 yaş, rampalı erişim → `elderlyCount >= 1`, `accessibilityNeeds` dolu | 0.75–0.90 | — |

**Pass threshold per scenario**:
1. Schema geçerli (schemaScore = 1.0)
2. Scenario-specific rule compliance ≥ 0.85
3. Confidence skoru expected range içinde
4. Conflict/flag durumları doğru tespit edilmiş
```
