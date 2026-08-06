# Agent Specification Template (ARCH-001)

> **Not**: Bu template, her agent için 16 zorunlu başlık içerir. Agent catalog ve ilk Tam agent (Trip Profile) için kullanılmıştır. Kanonik agent listesi [`docs/02-agents/agent-catalog.md`](docs/02-agents/agent-catalog.md)'dadır.

| Alan | Değer |
|---|---|
| Document ID | ARCH-001 |
| Sürüm | 1.0 |
| Durum | Onay Bekliyor |
| EOS Sürümü | EOS v1.0 |
| Bağımlılıklar | PRD-001, TST-001 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Her agent için 16 başlık içeren tekrarlanabilir specification template.

## 16-Başlık Standard

1. Kimlik ve Amaç
2. Sorumluluk Sınırı (✅/❌ listesi)
3. Tetiklenme Koşulları
4. Girdi / Çıktı Sözleşmesi
5. Kullanılan Veri Kaynakları (trust tier'ları, ARCH-003'e göre)
6. Kullanılan Tool'lar (tool catalog, TL-001~TL-014'e göre)
7. Sistem Promptu (composable 5 katman)
8. Alt Görev Akışı (workflow diagramı)
9. Karar Algoritması ve Puanlama Modeli
10. Diğer Agentlarla İletişim (handoff contracts)
11. Hata Yönetimi ve Yedek Stratejileri
12. Cache ve Maliyet Optimizasyonu
13. Güven Puanı (Confidence)
14. Test Senaryoları
15. Başarı Metrikleri
16. Loglama ve Gözlemlenebilirlik

## İlgili Dokümanlar

- [Agent Catalog (kanonik)](../02-agents/agent-catalog.md)
- [Testing Standard (TST-001)](../03-testing/agent-testing-evaluation-standard.md)
- [Data Source Trust Policy](../01-architecture/data-source-trust-policy.md)
- [Tool Catalog (plan)](../04-tools/tool-catalog.md)
