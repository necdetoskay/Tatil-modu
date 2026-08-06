# Tool Configuration & Versioning Standard

## 1. Amaç

Capability, provider, adapter, policy ve pricing yapılandırmalarının sürümlü ve tekrarlanabilir olmasını sağlamak.

## 2. Configuration katmanları

```text
platform defaults
environment
tenant/user scope
workflow override
request policy
```

Alt katman üst katmanı yalnız izin verilen alanlarda override edebilir.

## 3. Configuration alanları

- capability enabled/disabled,
- provider priority,
- timeout,
- retry,
- cache TTL,
- fallback chain,
- rate limit,
- circuit breaker,
- budget,
- quality threshold,
- privacy/consent,
- observability sampling.

## 4. Version türleri

### Capability contract version

Input/output sözleşmesi.

### Adapter version

Provider mapping uygulaması.

### Provider API version

Dış servis sürümü.

### Policy version

Permission, provider selection, retry/fallback ve kalite kuralları.

### Pricing version

Maliyet hesaplama tablosu.

### Configuration version

Runtime ayar kümesi.

## 5. Semantic versioning

- Patch: geriye uyumlu düzeltme.
- Minor: geriye uyumlu yeni alan/capability.
- Major: kırıcı contract değişimi.

## 6. Reproducibility

Her ToolResult en az şu sürümleri taşımalıdır:

```text
capabilityVersion
adapterVersion
providerApiVersion
policyVersion
pricingVersion
configurationVersion
```

## 7. Configuration promotion

```text
draft
test
staging
production
deprecated
```

Production configuration doğrudan elle değiştirilmez; review ve validation sonrası promote edilir.

## 8. Rollback

Her production sürümü:

- önceki configuration reference,
- activation timestamp,
- change reason,
- rollback procedure

taşır.

## 9. Breaking change

Capability major değişiminde:

- consumer agent listesi çıkarılır,
- fixture testleri yeniden çalışır,
- handoff contract etkisi değerlendirilir,
- migration window belirlenir.

## 10. Testler

- layer precedence,
- invalid override,
- rollback,
- version propagation,
- breaking change detection,
- pricing/config mismatch,
- disabled provider exclusion.
