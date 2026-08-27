# Test ve Değerlendirme Belgeleri

| Alan | Değer |
|---|---|
| Document ID | TST-README |
| Sürüm | 1.1 |
| Durum | ACTIVE / RECONCILIATION REQUIRED |
| Son Güncelleme | 2026-08-27 |

## Amaç

Bu klasör Tatil Modu agent sistemindeki test ve değerlendirme standartlarını içerir.

## Kanonik öncelik

Agent seti ve agent ownership için:

1. `docs/11-agent-specifications/canonical-agent-contract-catalog.md`

Harness lifecycle, R0–R8 test merdiveni, context manifest/freeze, system provenance, failure attribution ve verified-state gate için:

2. `docs/15-harness-and-orchestration/02-agent-contract-harness-baseline.md`

Radar/DeepSeek Harness adoption kararları için:

3. `docs/15-harness-and-orchestration/01-radar-deepseek-harness-adoption-review.md`

## Mevcut temel standart

- [Agent Testing & Evaluation Standard](agent-testing-evaluation-standard.md) (`TST-001`) — fixture/live/hybrid, schema/rule/LLM reviewer, regression ve release gate temelini tanımlar.

`TST-001` 2026-08-06 tarihli ilk agent yapısına göre hazırlanmıştır ve bazı path/agent isimleri legacy'dir. Aşağıdaki konularda Harness Baseline önceliklidir:

- `docs/11-agent-specifications/` canonical agent alanı,
- 16 uzman agent + Travel Orchestrator,
- R0 Contract → R8 Regression seviyesi,
- ContextManifest ve context freeze,
- context/tool/authority scope testleri,
- system-level provenance,
- harness-vs-model failure attribution,
- verification sonrası state commit gate.

## Değişmeyen temel ilkeler

TST-001'den aynen korunur:

- agentlar fixture ile bağımsız test edilebilir,
- live test varsayılan unit/fixture gate değildir,
- deterministic evaluator LLM reviewer'dan önce gelir,
- LLM reviewer tek başına PASS veremez,
- confirmed defect regression testine dönüşür,
- source/evidence olmadan kritik fact kabul edilmez.

## Sonraki reconciliation

TST-001 içerik olarak korunacak fakat ilk golden agent (`TM-AG-001 Profile Agent`) tamamlandıktan sonra v2'ye yükseltilerek legacy path ve eski agent isimleri temizlenecektir.
