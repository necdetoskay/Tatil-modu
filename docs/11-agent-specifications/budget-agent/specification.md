# TM-AG-010 — Budget Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-010 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Budget Agent, seçilmiş itinerary içindeki maliyet kayıtlarını deterministic ve provenance-aware `BudgetLedger` haline getirir; kullanıcı bütçe limitleriyle karşılaştırır.

```text
itinerary + normalized cost facts + budget constraints
→ normalize ledger items
→ deterministic arithmetic
→ separate known/estimated/unknown exposure
→ assess budget status
→ emit BudgetLedger
```

## 2. Boundary

Yapar:
- accommodation/activity/food/transport/toll/parking/fee maliyetlerini ledger'a bağlama,
- quantity × unit arithmetic,
- LIVE/OFFICIAL/ESTIMATED/UNKNOWN statülerini koruma,
- known total ve projected total hesaplama,
- unknown exposure görünürlüğü,
- hard overall/category budget limit değerlendirmesi,
- over-budget ise repair ihtiyacı üretme.

Yapmaz:
- itinerary sırasını değiştirmez,
- daha ucuz POI/otel/restoran keşfetmez,
- UNKNOWN fiyatı 0 kabul etmez,
- kur/fiyat uydurmaz,
- rezervasyon/ödeme yapmaz,
- final kullanıcı metni yazmaz.

## 3. Inputs

- `DraftItinerary` (TM-AG-009)
- selected accommodation price facts
- selected place/activity fee facts
- selected food price facts varsa
- route/toll/parking/fuel cost facts veya açık estimate model refs
- `PreferencePolicyOutput` budget constraints
- optional exchange-rate facts supplied by upstream capability
- cost policy snapshot
- `contextManifestId`

## 4. Output

Ana çıktı: `BudgetLedger.v1`.

```yaml
ledgerId: string
itineraryRef: string
targetCurrency: string
items: BudgetItem[]
knownTotal: number
projectedTotal: number|null
unknownItemCount: integer
budgetLimits: []
assessment:
  status: WITHIN_BUDGET | PROVISIONALLY_WITHIN | OVER_BUDGET | UNKNOWN
  headroomAmount: number|null
  overageAmount: number|null
repairNeeds: []
warnings: []
```

## 5. BudgetItem

```yaml
itemId: string
category: ACCOMMODATION | ACTIVITY | FOOD | TRANSPORT | FUEL | TOLL | PARKING | TRANSIT | FEE | SHOPPING | OTHER
itineraryRefs: []
entityRef: string|null
quantity: number|null
unitAmount: number|null
totalAmount: number|null
currency: string
priceStatus: LIVE | OFFICIAL | ESTIMATED | UNKNOWN
calculationMethod: DIRECT | QUANTITY_X_UNIT | FORMULA | UNKNOWN
sourceRefs: []
freshnessStatus: CURRENT | STALE | UNKNOWN
```

`UNKNOWN` item'ın `totalAmount` alanı null kalmalıdır.

## 6. Total semantics

### knownTotal
Yalnız `LIVE` + `OFFICIAL` ve amount mevcut kalemler.

### projectedTotal
`knownTotal + ESTIMATED` amount'lar.

UNKNOWN item projected total'a 0 olarak eklenmez.

## 7. Assessment semantics

- `WITHIN_BUDGET`: hard budget limiti var, ilgili tüm kritik kalemler known/estimated policy açısından yeterli ve projected total limit içinde.
- `PROVISIONALLY_WITHIN`: mevcut projected total limit içinde fakat unknown/non-final exposure var.
- `OVER_BUDGET`: deterministic karşılaştırmada applicable hard limit aşılmış.
- `UNKNOWN`: yeterli maliyet verisi veya karşılaştırılabilir currency yok.

## 8. Budget constraints

Desteklenen limit örnekleri:
- overall trip max,
- accommodation max,
- daily max,
- activity max,
- per-meal max,
- journey/transport max.

Hard budget constraint ihlali soft plan kalitesiyle telafi edilemez.

## 9. Currency policy

Budget Agent kur uyduramaz.

- aynı currency → normal toplama.
- farklı currency + evidence-backed conversion fact → normalize edilebilir.
- farklı currency + conversion fact yok → ilgili birleşik toplam `UNKNOWN` veya ayrı currency subtotal olarak tutulur.

