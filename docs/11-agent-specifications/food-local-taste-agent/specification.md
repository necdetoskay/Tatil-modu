# TM-AG-006 — Food & Local Taste Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-006 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 |
| Tarih | 2026-08-27 |

## 1. Purpose

Food & Local Taste Agent, hedef veya journey-stop bölgesindeki yerel gastronomi bağlamını ve gerçek yemek/restaurant adaylarını birbirinden ayırarak üretir.

```text
location scope
→ load/discover local taste context
→ discover real food venues
→ resolve identity + hours/menu/price evidence
→ apply dietary/hard constraints
→ evaluate family/meal-window fit
→ emit LocalTasteBrief[] + FoodCandidateSet
```

## 2. Boundary

Bu agent iki ayrı bilgi ailesi üretir.

### A. LocalTasteBrief

Bölgenin kültürel/gastronomik bağlamı:
- yöresel yemekler,
- ürünler,
- yemek gelenekleri,
- hangi lezzetin hangi bölgeyle ilişkili olduğu,
- stabil/slow-changing provenance.

Bu bilgi tek başına belirli bir işletmenin bugün o ürünü sunduğu anlamına gelmez.

### B. FoodCandidate

Gerçek işletme/restaurant/cafe/lokanta adayı:
- stable entity identity,
- kategori,
- çalışma saati,
- menü/dietary evidence,
- fiyat veya price-level sinyali,
- aile/meal-window fit,
- hard constraint disposition.

## 3. Non-goals

Agent:
- inter-city veya in-city rota hesaplamaz,
- günlük program sırasını değiştirmez,
- rezervasyon/order/ödeme yapmaz,
- review theme/pattern sentezi yapmaz,
- tek review'u fact'e dönüştürmez,
- menüde olmayan yemeği varmış gibi söylemez,
- exact fiyatı evidence olmadan üretmez,
- final kullanıcı cevabı yazmaz.

## 4. Inputs

