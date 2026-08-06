# Tool Cost Accounting Model

## 1. Amaç

Her tool çağrısının tahmini ve gerçek maliyetini izlemek, workflow ve kullanıcı seviyesinde bütçe kontrolü sağlamak.

## 2. Maliyet türleri

```text
per_request
per_unit
per_token
per_record
per_distance_element
per_map_load
subscription_amortized
internal_compute
storage
```

## 3. Cost estimate

Çağrıdan önce:

```json
{
  "currency": "USD",
  "estimatedCost": 0.004,
  "pricingVersion": "2026-08-01",
  "units": 2,
  "assumptions": []
}
```

## 4. Actual cost

Çağrıdan sonra:

```json
{
  "actualCost": 0.0038,
  "billableUnits": 2,
  "providerReported": true
}
```

Provider gerçek maliyet sunmuyorsa hesaplama pricing table ile yapılır ve `providerReported=false` olur.

## 5. Bütçe seviyeleri

```text
tool call budget
agent run budget
workflow budget
daily system budget
monthly provider budget
user/tenant budget
```

## 6. Budget gate

Çağrı öncesi:

1. estimated cost hesaplanır,
2. kalan bütçe kontrol edilir,
3. ucuz provider/cache alternatifi değerlendirilir,
4. sınır aşılırsa çağrı engellenir.

## 7. Maliyet optimizasyon sırası

```text
cache
fixture/provided data
cheaper equivalent provider
batch request
reduced result size
lower freshness when allowed
skip non-critical enrichment
```

## 8. Kaliteyi maliyet için gizlice düşürme yasağı

Ucuz provider seçildiğinde:

- kalite farkı,
- confidence etkisi,
- eksik alanlar

raporlanır.

## 9. Pricing versioning

Her maliyet hesabı:

- provider,
- pricing plan,
- currency,
- effective date,
- pricing version

taşır.

## 10. Raporlama

Ölçümler:

- tool başına maliyet,
- agent başına maliyet,
- workflow başına maliyet,
- cache savings,
- fallback cost,
- failed-call cost,
- provider bazlı aylık maliyet.

## 11. Testler

- estimate/actual farkı,
- currency conversion policy,
- budget denied,
- cache zero-cost,
- batch allocation,
- pricing version change,
- subscription amortization.
