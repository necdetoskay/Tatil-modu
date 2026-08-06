# Tatil Modu Dokümantasyon Haritası

Bu dosya dokümantasyonun ana giriş noktasıdır. Her konu için tek bir kanonik belge kullanılır.

## Klasör yapısı

| Klasör | Sorumluluk |
|---|---|
| `00-governance/` | ADR'ler, mühendislik ilkeleri, karar logu ve terimler |
| `01-architecture/` | Sistem mimarisi, handoff standardı ve veri güven politikası |
| `02-agents/` | Kanonik agent kataloğu, agent template'i ve agent belgeleri |
| `03-testing/` | Ortak agent test ve değerlendirme standardı |
| `04-tools/` | Tool sınıfları, seçim ve fallback kuralları |
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
| Veri güven politikası | [`01-architecture/data-source-trust-policy.md`](01-architecture/data-source-trust-policy.md) |
| Tool kataloğu | [`04-tools/tool-catalog.md`](04-tools/tool-catalog.md) |

## Source of truth kuralları

1. Agent listesi başka belgelerde yeniden yazılmaz.
2. Agent template'i yalnız `_templates` altında tutulur.
3. ADR kararın nedenini açıklar; güncel katalog görevi görmez.
4. README dosyaları ayrıntıyı kopyalamaz, kanonik belgeye yönlendirir.
5. Taşınan belgelerin eski konumu kaldırılır.
