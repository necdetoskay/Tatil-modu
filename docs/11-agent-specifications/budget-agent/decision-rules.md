# TM-AG-010 — Decision Rules

| ID | Rule | Oracle |
|---|---|---|
| BG-001 | UNKNOWN cost zero sayılamaz. | unknown item excluded from totals but unknown count increments |
| BG-002 | knownTotal yalnız LIVE/OFFICIAL. | estimated/unknown included → FAIL |
| BG-003 | projectedTotal known + ESTIMATED. | unknown included as 0/value → FAIL |
| BG-004 | MISMATCHED context live quote invalid. | mismatched LIVE counted → FAIL |
| BG-005 | stale LIVE current sayılmaz. | stale live counted as current → FAIL |
| BG-006 | duplicate dedupeKey double-count edilemez. | duplicate total contribution → FAIL |
| BG-007 | quantity × unit deterministic eşleşmeli. | arithmetic mismatch → FAIL |
| BG-008 | conversion evidence yoksa currencies birleşmez. | invented FX → FAIL |
| BG-009 | hard limit fail → OVER_BUDGET. | WITHIN/PROVISIONAL with hard fail → FAIL |
| BG-010 | unknown critical exposure varsa WITHIN_BUDGET olamaz. | false certainty → FAIL |
| BG-011 | taxesFeesKnown=false/null finality düşürür. | no warning/confidence impact → FAIL |
| BG-012 | Budget Agent itinerary değiştiremez. | selected entity/block removed/replaced → R6 FAIL |
| BG-013 | repair need affected itinerary refs taşır. | untraceable repair → FAIL |
| BG-014 | SHOPPING knowledge price değildir. | cultural product knowledge as current price → FAIL |
| BG-015 | category hard limit separately evaluated. | only overall total checked → FAIL |
| BG-016 | soft budget limit hard rejection üretmez. | soft limit becomes blocking hard fail → FAIL |
| BG-017 | source amount/currency korunur. | normalized amount without source trace → FAIL |
| BG-018 | same target currency conversionRef null olabilir. | forced fake conversion ref → FAIL |

## Assessment precedence

```text
hard budget fail → OVER_BUDGET
else incomparable/missing critical currency data → UNKNOWN
else critical unknown exposure → PROVISIONALLY_WITHIN
else within all applicable hard limits → WITHIN_BUDGET
```
