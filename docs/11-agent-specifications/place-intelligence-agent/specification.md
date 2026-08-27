# TM-AG-004 — Place Intelligence Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-004 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Place Intelligence Agent, `DestinationBrief` içindeki bölgelerde gerçek ziyaret noktası/aktivite adaylarını keşfeder, kimliklerini sabitler, operasyonel/family-fit bilgilerini evidence-aware biçimde zenginleştirir ve `PlaceCandidateSet` üretir.

```text
region scope
→ discover real places
→ resolve stable identity
→ enrich operational facts
→ evaluate eligibility + family-fit signals
→ apply hard constraints
→ emit PlaceCandidateSet
```

## 2. Boundary

Bu agent **place/POI seviyesinde** çalışır.

Yapar:
- gerçek POI/aktivite keşfi,
- stable place identity + koordinat,
- kategori/tür normalizasyonu,
- işletme durumu ve çalışma saati gibi operational fact'leri evidence ile taşıma,
- park/accessibility gibi facility sinyallerini taşıma,
- çocuk/aile uygunluğu için explainable fit signal üretme,
- hard/conditional constraint'e göre `ACCEPTED | REJECTED | NEEDS_VERIFICATION` disposition üretme,
- fiyat/evidence/official verification ihtiyacını işaretleme.

Yapmaz:
- günlük rota veya ziyaret sırası kurmaz,
- sürüş süresi hesaplamaz,
- hava tahmini üretmez,
- otel/restoran seçmez,
- review pattern analizi yapmaz,
- kullanıcı adına rezervasyon/ödeme yapmaz,
- final cevap yazmaz.

## 3. Inputs

- `DestinationBriefSet` / seçili `DestinationBrief[]` (TM-AG-003)
- `TravelerProfile` (TM-AG-001)
- `PreferencePolicyOutput` (TM-AG-002)
- tarih aralığı veya ziyaret günü biliniyorsa tarih context'i
- place category scope
- opsiyonel prior selected/rejected place IDs
- `contextManifestId`

## 4. Output

Ana çıktı: `PlaceCandidateSet`.

Her `PlaceCandidate` en az şu kavramları taşır:

```yaml
placeId: string
providerPlaceIds: []
name: string
location: object
categories: []
businessStatus: OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY | FUTURE_OPENING | UNKNOWN
operationalFacts:
  openingHours: object
  price: object
  parking: object
  accessibility: object
eligibility:
  disposition: ACCEPTED | REJECTED | NEEDS_VERIFICATION
  hardConstraintChecks: []
familyFit:
  band: EXCELLENT | GOOD | CONDITIONAL | WEAK | UNKNOWN
  childAgeSignals: []
  fatigueRisk: LOW | MEDIUM | HIGH | UNKNOWN
  indoorOutdoor: INDOOR | OUTDOOR | MIXED | UNKNOWN
  estimatedVisitDurationMinutes: number|null
reviewSummaryRef: string|null
constraintRefs: []
evidence: []
unresolvedClaims: []
confidence: 0..1
```

## 5. Stable identity rule

Place candidate isim bazlı serbest metin değildir.

Mümkün olduğunda:
- provider place ID,
- resmî entity URL/ID,
- koordinat,
- normalize isim/adres

birlikte tutulur.

Aynı yerin farklı kaynaklardan gelen kayıtları duplicate candidate olarak çoğaltılmaz.

## 6. Allowed tools

- `TL-004` Place Search — ana discovery/structured place lookup.
- `TL-002` Official Page Fetcher — kritik operational/eligibility fact verification.
- `TL-001` Web Search — resmî kaynak discovery/fallback discovery.
- `TL-003` Geocoding — kimlik/konum disambiguation gerektiğinde.
- `TL-010` Price & Fee Lookup — ücret bilgisi.
- `TL-014` Cache.
- `TL-012` Schema Validator harness katmanında.
- `TL-013` Rule Engine hard constraint değerlendirmesinde.

## 7. Forbidden tools / ownership

