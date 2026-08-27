# TM-AG-013 — Adaptive Itinerary Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-013 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 READY |
| Tarih | 2026-08-27 |

## 1. Purpose

Adaptive Itinerary Agent, mevcut itinerary üzerinde yeni bir olay/değişiklik oluştuğunda yalnız **etkilenen kapsamı** onarır.

```text
existing itinerary + verified change signal
→ resolve trigger set
→ impact analysis
→ smallest repair scope
→ candidate/route/time re-evaluation
→ patch affected fragment
→ preserve unaffected scope
→ emit AdaptiveRepairResult
```

## 2. Core principle — targeted repair

> Değişiklik ne kadar küçükse repair scope da mümkün olan en küçük kapsamda kalmalıdır.

Örnek `Day 3 / 15:00 outdoor event cancelled` ise normal durumda Day 1, Day 2, Day 4 ve Day 5 değişmez; yalnız affected block ve zorunlu dependency closure onarılır.

Tüm itinerary'nin yeniden üretilmesi ancak değişiklik global feasibility'yi gerçekten bozuyorsa mümkündür ve açık scope escalation provenance ister.

## 3. Supported triggers

- `WEATHER_RISK_CHANGED`
- `PLACE_CLOSED`
- `OPENING_HOURS_CHANGED`
- `ROUTE_DISRUPTION`
- `ACCOMMODATION_UNAVAILABLE`
- `BUDGET_OVERFLOW`
- `EVENT_CANCELLED` — Issue #51
- `EVENT_POSTPONED` — Issue #51
- `EVENT_CROWD_IMPACT_CHANGED` — Issue #51
- `SEASONAL_OPERATION_CHANGED` — Issue #51
- `USER_PLAN_CHANGE`
- `VERIFICATION_REPAIR_TARGET`
- `CRITICAL_EVIDENCE_STALE`

Trigger fact'i agent uyduramaz; evidence-aware change signal veya verification repair target olarak gelmelidir.

## 4. Inputs

- current itinerary snapshot
- `changeSignals[]`
- hard/soft constraints
- planning policy snapshot
- user-fixed stop/block refs
- current/replacement candidate pool
- current route facts/matrix
- WeatherSignal / OfficialFact / ReviewSignal / EventOccurrence / EventImpactSignal where applicable
- BudgetLedger repair needs
- VerificationResult repair targets
- `contextManifestId`

## 5. Output

Ana çıktı: `AdaptiveRepairResult.v1`.

```yaml
repairId: string
originalItineraryRef: string
triggerRefs: []
triggerResolutions:
  - triggerRef: string
    disposition: APPLIED | NO_EFFECT | DEFERRED | CONFLICTING
    reasonCode: string
    affectedRefs: []
    conflictWithTriggerRefs: []
    evidenceRefs: []
impactScope: object
scopeEscalation: object
patches: []
repairedFragments: object
preservationProofs: []
invalidatedRefs: []
verificationNeeds: []
downstreamRecheckRequests: []
repairStatus: REPAIRED | PARTIAL | BLOCKED | NO_CHANGE_REQUIRED
warnings: []
```

## 6. Multi-trigger resolution

Bir repair birden fazla trigger taşıyabilir. Her trigger ayrı disposition alır:

- `APPLIED`: repair kararına doğrudan etkili.
- `NO_EFFECT`: current plan invariant/objective'i materially etkilemiyor.
- `DEFERRED`: gerekli evidence/recheck tamamlanmadan uygulanamaz.
- `CONFLICTING`: başka trigger ile çözülemeyen çelişki var.

Çelişkili trigger'lar sessizce sıralanamaz veya biri yok sayılamaz. `triggerResolutions[]` tüm input trigger'larını kapsamalıdır.

## 7. Impact scope

```yaml
impactScope:
  directlyAffectedBlockRefs: []
  directlyAffectedSegmentRefs: []
  dependentBlockRefs: []
  dependentSegmentRefs: []
  affectedDayRefs: []
  protectedUnchangedDayRefs: []
```

Bir blok değişti diye aynı günün tamamı otomatik affected sayılmaz; dependency graph gerekçesi gerekir.

## 8. Scope escalation

Escalation seviyeleri:
- `BLOCK`
- `LOCAL_SEQUENCE`
- `DAY`
- `JOURNEY_SEGMENT`
- `MULTI_DAY`
- `FULL_ITINERARY`

`FULL_ITINERARY` yalnız global nedenlerle kullanılabilir: destination erişilemez, ana konaklama zinciri çöktü, kullanıcı tüm tarih/hedefi değiştirdi, global hard constraint değişti veya tüm zaman grafiğini etkileyen büyük route disruption oluştu.

Her escalation `reasonCode + evidenceRefs + dependencyRefs` taşır.

## 9. Patch model

Supported operations:
- `REPLACE_BLOCK`
- `REMOVE_BLOCK`
- `INSERT_BLOCK`
- `MOVE_BLOCK`
- `UPDATE_BLOCK_TIME`
- `REPLACE_ROUTE_LEG`
- `REPLACE_ACCOMMODATION`
- `UPDATE_JOURNEY_SEGMENT`

Her patch trigger/reason/constraint/evidence provenance taşır.

## 10. Preservation proof

Değişmeyen protected scope için before/after hash eşitliği gerekir:

