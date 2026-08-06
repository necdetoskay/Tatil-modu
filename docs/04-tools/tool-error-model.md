# Tool Error Model

## 1. Amaç

Tüm provider ve local service hatalarını ortak bir sınıflandırmaya dönüştürmek.

## 2. Hata kategorileri

| Kategori | Örnek | Retry |
|---|---|---|
| `timeout` | Provider zamanında cevap vermedi | Evet |
| `rate_limited` | Kota veya hız sınırı | Koşullu |
| `authentication_failed` | Anahtar/geçki hatası | Hayır |
| `authorization_failed` | Yetki yetersiz | Hayır |
| `invalid_request` | Giriş sözleşmesi geçersiz | Hayır |
| `not_found` | Entity veya veri bulunamadı | Hayır |
| `invalid_response` | Provider cevabı parse edilemedi | Koşullu |
| `partial_response` | Zorunlu olmayan alanlar eksik | Hayır |
| `stale_data` | Veri güncellik sınırını aşıyor | Fallback |
| `conflicting_data` | Kaynaklar çelişiyor | Hayır |
| `provider_unavailable` | Sağlayıcı servis dışı | Evet/Fallback |
| `budget_exceeded` | Çağrı maliyet sınırını aşıyor | Hayır |
| `policy_denied` | Agent/tool/provider politikası izin vermiyor | Hayır |
| `fixture_missing` | Fixture mode verisi yok | Hayır |
| `internal_error` | Gateway/adapter iç hatası | Koşullu |

## 3. Retry politikası

Retry yalnız şu durumlarda yapılır:

- timeout,
- geçici provider unavailable,
- belirli invalid response türleri.

Retry yapılmaz:

- authentication,
- authorization,
- invalid request,
- policy denied,
- budget exceeded,
- not found.

## 4. Backoff

Başlangıç yaklaşımı:

```text
attempt 1: immediate
attempt 2: 250–500 ms jitter
attempt 3: 750–1500 ms jitter
```

En fazla retry sayısı `ToolRequest.policy.maxRetries` ile sınırlıdır.

## 5. Hata ve partial ayrımı

Bazı alanların eksik olması tüm çağrının başarısız olduğu anlamına gelmez.

Örnek:

- place bulundu,
- çalışma saati yok,
- puan ve koordinat var.

Bu durumda:

```text
status = partial
warning = MISSING_OPENING_HOURS
```

## 6. Fallback

Fallback yalnız:

- policy izin veriyorsa,
- uygun ikinci provider varsa,
- bütçe sınırı aşılmıyorsa,
- kalite düşüşü açıkça kaydediliyorsa

çalışır.

## 7. Secret redaction

Hata mesajlarında:

- API key,
- authorization header,
- session cookie,
- kullanıcı kişisel verisi

bulunamaz.
