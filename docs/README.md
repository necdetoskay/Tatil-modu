# Tatil Modu Dokümantasyon Haritası

Bu dosya dokümantasyonun ana giriş noktasıdır. Her konu için tek bir kanonik belge kullanılır.

## Architecture Review durumu
**Güncel mimari durum:** Architecture Freeze öncesi kanonik baseline `08-architecture-baseline/` altında tutulur. Pre-implementation canonical deep-design katmanları `11–23` altında tamamlanmıştır; implementation izni henüz verilmemiştir.

## Klasör yapısı
| Klasör | Sorumluluk |
|---|---|
| `00-governance/` | ADR'ler, mühendislik ilkeleri, karar logu ve terimler |
| `01-architecture/` | Pre-freeze sistem mimarisi, handoff standardı ve veri güven politikası |
| `02-agents/` | Pre-freeze agent katalog ve agent belgeleri |
| `03-testing/` | Ortak agent test ve değerlendirme standardı |
| `04-tools/` | Capability Platform, provider adapterları ve capability contract'ları |
| `08-architecture-baseline/` | Architecture Freeze öncesi kanonik baseline |
| `09-pre-implementation-design/` | Pre-code workplan ve freeze checklist alanı |
| `10-product/` | Ürün vizyonu ve kapsam foundation |
| `11-agent-specifications/` | Canonical agent specifications |
| `12-contracts/` | Canonical handoff contract ve envelope tasarımları |
| `13-fixtures-and-evaluation/` | Canonical fixture, golden scenario ve evaluation tasarımları |
| `14-tool-and-capability-design/` | Tool, capability, adapter ve verification access tasarımları |
| `15-prompts/` | Composable prompt framework tasarımları |
| `16-workflows/` | E2E workflow ve orchestration tasarımları |
| `17-decision-policy-engine/` | Decision policy, gate ve precedence tasarımları |
| `18-memory-architecture/` | Memory architecture deep design |
| `19-quality-engine/` | Quality engine, review ve scoring tasarımları |
| `20-orchestrator/` | Orchestrator, coordination ve handoff routing tasarımları |
| `21-observability/` | Observability, telemetry, traceability ve operational insight tasarımları |
| `22-architecture-completion-review/` | Completion, ownership, gap ve freeze blocker review |
| `23-product-ux-design/` | Canonical product interaction ve UX deep-design |

## Kanonik belge matrisi
| Konu | Tek kaynak |
|---|---|
| Architecture baseline | `08-architecture-baseline/README.md` |
| Pre-implementation design / freeze | `09-pre-implementation-design/README.md` |
| Product vision | `10-product/PRD-001-URUN-VIZYONU.md` |
| Agent specifications | `11-agent-specifications/README.md` |
| Contracts | `12-contracts/README.md` |
| Fixtures and evaluation | `13-fixtures-and-evaluation/README.md` |
| Tool and capability design | `14-tool-and-capability-design/README.md` |
| Prompt framework | `15-prompts/README.md` |
| Workflows | `16-workflows/README.md` |
| Decision Policy Engine | `17-decision-policy-engine/README.md` |
| Memory Architecture | `18-memory-architecture/README.md` |
| Quality Engine | `19-quality-engine/README.md` |
| Orchestrator | `20-orchestrator/README.md` |
| Observability | `21-observability/README.md` |
| Architecture completion review | `22-architecture-completion-review/README.md` |
| Product/UX deep design | `23-product-ux-design/README.md` |

## Mimari aşama durumu
| Aşama | Durum |
|---|---|
| Architecture baseline | kanonik baseline mevcut |
| Pre-implementation workplan | tamamlandı; eski freeze kararı yeniden değerlendirilecek |
| Agent specifications | first phase tamamlandı |
| Contracts | first phase tamamlandı |
| Fixtures and evaluation | first phase tamamlandı |
| Tool and capability design | first phase tamamlandı |
| Prompt Framework | first phase tamamlandı |
| Workflows | first phase tamamlandı |
| Decision Policy Engine | first phase tamamlandı |
| Memory Architecture | first phase tamamlandı |
| Quality Engine | first phase tamamlandı |
| Orchestrator | first phase tamamlandı |
| Observability | first phase tamamlandı |
| Architecture completion review | first phase tamamlandı; Product/UX blocker kapatıldı |
| Product/UX deep design | first phase tamamlandı; frontend implementation kapalı |
| Pre-code freeze reassessment | **sıradaki aşama** |

## Source of truth kuralları
1. Architecture ownership ve boundary kararlarında `08-architecture-baseline/` önceliklidir.
2. Canonical deep-design artifact'ları `11–23` altındaki ilgili klasörde tutulur; eski workplan path'leri canonical içerik olarak kullanılmaz.
3. Agent'lar provider çağırmaz; capability kullanır.
4. Agent'lar birbirini doğrudan çağırmaz; Orchestrator routing yapar.
5. Hard constraint skorla telafi edilemez.
6. Verification, evidence ve confidence ownership'i ilgili canonical platform/contractlarda kalır.
7. Canonical memory write yalnız Memory Platform ownership'indedir.
8. Observability Audit Logger'ın yerine geçmez.
9. Product/UX canonical kararları temsil eder; policy/evidence/ranking üretmez.
10. README dosyaları ayrıntıyı kopyalamaz, ilgili canonical alana yönlendirir.
11. `09-pre-implementation-design/10-pre-code-freeze-checklist.md` mevcut `11–23` canonical yapı üzerinden yeniden değerlendirilmeden implementation başlamaz.
12. Ayrı bir pre-code freeze kararı verilene kadar application/frontend/backend/runtime/live-provider implementation kapalıdır.
