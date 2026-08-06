# Tatil Modu Dokümantasyon Haritası

Bu dosya dokümantasyonun ana giriş noktasıdır. Her konu için tek bir kanonik belge kullanılır.

## Klasör yapısı

| Klasör | Sorumluluk |
|---|---|
| `00-governance/` | ADR'ler, mühendislik ilkeleri, karar logu ve terimler |
| `01-architecture/` | Sistem mimarisi, handoff standardı ve veri güven politikası |
| `02-agents/` | Kanonik agent kataloğu, agent template'i ve agent belgeleri |
| `03-testing/` | Ortak agent test ve değerlendirme standardı |
| `04-tools/` | Capability Platform, provider adapterları, runtime kontrolleri ve capability contract'ları |
| `10-product/` | Ürün vizyonu, kapsam ve kullanıcı yolculuğu |
| `15-prompts/` | Ortak/composable prompt kataloğu |
| `16-workflows/` | E2E ve agent iş akışları |

## Kanonik belge matrisi

| Konu | Tek kaynak |
|---|---|
| Ürün vizyonu | [`10-product/PRD-001-URUN-VIZYONU.md`](10-product/PRD-001-URUN-VIZYONU.md) |
| Sistem mimarisi | [`01-architecture/system-overview.md`](01-architecture/system-overview.md) |
| Agent listesi | [`02-agents/agent-catalog.md`](02-agents/agent-catalog.md) |
| Agent template'i | [`02-agents/_templates/agent-specification-template.md`](02-agents/_templates/agent-specification-template.md) |
| Test standardı | [`03-testing/agent-testing-evaluation-standard.md`](03-testing/agent-testing-evaluation-standard.md) |
| Handoff standardı | [`01-architecture/handoff-contract-standard.md`](01-architecture/handoff-contract-standard.md) |
| Veri güven başlangıç politikası | [`01-architecture/data-source-trust-policy.md`](01-architecture/data-source-trust-policy.md) |
| Capability Platform | [`04-tools/README.md`](04-tools/README.md) |
| Capability Registry | [`04-tools/capability-registry.md`](04-tools/capability-registry.md) |
| Source trace ve lineage | [`04-tools/source-trace-and-data-lineage-standard.md`](04-tools/source-trace-and-data-lineage-standard.md) |
| Tool/Capability kapanışı | [`04-tools/tool-architecture-completion-checklist.md`](04-tools/tool-architecture-completion-checklist.md) |

## Mimari aşama durumu

| Aşama | Durum |
|---|---|
| Governance foundation | büyük ölçüde tamamlandı |
| Product vision | foundation tamamlandı |
| Agent foundation | AG-001 ve AG-002 ayrıntılı |
| Tool / Capability Architecture | architecture complete |
| Data Source & Trust Architecture | sıradaki |
| Decision Policy Engine | bekliyor |
| Prompt Framework | bekliyor |
| Memory Architecture | bekliyor |
| Quality Engine | bekliyor |
| Orchestrator | bekliyor |
| Observability üst katmanı | bekliyor |

## Source of truth kuralları

1. Agent listesi başka belgelerde yeniden yazılmaz.
2. Agent template'i yalnız `_templates` altında tutulur.
3. ADR kararın nedenini açıklar; güncel katalog görevi görmez.
4. README dosyaları ayrıntıyı kopyalamaz, kanonik belgeye yönlendirir.
5. Taşınan belgelerin eski konumu kaldırılır.
6. Provider isimleri agent contract'larına doğrudan yazılmaz; capability kimliği kullanılır.
7. Data Source Architecture, Capability Platform runtime kurallarını tekrar etmez; güven ve evidence kararlarını tanımlar.
