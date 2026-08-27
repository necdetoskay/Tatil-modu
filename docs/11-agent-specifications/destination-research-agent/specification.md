# TM-AG-003 — Destination Research Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-003 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Destination Research Agent, seyahat profili ve policy/constraint paketini kullanarak hedef şehir/bölge ve anlamlı çevre bölgeler için **region-level seyahat intelligence** üretir.

```text
scope target → discover regions → verify region facts → classify themes/seasonality → emit DestinationBriefSet
```

## 2. Authority boundary

Yapar:
- şehir/ilçe/bölge adaylarını keşfeder,
- resmî turizm ve seasonal guidance bağlamını araştırır,
- stable geo identity oluşturur,
- region-level experience theme çıkarır,
- nearby/exceptional relation üretir,
- downstream doğrulama ihtiyacını işaretler.

Yapmaz:
- tekil POI/otel/restoran listesi,
- driving distance/time hesabı,
- günlük itinerary,
- live weather forecast,
- hard constraint satisfaction kararı,
- final kullanıcı cevabı.

## 3. Inputs

- TM-AG-001 `TravelerProfile.v1`
- TM-AG-002 `PreferencePolicyOutput.v1`
- `destinationScope`: fixed target veya open destination
- date range varsa tarih bağlamı
- active radius/exception policy
- `contextManifestId`

## 4. Outputs

`DestinationBriefSet.v1` üretir.

Her brief:

```yaml
destinationId: string
name: string
administrativeType: city | district | region | resort_area | nature_region | thermal_region | mixed
relationToTarget: primary | nearby | exceptional
exceptionPolicyRefs: []
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

`relationToTarget=exceptional` ise `exceptionPolicyRefs` boş olamaz.

## 5. Required / forbidden context

Required:
- hedef/çıkış,
- family/travel summary,
- relevant constraints/preferences/exceptions,
- source trust/freshness policy.

Forbidden:
- full conversation history,
- unrelated personal data,
- provider credentials,
- hidden reasoning,
- raw POI/accommodation/review feeds.

## 6. Tool policy

Allowed:
- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-003` Geocoding
- `TL-007` Climate Normals
- `TL-014` Cache
- harness için `TL-012` Schema Validator

Forbidden:
- `TL-004` Place Search
- `TL-005` Directions & Distance Matrix
- `TL-006` Weather Forecast
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price & Fee Lookup

## 7. Source policy

Öncelik:

1. Tier 1 resmî kaynak,
2. Tier 2 structured geo/climate provider,
3. Tier 3 ikincil bağlam,
4. Tier 4 discovery-only.

Tier 4-only claim `VERIFIED_REGION_CONTEXT` olamaz.

## 8. Target modes

### Fixed target
Kullanıcının hedefi primary candidate'dır; open-destination selection yapılmaz.

### Open destination
Her aday selection rationale ve evidence taşır.

## 9. Radius / exception rules

- driving radius bu agent tarafından doğrulanmaz,
- radius constraint varsa `routeValidationRequired=true`,
- geocoding koordinatı driving distance değildir,
- exceptional candidate yalnız TM-AG-002 exception policy/delegation ile üretilebilir,
- exceptional candidate ilgili `exceptionPolicyRefs` taşır.

## 10. Region themes

- `culture_history`
- `nature`
- `beach_coast`
- `thermal_wellness`
- `family_attractions`
- `gastronomy`
- `rural_scenic`
- `urban_leisure`

Theme, POI önerisi değildir.

## 11. Seasonality

- Climate Normal yalnız `CLIMATE_NORMAL`.
- Kısa vadeli hava TM-AG-007'ye aittir.
- Resmî sezonluk rehber `OFFICIAL_SEASONAL_GUIDANCE`.

## 12. Constraint relevance

Agent constraint'i satisfied ilan etmez; sonraki doğrulama ihtiyacını taşır.

Örnek:
- women-only beach conditional hard → `place_level_privacy_verification`
- accessibility → `place_and_accommodation_accessibility_verification`
- drive radius → `route_validation`

## 13. Evidence / confidence

Her verified region claim evidence taşır:

```yaml
evidenceId: string
claimType: string
sourceTier: 1..4
sourceRef: string
retrievedAt: datetime
freshnessStatus: CURRENT | STALE | UNKNOWN
```

Confidence source trust + freshness + completeness + conflict üzerinden belirlenir.

## 14. Failure modes

- `TARGET_SCOPE_AMBIGUOUS`
- `UNVERIFIED_REGION_FACT`
- `CLIMATE_AS_FORECAST`
- `ROUTE_AUTHORITY_LEAKAGE`
- `PLACE_DISCOVERY_LEAKAGE`
- `OUT_OF_SCOPE_EXCEPTION_WITHOUT_POLICY`
- `SOURCE_TIER_VIOLATION`
- `STALE_CRITICAL_CONTEXT`
- `MISSING_PROVENANCE`

## 15. Handoff

Çıktı Orchestrator'a döner. Başlıca downstream:
- TM-AG-004 Place Intelligence
- TM-AG-005 Accommodation
- TM-AG-006 Food
- TM-AG-008 Transportation
- TM-AG-014 Verification

## 16. Evaluation

Hard fail:
- named POI listesi,
- drive duration/distance claim,
- climate-as-forecast,
- Tier4-only verified fact,
- exceptional candidate without exception ref,
- stale critical verified fact,
- forbidden tool,
- missing provenance.

## 17. Golden fixture coverage

```yaml
behavior_cases: 14
authority_cases: 7
tool_policy_cases: 7
context_lifecycle_cases: 4
provenance_cases: 4
```

Fixture: `tests/fixture-pack.v1.json`.

## 18. Contract sketch

```yaml
agentId: TM-AG-003
inputContract: destination-research-input.v1
outputContract: destination-brief-set.v1
writesCanonicalMemory: false
producesFinalUserResponse: false
```

## 19. Current status

```yaml
agent_spec_status: canonical_v1
input_schema: complete
output_schema: complete
authority_policy: complete
tool_policy: complete
source_policy: complete
decision_rules: complete
handoff_contracts: complete
evaluation_rubric: complete
fixture_pack: complete
implementation_allowed: false
prototype_allowed: false
next_agent: TM-AG-004
```
