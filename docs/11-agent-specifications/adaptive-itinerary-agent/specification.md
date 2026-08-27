# TM-AG-013 — Adaptive Itinerary Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-013 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Adaptive Itinerary Agent, mevcut itinerary üzerinde yeni bir olay/değişiklik oluştuğunda yalnız **etkilenen kapsamı** onarır.

```text
existing itinerary + verified change signal
→ impact analysis
→ smallest repair scope
→ candidate/route/time re-evaluation
→ patch affected fragment
→ preserve unaffected scope
→ emit AdaptiveRepairResult
```

## 2. Core principle — targeted repair

Bu agent'ın temel invariant'ı:

> Değişiklik ne kadar küçükse repair scope da mümkün olan en küçük kapsamda kalmalıdır.

Örnek:

```text
Day 3 / 15:00 outdoor event cancelled
```

normal durumda:
- Day 1 değişmez,
- Day 2 değişmez,
- Day 3 yalnız affected block ve zorunlu komşu transition'lar değişir,
- Day 4/5 değişmez.

Tüm itinerary'nin yeniden üretilmesi ancak değişiklik gerçekten global feasibility'yi bozuyorsa mümkündür ve açık `scopeEscalationReason` ister.

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

- current `DraftItinerary` / verified itinerary snapshot
- `changeSignals[]`
- applicable hard/soft constraints
- current planning policy snapshot
- user-fixed stop/block decisions
- current candidate pool and replacement candidates where available
- current route facts/matrix where available
- WeatherSignal / OfficialFact / ReviewSignal / EventOccurrence / EventImpactSignal where applicable
- BudgetLedger repair needs where applicable
- VerificationResult repair targets where applicable
- `contextManifestId`

## 5. Output

Ana çıktı: `AdaptiveRepairResult.v1`.

```yaml
repairId: string
originalItineraryRef: string
triggerRefs: []
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

## 6. Impact scope

Impact analysis önce yapılır.

```yaml
impactScope:
  directlyAffectedBlockRefs: []
  directlyAffectedSegmentRefs: []
  dependentBlockRefs: []
  dependentSegmentRefs: []
  affectedDayRefs: []
  protectedUnchangedDayRefs: []
```

Bir blok değişti diye aynı günün tamamı otomatik affected sayılmaz. Dependency graph üzerinden gerekçe gerekir.

## 7. Scope escalation

Başlangıç repair scope'u en küçüktür.

Escalation seviyeleri:
- `BLOCK`
- `LOCAL_SEQUENCE`
- `DAY`
- `JOURNEY_SEGMENT`
- `MULTI_DAY`
- `FULL_ITINERARY`

`FULL_ITINERARY` yalnız açık global nedenlerle kullanılabilir:
- final destination artık erişilemez,
- ana konaklama zinciri tamamen çöktü,
- kullanıcı tüm tarihleri/hedefi değiştirdi,
- global hard constraint değişti,
- tüm downstream zaman grafiğini etkileyen büyük rota disruption'ı.

Her escalation `reasonCode + evidenceRefs + dependencyRefs` taşır.

## 8. Patch model

Supported patch operations:
- `REPLACE_BLOCK`
- `REMOVE_BLOCK`
- `INSERT_BLOCK`
- `MOVE_BLOCK`
- `UPDATE_BLOCK_TIME`
- `REPLACE_ROUTE_LEG`
- `REPLACE_ACCOMMODATION`
- `UPDATE_JOURNEY_SEGMENT`

Her patch:

```yaml
patchId: string
operation: string
targetRef: string
beforeRef: string|null
afterRef: string|null
reasonCodes: []
triggerRefs: []
constraintRefs: []
evidenceRefs: []
```

## 9. Preservation proof

Targeted repair yalnız patch listesiyle kanıtlanmaz; değişmeyen kapsam için preservation proof taşınır.

```yaml
preservationProof:
  scopeRef: day_4
  beforeHash: ...
  afterHash: ...
  unchanged: true
