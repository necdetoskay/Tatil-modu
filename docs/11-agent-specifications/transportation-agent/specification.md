# TM-AG-008 — Transportation Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-008 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Transportation Agent, seyahat noktaları arasında provider-backed route facts üretir: yol mesafesi, tahmini süre, trafik-aware süre, route matrix ve Issue #49 için route corridor/detour bilgisi.

```text
locations + mode + time
→ geocode/resolve
→ route / matrix / corridor calculation
→ normalize route facts
→ emit TransportationResult
```

## 2. Boundary

Yapar:
- A→B route leg hesabı,
- multi-point route matrix,
- departure/arrival time bağlamında provider destekliyorsa traffic-aware duration,
- route geometry/corridor bağlamı,
- Issue #49 `Route Corridor Discovery`,
- corridor city candidate için detour km/dakika,
- selected stopover sequence sonrası route recalculation,
- toll/ferry/highway gibi provider route metadata'sı varsa provenance ile taşıma.

Yapmaz:
- hangi şehrin turistik olarak değerli olduğuna karar vermez,
- stopover seçmez,
- daily itinerary ordering yapmaz,
- çocuk yorgunluğu kararını kendisi vermez,
- POI/otel/restoran keşfetmez,
- weather tahmini üretmez,
- final cevap yazmaz.

## 3. Inputs

