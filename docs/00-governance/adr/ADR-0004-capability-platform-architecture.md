# ADR-0004 — Provider-Bağımsız Capability Platform Mimarisi

| Alan | Değer |
|---|---|
| Tür | Architecture Decision Record |
| Durum | Accepted |
| Tarih | 2026-08-06 |
| Karar Sahibi | Project Team |
| İlgili Alan | `docs/04-tools/` |

## Bağlam

Agentların geocoding, rota, hava, konaklama, yorum ve resmî bilgi gibi dış yeteneklere ihtiyacı vardır. Providerların doğrudan agentlarca çağrılması vendor lock-in, tekrar eden runtime kodu, tutarsız hata yönetimi, kaynak zinciri kaybı ve policy bypass riski yaratır.

## Karar

Agentlar provider veya doğrudan API çağırmayacaktır. Yalnız kanonik capability kimliğiyle `ToolRequest` oluşturacaktır.

```text
Agent
→ Capability Platform / Tool Gateway
→ Policy, Cache, Cost, Health, Provider Selection
→ Provider Adapter
→ Provider / Local Service / Fixture / Replay
```

Mevcut `TL-001`–`TL-014` Tool Class kimlikleri korunur; altlarında provider-bağımsız capability kimlikleri bulunur.

## Temel kurallar

- Her capability sürümlü input/output contract taşır.
- Provider adapter yalnız mapping ve normalizasyon yapar.
- Gateway permission, consent, cache, retry, budget ve observability uygular.
- Fixture ve live aynı normalize sonucu kullanır.
- Kritik sonuçlar kaynaktan öneriye kadar izlenebilir.
- Provider-specific alanlar agent sözleşmelerine sızmaz.

## Değerlendirilen seçenekler

### Agentların providerı doğrudan çağırması

Reddedildi.

### Her agentın kendi wrapperını yazması

Reddedildi.

### Ortak Gateway fakat provider-specific agent sözleşmeleri

Reddedildi.

### Provider-bağımsız Capability Platform

Kabul edildi.

## Sonuçlar

### Olumlu

- Provider değişimi agentları daha az etkiler.
- Runtime güvenliği ve maliyet merkezi yönetilir.
- Fixture/live eşdeğerliği sağlanır.
- Kaynak ve evidence lineage korunur.
- Provider kalite karşılaştırması mümkün olur.

### Olumsuz

- Başlangıç tasarım ve implementasyon maliyeti yüksektir.
- Gateway kritik altyapı bileşenidir.
- Provider özel özellikleri opsiyonel extension gerektirebilir.

## Klasör adı

`docs/04-tools/` şimdilik korunur. İleride `docs/04-capabilities/` taşıması ayrı ADR ile değerlendirilir.

## Yeniden değerlendirme koşulları

- Capability contract'ları provider özelliklerini ifade edemiyorsa,
- Gateway darboğaz veya tek hata noktası oluyorsa,
- offline/local-first model farklı yürütme gerektiriyorsa,
- write/action capability'leri mevcut güvenlik modelini aşıyorsa.
