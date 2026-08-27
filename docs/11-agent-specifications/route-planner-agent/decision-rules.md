# TM-AG-009 — Decision Rules

| ID | Rule | Oracle |
|---|---|---|
| RP-001 | REJECTED candidate kullanılamaz. | entity ref accepted pool'da değilse FAIL |
| RP-002 | Hard constraint scoring penalty değildir. | violated hard constraint + accepted plan = FAIL |
| RP-003 | Bloklar çakışamaz. | `prev.end <= next.start` |
| RP-004 | Transition süresi korunur. | `prev.end + route + buffer <= next.start` |
| RP-005 | Activity/meal slot çalışma penceresiyle uyumlu olmalıdır. | window conflict = reject/verification blocker |
| RP-006 | Hard rest window korunur. | overlap/absence = FAIL |
| RP-007 | Daily drive hard limiti aşılmaz. | total travel > limit = reject |
| RP-008 | Final-arrival deadline hard ise aşılmaz. | final arrival > deadline = reject |
| RP-009 | Check-in/out blokları stay policy ile uyumlu olmalıdır. | conflict = reject/repair |
| RP-010 | `NEEDS_VERIFICATION` hard blocker accepted gibi kullanılamaz. | blocker candidate in verified slot = FAIL |
| RP-011 | Weather signal planı etkileyebilir ama weather fact üretilemez. | new weather claim = R6 FAIL |
| RP-012 | LocalTasteBrief restoran/menu fact'i değildir. | taste knowledge → venue menu inference = FAIL |
| RP-013 | User-fixed stopover sessizce silinemez. | fixed stop missing without conflict record = FAIL |
| RP-014 | Journey segment refs travel/stay/day block handoff boyunca korunur. | dropped ref = provenance FAIL |
| RP-015 | Alternatif gerçek değişiklik içermelidir. | identical block sequence = fake alternative FAIL |
| RP-016 | Yeterli feasible alternatif yoksa sayı uydurulmaz. | invalid/duplicate fillers = FAIL |
| RP-017 | Route fact yoksa TL-005 veya verification need gerekir. | invented duration = FAIL |
| RP-018 | Soft preference hard feasibility'den sonra optimize edilir. | soft objective overrides hard fail = FAIL |
| RP-019 | Accommodation live-unavailable seçilemez. | unavailable stay block = FAIL |
| RP-020 | `CLIMATE_NORMAL` current weather fact olarak plan blocker yapamaz. | climate-as-day-weather = FAIL |

## Deterministic evaluation order

```text
candidate eligibility
→ fixed user choices
→ temporal feasibility
→ route feasibility
→ stay/deadline feasibility
→ hard rest/family constraints
→ weather safety policy
→ soft preference optimization
→ alternative diversity
```

Bu sıra R1 testlerinde sabit oracle olarak kullanılmalıdır.
