# TM-AG-008 — Transportation Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-008 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 |
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
- traffic-aware duration provider destekliyorsa,
- route geometry/corridor bağlamı,
- Issue #49 `Route Corridor Discovery`,
- detour km/dakika,
- supplied stop sequence route recalculation,
- toll/ferry/highway metadata varsa provenance ile taşıma.

Yapmaz:
- hangi şehrin turistik olarak değerli olduğuna karar vermez,
- stopover seçmez,
- daily itinerary ordering yapmaz,
- çocuk yorgunluğu kararını kendisi vermez,
- POI/otel/restoran keşfetmez,
- weather tahmini üretmez,
- final cevap yazmaz.

## 3. Inputs

- origin/destination veya location set
- travel mode
- departure/arrival datetime context
- request type
- optional selected stop sequence refs
- optional journey segment refs (Issue #49)
- `ruleSnapshotId`
- optional knowledge/location refs (Issue #50)
- `contextManifestId`

## 4. Route request types

- `POINT_TO_POINT`
- `MATRIX`
- `CORRIDOR_DISCOVERY`
- `STOP_SEQUENCE_RECALC`

## 5. Output

Ana çıktı: `TransportationResult`.

```yaml
requestType: string
ruleSnapshotId: string|null
routeLegs: RouteLeg[]
matrixEntries: RouteMatrixEntry[]
corridorCandidates: CorridorCityCandidate[]
warnings: []
overallConfidence: 0..1
```

`ruleSnapshotId`, corridor classification threshold provenance'ını korur.

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
freshnessStatus: CURRENT | STALE | UNKNOWN
routeMetadata: object
evidence: []
```

`distanceMeters` route-provider yol mesafesidir; straight-line distance bu alana yazılamaz.

## 7. Route matrix

Matrix output yalnız ulaşım gerçekleridir; TM-AG-009 için optimization girdisidir. Transportation matrix'ten kendi başına ziyaret sırası çıkarmaz.

## 8. Route Corridor Discovery — Issue #49

Origin → final destination baseline route üzerinden corridor administrative candidates çıkarılır.

```yaml
corridorCityId: string
locationRef: string
name: string
administrativeType: city | province | district
corridorRelation: ON_ROUTE | NEAR_ROUTE | DETOUR
routeProgressRatio: 0..1
baselineRouteRef: string
detourDistanceMeters: integer|null
detourDurationSeconds: integer|null
mainRouteEvidenceRefs: []
detourEvidenceRefs: []
requiresDestinationResearch: true
```

Transportation yalnız logistics relation/detour fact'i üretir; tourism/family value veya stop role üretmez.

## 9. Corridor semantics

- `ON_ROUTE`
- `NEAR_ROUTE`
- `DETOUR`

Threshold değerleri frozen Rule Registry snapshot'ından gelir; prompt sezgisiyle uydurulmaz.

## 10. Detour invariant

```text
viaCandidate route
minus
baseline route
```

Detour distance/duration provider-backed route/matrix evidence ister. Geodesic yakınlık tek başına detour değildir.

## 11. Allowed tools

- `TL-005` Directions & Distance Matrix
- `TL-003` Geocoding
- `TL-014` Cache
- `TL-012` Schema Validator
- `TL-013` Rule Engine

## 12. Forbidden ownership

- place discovery → TM-AG-004
- weather → TM-AG-007
- accommodation → TM-AG-005
- review → TM-AG-012
- tourism research/value → TM-AG-003
- itinerary ordering → TM-AG-009

## 13. Traffic semantics

Traffic-aware duration:
- datetime context ile bağlanır,
- freshness evidence taşır,
- arrival guarantee değildir.

`LIVE_OR_CURRENT` ile `HISTORICAL_OR_TYPICAL` ayrımı korunur.

## 14. Stop sequence recalculation — Issue #49

Kullanıcı/Route Planner bir stop sequence verdiyse Transportation bu sıranın route leg'lerini hesaplar; sırayı kendi başına değiştirmez.

## 15. Journey provenance

Bir leg belirli journey segmentine aitse `journeySegmentRef` korunur.

Baseline route, detour route ve selected sequence evidence zinciri trace edilebilir olmalıdır.

## 16. Weather interaction

TM-AG-007 caution sinyali context olarak gelebilir. Transportation autonomous weather-driven reroute yapmaz.

## 17. Knowledge compatibility — Issue #50

Stable location/admin IDs reuse edilebilir; current route/traffic facts freshness gate'ini bypass edemez.

## 18. Handoff

- TM-AG-003: corridor logistic facts
- TM-AG-009: route legs/matrix/corridor facts
- TM-AG-010: route distance + toll/ferry metadata
- TM-AG-013: repair-scope route recalculation
- TM-AG-014: full route provenance

## 19. Failure modes

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
- `RULE_SNAPSHOT_PROVENANCE_DROPPED`

## 20. Harness binding

- R0 route/corridor schema
- R1 route-vs-geodesic, detour formula, provenance
- R2 recorded route/matrix fixtures
- R3 route/geocode adapter integration
- R4 corridor semantic quality
- R5 stale traffic/provider outage/ambiguous geocode/extreme detour
- R6 tourism/stop-selection/itinerary/place authority leakage
- R7 controlled live route/matrix
- R8 regressions

## 21. Golden package coverage

```yaml
behavior_cases: 18
authority_cases: 8
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 5
route_corridor_discovery: true
rule_snapshot_provenance: true
journey_issue_49_required: true
knowledge_issue_50_compatible: true
```

Fixture-driven contract gap:
- `ruleSnapshotId` output schema'ya eklenmiştir; corridor relation kararının hangi threshold snapshot'ıyla üretildiği artık replay edilebilir.

## 22. Current status

```yaml
agent_spec_status: golden_package_v1
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
runtime_tests: pending
next_agent_package: TM-AG-009
```