## 10. Estimate policy

Estimate kullanılabilir ancak:
- formula/model ref taşır,
- `ESTIMATED` olarak kalır,
- LIVE/OFFICIAL'a yükseltilmez,
- uncertainty/warning görünür olur.

Örneğin fuel estimate:

```text
route_km × consumption_per_km × fuel_unit_price
```

Her input provenance taşımalıdır.

## 11. Allowed tools

- `TL-010` Price & Fee Lookup — eksik resmi/güncel fee lookup gerektiğinde.
- `TL-011` Calculator — arithmetic.
- `TL-012` Schema Validator.
- `TL-013` Rule Engine — budget limits/status.
- `TL-014` Cache.

## 12. Forbidden tools

- place/accommodation/food discovery,
- route optimization,
- weather/review research,
- booking/payment.

Budget Agent daha ucuz alternatif aramaz; repair target üretir.

## 13. Source policy

Fiyat güven sırası:
1. matching LIVE quote,
2. current OFFICIAL tariff/menu/fee,
3. explicit ESTIMATED method,
4. UNKNOWN.

Tier 4 veya review fiyatı current authoritative price olarak kullanılamaz.

## 14. Freshness

Live/dynamic prices query/date/occupancy context'ine bağlıdır.

Stale price current LIVE olarak kullanılamaz. Accommodation query-signature mismatch → LIVE price invalid.

## 15. Itinerary provenance

Her ledger item hangi plan parçasına ait olduğunu taşır:
- day/block ref,
- journeySegmentRef varsa,
- accommodation/food/place/route entity ref.

Issue #49 stopover nedeniyle oluşan ek geceleme/toll/fuel maliyetleri ilgili JourneySegment'e bağlanmalıdır.

## 16. Shopping compatibility — Issue #50 extension

Yerel ürün/alışveriş planı ileride itinerary'ye eklenirse `SHOPPING` category desteklenir.

Ancak LocalProductKnowledge içindeki kültürel ürün bilgisi fiyat değildir. Belirli ürün/mağaza fiyatı runtime evidence ister; yoksa `UNKNOWN/ESTIMATED` kalır.

## 17. Repair boundary

`OVER_BUDGET` veya hard budget blocker halinde Budget Agent itinerary'yi değiştirmez.

```text
Budget Agent → repairNeed
→ TM-AG-013 Adaptive Itinerary
→ revised itinerary
→ Budget Agent re-run
```

## 18. Deterministic invariants

1. UNKNOWN = 0 değildir.
2. knownTotal yalnız LIVE/OFFICIAL.
3. projectedTotal estimate'leri içerir, unknown'ları içermez.
4. currency conversion evidence'sız birleştirme yok.
5. hard over-budget accepted PASS olamaz.
6. item total arithmetic reproducible olmalıdır.
7. duplicate cost item double-count edilemez.
8. tax/fee dahil durumu bilinmiyorsa finality düşer.

## 19. Failure modes

- `UNKNOWN_AS_ZERO`
- `STALE_PRICE_AS_LIVE`
- `QUERY_SIGNATURE_MISMATCH`
- `CURRENCY_CONVERSION_INVENTED`
- `DOUBLE_COUNTED_COST`
- `ARITHMETIC_ERROR`
- `HARD_BUDGET_FALSE_PASS`
- `MISSING_ITEM_PROVENANCE`
- `PRICE_STATUS_PROMOTION`
- `ITINERARY_MUTATION_LEAKAGE`

## 20. Handoff

- TM-AG-014 Verification: BudgetLedger + provenance.
- TM-AG-013 Adaptive: repairNeeds when over budget/blocker.
- TM-AG-015 Explanation: verified budget rationale only after Verification.

## 21. Harness binding

- R0 ledger schema
- R1 deterministic arithmetic/status/currency rules
- R2 recorded cost fixtures
- R3 TL-010/Calculator integration
- R4 uncertainty/explanation semantic quality
- R5 stale/missing/mixed-currency/double-count cases
- R6 discovery/itinerary mutation/payment leakage
- R7 controlled current fee lookup
- R8 regressions

## 22. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
journey_issue_49_compatible: true
knowledge_issue_50_shopping_compatible: true
```
