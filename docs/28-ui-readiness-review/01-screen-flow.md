# UI Screen Flow

## Primary flow

```text
request intake
→ critical clarification
→ constraint confirmation
→ planning progress
→ plan overview
→ daily plan detail
→ evidence / warning detail
→ scoped revision
→ updated plan
```

## Screen responsibilities

| Surface | User goal | Allowed responsibility |
|---|---|---|
| Intake | İsteği ve bağlamı vermek | Input toplamak, eksikleri göstermek |
| Clarification | Kritik belirsizliği çözmek | Soru sormak, cevabı intent olarak göndermek |
| Constraint confirmation | Sınırları teyit etmek | Hard/soft/assumption ayrımını görünür göstermek |
| Planning progress | Bekleme durumunu anlamak | Stage/progress göstermek, retry sunmak |
| Plan overview | Hızlı karar vermek | Özet, süre, bütçe, sürüş/yorgunluk ve kritik warning göstermek |
| Daily plan | Günü uygulamak | Zaman blokları, dinlenme, alternatif ve geçiş yükünü göstermek |
| Evidence detail | Güveni değerlendirmek | Kaynak, freshness ve verification durumunu progressive disclosure ile göstermek |
| Revision | Sınırlı değişiklik istemek | Scope ve değişiklik niyetini göndermek; routing kararı vermemek |
| Memory consent | Hatırlamayı kontrol etmek | Öneriyi kabul/red/düzenle akışı sunmak; write gerçekleştirmemek |

## Ownership guard

UI policy, ranking, verification, confidence, quality score, orchestration routing veya memory write üretmez. Bu değerler yalnız canonical headless çıktılardan temsil edilir.
