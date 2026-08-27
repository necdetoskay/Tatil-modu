# TM-AG-003 — Destination Research Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-003 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Destination Research Agent, seyahat profili ve policy/constraint paketini kullanarak hedef şehir/bölge ve anlamlı çevre bölgeler için **bölge seviyesinde seyahat intelligence** üretir.

```text
scope target → discover regions → verify region-level facts → classify themes/seasonality → emit DestinationBrief[]
```

## 2. Boundary

Bu agent **region-level** çalışır.

Yapar:
- şehir/ilçe/bölge adaylarını keşfeder,
- resmî turizm bağlamı ve bölgesel temaları çıkarır,
- sezon/iklim bağlamını doğru veri türüyle taşır,
- nearby/exceptional adayları gerekçelendirir,
- hangi claim'lerin sonraki agentlarda doğrulanacağını işaretler.

Yapmaz:
- tekil POI/otel/restoran listesi üretmez,
- rota/sürüş süresi hesaplamaz,
- günlük plan yapmaz,
- canlı hava tahmini üretmez,
- hard constraint'i karşılanmış saymaz,
- final kullanıcı cevabı yazmaz.

## 3. Inputs

- `TravelerProfile` (TM-AG-001)
- `PreferencePolicyOutput` (TM-AG-002)
- target/open-destination scope
- trip date range varsa tarih bağlamı
- allowed research radius/exception policy
- `contextManifestId`

## 4. Outputs

Ana çıktı: `DestinationBriefSet`.

Her `DestinationBrief` en az:

```yaml
destinationId: string
name: string
administrativeType: city | district | region | resort_area | nature_region | thermal_region | mixed
relationToTarget: primary | nearby | exceptional
geoIdentity:
  latitude: number|null
  longitude: number|null
  evidenceRefs: []
experienceThemes: []
seasonality:
  dataType: CLIMATE_NORMAL | OFFICIAL_SEASONAL_GUIDANCE | NONE
  summary: string|null
  evidenceRefs: []
constraintRelevance: []
routeValidationRequired: boolean
researchStatus: VERIFIED_REGION_CONTEXT | PARTIAL | DISCOVERY_ONLY
unresolvedClaims: []
evidence: []
confidence: 0..1
```

## 5. Required context

- hedef/çıkış bilgisi,
- family/travel summary,
- active hard/conditional constraints,
- soft preferences ve exception policies,
- source trust/freshness policy,
- current date yalnız freshness değerlendirmesi için.

## 6. Forbidden context

- full conversation history,
- unrelated personal data,
- provider credentials,
- hidden reasoning,
- raw accommodation/POI/review feeds,
- downstream route or itinerary decisions.

## 7. Allowed tools

- `TL-001` Web Search — discovery.
- `TL-002` Official Page Fetcher — region/tourism/resmî guidance verification.
- `TL-003` Geocoding — stable geo identity.
- `TL-007` Climate Normals — uzun dönem mevsim bağlamı.
- `TL-014` Cache.
- `TL-012` Schema Validator harness katmanında.

`TL-005` Directions & Distance Matrix bu agent'a yasaktır; gerçek yol mesafesi TM-AG-008'e aittir.

## 8. Source policy summary

Öncelik:

1. Tier 1 resmî Bakanlık/valilik/belediye/turizm/korunan alan kaynakları.
2. Tier 2 geocoding/climate structured provider.
3. Tier 4 web yalnız discovery için; kritik region fact'i tek başına kesinleştiremez.

## 9. Target modes

### Fixed target
Kullanıcı hedef il/bölge verdiyse ana çalışma o hedef ve anlamlı çevresidir.

### Open destination
Kullanıcı destinasyon seçimini sisteme bırakmışsa agent bölge adayları üretebilir; her aday açık selection rationale ve evidence taşır.

## 10. Radius and exception handling

Bu agent route distance authority'sine sahip değildir.

