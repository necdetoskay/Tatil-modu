# TM-AG-009 — Route Planner Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-009 |
| Sürüm | 1.0 |
| Durum | CANONICAL / GOLDEN PACKAGE |
| Tarih | 2026-08-27 |

## 1. Purpose

Route Planner Agent, uygun adayları, route facts, konaklama/yemek pencereleri, weather sinyalleri ve policy'leri **zaman açısından uygulanabilir JourneyPlan + DailyPlan** haline getirir.

```text
eligible candidates + route matrix + constraints + stay windows
→ build feasible time graph
→ place travel/activity/meal/rest/stay blocks
→ reject impossible combinations
→ generate feasible alternatives
→ emit DraftItinerary
```

## 2. Boundary

Yapar:
- ziyaret sırası ve zamanlama,
- şehirlerarası JourneySegment planlama,
- şehir içi günlük blok planlama,
- çalışma saati + transition + buffer feasibility,
- check-in/check-out ve overnight bağlantıları,
- yemek/rest pencereleri,
- hard aile/tempo kurallarını uygulama,
- weather signal'i planning bias olarak kullanma,
- Issue #49 stopover rollerini günlere bağlama,
- hard violation'da kombinasyonu reject etme,
- talep/policy varsa 2–3 gerçek alternatif üretme.

Yapmaz:
- yeni POI/otel/restoran keşfetmez,
- opening hours/fiyat/weather fact'i uydurmaz,
- toplam bütçe hesabı yapmaz,
- hard constraint'i scoring penalty'ye dönüştürmez,
- rezervasyon/ödeme yapmaz,
- final kullanıcı metni yazmaz.

## 3. Inputs

- `TravelerProfile`
- `PreferencePolicyOutput`
- `DestinationBriefSet`
- `PlaceCandidateSet`
- `AccommodationCandidateSet`
- `FoodAndLocalTasteResult`
- `WeatherSignalSet`
- `TransportationResult` / route matrix
- trip date range/duration
- optional selected journey stopovers + stop roles
- optional final-arrival deadline
- product planning policy snapshot
- `contextManifestId`

## 4. Output

Ana çıktı: `DraftItinerary.v1`.

```yaml
itineraryId: string
planningPolicySnapshotId: string
journeyPlan: JourneyPlan
days: DailyPlan[]
alternatives: AlternativePlan[]
rejectedCombinations: []
verificationNeeds: []
constraintSummary: object
warnings: []
overallConfidence: 0..1
```

## 5. JourneyPlan — Issue #49

```yaml
journeyPlan:
  mode: DIRECT | ENRICHED_CORRIDOR
  originRef: string
  finalDestinationRef: string
  finalArrivalDeadline: datetime|null
  segments: JourneySegment[]
```

Her segment:

```yaml
segmentId: string
fromRef: string
toRef: string
travelDate: date
routeLegRef: string
stopRole: PASS_THROUGH | SHORT_STOP | HALF_DAY | FULL_DAY | OVERNIGHT_ONLY | OVERNIGHT_AND_DAY | MULTI_DAY | FINAL_DESTINATION
selectionOrigin: USER_FIXED | USER_OPTIONAL | PLANNER_SELECTED | FINAL_DESTINATION
selectionSourceRef: string
arrivalWindow: object|null
departureWindow: object|null
dailyPlanRefs: []
accommodationRef: string|null
```

`selectionOrigin` kullanıcı seçimi ile planner seçimini ayırır. `USER_FIXED` bir durak sessizce kaldırılamaz; infeasible ise conflict/rejected combination görünür olmalıdır.

## 6. DailyPlan

Her gün gerçek zaman blokları taşır:

```yaml
dayId: string
date: date
baseLocationRef: string|null
blocks:
  - blockType: TRAVEL | ACTIVITY | MEAL | REST | CHECK_IN | CHECK_OUT | FREE_TIME
    start: datetime
    end: datetime
    entityRef: string|null
    routeLegRef: string|null
    journeySegmentRef: string|null
    sourceRefs: []
    constraintRefs: []
    verificationStatus: VERIFIED_INPUT | NEEDS_VERIFICATION
```

Bloklar çakışamaz.

## 7. Feasibility invariants

Planlanamaz:
- fiziksel olarak yetişilemeyen transition,
- çalışma saatinin dışında aktivite/meal,
- check-in/out conflict,
- hard rest window ihlali,
- final-arrival deadline ihlali,
- hard daily-drive/distance ihlali,
- REJECTED candidate kullanımı,
- unresolved hard blocker'ın accepted gibi kullanımı,
- conditional hard constraint ihlali.

Hard violation → `rejectedCombinations[]`.

## 8. Deterministic time arithmetic

```text
block_end
+ transition_duration
+ configured_buffer
<= next_block_start
```

Route fact eksikse yalnız mevcut entity pair için `TL-005` istenebilir; süre uydurulamaz.

## 9. Opening-hours rule

Activity/food block ilgili operational window ile uyumlu olmalıdır. Stale/conflicting/unverified critical hours policy'ye göre blocker veya `NEEDS_VERIFICATION` üretir.

## 10. Family pace / rest

Tempo eşikleri prompt tarafından icat edilmez; policy/constraint snapshot'tan gelir.

Hard rest/daily-drive sınırı ihlal edilemez. Low-fatigue gibi soft tercihler yalnız feasible kombinasyonlar arasında optimize edilir.

