# Capability Specification — accommodation.search

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `accommodation.search` |
| Tool Class | `TL-008` |
| Version | `1.0.0` |
| Freshness | realtime |
| Cost Class | variable |
| Privacy Class | user_context |
| Source Trace | required |

## Amaç

Belirli tarih, kişi sayısı, çocuk yaşları, oda yapısı ve konum için konaklama teklifleri bulmak.

## Girdi

- hedef alan,
- check-in/check-out,
- yetişkin ve çocuklar,
- oda sayısı,
- para birimi,
- zorunlu ve tercih edilen özellikler,
- iptal/öğün/otopark filtreleri,
- result limit ve pagination.

## Çıktı

Her teklif için:

- canonical property ID,
- property metadata,
- room/offer ID,
- occupancy,
- total price,
- tax/fee breakdown,
- availability timestamp,
- cancellation policy,
- meal plan,
- parking,
- child policy,
- source trace.

## Kurallar

- toplam fiyat ile gecelik fiyat ayrılır,
- vergi/ücret dahil durumu açıkça taşınır,
- çocuk yaşları provider'a doğru iletilir,
- oda kapasitesi kişi sayısından düşük teklif döndürülemez,
- price freshness timestamp zorunludur,
- availability geçmiş veriyle kesin gösterilemez,
- rating ve review count burada yalnız metadata'dır; deneyim analizi yapılmaz.

## Quality metrics

- price freshness,
- availability freshness,
- tax completeness,
- occupancy correctness,
- cancellation completeness,
- child policy completeness,
- provider entity matching.

## Kritik hatalar

- oda kapasitesi ihlali,
- toplam fiyatta vergi belirsizliği,
- eski fiyatı güncel gösterme,
- çocuk yaşlarını yok sayma,
- source trace eksikliği.
