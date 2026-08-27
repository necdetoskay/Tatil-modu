# TM-AG-010 — Budget Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-010 |
| Sürüm | 1.0 |
| Durum | CANONICAL / GOLDEN PACKAGE |
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
- accommodation/activity/food/transport/toll/parking/fee/shopping maliyetlerini ledger'a bağlama,
- quantity × unit arithmetic,
- `LIVE | OFFICIAL | ESTIMATED | UNKNOWN` statülerini koruma,
- known/projected total hesaplama,
- critical/non-critical unknown exposure görünürlüğü,
- hard overall/category budget limit değerlendirmesi,
- over-budget ise repair ihtiyacı üretme.

Yapmaz:
- itinerary değiştirmez,
- daha ucuz POI/otel/restoran keşfetmez,
- UNKNOWN fiyatı 0 kabul etmez,
- kur/fiyat uydurmaz,
- rezervasyon/ödeme yapmaz,
- final kullanıcı metni yazmaz.

## 3. Inputs

- `DraftItinerary` (TM-AG-009)
- selected accommodation/place/food cost facts
- route/toll/parking/fuel cost facts veya explicit estimate refs
- `PreferencePolicyOutput` budget constraints
- optional evidence-backed exchange-rate facts
- cost policy snapshot
- `contextManifestId`

## 4. Output

Ana çıktı: `BudgetLedger.v1`.

```yaml
ledgerId: string
itineraryRef: string
targetCurrency: string
items: BudgetItem[]
currencySubtotals: []
knownTotal: number|null
projectedTotal: number|null
unknownItemCount: integer
budgetLimits: []
assessment:
  status: WITHIN_BUDGET | PROVISIONALLY_WITHIN | OVER_BUDGET | UNKNOWN
  unknownExposure: NONE | NON_CRITICAL | CRITICAL | UNKNOWN
  headroomAmount: number|null
  overageAmount: number|null
repairNeeds: []
warnings: []
```

## 5. BudgetItem

```yaml
itemId: string
sourceCostFactRef: string
dedupeKey: string
category: ACCOMMODATION | ACTIVITY | FOOD | TRANSPORT | FUEL | TOLL | PARKING | TRANSIT | FEE | SHOPPING | OTHER
budgetCriticality: CRITICAL | NON_CRITICAL
itineraryRefs: []
entityRef: string|null
journeySegmentRef: string|null
quantity: number|null
unitAmount: number|null
sourceAmount: number|null
sourceCurrency: string
normalizedAmount: number|null
targetCurrency: string
conversionRef: string|null
priceStatus: LIVE | OFFICIAL | ESTIMATED | UNKNOWN
calculationMethod: DIRECT | QUANTITY_X_UNIT | FORMULA | UNKNOWN
calculationRef: string|null
freshnessStatus: CURRENT | STALE | UNKNOWN
contextValidity: MATCHED | MISMATCHED | NOT_APPLICABLE | UNKNOWN
taxesFeesKnown: boolean|null
sourceRefs: []
```

## 6. Criticality semantics

`budgetCriticality` maliyet bilinmediğinde plan güvenine etkisini belirler.

- `CRITICAL`: planın zorunlu parçası; ör. seçilmiş konaklama, zorunlu ulaşım/toll, hard-required activity fee.
- `NON_CRITICAL`: opsiyonel harcama; ör. isteğe bağlı hediyelik/alışveriş.

UNKNOWN critical item → `WITHIN_BUDGET` kesin sonucu verilemez.

## 7. Total semantics

### knownTotal
Yalnız amount mevcut `LIVE + OFFICIAL` kalemler.

### projectedTotal
`knownTotal + ESTIMATED` amount'lar.

UNKNOWN item hiçbir toplamda 0 gibi kullanılmaz.

## 8. Assessment precedence

```text
hard budget FAIL → OVER_BUDGET
else critical currency/amount incomparable → UNKNOWN
else critical unknown exposure → PROVISIONALLY_WITHIN
else applicable hard limits pass → WITHIN_BUDGET
```

Soft budget limit hard rejection üretmez.

## 9. Budget constraints

Desteklenen scope örnekleri:
- overall trip,
- accommodation,
- daily,
- activity,
- food/meal,
- transport,
- shopping.

Hard budget constraint soft kalite ile telafi edilemez.

## 10. Currency policy

Budget Agent exchange rate uyduramaz.

- same currency → direct normalize.
- mixed currency + evidence-backed conversion fact → normalize.
- mixed currency + conversion yok/stale → combined target total kesinleştirilemez; source-currency subtotals korunur.

## 11. Estimate policy

