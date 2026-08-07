# Tatil Modu Dokümantasyon Haritası

Bu dosya dokümantasyonun ana giriş noktasıdır. Her konu için tek bir kanonik belge kullanılır.

## Architecture Review durumu

**Güncel mimari durum:** Architecture Freeze öncesi kanonik baseline `08-architecture-baseline/` altında tutulur.

`01-architecture/`, `02-agents/`, `03-testing/` ve `04-tools/` altındaki eski belgeler pre-freeze referans veya domain-spesifik çalışma belgeleri olabilir. Architecture Review sırasında isimlendirme, ownership veya platform sınırı çakışmalarında `08-architecture-baseline/` önceliklidir.

İlk kritik Architecture Review blocker'ları kapatılmıştır:

- ARF-001 — Knowledge Platform / Travel Knowledge Store ayrımı
- ARF-002 — Verification Platform / Data Source & Trust ayrımı
- ARF-003 — Initial Agent Catalog pre-freeze referans statüsü
- ARF-004 — Travel Intelligence module / agent ayrımı
- ARF-005 — Capability Platform / Tool Adapter ayrımı
- ARF-006 — Freeze required artifact inventory

## Klasör yapısı

| Klasör | Sorumluluk |
|---|---|
| `00-governance/` | ADR'ler, mühendislik ilkeleri, karar logu ve terimler |
| `01-architecture/` | Pre-freeze sistem mimarisi, handoff standardı ve veri güven politikası |
| `02-agents/` | Pre-freeze agent katalog ve agent belgeleri |
| `03-testing/` | Ortak agent test ve değerlendirme standardı |
| `04-tools/` | Capability Platform, provider adapterları, runtime kontrolleri ve capability contract'ları |
| `08-architecture-baseline/` | Architecture Freeze öncesi kanonik baseline, ARF kararları ve required artifact envanteri |
| `09-pre-implementation-design/` | Kod/prototype başlamadan önce tamamlanacak Tatil Modu tasarım artifact'ları |
| `10-product/` | Ürün vizyonu, kapsam ve kullanıcı yolculuğu |
| `11-agent-specifications/` | Koddan önce hazırlanacak canonical agent specification dosyaları |
| `12-contracts/` | Koddan önce hazırlanacak canonical handoff contract ve envelope tasarımları |
| `13-fixtures-and-evaluation/` | Koddan önce hazırlanacak canonical fixture, golden scenario ve evaluation tasarımları |
| `14-tool-and-capability-design/` | Koddan önce hazırlanacak tool, capability, adapter ve verification access tasarımları |
| `15-prompts/` | Ortak/composable prompt framework tasarımları |
| `16-workflows/` | Koddan önce hazırlanacak E2E workflow, handoff ve orchestration tasarımları |
| `17-decision-policy-engine/` | Koddan önce hazırlanacak decision policy, gate ve precedence tasarımları |
| `18-memory-architecture/` | Koddan önce hazırlanacak memory architecture deep design tasarımları |
| `19-quality-engine/` | Koddan önce hazırlanacak quality engine, review ve scoring tasarımları |
| `20-orchestrator/` | Koddan önce hazırlanacak orchestrator, coordination ve handoff routing tasarımları |

## Kanonik belge matrisi