- `150 km` gibi driving radius hard constraint'i **karşılandı** diye işaretleyemez.
- Candidate'ı `nearby` olarak keşfedebilir ancak `routeValidationRequired=true` taşır.
- Açık `ExceptionPolicy` varsa exceptional aday üretebilir; exception gerekçesi source/provenance ile izlenir.
- Düz çizgi mesafe sürüş mesafesi olarak sunulamaz.

## 11. Experience themes

Region-level theme taxonomy örnekleri:

- `culture_history`
- `nature`
- `beach_coast`
- `thermal_wellness`
- `family_attractions`
- `gastronomy`
- `rural_scenic`
- `urban_leisure`

Bu theme'ler tekil POI önerisi değildir.

## 12. Seasonality rules

- `TL-007 Climate Normals` sonucu **forecast değildir**.
- Uzun dönem iklim verisi `CLIMATE_NORMAL` olarak açıkça etiketlenir.
- Kısa vadeli hava kararı TM-AG-007 Weather Agent'a aittir.
- Sezonluk resmî kapanış/erişim rehberi varsa `OFFICIAL_SEASONAL_GUIDANCE` olarak taşınır.

## 13. Constraint relevance

Agent aktif constraint'i yalnız bölge araştırma relevance'ı olarak taşır.

Örnek:
- beach conditional-hard varsa `beach_coast` theme için `requires_place_level_privacy_verification`.
- accessibility hard ise `requires_place_and_accommodation_accessibility_verification`.
- drive radius hard ise `requires_route_validation`.

Bu agent bu constraint'leri karşılanmış ilan etmez.

## 14. Evidence requirements

Region fact claim'leri evidence taşır:

```yaml
Evidence:
  evidenceId: string
  claimType: string
  sourceTier: 1 | 2 | 3 | 4
  sourceRef: string
  retrievedAt: datetime
  freshnessStatus: CURRENT | STALE | UNKNOWN
```

Discovery-only kaynağı final verified fact'e dönüşmez.

## 15. Confidence

Confidence; source trust + completeness + freshness + conflict durumuna göre hesaplanır.

- official current direct region match → yüksek,
- partial/secondary region context → orta,
- discovery-only veya unresolved conflict → düşük.

## 16. Failure modes

- `TARGET_SCOPE_AMBIGUOUS`
- `UNVERIFIED_REGION_FACT`
- `CLIMATE_AS_FORECAST`
- `ROUTE_AUTHORITY_LEAKAGE`
- `PLACE_DISCOVERY_LEAKAGE`
- `OUT_OF_SCOPE_EXCEPTION_WITHOUT_POLICY`
- `SOURCE_TIER_VIOLATION`
- `STALE_CRITICAL_CONTEXT`
- `MISSING_PROVENANCE`

## 17. Clarification triggers

- target scope gerçekten belirsizse,
- open destination için minimum coğrafi kapsam yoksa,
- kullanıcının exception/radius ifadeleri TM-AG-002 tarafından unresolved gelmişse.

Diğer eksikler `unresolvedClaims` olarak taşınabilir; agent gereksiz clarification üretmez.

## 18. Handoff

Çıktı Orchestrator'a döner.

Başlıca downstream:
- TM-AG-004 Place Intelligence
- TM-AG-005 Accommodation
- TM-AG-006 Food
- TM-AG-008 Transportation
- TM-AG-014 Verification

## 19. Evaluation

Hard fail:
- tekil POI listesi üretmek,
- driving duration/distance claim'i üretmek,
- climate normal'i weather forecast olarak sunmak,
- Tier 4 discovery kaynağını kritik resmî fact gibi kullanmak,
- exception policy olmadan out-of-scope candidate'ı normal aday yapmak,
- evidence'sız verified region fact üretmek.

## 20. Contract sketch

```yaml
agentId: TM-AG-003
inputContract: destination-research-input.v1
outputContract: destination-brief-set.v1
allowedTools:
  - TL-001
  - TL-002
  - TL-003
  - TL-007
  - TL-014
forbiddenTools:
  - TL-004
  - TL-005
  - TL-006
  - TL-008
  - TL-009
writesCanonicalMemory: false
producesFinalUserResponse: false
```

## 21. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
```