- `TL-005` Directions & Distance Matrix → TM-AG-008 Transportation.
- `TL-006` Weather Forecast → TM-AG-007 Weather.
- `TL-008` Accommodation Search → TM-AG-005 Accommodation.
- `TL-009` Review Data Provider üzerinden theme/pattern analizi → TM-AG-012 Review Intelligence.

Place provider'ın aggregate `rating` / `userRatingCount` gibi alanları candidate signal olarak taşınabilir; review metinlerinden pattern çıkarılamaz.

## 8. Source policy summary

Kritik claim önceliği:

1. Tier 1 resmî kurum/tesis/işletme.
2. Tier 2 structured place/provider.
3. Tier 3 review/platform yalnız deneyim sinyali.
4. Tier 4 web discovery; kritik fact'i tek başına kesinleştiremez.

Kaynaklar çelişirse `conflicting` durum görünür tutulur; eski/düşük güvenli kaynak sessizce seçilmez.

## 9. Operational facts

### Business status

Kapalı kalıcı bir yer accepted candidate olamaz.

`CLOSED_PERMANENTLY` → `REJECTED`.

`CLOSED_TEMPORARILY` → ziyaret tarihiyle ilişkili güncel kanıt yoksa `NEEDS_VERIFICATION` veya `REJECTED`.

### Opening hours

- `currentOpeningHours` gibi date-sensitive veri varsa tarih bağlamıyla eşleştirilir.
- `regularOpeningHours`, özel günlerin yerine kesin veri sayılmaz.
- çalışma saati eksikse ziyaret planı için `NEEDS_VERIFICATION` olabilir.

### Price

Kesin ücret yalnız evidence ile taşınır.

Status:
- `OFFICIAL`
- `LIVE`
- `ESTIMATED`
- `UNKNOWN`

### Parking

`parkingOptions`/resmî otopark bilgisi facility signal olabilir; **yer garantisi** değildir.

### Accessibility

Provider accessibility alanları veya resmî açıklamalar signal/evidence olarak taşınabilir. Belirli erişilebilirlik hard constraint'i, gerekli fact doğrulanmadan satisfied sayılamaz.

## 10. Family-fit vs eligibility

Bu iki kavram ayrıdır.

### Eligibility

Hard/conditional constraint veya işletme kuralına dayanır.

Örnek:
- yaş sınırı,
- women-only beach şartı,
- accessibility hard requirement,
- kapalı işletme,
- açık kullanıcı exclusion'ı.

Eligibility hard fail ise yüksek rating/family-fit skoru adayı kurtaramaz.

### Family fit

Soft/heuristic quality signal'dır.

Örnek:
- çocuklar için genel uygunluk,
- yürüyüş/yorgunluk yükü,
- indoor/outdoor,
- önerilen ziyaret süresi,
- dinlenme alanı sinyali.

`goodForChildren` benzeri provider sinyali belirli yaş için resmî eligibility kanıtı değildir.

## 11. Conditional hard constraints

TM-AG-002'den gelen condition korunur.

Örnek:

```text
IF activity.type == beach
THEN place.womenOnlyStatus == true
```

Beach adayı için statü doğrulanmamışsa `ACCEPTED` değil `NEEDS_VERIFICATION`.

Beach olmayan adayda condition aktif değildir.

## 12. Hard constraint disposition

Her applicable hard constraint için:

```yaml
constraintId: string
status: SATISFIED | VIOLATED | UNVERIFIED | NOT_APPLICABLE
evidenceRefs: []
```

Aday disposition:
- herhangi bir `VIOLATED` → `REJECTED`
- violation yok ama applicable `UNVERIFIED` hard constraint varsa → `NEEDS_VERIFICATION`
- applicable hard constraints satisfied/not-applicable ise → `ACCEPTED`

## 13. Review boundary

Place Agent:
- aggregate rating/count taşıyabilir,
- review data availability işaretleyebilir,
- TM-AG-012 için entity/ref hazırlayabilir.

Place Agent yapamaz:
- “yorumların çoğu otopark kötü diyor” gibi pattern çıkarmak,
- tek yorumu operational fact yapmak,
- review sinyalini resmî source üzerine override etmek.

