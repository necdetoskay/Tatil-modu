# TM-AG-007 — Weather Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-007 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 |
| Tarih | 2026-08-27 |

## 1. Purpose

Weather Agent, belirli lokasyon/tarih/aktivite bağlamı için hava tahmini veya uzak gelecek için iklim normali bağlamını ayrı veri türleri olarak üretir ve planlayıcıların kullanacağı weather-risk sinyallerine dönüştürür.

```text
location + time + activity context
→ choose forecast vs climate-normal path
→ obtain weather evidence
→ normalize hazards
→ emit WeatherSignalSet
```

## 2. Boundary

Yapar:
- forecast horizon içinde güncel hava tahmini,
- forecast horizon dışında climate-normal context,
- yağış/sıcaklık/rüzgâr/fırtına/kar risk sinyalleri,
- indoor/outdoor bias,
- freshness + horizon + confidence taşıma.

Yapmaz:
- itinerary bloğunu silmez/değiştirmez,
- POI bulmaz,
- rota değiştirmez,
- otel/restoran seçmez,
- climate normal'i belirli gün forecast'ı gibi sunmaz,
- final kullanıcı cevabı yazmaz.

## 3. Inputs

- location identity + coordinates
- target date/time window
- optional activity/place refs
- `INDOOR | OUTDOOR | MIXED | TRAVEL_LEG | UNKNOWN` exposure type
- optional `journeySegmentRef` (Issue #49)
- current date/time context
- optional knowledge refs (Issue #50)
- `contextManifestId`

## 4. Output

Ana çıktı: `WeatherSignalSet`.

Her signal:

```yaml
weatherSignalId: string
locationRef: string
journeySegmentRef: string|null
activityRef: string|null
dataType: FORECAST | CLIMATE_NORMAL
validWindow: object
issuedAt: datetime|null
retrievedAt: datetime
freshnessStatus: CURRENT | STALE | UNKNOWN
forecastHorizonHours: number|null
conditions: object
hazards: []
riskLevel: LOW | MEDIUM | HIGH | SEVERE | UNKNOWN
planBias: PREFER_INDOOR | PREFER_OUTDOOR | CAUTION | NO_SIGNAL
confidence: 0..1
evidence: []
```

## 5. Forecast vs climate-normal invariant

### FORECAST
Belirli tarih/saat için provider forecast evidence'ına dayanır.

### CLIMATE_NORMAL
Uzun dönem istatistiksel mevsim bağlamıdır; belirli günün havasını söylemez.

```text
CLIMATE_NORMAL may inform planning uncertainty.
CLIMATE_NORMAL cannot assert a specific day's weather.
```

## 6. Allowed tools

- `TL-006` Weather Forecast
- `TL-007` Climate Normals
- `TL-014` Cache
- `TL-012` Schema Validator
- `TL-013` Rule Engine

## 7. Forbidden tools / ownership

- `TL-004` Place Search → TM-AG-004
- `TL-005` Directions → TM-AG-008
- `TL-008` Accommodation → TM-AG-005
- itinerary ordering/repair → TM-AG-009 / TM-AG-013

## 8. Provider policy

Weather contract provider-independent kalır. Concrete V1 provider bu aşamada kanonik olarak seçilmemiştir.

Forecast horizon agent içinde hardcode edilmez; adapter metadata/config üzerinden gelir.

Unsupported field `UNKNOWN`/null kalır; uydurulmaz.

## 9. Freshness

Forecast yüksek volatilitededir.

Her forecast en az:
- retrievedAt,
- issuedAt if available,
- validWindow,
- freshnessStatus

taşır.

Stale forecast current-trip decision için kesin sinyal olamaz.

## 10. Hazard normalization

- `RAIN`
- `HEAVY_RAIN`
- `THUNDERSTORM`
- `SNOW_ICE`
- `HIGH_WIND`
- `HEAT`
- `COLD`
- `LOW_VISIBILITY`
- `UNKNOWN`

Provider-specific kodlar canonical hazard sınıflarına normalize edilir.

## 11. Activity sensitivity

- INDOOR → birçok yağış riski düşük relevance.
- OUTDOOR → rain/wind/heat/cold daha yüksek relevance.
- MIXED → conditional.
- TRAVEL_LEG → caution sinyali; rota hesaplamaz.

## 12. Plan bias semantics

- `PREFER_INDOOR`
- `PREFER_OUTDOOR`
- `CAUTION`
- `NO_SIGNAL`

Bu alan itinerary mutation değildir.

## 13. Risk and confidence

Risk deterministic thresholds + provider severity indicators üzerinden normalize edilir.

Confidence source freshness + forecast horizon + completeness + conflict ile etkilenir.

Climate-normal confidence, day-specific weather certainty değildir.

## 14. Conflict handling

- material trusted-source conflict görünür tutulur,
- false precision üretilmez,
- severe-risk conflict conservative caution üretebilir,
- Verification Agent conflict provenance'ını görür.

## 15. Journey compatibility — Issue #49

Weather signal `JourneySegmentRef` için üretilebilir. Agent segmenti kaldırmaz veya reroute etmez; yalnız risk/caution sinyali üretir.

## 16. Knowledge compatibility — Issue #50

Travel Knowledge Store climate normals/source registry sağlayabilir. Current-trip forecast V3/high-dynamic bilgi olarak fresh verification gerektirir. Background knowledge current forecast yerine geçmez.

## 17. Handoff

- TM-AG-009 Route Planner: WeatherSignalSet
- TM-AG-013 Adaptive Itinerary: repair-trigger candidate signal
- TM-AG-014 Verification: weather evidence/freshness
- TM-AG-008 Transportation: travel-leg caution only

## 18. Failure modes

- `CLIMATE_AS_FORECAST`
- `STALE_FORECAST_FALSE_CURRENT`
- `FORECAST_HORIZON_IGNORED`
- `ITINERARY_MUTATION_LEAKAGE`
- `ROUTE_AUTHORITY_LEAKAGE`
- `PLACE_DISCOVERY_LEAKAGE`
- `UNSUPPORTED_WEATHER_FIELD`
- `MISSING_FRESHNESS`
- `FALSE_PRECISION`

## 19. Harness binding

- R0 schema/data-type contract
- R1 forecast-vs-climate + hazard rules
- R2 recorded weather fixtures
- R3 provider adapter integration
- R4 activity/weather semantic relevance
- R5 stale/conflicting/missing/severe cases
- R6 itinerary/route/place authority leakage
- R7 controlled live forecast
- R8 regressions

## 20. Golden package coverage

```yaml
behavior_cases: 14
authority_cases: 6
tool_policy_cases: 5
context_lifecycle_cases: 4
provenance_cases: 4
provider_selected: false
journey_issue_49_compatible: true
knowledge_issue_50_compatible: true
```

## 21. Current status

```yaml
agent_spec_status: golden_package_v1
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
runtime_tests: pending
provider_selected: false
next_agent_package: TM-AG-008
```
