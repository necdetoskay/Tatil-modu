# Capability Registry v1.0

## 1. Amaç

Sistemdeki tüm capability'lerin resmi sözlüğünü, sözleşme sınırlarını, zorunlu çıktılarını ve kalite ölçülerini tanımlamak.

Bu belge provider listesi değildir.

Providerların hangi capability'leri desteklediği ayrı provider kayıtlarında tutulur.

## 2. Capability kimliği

Format:

```text
<domain>.<action>
```

Örnek:

```text
geo.geocode
directions.route
weather.forecast
accommodation.search
reviews.collect
rules.evaluate
```

## 3. Capability yaşam döngüsü

```text
proposed
contracted
fixture-tested
provider-mapped
live-tested
approved
deprecated
disabled
```

## 4. Registry alanları

Her capability şu alanları taşır:

```text
capabilityId
toolClassId
name
version
status
description
inputContract
outputContract
requiredFields
optionalFields
qualityMetrics
freshnessClass
costClass
privacyClass
allowedExecutionModes
supportedBatching
sourceTraceRequired
```

## 5. İlk capability listesi

### TL-001 — Web Search

#### `search.web`

Amaç:

- güncel sayfa ve kaynak keşfi,
- resmî sayfa bulma,
- genel web araştırması.

Zorunlu çıktı:

- title,
- canonical URL,
- snippet/summary,
- source domain,
- retrieval timestamp,
- rank,
- provider reference.

Kalite metrikleri:

- precision@k,
- authoritative source ratio,
- duplicate result ratio,
- stale result ratio.

---

### TL-002 — Official Page Fetcher

#### `web.fetch_official_fact`

Amaç:

Resmî veya veri sahibine ait sayfadan belirli bir gerçek bilgiyi çıkarmak.

Zorunlu çıktı:

- requested fact type,
- extracted value,
- source URL,
- page title,
- retrievedAt,
- evidence fragment reference,
- verification status.

Kalite metrikleri:

- extraction accuracy,
- source authority,
- evidence completeness,
- change detection accuracy.

---

### TL-003 — Geocoding

#### `geo.geocode`

Metni koordinat ve kanonik yer kimliğine dönüştürür.

Zorunlu çıktı:

- canonical name,
- latitude,
- longitude,
- country,
- administrative hierarchy,
- provider entity ID,
- resolution confidence.

#### `geo.reverse_geocode`

Koordinatı adres ve idari bölgeye dönüştürür.

Kalite metrikleri:

- positional accuracy,
- administrative accuracy,
- ambiguity rate,
- unresolved rate.

---

### TL-004 — Place Search

#### `places.search`

Belirli coğrafya ve kategori içinde yer/işletme arar.

Zorunlu çıktı:

- canonical place ID,
- name,
- category,
- coordinates,
- address,
- provider IDs,
- source trace.

Opsiyonel:

- rating,
- review count,
- hours,
- price level,
- attributes.

#### `places.get_details`

Tek bir yer için ayrıntılı metadata alır.

Kalite metrikleri:

- entity match accuracy,
- field coverage,
- duplicate rate,
- attribute freshness.

---

### TL-005 — Directions & Distance Matrix

#### `directions.route`

Zorunlu çıktı:

- origin/destination,
- mode,
- distance,
- duration,
- route timestamp,
- route geometry reference,
- toll/ferry/highway flags when available.

#### `directions.matrix`

Birden fazla origin/destination arasında mesafe ve süre matrisi üretir.

#### `directions.travel_time`

Sadece normalize seyahat süresi döndürür.

Kalite metrikleri:

- distance accuracy,
- duration accuracy,
- traffic freshness,
- unreachable route detection.

---

### TL-006 — Weather Forecast

#### `weather.forecast`

Yakın tarih için tahmin üretir.

Zorunlu çıktı:

- location,
- forecast time,
- generated time,
- temperature,
- precipitation probability,
- wind,
- condition,
- provider confidence when available.

Kalite metrikleri:

- forecast age,
- horizon,
- missing field ratio,
- provider verification status.

---