| Konu | Tek kaynak |
|---|---|
| Architecture Freeze baseline | [`08-architecture-baseline/README.md`](08-architecture-baseline/README.md) |
| Freeze required artifact inventory | [`08-architecture-baseline/freeze-required-artifact-inventory.md`](08-architecture-baseline/freeze-required-artifact-inventory.md) |
| Pre-implementation design alanı | [`09-pre-implementation-design/README.md`](09-pre-implementation-design/README.md) |
| Design completion assessment | [`09-pre-implementation-design/01-design-completion-assessment.md`](09-pre-implementation-design/01-design-completion-assessment.md) |
| Ürün vizyonu | [`10-product/PRD-001-URUN-VIZYONU.md`](10-product/PRD-001-URUN-VIZYONU.md) |
| Sistem mimarisi | [`08-architecture-baseline/README.md`](08-architecture-baseline/README.md) |
| Canonical agent specifications | [`11-agent-specifications/README.md`](11-agent-specifications/README.md) |
| Canonical contracts | [`12-contracts/README.md`](12-contracts/README.md) |
| Canonical fixtures and evaluation | [`13-fixtures-and-evaluation/README.md`](13-fixtures-and-evaluation/README.md) |
| Canonical tool and capability design | [`14-tool-and-capability-design/README.md`](14-tool-and-capability-design/README.md) |
| Canonical prompt framework | [`15-prompts/README.md`](15-prompts/README.md) |
| Canonical workflow design | [`16-workflows/README.md`](16-workflows/README.md) |
| Canonical decision policy engine | [`17-decision-policy-engine/README.md`](17-decision-policy-engine/README.md) |
| Canonical memory architecture | [`18-memory-architecture/README.md`](18-memory-architecture/README.md) |
| Canonical quality engine | [`19-quality-engine/README.md`](19-quality-engine/README.md) |
| Trip Intake Agent spec | [`11-agent-specifications/trip-intake-agent.md`](11-agent-specifications/trip-intake-agent.md) |
| Pre-freeze agent listesi | [`02-agents/agent-catalog.md`](02-agents/agent-catalog.md) |
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
| Governance foundation | tamamlandı / pre-freeze referans |
| Product vision | foundation tamamlandı |
| Agent foundation | pre-freeze referans; canonical sınırlar baseline altında |
| Tool / Capability Architecture | ARF-005 ile boundary netleşti |
| Data Source & Trust Architecture | ARF-002 ile Verification Platform'dan ayrıştırıldı |
| Knowledge Platform | ARF-001 ile Travel Knowledge Store'dan ayrıştırıldı |
| Architecture baseline | freeze öncesi kanonik kaynak |
| Required artifact inventory | ARF-006 ile eklendi |
| Pre-implementation design | workplan tamamlandı; kod/prototype kapalı |
| Canonical agent specifications | first phase tamamlandı; kod/prototype kapalı |
| Canonical contracts | first phase tamamlandı; kod/prototype kapalı |
| Canonical fixtures and evaluation | first phase tamamlandı; kod/prototype/test runner kapalı |
| Canonical tool and capability design | first phase tamamlandı; adapter/provider/live tool kapalı |
| Prompt Framework | first phase tamamlandı; runtime prompt engine kapalı |
| Workflows | first phase tamamlandı; runtime orchestration kapalı |
| Decision Policy Engine | first phase tamamlandı; runtime policy engine kapalı |
| Memory Architecture | first phase tamamlandı; runtime memory store kapalı |
| Quality Engine | first phase tamamlandı; runtime reviewer/scoring engine kapalı |
| Orchestrator | sıradaki aşama; kod/prototype kapalı |
| Observability üst katmanı | bekliyor |

## Source of truth kuralları

1. Architecture Freeze öncesi mimari ownership ve boundary kararlarında `08-architecture-baseline/` önceliklidir.
2. Agent listesi başka belgelerde yeniden yazılmaz; `02-agents/agent-catalog.md` pre-freeze referans kabul edilir.
3. Agent template'i yalnız `_templates` altında tutulur.
4. ADR kararın nedenini açıklar; güncel katalog görevi görmez.
5. README dosyaları ayrıntıyı kopyalamaz, kanonik belgeye yönlendirir.
6. Taşınan belgelerin eski konumu kaldırılır.
7. Provider isimleri agent contract'larına doğrudan yazılmaz; capability kimliği kullanılır.
8. Data Source Architecture, Capability Platform runtime kurallarını tekrar etmez; güven ve evidence kararlarını tanımlar.
9. Kodlama ve prototype, `09-pre-implementation-design/` altındaki tasarım artifact seti tamamlanmadan başlamaz.
10. Canonical agent specification dosyaları `11-agent-specifications/` altında tutulur; `02-agents/` pre-freeze referans olarak kalır.
11. Canonical handoff contract tasarımları `12-contracts/` altında tutulur; schema code ve runtime validator değildir.
12. Canonical fixture ve evaluation tasarımları `13-fixtures-and-evaluation/` altında tutulur; test runner, CI veya otomasyon kodu değildir.
13. Canonical tool ve capability tasarımları `14-tool-and-capability-design/` altında tutulur; gerçek tool çağrısı, adapter kodu veya provider entegrasyonu değildir.
14. Prompt framework tasarımları `15-prompts/` altında tutulur; runtime prompt engine veya production prompt routing değildir.
15. Workflow tasarımları `16-workflows/` altında tutulur; runtime orchestration, job runner veya production workflow engine değildir.
16. Decision policy tasarımları `17-decision-policy-engine/` altında tutulur; runtime policy engine, rule evaluator veya scoring implementation değildir.
17. Memory architecture tasarımları `18-memory-architecture/` altında tutulur; runtime memory store, database schema veya vector store implementation değildir.
18. Quality engine tasarımları `19-quality-engine/` altında tutulur; runtime reviewer, scoring engine, LLM judge veya CI evaluator değildir.
19. Orchestrator tasarımları sıradaki aşamada ele alınacaktır; runtime orchestration veya live agent execution değildir.
