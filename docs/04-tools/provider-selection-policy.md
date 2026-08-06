# Provider Selection Policy

## 1. Amaç

Aynı capability için birden fazla provider bulunduğunda seçim davranışını standartlaştırmak.

## 2. Provider seçim faktörleri

```text
capability coverage
data trust
freshness
geographic coverage
latency
reliability
cost
rate limit availability
license/commercial suitability
privacy
```

## 3. Hard filtreler

Provider şu durumlarda elenir:

- gerekli capability yok,
- bölgesel kapsama sahip değil,
- kullanım şartı projeye uygun değil,
- bütçe üstünde,
- agent politikası yasaklıyor,
- sağlık durumu unavailable/misconfigured,
- gerekli veri saklama/işleme izni yok.

## 4. Başlangıç provider skoru

```text
providerScore =
  capabilityFit × 0.25
+ trust         × 0.20
+ freshness     × 0.15
+ reliability   × 0.15
+ latency       × 0.10
+ cost          × 0.10
+ privacy       × 0.05
```

Bu ağırlıklar capability türüne göre değişebilir.

Örnek:

- weather için freshness yükselir,
- official fact için trust yükselir,
- geocoding için coverage ve accuracy yükselir,
- review için license ve provenance yükselir.

## 5. Provider pinning

Aşağıdaki durumlarda provider sabitlenebilir:

- sözleşmesel zorunluluk,
- fixture/regression testi,
- resmî birincil kaynak,
- belirli entity kimliği yalnız o providerda mevcut.

## 6. Fallback zinciri

Fallback listesi capability bazında tanımlanır.

Örnek mantık:

```text
structured official API
→ licensed structured provider
→ official webpage
→ trusted platform
→ general web
```

Fallback kalite ve confidence etkisini ToolResult içinde taşır.

## 7. Multi-provider cross-check

Kritik bilgiler için iki provider çağrılabilir:

- çalışma saati,
- ücret,
- çocuk politikası,
- erişilebilirlik,
- yüksek riskli rota bilgisi.

Cross-check her çağrıda zorunlu değildir; Decision Policy tarafından tetiklenir.

## 8. Vendor lock-in önleme

- provider-specific ID yanında canonical internal ID tutulur,
- provider cevabı doğrudan agent sözleşmesine sızmaz,
- adapter testleri capability contract'a göre yazılır,
- provider değişimi agent promptunu değiştirmemelidir.
