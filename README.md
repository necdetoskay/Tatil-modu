# Tatil Modu

> **Mobil uygulama vitrindir; asıl ürün, doğrulanabilir kararlar üreten agent sistemidir.**

Tatil Modu, kullanıcıların tatil planlarken yaptığı araştırma, karşılaştırma, doğrulama ve rota oluşturma işlerini yapılandırılmış agentlar ve deterministik araçlarla gerçekleştirmeyi amaçlar.

## Temel yaklaşım

- **Documentation First:** Agent kodlanmadan önce specification, schema, prompt ve test paketi hazırlanır.
- **Contract Before Code:** Agentlar serbest metin yerine sürümlü handoff sözleşmeleriyle iletişim kurar.
- **Fixture Mode:** Her agent başka agentlara veya canlı servislere ihtiyaç duymadan bağımsız test edilebilir.
- **Tool-First Verification:** Güncel fiyat, çalışma saati, hava ve mesafe gibi bilgiler uygun araçlardan alınır.
- **Single Source of Truth:** Her mimari konu için yalnız bir kanonik belge tutulur.

## Dokümantasyon

| Alan | Kanonik belge |
|---|---|
| Doküman haritası | [docs/README.md](docs/README.md) |
| Ürün vizyonu | [PRD-001](docs/10-product/PRD-001-URUN-VIZYONU.md) |
| Sistem mimarisi | [System Overview](docs/01-architecture/system-overview.md) |
| Agent kataloğu | [Agent Catalog](docs/02-agents/agent-catalog.md) |
| Agent şablonu | [ARCH-001](docs/02-agents/_templates/agent-specification-template.md) |
| Test standardı | [TST-001](docs/03-testing/agent-testing-evaluation-standard.md) |
| Tool kataloğu | [Tool Catalog](docs/04-tools/tool-catalog.md) |
| Governance ve ADR | [Governance](docs/00-governance/README.md) |

## İlk tamamlanan agent

### AG-001 — Trip Profile Agent

Kullanıcının serbest metin tatil talebini diğer agentların kullanabileceği yapılandırılmış bir profile dönüştürür.

Belgeler:

- [Specification](docs/02-agents/trip-profile-agent/specification.md)
- [System Prompt](docs/02-agents/trip-profile-agent/system-prompt.md)
- [Decision Rules](docs/02-agents/trip-profile-agent/decision-rules.md)
- [Input Schema](docs/02-agents/trip-profile-agent/input.schema.json)
- [Output Schema](docs/02-agents/trip-profile-agent/output.schema.json)
- [Tool Policy](docs/02-agents/trip-profile-agent/tool-policy.md)
- [Handoff Contracts](docs/02-agents/trip-profile-agent/handoff-contracts.md)
- [Evaluation Rubric](docs/02-agents/trip-profile-agent/evaluation-rubric.md)
- [Fixture ve testler](docs/02-agents/trip-profile-agent/tests/README.md)

## Sıradaki çalışma

`AG-002 — Destination Discovery Agent`

Bu agent için specification, veri kaynakları, tool politikası, handoff sözleşmeleri ve fixture testleri hazırlanacaktır.
