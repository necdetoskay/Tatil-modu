# ADR-0003 — Fixture Mode Test Stratejisi

| Alan | Değer |
|---|---|
| Tür | Process ADR |
| Durum | Accepted |
| Tarih | 2026-08-06 |
| Karar Sahibi | Project Team |
| İlgili Doküman | TST-001 |

## Bağlam

Agent testleri yapılırken, "doğru çıktı mı üretti?" sorusunu deterministik olarak yanıtlamak gerekir. LLM her çalışmada farklı cümle kurabilir. Metinle karşılaştırma güvenilir değildir.

## Karar

Testlerde **fixture mode** kullanılır. LLM Reviewer metin karşılaştırması yerine **kural tablosu** (rule table) ve **JSONPath assertion** ile değerlendirme yapar.

## Gerekçe

1. **Determinizm**: Aynı fixture → aynı schema, aynı rule compliance, aynı confidence.
2. **Tekrarlanabilirlik**: LLM non-determinizmi testleri kırar.
3. **Maliyet**: Live mode testleri ~$0.01/test. 1500 test × $0.01 = $15/test run. Fixture mode = $0.
4. **Hız**: Fixture mode < 100ms, Live mode 5-30s.

## Değerlendirilen Seçenekler

### A. Metin tablı assertion (exact match)

**Eleyildi.** LLM her çalışmada farklı cümle kurur. Test her zaman kırılır.

### B. LLM tablı puanlama (sadece reviewer)

**Eleyildi.** Tek başına LLM reviewer subjectiftir. TST-001'e göre üçlü değerlendirme zorunludur.

### C. Rule-based assertion + LLM reviewer (seçildi)

**Kabul edildi.** Schema + Rule deterministiktir. LLM Reviewer sadece mantık kontrolü yapar (puan + gerekçe), geçme kararı vermez.

## Sonuçlar

### Olumlu

- Testler deterministik ve hızlı
- Regresyon testi güvenilir
- LLM Reviewer için rubric standardizasyonu mümkün

### Olumsuz

- LLM Reviewer'ın puanı kural tablı kontrollere göre ikincil olur
- Bazı "kalite" faktörleri kuantitatif olarak ifade edilemeyebilir

## Değiştirme Koşulu

LLM Reviewer'ın subjektif puanlaması rule-based kontrollerden daha iyi performans gösterirse (A/B test), yeni ADR ile revize edilir.
