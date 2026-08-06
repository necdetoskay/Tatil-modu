# Agent Specification Template — ARCH-001

| Alan | Değer |
|---|---|
| Document ID | ARCH-001 |
| Sürüm | 1.1 |
| Durum | Accepted |
| Kanonik Konum | `docs/02-agents/_templates/agent-specification-template.md` |
| Son Güncelleme | 2026-08-06 |

## Amaç

Her agent için ortak, tekrarlanabilir ve test edilebilir specification yapısını tanımlar.

## 16 başlık standardı

1. Kimlik ve Amaç
2. Sorumluluk Sınırı
3. Tetiklenme Koşulları
4. Girdi / Çıktı Sözleşmesi
5. Veri Kaynakları
6. Tool Politikası
7. Sistem Promptu
8. Alt Görev Akışı
9. Karar Algoritması ve Puanlama
10. Agentlar Arası İletişim
11. Hata ve Fallback
12. Cache ve Maliyet
13. Confidence
14. Test Paketi
15. Başarı Metrikleri
16. Loglama ve Gözlemlenebilirlik

## Zorunlu dosya yapısı

```text
docs/02-agents/<agent-name>/
  specification.md
  input.schema.json
  output.schema.json
  system-prompt.md
  decision-rules.md
  tool-policy.md
  handoff-contracts.md
  evaluation-rubric.md
  tests/
```

## Kanonik belgeler

- [Agent Catalog](../agent-catalog.md)
- [Agent Testing Standard](../../03-testing/agent-testing-evaluation-standard.md)
- [Handoff Contract Standard](../../01-architecture/handoff-contract-standard.md)
- [Data Source Trust Policy](../../01-architecture/data-source-trust-policy.md)
- [Tool Catalog](../../04-tools/tool-catalog.md)
