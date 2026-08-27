# TM-AG-009 — Route Planner Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-009 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Route Planner Agent, doğrulanmış/uygun adayları, route facts, konaklama, yemek pencereleri, weather sinyalleri ve hard/soft policy'leri **zaman açısından uygulanabilir bir JourneyPlan + DailyPlan** haline getirir.

```text
eligible candidates + route matrix + constraints + stay windows
→ build feasible time graph
→ place travel/activity/meal/rest/stay blocks
→ reject impossible combinations
→ generate daily alternatives
→ emit DraftItinerary
```

## 2. Boundary

Yapar:
- ziyaret sırası ve zamanlama,
- şehirlerarası JourneySegment planlama,
- şehir içi günlük blok planlama,
- çalışma saati ile ziyaret slotu uyumu,
- route duration + buffer ile bloklar arası feasibility,
- check-in/check-out / overnight bağlantıları,
- yemek/rest pencereleri,
- çocuk/aile tempo ve dinlenme kurallarının uygulanması,
- weather signal'e göre alternatif plan bias'ı,
- Issue #49 stopover rollerini günlere bağlama,
- hard constraint ihlalinde kombinasyonu reject etme,
- 2–3 alternatif istenmişse gerçek alternatif plan dalları oluşturma.

Yapmaz:
- yeni POI/otel/restoran keşfetmez,
- opening hours/fiyat/weather fact'i uydurmaz,
- hard constraint'i scoring penalty'ye dönüştürmez,
- kullanıcı adına rezervasyon/ödeme yapmaz,
- final kullanıcı metni yazmaz.

## 3. Inputs