## 11. Alternatives

Supported classes:
- `WEATHER_ALTERNATIVE`
- `LOW_FATIGUE_ALTERNATIVE`
- `ROUTE_ALTERNATIVE`
- `ACTIVITY_ALTERNATIVE`

Alternatif gerçek block/entity/route farkı içermelidir. Yeterli feasible aday yoksa 2–3 sayısını doldurmak için sahte/duplicate plan üretilmez.

### Budget boundary

`BUDGET_ALTERNATIVE` TM-AG-009 ownership'inde değildir. Toplam maliyet `TM-AG-010 Budget Agent` tarafından hesaplanır. Budget hard fail/overflow gerekiyorsa `TM-AG-013 Adaptive Itinerary` için targeted repair tetiklenir.

## 12. Weather interaction

TM-AG-007 weather signal verir; Route Planner bunu plan bias/risk girdisi olarak kullanır. Weather fact üretmez. `CLIMATE_NORMAL` belirli gün weather event'i gibi kullanılamaz.

## 13. Accommodation interaction

- live-unavailable/occupancy violated stay seçilemez,
- check-in/out zaman çizelgesinde block'tur,
- overnight journey segment provenance korunur.

## 14. Food interaction

Meal blocks travel/activity ile çakışamaz. Hard dietary violation içeren candidate kullanılamaz. `LocalTasteBrief` tek başına venue/menu fact'i değildir.

## 15. Allowed tools

- `TL-005` Directions & Distance Matrix — eksik mevcut-entity transition/leg
- `TL-011` Calculator
- `TL-012` Schema Validator
- `TL-013` Rule Engine
- `TL-014` Cache

## 16. Forbidden tools

- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-004` Place Search
- `TL-006` Weather Forecast
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price Lookup

Missing domain fact → upstream verification/repair ihtiyacı.

## 17. Source/provenance policy

Agent source keşfetmez. Her selected block mümkün olduğunda entity, route, constraint ve source/evidence refs taşır.

Journey stop provenance:

```text
selectionSourceRef
→ selectionOrigin
→ JourneySegment
→ DailyPlan blocks
→ Verification
```

## 18. Constraint ordering

```text
1 hard eligibility
2 fixed user choices
3 temporal feasibility
4 route/travel feasibility
5 stay/deadline feasibility
6 hard rest/family rules
7 weather safety policy
8 soft preference optimization
9 alternative diversity
```

Soft score üst seviyedeki fail'i telafi edemez.

## 19. Final-arrival deadline

Hard deadline varsa:

```text
arrival(final destination) <= deadline
```

olmalıdır. Çok değerli stopover bile bu kuralı geçersiz kılamaz.

## 20. Rejected combination provenance

```yaml
combinationId: string
reasonCode: string
constraintRefs: []
entityRefs: []
routeRefs: []
evidenceRefs: []
```

User-fixed stop infeasible ise bu kayıtta açıkça görünür olmalıdır.

## 21. Verification needs

Agent yeni evidence toplamaz. Eksik kritik fact için `BLOCKING | NON_BLOCKING` verification need üretir ve etkilenen block refs'i bağlar.

## 22. Adaptive boundary

TM-AG-009 initial/draft plan sahibidir. Sonradan closure/weather/budget/change repair → TM-AG-013. İki agent aynı feasibility invariants'ını paylaşır.

## 23. Failure modes

- `HARD_CONSTRAINT_AS_SCORE`
- `IMPOSSIBLE_TRANSITION`
- `OPENING_HOURS_CONFLICT`
- `BLOCK_OVERLAP`
- `CHECKIN_CHECKOUT_CONFLICT`
- `FINAL_ARRIVAL_DEADLINE_MISSED`
- `DAILY_DRIVE_LIMIT_VIOLATED`
- `REJECTED_CANDIDATE_USED`
- `UNVERIFIED_HARD_BLOCKER_USED`
- `NEW_PLACE_DISCOVERY_LEAKAGE`
- `ROUTE_FACT_INVENTION`
- `JOURNEY_SEGMENT_PROVENANCE_DROPPED`
- `USER_FIXED_STOP_PROVENANCE_DROPPED`
- `FAKE_ALTERNATIVE_DIVERSITY`
- `BUDGET_AUTHORITY_LEAKAGE`

## 24. Harness binding

- R0 itinerary/journey schema
- R1 deterministic rules RP-001..RP-020
- R2 recorded multi-agent fixtures
- R3 missing-leg route integration
- R4 pacing/quality/alternative diversity
- R5 stale hours/weather/check-in/deadline/impossible route
- R6 research/budget/tool authority leakage
- R7 controlled live route-feasibility
- R8 regressions

## 25. Golden coverage

```yaml
behavior_cases: 22
authority_cases: 9
tool_policy_cases: 7
context_lifecycle_cases: 5
provenance_cases: 6
journey_issue_49_cases: 4
```

Fixture-driven contract gaps resolved:
- user-fixed stop selection provenance → `selectionOrigin + selectionSourceRef`
- budget alternative ownership → removed from Route Planner; Budget → Adaptive repair loop

## 26. Current status

```yaml
agent_spec_status: golden_v1
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
journey_issue_49_required: true
knowledge_issue_50_indirect: true
next_agent_package: TM-AG-010
```
