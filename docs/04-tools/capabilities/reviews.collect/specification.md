# Capability Specification — reviews.collect

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `reviews.collect` |
| Tool Class | `TL-009` |
| Version | `1.0.0` |
| Freshness | medium |
| Cost Class | variable |
| Privacy Class | public |
| Source Trace | required |

## Amaç

İzinli kaynaklardan belirli bir yer, işletme veya varış noktası için yorum kayıtlarını toplamak ve ortak şemaya normalize etmek.

## Girdi

- canonical entity ID,
- provider entity IDs,
- tarih aralığı,
- dil filtreleri,
- pagination,
- maksimum kayıt,
- doğrulanmış ziyaret tercihi,
- lisans kullanım amacı.

## Çıktı

Her yorum için:

- canonical review ID,
- provider review ID,
- entity ID,
- source/provider,
- review date,
- rating,
- text veya izin verilen extract/reference,
- language,
- verified visit/stay flag,
- reviewer segment metadata if permitted,
- duplicate cluster,
- spam/bot suspicion,
- license and usage metadata,
- source trace.

## Kurallar

- scraping ve yeniden yayınlama provider şartlarına uygun olmalıdır,
- ham metin saklama izni yoksa yalnız permitted extract veya reference tutulur,
- aynı yorum farklı kaynak/çekimlerde duplicate olarak işaretlenir,
- yorum yazarı gereksizse tutulmaz,
- verified flag providerın gerçek alanından gelir; model tarafından uydurulmaz,
- review collection analiz yapmaz,
- olumlu/olumsuz tema çıkarmaz,
- yorum skoru ile deneyim skoru aynı değildir.

## Duplicate

Duplicate tespiti için:

- provider review ID,
- normalized text hash,
- date,
- rating,
- entity,
- reviewer hash when permitted

kullanılabilir.

Duplicate kayıt tamamen silinmek yerine cluster ilişkisi taşımalıdır.

## Lisans

Her kayıt:

- license ID,
- text usage mode,
- storage allowed,
- redistribution allowed,
- retention class

alanlarını taşımalıdır.

## Privacy

- reviewer adı zorunlu değildir,
- reviewer profile URL varsayılan olarak saklanmaz,
- kullanıcı adı gerekiyorsa hash/pseudonym tercih edilir,
- serbest metindeki kişisel veri redaction sürecine girebilir.

## Quality metrics

- coverage,
- recency,
- verified-review ratio,
- duplicate ratio,
- language detection accuracy,
- source trace completeness,
- license completeness,
- spam suspicion rate.

## Kritik hatalar

- lisans metadata olmadan yorum kullanımı,
- verified flag uydurma,
- duplicate yorumları bağımsız kanıt gibi sayma,
- source trace eksikliği,
- izin verilmeyen tam metni saklama.