- origin location
- destination location veya location set
- travel mode
- departure/arrival datetime context if available
- route request type
- optional selected stopover refs
- optional hard route-policy refs (yalnız evaluation metadata; policy ownership TM-AG-002)
- optional journey plan / segment refs (Issue #49)
- `contextManifestId`

## 4. Route request types

- `POINT_TO_POINT`
- `MATRIX`
- `CORRIDOR_DISCOVERY`
- `STOP_SEQUENCE_RECALC`

Transportation Agent request type dışındaki planlama işini üstlenmez.

## 5. Output

Ana çıktı: `TransportationResult`.

```yaml
routeLegs: RouteLeg[]
matrixEntries: RouteMatrixEntry[]
corridorCandidates: CorridorCityCandidate[]
warnings: []
overallConfidence: 0..1
```

## 6. RouteLeg

```yaml
routeLegId: string
fromRef: string
toRef: string
journeySegmentRef: string|null
mode: car | transit | walking | cycling | other
distanceMeters: integer|null
durationSeconds: integer|null
trafficAwareDurationSeconds: integer|null
departureTime: datetime|null
arrivalTimeEstimate: datetime|null
routeGeometryRef: string|null
routeMetadata: object
freshnessStatus: CURRENT | STALE | UNKNOWN
evidence: []
```

`distanceMeters` driving/transit route distance'dır; straight-line distance bu alana yazılamaz.

## 7. Route matrix

Bir aday seti için pair-wise veya supported matrix result üretir. Matrix output plan sırası değildir; TM-AG-009 optimization girdisidir.

## 8. Route Corridor Discovery — Issue #49

Origin → final destination ana route geometry'si üzerinden anlamlı administrative city/province candidates bulunabilir.

Her corridor candidate:

```yaml
corridorCityId: string
locationRef: string
name: string
administrativeType: city | province | district
corridorRelation: ON_ROUTE | NEAR_ROUTE | DETOUR
routeProgressRatio: 0..1
detourDistanceMeters: integer|null
detourDurationSeconds: integer|null
mainRouteEvidenceRefs: []
detourEvidenceRefs: []
requiresDestinationResearch: true
```

Transportation Agent yalnız lojistik relation/detour fact'i üretir.

Şunları üretmez:
- tourism value,
- family value,
- recommended stop role,
- full-day/overnight decision.

Bunlar TM-AG-003/TM-AG-009 ownership'idir.

## 9. Corridor candidate semantics

- `ON_ROUTE`: candidate route corridor üzerinde/çok yakın; threshold canonical rule/config ile tanımlanır.
- `NEAR_ROUTE`: küçük sapmayla erişilebilir.
- `DETOUR`: anlamlı sapma gerektirir.

Threshold değerleri agent prompt'unda uydurulmaz; registry/rule snapshot'tan gelir.

## 10. Detour invariant

Detour:

```text
route(origin → candidate → final)
minus
baseline route(origin → final)
```

veya provider/matrix eşdeğer yöntemle hesaplanır.

Düz çizgi mesafe detour km/dakika yerine kullanılamaz.

## 11. Allowed tools

- `TL-005` Directions & Distance Matrix — primary route capability.
- `TL-003` Geocoding — location identity/disambiguation ve corridor administrative resolution gerektiğinde.
- `TL-014` Cache — route/freshness-aware cache.
- `TL-012` Schema Validator harness katmanında.
- `TL-013` Rule Engine corridor thresholds / deterministic checks için.

## 12. Forbidden tools / ownership

- `TL-004` Place Search — place discovery TM-AG-004.
- `TL-006` Weather — TM-AG-007.
- `TL-008` Accommodation — TM-AG-005.
- `TL-009` Review — TM-AG-012.
- tourism research/search → TM-AG-003.

## 13. Traffic semantics

Provider traffic-aware result destekliyorsa:
- departure/arrival datetime context korunur,
- traffic-aware duration ayrı alan olarak taşınır,
- retrieval time/freshness evidence tutulur.

Traffic-aware duration garanti edilmiş varış süresi değildir.

Historical/typical traffic ile live/current traffic aynı veri türü gibi sunulamaz.

## 14. Distance semantics

- route distance != straight-line distance.
- `route distance` exact provider route output olduğunda evidence taşımalıdır.
- approximate fallback varsa açık approximation status gerekir; exact route field'e sessizce yazılmaz.

## 15. Stop sequence recalculation — Issue #49

Kullanıcı/Route Planner stopover seçtiğinde Transportation Agent verilen sırayı değerlendirebilir:

```text
Kocaeli → Ankara → Aksaray → Nevşehir
```

ve her inter-city leg için route fact üretir.

Transportation Agent sırayı kendi başına optimize etmez; request'te verilen sequence'i hesaplar veya matrix üretir.

## 16. Journey segment provenance

Bir route leg belirli journey segmentine aitse `journeySegmentRef` korunur.

Route evidence;
- baseline route,
- detour calculation,
- selected stop sequence
arasında trace edilebilir olmalıdır.

## 17. Weather interaction

TM-AG-007 travel-leg caution sinyali sağlayabilir. Transportation Agent weather nedeniyle reroute kararını kendi başına vermez; desteklenen route options varsa facts olarak döndürebilir, seçim TM-AG-009/TM-AG-013'e aittir.

## 18. Knowledge compatibility — Issue #50

Travel Knowledge Store stable location/admin identities ve known source/geo refs sağlayabilir.

Ancak dynamic traffic/current route restrictions knowledge snapshot'tan current fact olarak alınmaz. Route provider/freshness gate gerekir.

## 19. Handoff

- TM-AG-003 Destination Research: corridor city location refs + logistic relation only.
- TM-AG-009 Route Planner: RouteLeg/Matrix/Corridor facts.
- TM-AG-010 Budget: distance/toll/ferry route metadata where supported.
- TM-AG-013 Adaptive: affected route legs/matrix for repair.
- TM-AG-014 Verification: full route evidence/freshness.

## 20. Failure modes

- `STRAIGHT_LINE_AS_ROUTE_DISTANCE`
- `TRAFFIC_DURATION_FALSE_GUARANTEE`
- `DETOUR_WITHOUT_BASELINE`
- `CORRIDOR_TOURISM_RANKING_LEAKAGE`
- `STOP_SELECTION_LEAKAGE`
- `ITINERARY_ORDERING_LEAKAGE`
- `PLACE_DISCOVERY_LEAKAGE`
- `STALE_TRAFFIC_FALSE_CURRENT`
- `MISSING_ROUTE_PROVENANCE`
- `JOURNEY_SEGMENT_REF_DROPPED`

## 21. Harness binding

- R0 route/corridor schema
- R1 route-vs-straight-line, detour formula, provenance rules
- R2 recorded route/matrix fixtures
- R3 route/geocode adapter integration
- R4 corridor candidate semantic quality
- R5 stale traffic/provider outage/ambiguous geocode/extreme detour
- R6 tourism/stop-selection/itinerary/place authority leakage
- R7 controlled live route/matrix
- R8 regressions

## 22. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
journey_issue_49_required: true
knowledge_issue_50_compatible: true
```
