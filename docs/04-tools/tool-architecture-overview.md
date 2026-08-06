# Tool Architecture Overview

## 1. Amaç

Tatil Modu agentlarının dış dünya ve deterministik servislerle güvenli, izlenebilir ve test edilebilir biçimde iletişim kurmasını sağlayan ortak Tool Architecture yapısını tanımlar.

## 2. Temel ayrım

```text
Tool Class
    ↓
Capability Contract
    ↓
Provider Adapter
    ↓
Provider/API/Local Service
```

### Tool Class

İş ihtiyacını tanımlar.

Örnek:

- Geocoding
- Weather Forecast
- Accommodation Search
- Review Data Provider

### Capability Contract

Tool sınıfının sağlayacağı ortak giriş ve çıkış sözleşmesidir.

### Provider Adapter

Belirli sağlayıcının cevabını ortak sözleşmeye dönüştürür.

### Provider

Gerçek API, yerel servis, veritabanı veya lisanslı veri kaynağıdır.

## 3. Mimari akış

```text
Agent
  ↓ ToolRequest
Tool Gateway
  ↓ policy + cache + budget + provider selection
Provider Adapter
  ↓ provider-specific request
External/Local Provider
  ↑ provider response
Provider Adapter
  ↑ normalized ToolResult
Tool Gateway
  ↑ trace + source + cost + freshness
Agent
```

## 4. Tool Gateway sorumlulukları

- request schema doğrulama,
- agent/tool izin kontrolü,
- cache sorgulama,
- provider seçimi,
- rate limit kontrolü,
- timeout ve retry,
- fallback kararı,
- çıktı normalizasyonu,
- kaynak izi,
- maliyet ölçümü,
- freshness kontrolü,
- observability event üretimi.

Tool Gateway kullanıcı niyetini yeniden yorumlamaz ve agent kararı vermez.

## 5. Ana ilkeler

### Provider bağımsızlığı

Agent Google, OpenStreetMap veya başka bir sağlayıcıyı doğrudan çağırmaz. Agent capability ister.

### Normalleştirilmiş hata

Her provider hatası ortak hata taksonomisine dönüştürülür.

### Fixture/live eşdeğerliği

Fixture modundaki cevap, live mode ile aynı `ToolResult` sözleşmesini kullanır.

### Kaynak izlenebilirliği

Her dış veri sonucu provider, retrieval time, source identity ve freshness metadata taşır.

### Sessiz kalite düşüşü yasağı

Fallback kullanılırsa:

- provider değişikliği,
- kaynak güven seviyesi,
- confidence etkisi,
- eksik alanlar

açıkça kaydedilir.

## 6. Tool yaşam döngüsü

```text
proposed
contracted
adapter-designed
fixture-tested
live-tested
approved
deprecated
disabled
```

## 7. Klasör standardı

```text
docs/04-tools/
  tool-catalog.md
  tool-architecture-overview.md
  tool-adapter-contract.md
  tool-error-model.md
  provider-selection-policy.md
  tool-execution-modes.md
  schemas/
    tool-request.schema.json
    tool-result.schema.json
```

Belirli tool sınıfları ileride:

```text
docs/04-tools/<tool-id>-<tool-name>/
```

altında ayrıntılandırılır.