- `TravelerProfile`
- `PreferencePolicyOutput`
- `DestinationBriefSet`
- `PlaceCandidateSet` — yalnız accepted/eligible pool
- `AccommodationCandidateSet`
- `FoodAndLocalTasteResult` — yalnız eligible food candidate refs
- `WeatherSignalSet`
- `TransportationResult` / route matrix
- trip date range/duration
- optional selected journey stopovers and stop roles (Issue #49)
- optional final-arrival deadline
- product planning policy snapshot
- `contextManifestId`

## 4. Output

Ana çıktı: `DraftItinerary.v1`.

```yaml
itineraryId: string
requestId: string
planningPolicySnapshotId: string
journeyPlan: object
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

Her `JourneySegment`:

```yaml
segmentId: string
fromRef: string
toRef: string
travelDate: date
routeLegRef: string
stopRole: PASS_THROUGH | SHORT_STOP | HALF_DAY | FULL_DAY | OVERNIGHT_ONLY | OVERNIGHT_AND_DAY | MULTI_DAY | FINAL_DESTINATION
arrivalWindow: object|null
departureWindow: object|null
dailyPlanRefs: []
accommodationRef: string|null
```

Route Planner corridor şehirlerini keşfetmez. TM-AG-008/TM-AG-003 tarafından sağlanan ve kullanıcı/policy tarafından seçilebilir hale getirilen stopover context'ini zamanlar.

## 6. DailyPlan

Her gün gerçek zaman blokları taşır:

```yaml
dayId: string
date: date
baseLocationRef: string|null
blocks:
  - blockId: string
    blockType: TRAVEL | ACTIVITY | MEAL | REST | CHECK_IN | CHECK_OUT | FREE_TIME
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

## 7. Feasibility invariant

Aşağıdaki kombinasyonlar planlanamaz:

- bir önceki bloktan fiziksel olarak yetişilemeyen sonraki blok,
- ziyaret saatinin dışında aktivite,
- check-in/out ile çakışan travel/activity,
- hard rest window ihlali,
- final-arrival deadline ihlali,
- hard daily-drive veya distance limit ihlali,
- REJECTED/NEEDS_VERIFICATION hard blocker candidate'ın accepted gibi kullanılması,
- hard conditional constraint ihlali.

Hard violation → candidate combination `rejectedCombinations[]`.

## 8. Time arithmetic

Plan zamanlaması deterministic olmalıdır:

```text
block_end
+ transition_duration
+ configured_buffer
<= next_block_start
```

Route matrix/leg eksikse Route Planner `TL-005` ile yalnız gerekli pair/leg hesabını isteyebilir; yeni yer keşfedemez.

## 9. Opening-hours invariant

Bir activity/food block:
- gerekli opening/menu window evidence ile uyuşmalı,
- conflict/stale/unverified critical hours varsa `NEEDS_VERIFICATION` olarak işaretlenmeli veya hard policy'ye göre block edilmelidir.

Route Planner çalışma saati uyduramaz.

## 10. Family pace / rest

Aile temposu policy/constraint girdisidir; agent kendi çocuk güvenlik eşiğini icat etmez.

Örnek planning signals:
- midday rest window,
- max continuous activity duration,
- max daily drive,
- low-fatigue preference,
- early evening return,
- walking/load signal.

Hard rest constraint varsa ihlal edilemez. Soft fatigue preference objective/ranking sinyalidir.

## 11. Alternatives

Alternatifler aynı planın küçük isim değişikliği değildir.

Supported classes:
- `WEATHER_ALTERNATIVE`
- `LOW_FATIGUE_ALTERNATIVE`
- `BUDGET_ALTERNATIVE`
- `ROUTE_ALTERNATIVE`
- `ACTIVITY_ALTERNATIVE`

Product/user policy 2–3 alternatif/gün istiyorsa, feasible candidate pool yettiği ölçüde 2–3 anlamlı alternatif üretilir. Yeterli güvenli aday yoksa sayı uydurulmaz; coverage gap görünür tutulur.

## 12. Weather interaction

TM-AG-007 `planBias` ve hazard signal verir.

Route Planner:
- PREFER_INDOOR sinyalini objective olarak kullanabilir,
- severe/high weather risk'te outdoor combination'ı policy'ye göre reject/alternative'e taşıyabilir,
- weather fact üretmez.

## 13. Accommodation interaction

- `LIVE_UNAVAILABLE` veya hard occupancy violation stay seçilemez.
- `NEEDS_VERIFICATION` accommodation hard policy'ye göre plan draft'ında blocker olabilir.
- check-in/out window'ları zaman çizelgesinde block olarak tutulur.
- Issue #49 overnight segmentleri doğru `journeySegmentRef` ile bağlanır.

## 14. Food interaction

Meal windows:
- travel/activity ile çakışmamalı,
- hard dietary constraint ihlali içeren candidate kullanılamaz,
- venue current menu/hours unverified ise status görünür kalır.

LocalTasteBrief tek başına restaurant block üretmez.

## 15. Allowed tools

- `TL-005` Directions & Distance Matrix — eksik transition/leg hesabı.
- `TL-011` Calculator — süre/toplam arithmetic.
- `TL-012` Schema Validator.
- `TL-013` Rule Engine — hard constraints/feasibility.
- `TL-014` Cache.

## 16. Forbidden tools

- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-004` Place Search
- `TL-006` Weather Forecast
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price Lookup

Missing domain fact → ilgili upstream verification/repair ihtiyacı; Route Planner araştırma yapmaz.

## 17. Source policy

Agent source keşfetmez. Yalnız upstream evidence-aware facts kullanır.

Plan block provenance minimum:
- selected entity/candidate ref,
- route leg/matrix ref where movement exists,
- applicable constraint refs,
- source/evidence refs or verification status.

## 18. Constraint ordering

Karar sırası:

```text
1 hard eligibility
2 time feasibility
3 route/travel feasibility
4 fixed stay/deadline constraints
5 rest/family hard rules
6 weather safety policy
7 soft preferences / quality objective
8 alternatives/diversity
```

Soft score hiçbir üst seviyedeki fail'i telafi edemez.

## 19. Final-arrival deadline — Issue #49

`finalArrivalDeadline` HARD ise:

```text
arrival(final destination) <= deadline
```

olmalıdır.

Ara şehir çok değerli olsa bile deadline ihlal eden journey plan reject edilir.

## 20. Rejected combination provenance

Her reject:

```yaml
combinationId: string
reasonCode: string
constraintRefs: []
entityRefs: []
routeRefs: []
evidenceRefs: []
```

taşır.

Bu bilgi Adaptive Itinerary ve Explanation için önemlidir.

## 21. Verification needs

Route Planner yeni evidence toplamaz. Eksik kritik fact için:

```yaml
verificationNeed:
  needId: string
  claimType: string
  entityRef: string
  affectsBlockRefs: []
  severity: BLOCKING | NON_BLOCKING
```

üretir.

## 22. Adaptive boundary

TM-AG-009 initial/draft plan oluşturur.

Sonradan weather/closure/crowding/change nedeniyle targeted repair → TM-AG-013.

TM-AG-009 ve TM-AG-013 aynı feasibility invariants'ını paylaşmalıdır.

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
- `FAKE_ALTERNATIVE_DIVERSITY`

## 24. Harness binding

- R0 itinerary/journey schema
- R1 deterministic time/constraint/overlap/deadline rules
- R2 recorded multi-agent fixtures
- R3 route-calculation integration for missing legs
- R4 itinerary quality/pacing/alternative diversity
- R5 stale hours/weather conflict/check-in/deadline/impossible route
- R6 research/tool/authority leakage
- R7 controlled live route-feasibility test
- R8 regressions

## 25. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
journey_issue_49_required: true
knowledge_issue_50_indirect: true
```
