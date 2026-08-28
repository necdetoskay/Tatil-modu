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
TM-AG-001 Profile Agent
TM-AG-002 Preference & Policy Agent
TM-AG-003 Destination Research Agent
TM-AG-004 Place Intelligence Agent
TM-AG-005 Accommodation Agent
TM-AG-006 Food & Local Taste Agent
TM-AG-007 Weather Agent
TM-AG-008 Transportation Agent
TM-AG-009 Route Planner Agent
TM-AG-010 Budget Agent
TM-AG-011 Public Authority Intelligence Agent
TM-AG-012 Review Intelligence Agent
TM-AG-013 Adaptive Itinerary Agent
TM-AG-014 Verification Agent
TM-AG-015 Explanation Agent
TM-AG-016 Final Composer Agent
TM-ORCH-001 Travel Orchestrator
```

Bu liste yalnız kısa çalışma özetidir. Kanonik agent seti `docs/11-agent-specifications/canonical-agent-contract-catalog.md` içindedir.

## Zorunlu geliştirme sırası

Bir agent için kod veya canlı entegrasyon başlamadan önce:

1. `specification.md`
2. `input.schema.json`
3. `output.schema.json`
4. `authority-policy.md`
5. `tool-policy.md`
6. `source-policy.md`
7. `decision-rules.md`
8. `handoff-contracts.md`
9. `evaluation-rubric.md`
10. `tests/fixture-pack.v1.json`
11. contract, behavioral, scenario ve adversarial testleri

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

Tek kanonik makine-okunur durum kaydı `project-status.json` dosyasıdır. İnsan-okunur üretilmiş görünüm: `docs/generated/project-status.md`.

- 17/17 golden contract paketi mevcut.
- M1 executable contract harness aktiftir; R2 case-depth gate tamamlanana kadar runtime kilitlidir.
- Orchestrator ve live provider entegrasyonu ilgili gate açılmadan uygulanmaz.
