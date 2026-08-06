# AGENTS.md — Tatil Modu

## Purpose

Tatil Modu, belge-first, sözleşme tabanlı ve bağımsız test edilebilir bir seyahat planlama agent sistemidir.

Bu dosya, repository üzerinde çalışan insan ve AI geliştiriciler için kısa çalışma sözleşmesidir. Ayrıntılı kararlar kanonik dokümanlarda tutulur; burada tekrar edilmez.

## Kanonik kaynaklar

- Doküman haritası: `docs/README.md`
- Agent kataloğu: `docs/02-agents/agent-catalog.md`
- Agent template'i: `docs/02-agents/_templates/agent-specification-template.md`
- Test standardı: `docs/03-testing/agent-testing-evaluation-standard.md`
- Handoff standardı: `docs/01-architecture/handoff-contract-standard.md`
- Tool kataloğu: `docs/04-tools/tool-catalog.md`
- Governance: `docs/00-governance/`

## Agent ID haritası

```text
AG-001 Trip Profile Agent
AG-002 Destination Discovery Agent
AG-003 Places & Experiences Agent
AG-004 Accommodation Agent
AG-005 Food & Local Taste Agent
AG-006 Review Intelligence Agent
AG-007 Weather Context Agent
AG-008 Route & Schedule Optimizer
AG-009 Budget & Constraint Evaluator
AG-010 Verification & Quality Reviewer
AG-011 Final Plan Composer
AG-012 Orchestrator
```

Bu listeyi değiştirirken yalnız kanonik `agent-catalog.md` güncellenir; bu özet de aynı commit içinde senkronize edilir.

## Zorunlu geliştirme sırası

Bir agent için kod veya canlı entegrasyon başlamadan önce:

1. `specification.md`
2. `input.schema.json`
3. `output.schema.json`
4. `system-prompt.md`
5. `decision-rules.md`
6. `tool-policy.md`
7. `handoff-contracts.md`
8. `evaluation-rubric.md`
9. fixture testleri
10. contract, behavioral, scenario ve adversarial testleri

hazır olmalıdır.

## Çalışma kuralları

- Agent görev sınırını aşmamalıdır.
- Deterministik işlem LLM'e bırakılmamalıdır.
- Güncel bilgi tool veya güvenilir kaynakla doğrulanmalıdır.
- Varsayımlar kesin bilgi gibi sunulmamalıdır.
- Her agent fixture mode'da bağımsız test edilebilmelidir.
- Handoff çıktıları sürümlü JSON sözleşmesine uymalıdır.
- Gizli anahtarlar ve kişisel veriler repoya yazılmamalıdır.
- Aynı bilginin ikinci bir kanonik kopyası oluşturulmamalıdır.

## Mevcut durum

- `AG-001 — Trip Profile Agent`: ilk dokümantasyon ve fixture paketi mevcut.
- Sıradaki agent: `AG-002 — Destination Discovery Agent`.
- Orchestrator, diğer agent sözleşmeleri yeterince olgunlaşmadan uygulanmaz.
