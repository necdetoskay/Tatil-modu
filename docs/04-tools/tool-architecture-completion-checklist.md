# Tool / Capability Architecture Completion Checklist

## Amaç

Tool / Capability Architecture aşamasının tasarım bakımından tamamlanma koşullarını kayıt altına alır.

Bu kapanış, provider seçimi veya kod implementasyonunun tamamlandığı anlamına gelmez.

## Tamamlanan alanlar

### Temel mimari

- [x] Tool Class, Capability, Provider ve Adapter ayrımı
- [x] Capability Platform / Tool Gateway modeli
- [x] Provider-bağımsız agent çağrısı
- [x] Fixture, hybrid, live, replay ve shadow çalışma modları

### Ortak sözleşmeler

- [x] ToolRequest ve ToolResult
- [x] Capability Definition
- [x] Provider Capability Support
- [x] Tool Permission Policy
- [x] Source Trace ve Evidence
- [x] Observability Event

### Runtime kontrolleri

- [x] Cache, TTL ve stale-if-error
- [x] Rate limit ve circuit breaker
- [x] Retry/backoff
- [x] Batch, concurrency, deadline ve cancellation
- [x] Provider health
- [x] Cost accounting ve budget gate

### Güvenlik ve yönetişim

- [x] Secret ve privacy policy
- [x] Consent ve data minimization
- [x] Permission matrix
- [x] Configuration/versioning ve rollback
- [x] Provider support matrix
- [x] Provider adapter specification template

### Kaynak, kalite ve izlenebilirlik

- [x] Source trace ve data lineage
- [x] Claim-level evidence
- [x] Resmî iddia / deneyim kanıtı ayrımı
- [x] Capability quality score
- [x] Tool observability events
- [x] Yorum lisans ve duplicate lineage yaklaşımı

### Çekirdek capability contract'ları

- [x] `geo.geocode`
- [x] `directions.matrix`
- [x] `places.search`
- [x] `weather.forecast`
- [x] `climate.normals`
- [x] `accommodation.search`
- [x] `reviews.collect`
- [x] `web.fetch_official_fact`

Her capability için specification, input schema, output schema ve fixture örneği hazırdır.

## Bilinçli olarak ertelenen işler

- [ ] Gerçek provider seçimi ve fiyat araştırması
- [ ] Provider lisans/sözleşme incelemesi
- [ ] Adapter ve Tool Gateway kodu
- [ ] Çalıştırılabilir test runner
- [ ] Live integration ve load testleri
- [ ] Observability dashboardları
- [ ] Secret manager seçimi
- [ ] Üretim SLA/SLO değerleri

## Kapanış durumu

```text
Architecture: complete
Implementation: not started
Provider selection: not started
Live integration: not started
```

Yeni temel platform kavramı yalnız mevcut boşluk ve kanonik belgelere etkisi açıklanarak eklenir.
