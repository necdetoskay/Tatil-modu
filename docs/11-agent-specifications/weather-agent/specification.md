# TM-AG-007 — Weather Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-007 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
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
- forecast horizon dışında gerekiyorsa climate-normal context,
- yağış/sıcaklık/rüzgâr/fırtına/kar gibi risk sinyalleri,
- indoor/outdoor bias,
- weather-sensitive activity için caution/verification sinyali,
- freshness ve forecast horizon bilgisini taşıma.

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
- activity exposure type: `INDOOR | OUTDOOR | MIXED | TRAVEL_LEG | UNKNOWN`
- optional journeySegmentRef (Issue #49)
- optional current itinerary/day-plan ref
- current date/time context
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
CLIMATE_NORMAL cannot assert "27 Eylül'de yağmur yağacak".
```

## 6. Allowed tools

- `TL-006` Weather Forecast — current forecast/conditions provider adapter.
- `TL-007` Climate Normals — forecast horizon dışında veya genel seasonal context için.
- `TL-014` Cache — TTL/freshness-aware.
- `TL-012` Schema Validator harness katmanında.
- `TL-013` Rule Engine deterministic hazard thresholds için.

## 7. Forbidden tools / ownership

- `TL-004` Place Search → TM-AG-004.
- `TL-005` Directions → TM-AG-008.
- `TL-008` Accommodation → TM-AG-005.
- itinerary ordering/repair → TM-AG-009 / TM-AG-013.

## 8. Provider policy

Weather contract provider-independent kalır. Concrete V1 provider bu aşamada kanonik olarak seçilmemiştir.

Provider adapter şu minimum alanları normalize edebilmelidir:
- location/time window,
- forecast issue/retrieval time,
- temperature,
- precipitation probability/amount where available,
- wind,
- weather code/condition,
- severe/hazard indicators where available,
- source/provider reference.

Unsupported field `UNKNOWN` kalır; uydurulmaz.

## 9. Freshness

Forecast yüksek volatilitededir.

Her forecast:
- `retrievedAt`,
- `issuedAt` if available,
- `validWindow`,
- `freshnessStatus`

taşır.

Stale forecast current-trip decision için kesin sinyal olamaz.

## 10. Hazard normalization

Canonical hazard classes:
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

Weather Agent activity exposure type'i kullanabilir:

- INDOOR → çoğu yağış riski düşük plan impact.
- OUTDOOR → rain/wind/heat/cold daha yüksek relevance.
- MIXED → conditional.
- TRAVEL_LEG → severe weather route/travel caution sinyali; rota hesaplamaz.

## 12. Plan bias semantics

- `PREFER_INDOOR`: weather conditions outdoor plan için belirgin risk oluşturuyor.
- `PREFER_OUTDOOR`: koşullar outdoor plan için olumlu görünüyor.
- `CAUTION`: belirsiz/orta-yüksek risk veya weather-sensitive context.
- `NO_SIGNAL`: yeterli evidence yok veya weather relevance düşük.

Bu alan bir itinerary mutation değildir.

## 13. Risk and confidence

Risk deterministic thresholds + provider severity indicators üzerinden normalize edilir.

Confidence:
- source freshness,
- forecast horizon,
- field completeness,
- provider conflict
ile etkilenir.

Uzun horizon confidence düşürülebilir; climate normal için confidence weather-event certainty değildir.

## 14. Conflict handling

Birden fazla trusted weather source kullanılırsa:
- önemli conflict görünür tutulur,
- false precision üretilmez,
- severe risk varsa conservative caution üretilebilir,
- Verification Agent conflict'i görebilir.

## 15. Journey compatibility — Issue #49

Weather signal belirli `JourneySegmentRef` için üretilebilir.

Örnek:
- corridor city stop,
- inter-city travel leg,
- overnight stop next-day activity window.

Weather Agent segmenti kaldırmaz veya rotayı değiştirmez. Gerekirse TM-AG-013 için repair trigger signal üretir.

## 16. Knowledge compatibility — Issue #50

Travel Knowledge Store:
- climate normals,
- known seasonal patterns,
- source registry
sağlayabilir.

Ancak current-trip forecast V3/high-dynamic bilgi olarak live/fresh verification gerektirir. Background knowledge current forecast'ın yerine geçmez.

## 17. Handoff

- TM-AG-009 Route Planner: WeatherSignalSet only.
- TM-AG-013 Adaptive Itinerary: repair trigger/risk signal.
- TM-AG-014 Verification: forecast/climate evidence + freshness.
- TM-AG-008 Transportation: travel-leg weather caution signal only; no route decision.

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
- R1 forecast-vs-climate and deterministic hazard rules
- R2 recorded weather fixtures
- R3 provider adapter integration
- R4 activity/weather relevance semantic quality
- R5 stale/conflicting/missing/severe cases
- R6 itinerary/route/place authority leakage
- R7 controlled live forecast
- R8 regressions

## 20. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
provider_selected: false
journey_issue_49_compatible: true
knowledge_issue_50_compatible: true
```
