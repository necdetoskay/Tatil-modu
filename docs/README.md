# Tatil Modu Dokümantasyon Haritası

Bu dosya dokümantasyonun ana giriş noktasıdır. Her konu için tek bir kanonik belge kullanılır.

## Güncel durum
Canonical pre-code design freeze **PASS**. `11–23` deep-design katmanları tamamlandı ve açık design blocker kalmadı. Sıradaki aşama `24-implementation-readiness/` altında implementation ve delivery planıdır.

```yaml
canonical_design_freeze: approved
open_design_blockers: 0
implementation_planning_allowed: true
production_release_allowed: false
live_provider_integration_allowed: false
current_stage: implementation_readiness_and_delivery_plan
```

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
| `23-product-ux-design/` | Product interaction ve UX deep design |
| `24-implementation-readiness/` | Implementation topology, sequence, testing, CI ve delivery planı |

## Kanonik belge matrisi
| Konu | Tek kaynak |
|---|---|
| Architecture baseline | `08-architecture-baseline/README.md` |
| Pre-code freeze | `09-pre-implementation-design/10-pre-code-freeze-checklist.md` |
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
| Implementation readiness | `24-implementation-readiness/README.md` |

## Aşama durumu
| Aşama | Durum |
|---|---|
| Canonical design `11–23` | tamamlandı |
| Architecture completion review | tamamlandı |
| Product/UX deep design | tamamlandı |
| Pre-code freeze reassessment | **PASS** |
| Implementation readiness & delivery plan | **aktif aşama** |
| Production readiness | kapalı |

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
11. Design freeze PASS production readiness anlamına gelmez.
12. Live provider, persistent production memory ve deployment ayrı readiness gate'lerine tabidir.
