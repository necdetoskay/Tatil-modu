# Tatil Modu — Version Management & Compatibility Platform

**Doküman türü:** Platform ve yönetişim standardı
**Teknik kod adı:** `version_compatibility_platform`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Architecture Freeze öncesi kanonik taslak

## 1. Amaç

Bütün agent, platform, protokol, şema, prompt, model alias, tool adapter ve deployment bileşenlerinin sürümlerini ve aralarındaki uyumluluğu yönetmek.

## 2. Sürümlenen Bileşenler

- ACP
- JSON Schema Library
- Agent SDK
- Runtime
- Security Platform
- Prompt Bundle
- Agent
- Tool Adapter
- Model Alias Mapping
- Registry
- Configuration
- Feature Flag
- Deployment Manifest
- Database Schema
- Golden Fixture

## 3. Sürümleme Kuralları

Semantic Versioning:

- major: breaking change
- minor: geriye uyumlu özellik
- patch: düşük riskli düzeltme

Data migration sürümleri ayrıca tutulabilir.

## 4. Version Registry

```json
{
  "component_id": "agent.route_planner",
  "component_type": "agent",
  "version": "3.4.0",
  "status": "production",
  "released_at": "2026-08-06T18:00:00Z",
  "dependencies": [
    {
      "component_id": "acp",
      "range": ">=1.3 <2.0"
    }
  ],
  "rollback_target": "3.3.2"
}
```

## 5. Compatibility Matrix

Takip edilen ilişkiler:

- ACP ↔ Agent SDK
- Agent SDK ↔ Runtime
- Agent ↔ Input/Output Schema
- Agent ↔ Prompt Bundle
- Prompt Bundle ↔ Model Alias
- Tool Adapter ↔ Capability Registry
- Deployment ↔ Database Schema
- Golden Fixture ↔ Eval Runner

## 6. Compatibility Durumları

- `compatible`
- `compatible_with_adapter`
- `deprecated`
- `incompatible`
- `unknown`

Unknown production'da kabul edilmez.

## 7. Compatibility Check

Release öncesi:

1. dependency range çözülür,
2. schema compatibility test edilir,
3. contract test çalıştırılır,
4. migration ihtiyacı belirlenir,
5. prompt/model uyumu değerlendirilir,
6. rollback hedefi doğrulanır.

## 8. Schema Compatibility

### Geriye uyumlu

- optional alan ekleme
- enum genişletme ancak tüketici toleransı varsa
- açıklama değişikliği

### Breaking

- required alan ekleme
- alan silme
- type değiştirme
- enum daraltma
- anlam değişikliği

## 9. ACP Compatibility

Major ACP değişikliği:

- adapter
- migration guide
- deprecation window
- dual-read/dual-write gerektiğinde
- contract tests

gerektirir.

## 10. Prompt/Model Compatibility

Prompt bundle belirli model alias yetenekleri isteyebilir:

- structured output
- tool calling
- context size
- language
- latency class

Model alias değişikliğinde bağlı eval seti tekrar çalışır.

## 11. Tool Adapter Compatibility

- operation contract
- request/response schema
- evidence metadata
- error normalization
- mode support
- provider capability

uyumlu olmalıdır.

## 12. Migration Package

Her breaking change:

- migration guide
- adapter
- data migration
- test fixture
- rollback/forward-fix
- deprecation date

taşır.

## 13. Deprecation Window

Önerilen:

- internal minor component: 1 release
- shared protocol/schema: 2–3 release
- public integration: açık SLA
- air-gap release: daha uzun destek penceresi

## 14. Freeze Etiketi

Architecture Freeze sırasında:

- protokol major sürümü
- schema baseline
- registry baseline
- agent manifest baseline
- compatibility matrix

etiketlenir.

## 15. Hata Kodları

- `VER_COMPONENT_NOT_FOUND`
- `VER_RANGE_UNSATISFIED`
- `VER_SCHEMA_INCOMPATIBLE`
- `VER_PROMPT_MODEL_INCOMPATIBLE`
- `VER_ADAPTER_REQUIRED`
- `VER_MIGRATION_MISSING`
- `VER_ROLLBACK_TARGET_INVALID`
- `VER_UNKNOWN_COMPATIBILITY`

## 16. Kabul Kriterleri

- Bütün üretim bileşenleri version registry'de bulunmalı.
- Compatibility matrix release gate olmalı.
- Breaking change migration paketi gerektirmeli.
- Unknown compatibility production'ı bloklamalı.
- Rollback hedefleri doğrulanmalı.
- Freeze baseline sürümleri kayıt altına alınmalı.
