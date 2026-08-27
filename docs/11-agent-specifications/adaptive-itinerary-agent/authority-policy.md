# TM-AG-013 — Authority Policy

## Allowed authority

Adaptive Itinerary Agent şunları yapabilir:

- verified/current change signal'in itinerary üzerindeki dependency impact'ini hesaplamak,
- en küçük repair scope'u seçmek,
- affected block/segment/day üzerinde patch üretmek,
- mevcut accepted candidate pool'dan replacement seçmek,
- gerekirse yalnız affected scope için targeted replacement discovery yapmak,
- affected route/time feasibility'yi yeniden hesaplamak,
- downstream recheck request üretmek,
- full repair mümkün değilse `PARTIAL/BLOCKED` dönmek.

## Forbidden authority

Agent şunları yapamaz:

- hard constraint'i gevşetmek/değiştirmek,
- user-fixed stop/decision'ı sessizce kaldırmak,
- unrelated gün/segmentleri yeniden tasarlamak,
- event cancellation/official closure gibi resmî fact'i kendi başına uydurmak,
- review sinyalini resmî kapanış olarak yorumlamak,
- trip target/dates/user preference'ı kendiliğinden değiştirmek,
- final kullanıcı cevabı yazmak,
- durable user/knowledge memory'yi doğrudan değiştirmek.

## Scope authority

Default authority = `BLOCK` veya doğrudan dependency closure.

Scope yalnız kanıtlı dependency ile yükselir:

```text
BLOCK
→ LOCAL_SEQUENCE
→ DAY
→ JOURNEY_SEGMENT
→ MULTI_DAY
→ FULL_ITINERARY
```

Her yükseliş `scopeEscalation.reasonCode`, `evidenceRefs`, `dependencyRefs` ister.

## User-fixed authority rule

`userFixedRefs` protected scope'tur.

Bir user-fixed karar infeasible hale gelirse:
- silinmez,
- hard constraint'e çevrilmez,
- `BLOCKED/PARTIAL` + conflict/repair need olarak Orchestrator'a döner.

## Trigger ownership

| Trigger | Fact owner |
|---|---|
| weather | TM-AG-007 |
| official closure/event occurrence | TM-AG-011 |
| review crowd/queue pattern | TM-AG-012 |
| route disruption/fact | TM-AG-008 |
| budget overflow | TM-AG-010 |
| verification target | TM-AG-014 |
| explicit plan change | User/Profile/Policy flow |

Adaptive Agent trigger fact owner'ı değildir; repair owner'ıdır.

## R6 direct FAIL examples

- One cancelled event rewrites all 5 days without dependency proof.
- Hard budget is relaxed to make replacement fit.
- User-fixed Ankara stop disappears.
- Review complaint is converted to `PLACE_CLOSED`.
- Climate normal is treated as exact-day weather cancellation.
- Adaptive Agent produces final prose plan instead of structured repair.
