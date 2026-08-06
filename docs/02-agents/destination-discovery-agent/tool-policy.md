# Destination Discovery Agent — Tool Policy

## İzinli tool sınıfları

| Tool | Amaç | Fixture mode |
|---|---|---|
| Web Search | Kaynak keşfi | Mock |
| Official Page Fetcher | Birincil bilgi | Mock |
| Geocoding | Yer çözümleme | Fixture |
| Directions/Distance Matrix | Yol/süre | Fixture |
| Weather Forecast | Yakın tarih | Fixture |
| Climate Normals | İleri tarih | Fixture |
| Calculator | Skor/mesafe hesabı | Gerçek deterministic |
| Schema Validator | Contract kontrolü | Gerçek deterministic |
| Rule Engine | Hard constraint | Gerçek deterministic |
| Cache | Çağrı azaltma | Test cache |

## Yasaklar

- genel web sonucunu resmî kaynak gibi etiketleme,
- directions yerine düz çizgi mesafesi kullanma,
- climate normal'i forecast olarak yazma,
- lisans/şartlar uygun değilse yorum veya fiyat verisi scrape etme,
- tool hatasını gizleme.

## Çağrı sırası

1. cache,
2. fixture/provided data,
3. yapılandırılmış provider,
4. resmî kaynak,
5. güvenilir genel web fallback.

## Retry

- timeout: 1 retry,
- rate limit: retry yerine cache/yedek provider,
- invalid response: schema reject,
- conflicting data: primary source ve warning.

## Maliyet sınırı

Agent önce aday havuzunu ucuz verilerle daraltır; pahalı directions ve detaylı kaynak çağrılarını yalnız kısa liste için yapar.