Estimate:
- formula/model ref taşır,
- `ESTIMATED` kalır,
- LIVE/OFFICIAL'a yükseltilmez,
- uncertainty görünür olur.

Fuel örneği:

```text
route_km × consumption_per_km × fuel_unit_price
```

Her input provenance taşır.

## 12. Allowed tools

- `TL-010` Price & Fee Lookup — yalnız selected entity/fee scope
- `TL-011` Calculator
- `TL-012` Schema Validator
- `TL-013` Rule Engine
- `TL-014` Cache

## 13. Forbidden tools / authority

- place/accommodation/food discovery,
- route optimization,
- weather/review research,
- booking/payment,
- itinerary mutation.

Budget Agent daha ucuz alternatif aramaz; repair target üretir.

## 14. Source policy

Fiyat güven sırası:
1. matching `LIVE`,
2. current `OFFICIAL`,
3. explicit `ESTIMATED`,
4. `UNKNOWN`.

Tier 4/review fiyatı current authoritative amount olamaz.

## 15. Freshness and context validity

Live/dynamic fiyat query/date/occupancy context'ine bağlıdır.

- stale price current LIVE sayılamaz.
- accommodation query-signature mismatch → live quote invalid.
- taxes/fees bilinmiyorsa finality/confidence düşer.

## 16. Deduplication

Her source fact `dedupeKey` taşır. Aynı ekonomik maliyet iki farklı kaynak/kalem üzerinden tekrar sayılmaz.

Örnek hard fail:
- otel toplamına dahil verginin ayrıca ikinci kez ledger'a eklenmesi,
- aynı toll kaydının iki kez sayılması.

## 17. Itinerary provenance — Issue #49

Her maliyet plan parçasına bağlanır:
- day/block ref,
- `journeySegmentRef` varsa,
- accommodation/food/place/route entity ref.

Stopover ek geceleme/toll/fuel/parking maliyetleri ilgili JourneySegment'e bağlanır.

## 18. Shopping compatibility — Issue #50

`SHOPPING` category desteklenir.

`LocalProductKnowledge` kültürel ürün bilgisidir; current mağaza/ürün fiyatı değildir. Runtime price evidence yoksa cost `UNKNOWN/ESTIMATED` kalır.

## 19. Repair boundary

```text
BudgetLedger hard FAIL
→ repairNeed
→ TM-AG-013 targeted repair
→ revised itinerary
→ TM-AG-010 re-run
→ TM-AG-014 Verification
```

Budget Agent itinerary'yi kendisi değiştirmez.

## 20. Deterministic invariants

1. UNKNOWN != 0.
2. knownTotal yalnız LIVE/OFFICIAL.
3. projectedTotal estimate'leri içerir, unknown'ları içermez.
4. FX evidence'sız currency merge yok.
5. hard over-budget → OVER_BUDGET.
6. arithmetic reproducible.
7. duplicate cost double-count yok.
8. critical unknown → final WITHIN_BUDGET yok.
9. stale/mismatched price current olarak promote edilmez.
10. every item has source + itinerary provenance.

## 21. Failure modes

- `UNKNOWN_AS_ZERO`
- `STALE_PRICE_AS_LIVE`
- `QUERY_SIGNATURE_MISMATCH`
- `CURRENCY_CONVERSION_INVENTED`
- `DOUBLE_COUNTED_COST`
- `ARITHMETIC_ERROR`
- `HARD_BUDGET_FALSE_PASS`
- `CRITICAL_UNKNOWN_FALSE_PASS`
- `MISSING_ITEM_PROVENANCE`
- `PRICE_STATUS_PROMOTION`
- `ITINERARY_MUTATION_LEAKAGE`

## 22. Handoff

- TM-AG-014 Verification → full ledger/provenance.
- TM-AG-013 Adaptive → targeted repair needs.
- TM-AG-015 Explanation → verified ledger only after Verification.

## 23. Harness binding

- R0 ledger schema
- R1 deterministic BG-001..BG-018
- R2 recorded cost fixtures
- R3 TL-010/Calculator integration
- R4 uncertainty/repair semantic quality
- R5 stale/missing/mixed-currency/dedupe cases
- R6 discovery/itinerary mutation/payment leakage
- R7 controlled current fee lookup
- R8 regressions

## 24. Golden coverage

```yaml
behavior_cases: 18
authority_cases: 6
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 5
```

Fixture-driven contract gap:
- unknown cost severity could not be derived reliably → `budgetCriticality: CRITICAL | NON_CRITICAL` added to input and ledger item.

## 25. Current status

```yaml
agent_spec_status: golden_v1
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
journey_issue_49_compatible: true
knowledge_issue_50_shopping_compatible: true
next_agent_package: TM-AG-011
```