```

Protected scope hash değişmişse repair minimal değildir veya gerekçesiz mutation vardır.

## 10. Shared feasibility invariants

TM-AG-013, TM-AG-009 ile aynı temel feasibility kurallarını kullanır:
- hard constraint önce,
- block overlap yok,
- route transition fiziksel olarak mümkün,
- opening window uyumu,
- check-in/check-out uyumu,
- rest/family hard policy uyumu,
- final arrival deadline,
- user-fixed stop preservation,
- rejected candidate kullanılmaması.

Repair eski hatayı başka bir hard violation ile değiştiremez.

## 11. Replacement candidate policy

Öncelik:
1. mevcut accepted alternative/candidate pool,
2. aynı lokasyon/gün için önceden araştırılmış knowledge/candidates,
3. yalnız gerekli repair scope için targeted `TL-004` discovery,
4. yeterli güvenli replacement yoksa `BLOCKED/PARTIAL`.

Broad destination rediscovery yasaktır.

Issue #50 knowledge hit mevcutsa gereksiz broad search yapılmaz; stale dynamic facts yeniden doğrulanmalıdır.

## 12. Issue #49 — multi-city journey repair

Journey repair segment-aware olmalıdır.

Örnek:

```text
Kocaeli → Ankara FULL_DAY → Aksaray OVERNIGHT → Nevşehir
```

Aksaray oteli unavailable olursa:
- mümkünse yalnız Aksaray stay + bağlı arrival/departure blokları onarılır,
- Ankara tam gün planı sebepsiz değiştirilmez,
- Nevşehir final planı ancak yeni travel timing etkiliyorsa değişir.

User-fixed stop silinemez; infeasible ise conflict olarak kullanıcı/Orchestrator'a yükseltilir.

## 13. Issue #51 — event/festival repair

### Event cancelled
Confirmed cancellation:
- event block invalidated,
- yalnız event block ve bağlı route/meal/rest transition'ları repair edilir.

### Event postponed
Yeni saat/gün mevcut itinerary ile uyumluysa local move/replace yapılabilir. Uyumlu değilse scope gerekçeli yükseltilir.

### Crowd avoid
EventImpactSignal değiştiğinde kullanıcı `AVOID` ise affected venue/peak window için local alternative oluşturulur.

Recurring event knowledge tek başına cancellation/postponement fact'i değildir; exact occurrence evidence gerekir.

## 14. Weather repair

High/severe fresh WeatherSignal affected outdoor block için repair trigger olabilir.

Weather Agent itinerary değiştirmez; Adaptive Agent değişikliği yapar.

Climate normal exact-day weather trigger olarak kullanılamaz.

## 15. Budget repair

TM-AG-010 `repairNeeds` üretir.

Adaptive Agent:
- over-budget item'ların bağlı olduğu block/stay/segmentleri hedefler,
- kullanıcı hard budget'ını gevşetmez,
- daha ucuz replacement gerekiyorsa scope-limited candidate lookup yapabilir,
- revised itinerary sonrası Budget Agent tekrar çalışmalıdır.

Budget Agent'ın kendisi itinerary değiştirmez.

## 16. Verification repair

TM-AG-014 `REPAIR` sonucu:
- repair target refs,
- violated invariant/claim refs,
- severity
ile gelmelidir.

Adaptive Agent yalnız target/dependency closure içinde mutation yapar.

Repair sonrası Verification yeniden zorunludur.

## 17. Allowed tools

Kanonik katalogla uyumlu:
- `TL-004` Place Search — yalnız targeted replacement discovery.
- `TL-005` Directions & Distance Matrix — affected transition/route.
- `TL-006` Weather Forecast — yalnız trigger/current weather refresh gerektiğinde.
- `TL-010` Price & Fee Lookup — replacement cost/fee gerektiğinde.
- `TL-011` Calculator — time/cost arithmetic.
- `TL-012` Schema Validator — harness/output validation.
- `TL-013` Rule Engine — feasibility/hard constraints.
- `TL-014` Cache.

## 18. Forbidden behavior

- full itinerary regeneration by default,
- hard constraint relaxation,
- user-fixed decision deletion,
- unrelated POI discovery,
- official event/closure fact invention,
- review signalini official closure sayma,
- climate normal'i weather trigger yapma,
- replacement route duration invention,
- untracked mutation,
- final user response writing.

## 19. Source policy

Change signal kaynağı trigger türüne uygun olmalıdır:
- official closure/event status → TM-AG-011 OfficialFact / primary evidence,
- weather → TM-AG-007 fresh FORECAST,
- crowd/queue experience → TM-AG-012 signal (policy-dependent planning impact only),
- route → TM-AG-008 route fact,
- budget → TM-AG-010 BudgetLedger,
- user change → explicit user source.

Repair sırasında yeni dynamic claim elde edilirse provenance/freshness korunur.

## 20. Downstream recheck contract

Repair sonrası gerekli recheck'ler açıkça istenir:
- `ROUTE_RECHECK`
- `BUDGET_RECHECK`
- `OFFICIAL_FACT_RECHECK`
- `WEATHER_RECHECK`
- `VERIFICATION_RECHECK`

`VERIFICATION_RECHECK` başarılı repair sonrası zorunludur.

## 21. Failure modes

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

## 22. Harness binding

- R0 repair/patch schema
- R1 impact closure, minimal-scope, time/hard-constraint invariants
- R2 recorded change fixtures
- R3 targeted tool adapter integration
- R4 replacement quality/continuity semantic evaluation
- R5 cascade, stale evidence, conflicting triggers, no-replacement cases
- R6 over-repair/research/constraint authority leakage
- R7 controlled live change repair
- R8 production regression repairs

## 23. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
journey_issue_49_required: true
knowledge_issue_50_required: true
event_season_issue_51_required: true
```