### TL-007 — Climate Normals

#### `climate.normals`

Uzun dönem iklim beklentisi sağlar.

Zorunlu çıktı:

- location,
- period,
- normal temperature range,
- precipitation normal,
- wind/sea condition where available,
- reference period.

Kural:

`weather.forecast` yerine kullanılamaz.

---

### TL-008 — Accommodation Search

#### `accommodation.search`

Zorunlu çıktı:

- property identity,
- date/party context,
- room/offer identity,
- total price,
- currency,
- tax inclusion,
- capacity,
- cancellation policy,
- availability timestamp,
- provider source.

#### `accommodation.get_offer`

Belirli bir offer için ayrıntılı koşulları alır.

#### `accommodation.get_property_details`

Otel/tesis metadata'sı sağlar.

Kalite metrikleri:

- price freshness,
- availability freshness,
- tax completeness,
- room capacity accuracy,
- cancellation policy completeness.

---

### TL-009 — Review Data Provider

#### `reviews.collect`

İzinli kaynaklardan normalize yorum kayıtları sağlar.

Zorunlu çıktı:

- review ID,
- entity ID,
- source,
- review date,
- rating when available,
- text or permitted extract,
- language,
- verification indicator,
- retrieval time,
- license/usage metadata.

#### `reviews.aggregate_metadata`

Yorum hacmi ve dönem dağılımını sağlar.

Kalite metrikleri:

- coverage,
- recency,
- duplicate ratio,
- verified-review ratio,
- language detection accuracy,
- license compliance.

Not:

Yorum analizi ayrı bir agent/model capability olabilir; toplama ile karıştırılmaz.

---

### TL-010 — Price & Fee Lookup

#### `fees.lookup`

Zorunlu çıktı:

- entity/service,
- fee type,
- amount,
- currency,
- included/excluded items,
- effective date,
- retrievedAt,
- source.

Kalite metrikleri:

- freshness,
- completeness,
- official source ratio,
- tax/extra fee clarity.

---

### TL-011 — Calculator

#### `math.calculate`

Deterministik matematik işlemleri.

#### `cost.estimate_trip_component`

Tanımlı girdilerden maliyet tahmini hesaplar.

Kalite metrikleri:

- deterministic reproducibility,
- numerical precision,
- unit correctness.

---

### TL-012 — Schema Validator

#### `schema.validate`

Girdi veya çıktıyı belirli JSON Schema'ya göre doğrular.

Zorunlu çıktı:

- valid,
- schema ID/version,
- errors,
- warnings.

---

### TL-013 — Rule Engine

#### `rules.evaluate`

Hard ve soft policy kurallarını deterministik değerlendirir.

#### `rules.score`

Tanımlı ağırlık ve cezalarla skor hesaplar.

Zorunlu çıktı:

- rule results,
- violations,
- penalties,
- final decision/score,
- policy version.

---

### TL-014 — Cache

#### `cache.get`

#### `cache.put`

#### `cache.invalidate`

#### `cache.get_or_compute`

Kalite metrikleri:

- hit ratio,
- stale hit ratio,
- invalidation accuracy,
- privacy-safe key compliance.

## 6. Capability bağımlılıkları

Örnek:

```text
accommodation.search
  depends on:
  - geo.geocode
  - schema.validate
  - cache.get_or_compute
```

```text
destination discovery
  consumes:
  - geo.geocode
  - directions.matrix
  - climate.normals
  - search.web
```

## 7. Capability kalite kapısı

Bir capability `approved` olmadan önce:

- input/output contract,
- fixture set,
- en az bir provider adapter veya local implementation,
- source trace desteği,
- error mapping,
- cost model,
- quality metrics,
- live integration testi

bulunmalıdır.

## 8. Yeni capability ekleme kuralı

Yeni capability yalnız şu şartlarla eklenir:

- mevcut capability ile anlamlı biçimde ifade edilemiyor,
- bağımsız contract gerektiriyor,
- bağımsız kalite metriği var,
- agentlar arasında yeniden kullanılabiliyor,
- provider bağımsız tanımlanabiliyor.
