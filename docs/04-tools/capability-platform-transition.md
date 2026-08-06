# Capability Platform Transition

## 1. Amaç

Tatil Modu içinde agentların belirli araç veya sağlayıcıları değil, iş yeteneklerini talep etmesini kanonik hale getirmek.

Mevcut `docs/04-tools/` klasörü korunur. Ancak kavramsal model şu şekilde yorumlanır:

```text
Agent
  ↓ capability request
Capability Platform
  ↓ policy, provider selection, cache, cost, trust
Provider Adapter
  ↓
Provider / Local Service / Model
```

## 2. Neden capability?

`Directions` bir sağlayıcı değildir.

Aynı capability aşağıdaki farklı sağlayıcılarla karşılanabilir:

- Google Maps
- Mapbox
- OpenRouteService
- OSRM
- yerel rota motoru
- fixture/replay kaydı

Agentın görevi hangi sağlayıcının kullanılacağını bilmek değildir.

## 3. Kanonik terimler

| Terim | Tanım |
|---|---|
| Capability | Sistem tarafından sunulan iş yeteneği |
| Tool Class | Capability'nin mevcut katalog kimliği |
| Provider | Yeteneği gerçekleyen dış veya yerel sistem |
| Provider Adapter | Provider cevabını capability contract'a dönüştüren katman |
| Capability Platform | Gateway, policy, cache, cost, health ve trace bileşenlerinin bütünü |
| Invocation | Tek bir capability çalıştırma isteği |
| Evidence | Bir sonucun dayandığı kaynak ve veri zinciri |

## 4. Tool Catalog ile ilişki

Mevcut `TL-001`–`TL-014` kimlikleri korunur.

Bu kimlikler artık:

> Capability Platform içindeki kanonik capability sınıfları

olarak değerlendirilir.

Örnek:

```text
TL-005
tool class: Directions & Distance Matrix
canonical capability IDs:
- directions.route
- directions.matrix
- directions.travel_time
```

## 5. Adlandırma kararı

Şimdilik klasör ve dosya yolları değiştirilmez.

Nedenleri:

- mevcut bağlantıları bozmamak,
- çok sayıda belgeyi aynı anda taşımamak,
- capability registry tamamlanmadan yeni isimlendirmeyi zorunlu kılmamak.

İleride ayrı ADR ile:

```text
docs/04-tools/
→ docs/04-capabilities/
```

taşıması değerlendirilebilir.

## 6. Mimari sonuç

Agent specification dosyalarında artık:

```text
allowedTools
```

yerine kavramsal olarak:

```text
allowedCapabilities
```

kullanılması önerilir.

Mevcut belgeler geriye uyumluluk için korunur; yeni agentlarda capability kimlikleri yazılır.