- `TravelerProfile`
- `PreferencePolicyOutput`
- `DestinationBrief` veya journey stopover location context
- opsiyonel `JourneySegmentRef` (Issue #49)
- meal window (`breakfast | lunch | dinner | snack | flexible`)
- tarih/saat context'i varsa
- selected place/accommodation context refs varsa
- opsiyonel Travel Knowledge Store / Trusted Source Registry refs (Issue #50)
- `contextManifestId`

## 5. Outputs

Ana çıktı: `FoodAndLocalTasteResult`.

```yaml
localTasteBriefs: LocalTasteBrief[]
foodCandidates: FoodCandidate[]
rejectedCandidates: FoodCandidate[]
warnings: []
overallConfidence: 0..1
```

## 6. LocalTasteBrief rules

Bir yöresel lezzet kaydı:

```yaml
localTasteId: string
name: string
category: dish | dessert | beverage | ingredient | tradition | product
regionRefs: []
description: string|null
knowledgeStatus: VERIFIED | PARTIAL | DISCOVERY_ONLY
evidence: []
volatilityClass: V0 | V1
```

`LocalTasteBrief`, belirli işletme tavsiyesi değildir.

```text
"Nevşehir testi kebabı bölgesel bir yemektir"
!=
"Restaurant X bugün testi kebabı servis ediyor"
```

İkinci claim venue/menu evidence ister.

## 7. FoodCandidate core fields

Her aday en az:
- stable restaurant/entity ID,
- provider IDs,
- location,
- categories/cuisine tags,
- business status,
- opening-hours evidence,
- menu/dietary evidence,
- price fact/status,
- hard dietary/food constraints,
- family/meal-window fit,
- aggregate rating/count sinyali,
- review analysis ref,
- evidence/provenance,
- unresolved claims

taşır.

## 8. Allowed tools

- `TL-004` Place Search
- `TL-002` Official Page Fetcher
- `TL-001` Web Search
- `TL-009` Review Data Provider — aggregate/provider metadata only; semantic synthesis yasak
- `TL-010` Price & Fee Lookup
- `TL-014` Cache
- `TL-012` Schema Validator (harness)
- `TL-013` Rule Engine

## 9. Forbidden tools / ownership

- `TL-005` Directions → TM-AG-008.
- `TL-006` Weather → TM-AG-007.
- `TL-008` Accommodation → TM-AG-005.
- Review theme/sentiment synthesis → TM-AG-012.

Food Agent “5 dakika uzaklıkta” veya “rotanın üzerinde” gibi route claim üretmez; yalnız location bilgisini downstream'e verir.

## 10. Source policy

Öncelik:
1. Tier 1 — işletmenin resmî sitesi/menüsü, kamu veya resmî gastronomi kaynağı.
2. Tier 2 — structured place/provider data.
3. Tier 3 — review/platform aggregate experience signals.
4. Tier 4 — discovery only.

Issue #50 Travel Knowledge Store'daki stabil gastronomi bilgisi kullanılabilir; restaurant hours/menu/price için freshness gate atlanamaz.

## 11. Dietary and hard-constraint semantics

Örnek hard constraint'ler:
- alerjen exclusion,
- kullanıcı açıkça yemediği/istemediği içerik,
- gerekli dietary category,
- çocuk için yaş/güvenlik kuralı varsa,
- hard budget ceiling varsa.

Applicable hard dietary constraint `UNVERIFIED` ise aday `ACCEPTED` olamaz; `NEEDS_VERIFICATION` olur.

Hard violation → `REJECTED`.

Rating/popülerlik hard constraint'i override edemez.

## 12. Menu evidence

- `SUPPORTED_CURRENT`
- `SUPPORTED_OFFICIAL_UNDATED`
- `PARTIAL`
- `CONFLICTING`
- `UNKNOWN`

Bir yemek şehirde meşhur olsa bile venue menüsünde bulunduğu varsayılmaz.

## 13. Price semantics

- `LIVE`
- `OFFICIAL`
- `ESTIMATED`
- `UNKNOWN`

Review'da geçen fiyat current menu fiyatı sayılmaz.

## 14. Opening hours

- date/time-sensitive plan için current/official schedule tercih edilir.
- regular hours özel gün garantisi değildir.
- meal-window overlap doğrulanamıyorsa `NEEDS_VERIFICATION` olabilir.

## 15. Family / meal-window fit

Soft fit sinyalleri hard eligibility'den sonra değerlendirilir:
- çocukla oturma rahatlığı,
- meal duration burden,
- hızlı servis/uzun bekleme sinyali,
- indoor/outdoor,
- high-chair/family facility evidence,
- meal window uyumu.

## 16. Review boundary

Food Agent yalnız aggregate rating/count veya mevcut `ReviewSignalRef` kullanabilir.

Review theme/pattern üretimi TM-AG-012'ye aittir.

## 17. Journey compatibility — Issue #49

Aynı contract final destination ve corridor stop segmentlerinde kullanılabilir. `journeySegmentRef` varsa output provenance içinde korunur. Agent stopover sırasını belirlemez.

## 18. Knowledge compatibility — Issue #50

Background Travel Knowledge Curator önceden local taste catalog, trusted source registry, stable venue identity ve derived review snapshot sağlayabilir.

Runtime agent knowledge hit varsa broad rediscovery yerine targeted refresh yapabilir. Precomputed bilgi freshness/verification gate'i bypass etmez.

## 19. Eligibility disposition

- hard dietary violation → `REJECTED`
- business permanently closed → `REJECTED`
- required menu/dietary claim unverified → `NEEDS_VERIFICATION`
- required meal-window opening unverified → `NEEDS_VERIFICATION`
- no violation + applicable hard checks satisfied → `ACCEPTED`

## 20. Handoff

- TM-AG-008 Transportation: candidate locations only.
- TM-AG-009 Route Planner: accepted food candidates + meal-window facts.
- TM-AG-010 Budget: normalized price facts.
- TM-AG-012 Review Intelligence: stable venue refs.
- TM-AG-014 Verification: full evidence package.

## 21. Failure modes

- `LOCAL_TASTE_AS_VENUE_MENU_FACT`
- `UNSUPPORTED_MENU_CLAIM`
- `UNSUPPORTED_PRICE_CLAIM`
- `HARD_DIETARY_FALSE_PASS`
- `REVIEW_ANALYSIS_LEAKAGE`
- `ROUTE_AUTHORITY_LEAKAGE`
- `STALE_OPENING_HOURS`
- `BUSINESS_CLOSED_FALSE_PASS`
- `MISSING_PROVENANCE`
- `KNOWLEDGE_CACHE_BYPASSES_REFRESH`

## 22. Harness binding

- R0 schema/contract
- R1 hard dietary + menu/opening deterministic checks
- R2 recorded place/menu fixtures
- R3 place/official/price adapter integration
- R4 local-taste and family-fit semantic quality
- R5 stale/conflicting/menu-missing/provider outage
- R6 route/review/order/payment authority leakage
- R7 controlled live food lookup
- R8 regressions

## 23. Golden package coverage

```yaml
behavior_cases: 16
authority_cases: 8
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 4
journey_issue_49_compatible: true
knowledge_issue_50_compatible: true
```

## 24. Current status

```yaml
agent_spec_status: golden_package_v1
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
runtime_tests: pending
next_agent_package: TM-AG-007
```
