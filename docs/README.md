# Tatil Modu Dokümantasyon Haritası

Bu dosya dokümantasyonun ana giriş noktasıdır. Her konu için tek bir kanonik belge kullanılır.

## Güncel durum

Tek kanonik makine-okunur durum kaydı [`../project-status.json`](../project-status.json) dosyasıdır. İnsan-okunur ve otomatik üretilen görünüm için [`generated/project-status.md`](generated/project-status.md) kullanılır. Bu sayfadaki tarihsel aşama tabloları readiness kararı için kaynak değildir.

## Klasör yapısı
| Klasör | Sorumluluk |
|---|---|
| `00-governance/` | ADR'ler, mühendislik ilkeleri, karar logu ve terimler |
| `01-architecture/` | Pre-freeze referans mimari belgeleri |
| `02-agents/` | Pre-freeze agent katalog/referans belgeleri |
| `03-testing/` | Ortak test/evaluation referansları |
| `04-tools/` | Pre-freeze capability/tool referansları |
| `08-architecture-baseline/` | Kanonik architecture baseline |
| `09-pre-implementation-design/` | Pre-code workplan ve final design freeze kararı |
| `10-product/` | Ürün vizyonu ve kapsam foundation |
| `11-agent-specifications/` | Canonical agent specifications |
| `12-contracts/` | Canonical handoff contracts |
| `13-fixtures-and-evaluation/` | Fixture, golden scenario ve evaluation tasarımları |
| `14-tool-and-capability-design/` | Tool/capability/provider boundary tasarımları |
| `15-prompts/` | Prompt framework |
| `16-workflows/` | E2E workflow tasarımları |
| `17-decision-policy-engine/` | Policy, gate ve precedence tasarımları |
| `18-memory-architecture/` | Memory/privacy tasarımı |
| `19-quality-engine/` | Quality/review tasarımı |
| `20-orchestrator/` | Orchestration/routing tasarımı |
| `21-observability/` | Telemetry/traceability tasarımı |
| `22-architecture-completion-review/` | Cross-layer completion ve blocker review |
| `23-product-ux-design/` | Product interaction ve UX deep design; implementation ertelendi |
| `24-implementation-readiness/` | Headless core topology, sequence, testing, CI ve delivery planı |
| `25-headless-test-architecture/` | Headless test suite, severity/gate, coverage, model eval ve UI Unlock mimarisi |
| `26-headless-implementation/` | H0–H12 gerçek implementation ve execution evidence kayıt alanı |
| `27-agent-model-routing-and-evaluation/` | Agent bazlı model tier, capability/memory matrisi, routing, benchmark ve promotion/rollback tasarımı |

## Kanonik belge matrisi
| Konu | Tek kaynak |
|---|---|
| Architecture baseline | `08-architecture-baseline/README.md` |
| Pre-code freeze | `09-pre-implementation-design/10-pre-code-freeze-checklist.md` |
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
| Product/UX deep design | `23-product-ux-design/README.md` |
| Implementation readiness | `24-implementation-readiness/README.md` |
| Headless test architecture | `25-headless-test-architecture/README.md` |
| UI unlock gate | `25-headless-test-architecture/15-headless-core-acceptance-gate.md` |
| Implementation execution | `26-headless-implementation/README.md` |
| Agent/model routing & evaluation | `27-agent-model-routing-and-evaluation/README.md` |

## Aşama durumu

Güncel aşama ve gate değerleri yalnız [`generated/project-status.md`](generated/project-status.md) görünümünde tutulur.

## Source-of-truth kuralları
1. Architecture ownership ve boundary kararlarında `08-architecture-baseline/` önceliklidir.
2. Canonical deep-design artifact'ları `11–23` altındaki ilgili klasörde tutulur.
3. Agent provider çağırmaz; capability kullanır.
4. Agent'lar birbirini doğrudan çağırmaz; Orchestrator routing yapar.
5. Hard constraint skorla telafi edilemez.
6. Verification/evidence/confidence ownership'i canonical platform/contractlarda kalır.
7. Canonical memory write yalnız Memory Platform ownership'indedir.
8. Observability Audit Logger'ın yerine geçmez.
9. Product/UX policy/evidence/ranking üretmez; canonical sonucu temsil eder.
10. Implementation canonical contract ve ownership sınırlarını değiştirecekse önce ADR/design amendment gerekir.
11. Headless core L0–L7 acceptance gate'leri ve tüm P0 testleri geçmeden UI readiness review açılamaz.
12. UI readiness review ayrıca PASS vermeden UI/frontend implementation başlayamaz.
13. Real model/provider benchmark deterministic core test gate'inin yerine geçmez.
14. Live provider, persistent production memory ve deployment ayrı readiness gate'lerine tabidir.
15. H0–H11 sprintleri test-gated Definition of Done ile kapanır; feature code tek başına sprint completion değildir.
16. Bir sprintin sonraki sprinti açabilmesi için gerçek test execution evidence gereklidir.
17. Production model isimleri ve exact token/latency/cost limitleri yalnız `27-agent-model-routing-and-evaluation/` altında tanımlanan L8 benchmark evidence sonrası atanır.
18. Model tier değişimi agent capability veya memory erişimini genişletemez.