```yaml
preservationProof:
  scopeRef: day_4
  beforeHash: ...
  afterHash: ...
  unchanged: true
```

Protected scope hash değişmişse over-repair veya untracked mutation vardır.

## 11. Shared feasibility invariants

TM-AG-013, TM-AG-009 ile aynı temel kuralları kullanır:
- hard constraint önce,
- block overlap yok,
- route transition fiziksel olarak mümkün,
- opening window uyumu,
- check-in/check-out uyumu,
- rest/family hard policy uyumu,
- final arrival deadline,
- user-fixed stop preservation,
- rejected candidate kullanılmaması.

Repair eski hatayı başka hard violation ile değiştiremez.

## 12. Replacement candidate policy

Öncelik:
1. mevcut accepted alternatives/candidate pool,
2. Issue #50 knowledge/candidate store,
3. yalnız affected scope için targeted `TL-004` discovery,
4. güvenli replacement yoksa `BLOCKED/PARTIAL`.

Knowledge hit dynamic freshness gate'i bypass etmez.

## 13. Issue #49 — multi-city journey repair

Örnek:

```text
Kocaeli → Ankara FULL_DAY → Aksaray OVERNIGHT → Nevşehir
```

Aksaray oteli unavailable olursa mümkünse yalnız Aksaray stay + bağlı arrival/departure/route blokları onarılır; Ankara tam gün planı korunur. Nevşehir bölümü yalnız yeni timing dependency'si varsa etkilenir.

User-fixed stop silinemez; infeasible ise `BLOCKED/PARTIAL` conflict olarak yükseltilir.

## 14. Issue #51 — event/festival/seasonal repair

- confirmed event cancellation → event block + dependent transitions local repair.
- postponement → feasible ise move/local repair; değilse gerekçeli scope escalation.
- crowd-avoid preference → affected venue/peak window değiştirilir, unrelated areas korunur.
- seasonal closure → official current evidence gerekir.

RecurringEventKnowledge exact occurrence fact'i değildir.

## 15. Weather repair

Exact-day repair yalnız fresh FORECAST/current weather evidence ile yapılır. Climate normal exact weather trigger değildir.

## 16. Budget repair

TM-AG-010 repairNeeds cost-driving refs'i hedefler. Hard budget gevşetilmez. Revised itinerary sonrası `BUDGET_RECHECK` + `VERIFICATION_RECHECK` zorunludur.

## 17. Verification repair

TM-AG-014 repair target/dependency closure dışına gereksiz mutation yapılamaz. Repair sonrası Verification yeniden zorunludur.

## 18. Allowed tools

- `TL-004` targeted replacement discovery
- `TL-005` affected route calculation
- `TL-006` current weather refresh
- `TL-010` replacement price/fee lookup
- `TL-011` Calculator
- `TL-012` Schema Validator
- `TL-013` Rule Engine
- `TL-014` Cache

## 19. Forbidden behavior

- default full regeneration,
- hard constraint relaxation,
- user-fixed decision deletion,
- unrelated discovery,
- official event/closure invention,
- review-as-official fact,
- climate-as-weather trigger,
- invented route duration,
- untracked mutation,
- final user response.

## 20. Source policy

- official closure/event status → TM-AG-011 / primary evidence
- weather → TM-AG-007 fresh FORECAST
- crowd/queue experience → TM-AG-012 planning signal only
- route → TM-AG-008
- budget → TM-AG-010
- user change → explicit user source

## 21. Downstream rechecks

- `ROUTE_RECHECK`
- `BUDGET_RECHECK`
- `OFFICIAL_FACT_RECHECK`
- `WEATHER_RECHECK`
- `VERIFICATION_RECHECK`

Mutation sonrası `VERIFICATION_RECHECK` zorunludur.

## 22. Failure modes

- `OVER_REPAIR`
- `UNJUSTIFIED_SCOPE_ESCALATION`
- `HARD_CONSTRAINT_RELAXED`
- `USER_FIXED_DECISION_DROPPED`
- `UNRELATED_DAY_MUTATED`
- `REPLACEMENT_WITHOUT_ROUTE_FEASIBILITY`
- `REPLACEMENT_WITH_STALE_CRITICAL_FACT`
- `EVENT_KNOWLEDGE_AS_OCCURRENCE_FACT`
- `CLIMATE_NORMAL_AS_WEATHER_TRIGGER`
- `BUDGET_REPAIR_WITHOUT_RECHECK`
- `MISSING_BEFORE_AFTER_DIFF`
- `MISSING_PRESERVATION_PROOF`
- `MISSING_TRIGGER_RESOLUTION_TRACE`

## 23. Harness binding

- R0 repair/patch schema
- R1 impact closure, trigger resolution, minimal-scope, hard/time invariants
- R2 recorded change fixtures
- R3 targeted tool integration
- R4 replacement quality/continuity
- R5 cascade/stale/conflicting/no-replacement cases
- R6 over-repair/research/constraint leakage
- R7 controlled live repair
- R8 regressions

## 24. Current status

```yaml
agent_spec_status: golden_v1_ready
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
journey_issue_49_required: true
knowledge_issue_50_required: true
event_season_issue_51_required: true
trigger_resolution_trace_required: true
preservation_proof_required: true
```