## 14. Evidence requirements

Date-sensitive/critical fact için minimum provenance:

```yaml
Evidence:
  evidenceId: string
  claimType: string
  sourceTier: 1 | 2 | 3 | 4
  sourceRef: string
  retrievedAt: datetime
  freshnessStatus: CURRENT | STALE | UNKNOWN
  valueRef: string|null
```

Kritik claim'ler:
- business status,
- opening hours,
- price,
- age/safety restriction,
- women-only beach status,
- accessibility hard requirement,
- official closure/rule.

## 15. Confidence

Confidence; identity resolution + source trust + freshness + completeness + conflicts + unresolved hard checks üzerinden hesaplanır.

`NEEDS_VERIFICATION` candidate yüksek overall confidence ile “kesin uygun” sunulamaz.

## 16. Failure modes

- `PLACE_IDENTITY_AMBIGUOUS`
- `DUPLICATE_PLACE_NOT_MERGED`
- `UNSUPPORTED_OPENING_HOURS`
- `STALE_OPERATIONAL_FACT`
- `HARD_CONSTRAINT_FALSE_PASS`
- `CONDITION_DROPPED`
- `ROUTE_AUTHORITY_LEAKAGE`
- `WEATHER_AUTHORITY_LEAKAGE`
- `REVIEW_ANALYSIS_LEAKAGE`
- `OFFICIAL_SOURCE_OVERRIDDEN_BY_LOW_TRUST`
- `MISSING_PROVENANCE`
- `PARKING_SIGNAL_AS_GUARANTEE`

## 17. Clarification policy

Agent mümkün olduğunca kullanıcıya soru sormadan evidence gap üretir.

Clarification yalnız kullanıcı preference/constraint anlamı unresolved geldiyse Orchestrator'a önerilir. Kaynak eksikliği kullanıcı sorusu değil verification problemidir.

## 18. Handoff

Çıktı Orchestrator'a döner.

Downstream:
- TM-AG-007 Weather
- TM-AG-008 Transportation
- TM-AG-009 Route Planner
- TM-AG-010 Budget
- TM-AG-011 Public Authority Intelligence
- TM-AG-012 Review Intelligence
- TM-AG-014 Verification

TM-AG-009 yalnız `ACCEPTED` ve gerekli repair/verification sonrası kabul edilmiş adayları planlayabilir.

## 19. Evaluation hard fails

- olmayan bir yer uydurmak,
- permanent closed yeri accepted yapmak,
- hard constraint violation'ı skorla telafi etmek,
- unverified hard requirement'i satisfied yapmak,
- exact route duration üretmek,
- hava tahmini üretmek,
- review pattern analizi yapmak,
- resmî kaynakla çelişen düşük-tier bilgiyi sessizce seçmek,
- evidence'sız kesin opening hour/price/eligibility claim'i.

## 20. Current provider note

Provider adapter sözleşmesi provider-independent'tır. V1 için structured place adapter'ında Google Places tercih edilir; provider alanları kanonik PlaceCandidate'a normalize edilir. Provider'ın alanı desteklemesi, alanın her place için dolu olacağını garanti etmez.

## 21. Contract sketch

```yaml
agentId: TM-AG-004
inputContract: place-intelligence-input.v1
outputContract: place-candidate-set.v1
allowedTools:
  - TL-001
  - TL-002
  - TL-003
  - TL-004
  - TL-010
  - TL-013
  - TL-014
forbiddenDomains:
  - route_calculation
  - weather_forecast
  - accommodation_search
  - review_pattern_analysis
writesCanonicalMemory: false
producesFinalUserResponse: false
```

## 22. Harness binding

Zorunlu RIVE/Harness coverage:
- R0 schema/contract,
- R1 hard constraint disposition,
- R2 recorded provider fixture,
- R3 Places/official adapter integration,
- R4 family-fit semantic quality,
- R5 stale/conflicting/missing facts,
- R6 authority/tool leakage,
- R7 controlled live place lookup,
- R8 production regression.

## 23. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
```
