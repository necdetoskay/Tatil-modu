# Tatil-Plan

> **Mobile uygulama bir vitrin. Gerçek ürün, agent sistemdir.**

Tatil-Plan, insanların "tatil planlarken hangi işleri yaptıklarını" modelleyen bir **seyahit danışmanlığı agent sistemidir.**

- **Mimari**: 3 katman (User/App → Orchestrator/Decision → Agent/Tool) + 12 agent
- **Test felsefesi**: Contract → Behavioral → Scenario → Adversarial + Triple Evaluation (Schema + Rule + LLM)
- **İlklleme**: Documentation First, Agent Contract Before Code, Fixture Mode testing

## 📚 Dokümantasyon

| Katman | Link |
|--------|------|
| **Governance** | [README](docs/00-governance/README.md) · [İlkeler](docs/00-governance/engineering-principles.md) · [ADR-0001](docs/00-governance/adr/ADR-0001-eos-adoption.md) |
| **Architecture** | [System Overview](docs/01-architecture/system-overview.md) · [Handoff Standard](docs/01-architecture/handoff-contract-standard.md) · [Data Trust Policy](docs/01-architecture/data-source-trust-policy.md) |
| **Product** | [Vision & Scope](docs/10-product/PRD-001-URUN-VIZYONU.md) |
| **Agent Catalog** | [ARCH-002](docs/02-agents/agent-catalog.md) — 12 agent, geliştirme sırası |
| **Spec Template** | [ARCH-001](docs/11-architecture/ARCH-001-AGENT-SPECIFICATION-TEMPLATE.md) — 16 başlık standardı |
| **Testing** | [TST-001](docs/03-testing/agent-testing-evaluation-standard.md) — 4 seviyeli test, triple evaluation |
| **Tools** | [Tool Catalog](docs/04-tools/tool-catalog.md) — 14 tool sınıfı |

## 🚀 İlk Tam Agent: Trip Profile (AG-001)

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `specification.md` | ~100 | 16 başlık template, confidence modeli, başarı metrikleri |
| `system-prompt.md` | ~70 | "Yap / Yapma" komutları, inference kuralları |
| `decision-rules.md` | ~55 | Kaynak önceliği, yaş grupları, çelişki kodları |
| `input.schema.json` | 93 | JSON Schema 2020-12 |
| `output.schema.json` | 165 | 22 zorunlu alan |
| `tool-policy.md` | ~40 | Tool kullanımı: hiçbiri (fixture-mode test uyumlu) |
| `handoff-contracts.md` | ~115 | 5 consumer agent için contract |
| `evaluation-rubric.md` | ~95 | Schema/Rubric, Behavioral, Scenario, Adversarial |
| `tests/fixtures/` | 15 | TPA-001 → TPA-015 (8 kategori) |
| `tests/contract.test.ts` | ~60 | Schema validity |
| `tests/behavioral.test.ts` | ~110 | Karar kuralı compliance |
| `tests/scenario.test.ts` | ~60 | Zor gerçek dünya senaryoları |
| `tests/adversarial.test.ts` | ~55 | Çelişkili girdiler |
| `tests/README.md` | ~50 | Fixture format, assertion operatörleri, geçme kriteri |

**Test matrisi**: 15 fixture, 5 adversarial, 10 scenario, 12 behavioral. Schema coverage: 100%.

## 🔜 Bir Sonraki Adımlar

1. **Destination Discovery Agent** (AG-002) — specification + fixtures
2. **Places & Experiences Agent** (AG-003)
3. **Review Intelligence Agent** (AG-005) — yorum analizi mimarisi
4. **Orchestrator** (AG-012) — en son (tüm contract'lar netleştiğinde)
