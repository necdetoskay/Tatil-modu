# TM-AG-005 — Accommodation Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-005 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Accommodation Agent, hedef veya journey stopover bölgesinde tarih, kişi/oda yapısı, hard constraints ve aile ihtiyaçlarıyla uyumlu gerçek konaklama adaylarını bulur; availability, price, facility ve policy bilgisini provenance ile normalize eder.

```text
stay request
→ search properties
→ resolve property identity/details
→ verify occupancy + availability + price
→ apply hard constraints
→ rank family/stay fit
→ emit AccommodationCandidateSet
```

## 2. Boundary

Yapar:
- konaklama discovery/search,
- property identity/details,
- verilen stay query için availability/price lookup,
- oda/occupancy ve çocuk politikası uygunluğu,
- facility/policy evidence,
- family/rest/location fit sinyali,
- `ACCEPTED | REJECTED | NEEDS_VERIFICATION` disposition.

Yapmaz:
- rezervasyon/order oluşturmaz,
- ödeme almaz,
- fiyat/müsaitlik garantisi vermez,
- günlük gezi planı kurmaz,
- inter-city route hesaplamaz,
- review pattern analizi yapmaz,
- final cevap yazmaz.

## 3. Inputs

- `TravelerProfile`
- `PreferencePolicyOutput`
- `DestinationBrief` veya seçilmiş stopover/corridor city context
- `checkIn`, `checkOut`
- guest/room occupancy request
- budget context varsa bütçe sınırı
- opsiyonel `JourneySegmentRef` (Issue #49)
- `contextManifestId`

## 4. Journey compatibility

Aynı contract aşağıdaki stay rollerini destekler:

- final-destination stay,
- `OVERNIGHT_ONLY`,
- `OVERNIGHT_AND_DAY`,
- `MULTI_DAY` stopover.

Accommodation Agent journey sırasını belirlemez; yalnız Orchestrator/Route Planner tarafından verilen stay window için aday üretir.

## 5. Output

Ana çıktı: `AccommodationCandidateSet`.

Root output tek bir `stayQuerySignature` taşır ve bu signature içinde `journeySegmentRef` de korunur.

```yaml
stayQuerySignature:
  locationName: string
  checkIn: date
  checkOut: date
  adults: integer
  childrenAges: []
  rooms: integer
  currency: string|null
  stayRole: FINAL_DESTINATION | OVERNIGHT_ONLY | OVERNIGHT_AND_DAY | MULTI_DAY
  journeySegmentRef: string|null
```

Her candidate:

```yaml
accommodationId: string
providerIds: []
name: string
location: object
availability:
  status: LIVE_AVAILABLE | LIVE_UNAVAILABLE | UNKNOWN
  retrievedAt: datetime|null
  freshnessStatus: CURRENT | STALE | UNKNOWN
  querySignatureMatch: boolean
  evidenceRefs: []
priceQuote:
  status: LIVE | OFFICIAL | ESTIMATED | UNKNOWN
  totalAmount: number|null
  currency: string|null
  taxesFeesKnown: boolean|null
  retrievedAt: datetime|null
  freshnessStatus: CURRENT | STALE | UNKNOWN
  querySignatureMatch: boolean
  evidenceRefs: []
occupancyFit:
  status: SATISFIED | VIOLATED | UNVERIFIED
  childrenPolicyStatus: SATISFIED | VIOLATED | UNVERIFIED | NOT_APPLICABLE
  evidenceRefs: []
facilities: []
policies: object
eligibility:
  disposition: ACCEPTED | REJECTED | NEEDS_VERIFICATION
  dispositionReasons: []
  hardConstraintChecks: []
familyFit: object
reviewAnalysisRef: string|null
evidence: []
unresolvedClaims: []
confidence: 0..1
```

## 6. Query-signature invariant

Live availability/price yalnız şu sorgu bağlamına aittir:

- property/location search context,
- check-in/out,
- adults,
- children/ages provider desteklediği biçimde,
- rooms/occupancy,
- currency/booker context gerektiğinde,
- stay role,
- journey segment varsa `journeySegmentRef`.

Bir sorgunun LIVE fiyatı başka tarih/occupancy/segment için yeniden kullanılamaz.

## 7. Allowed tools

- `TL-008` Accommodation Search — search, availability, property/product details.
- `TL-004` Place Search — location/entity corroboration ve facility/location signal gerektiğinde.
- `TL-002` Official Page Fetcher — property facility/policy doğrulaması.
- `TL-011` Calculator — totals/budget arithmetic.
- `TL-014` Cache — TTL-sensitive cache.
- `TL-012` Schema Validator harness katmanında.
- `TL-013` Rule Engine hard constraints için.

Review semantic analizi TM-AG-012'ye aittir.

## 8. V1 provider policy

Booking.com Demand API erişimi varsa v1 accommodation adapter için tercih edilir.

Provider-independent contract korunur. Provider API erişimi yoksa:
- property candidate bulunabilir,
- availability `UNKNOWN`,
- live price `UNKNOWN`,
- sistem bunları `LIVE` diye sunamaz.

## 9. Availability

- `LIVE_AVAILABLE`: aynı query signature için güncel provider sonucu.
- `LIVE_UNAVAILABLE`: aynı query signature için güncel sonuçta uygun ürün yok.
- `UNKNOWN`: canlı lookup yapılmadı/başarısız/stale.

`LIVE_UNAVAILABLE` candidate normal accepted stay pool'a giremez.

## 10. Price

- `LIVE`: current search/availability response tied to query signature.
- `OFFICIAL`: property/official tariff fakat live inventory quote değil.
- `ESTIMATED`: açık estimate source/method ile.
- `UNKNOWN`: güvenilir fiyat yok.

Price ve availability dinamiktir. Eski cached quote current/live olarak sunulamaz.

## 11. Occupancy and children policy

Aile için temel hard check:
- yetişkin/çocuk sayısı,
- room/product occupancy,
- çocuk yaş/policy uyumu,
- gerekli oda sayısı.

Occupancy doğrulanmadan `ACCEPTED` live stay önerisi üretilemez; en fazla `NEEDS_VERIFICATION`.

## 12. Facilities and policies

Evidence gerekebilecek alanlar:
- parking,
- breakfast,
- pool/children pool,
- thermal/spa,
- family room,
- accessibility,
- cancellation,
- meal plan,
- taxes/extra charges,
- check-in/check-out rules.

Provider field absence `false` değildir; `UNKNOWN` olabilir.

## 13. Location fit boundary

Accommodation Agent konum koordinatı ve area-fit sinyali taşıyabilir; kesin route duration TM-AG-008'e aittir.

“Merkeze 10 dakika” gibi driving claim route evidence olmadan üretilemez.

## 14. Hard constraints

Örnek:
- max accommodation budget,
- required parking,
- accessibility requirement,
- required room/occupancy,
- explicit accommodation type exclusion,
- hard facility requirement.

Hard violation rating veya genel family-fit ile telafi edilemez.

## 15. Eligibility disposition

- live unavailable → `REJECTED` for the exact stay query.
- occupancy violated → `REJECTED`.
- hard facility/policy violated → `REJECTED`.
- applicable hard requirement unverified → `NEEDS_VERIFICATION`.
- no violation + hard checks satisfied → `ACCEPTED`.

## 16. Evidence/provenance

Critical evidence:
- availability,
- price,
- occupancy,
- cancellation,
- required facility,
- child policy,
- taxes/fees when used in budget decision.

Every disposition reason points to evidence IDs or explicit unresolved state.

## 17. Authority boundaries

Forbidden:
- Orders/booking creation,
- payment operation,
- user credential/account access,
- route/time calculation,
- review theme synthesis,
- exact current price without matching live evidence.

## 18. Handoff

Downstream:
- TM-AG-008 Transportation: property location only.
- TM-AG-009 Route Planner: selected stay window, check-in/out, location, availability/eligibility status.
- TM-AG-010 Budget: normalized price/tax/fee facts.
- TM-AG-012 Review Intelligence: stable property entity ref.
- TM-AG-014 Verification: full candidate/evidence package.

For Issue #49 stopover stays, `journeySegmentRef` and `stayRole` must survive every handoff.

## 19. Harness binding

- R0 schema/query-signature contract
- R1 occupancy/availability/price deterministic rules
- R2 recorded provider fixtures
- R3 accommodation adapter integration
- R4 family/stay fit semantic quality
- R5 stale quote/conflict/missing facility/provider outage
- R6 booking/payment/route/review authority leakage
- R7 controlled live search/availability
- R8 regressions

## 20. Current status

```yaml
agent_spec_status: golden_package_v1_ready
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
journey_issue_49_compatible: true
contract_gap_resolved:
  - journeySegmentRef_preserved_in_stayQuerySignature
```
