# Rate Limit & Circuit Breaker Architecture

## 1. Amaç

Providerların aşırı kullanılmasını, zincirleme hataları ve gereksiz retry fırtınalarını önlemek.

## 2. Rate limit seviyeleri

```text
global provider limit
capability limit
agent limit
workflow limit
user/session limit
```

## 3. Token bucket yaklaşımı

Başlangıç algoritması:

- her provider/capability için token bucket,
- provider header bilgisi varsa gerçek kota ile senkronizasyon,
- yoksa konfigüre edilen güvenli sınır,
- kritik çağrılar için ayrılmış düşük hacimli rezerv.

## 4. Queue davranışı

Çağrı beklemeye alınabilir yalnız:

- timeout bütçesi izin veriyorsa,
- kullanıcı deneyimi bozulmuyorsa,
- provider limitinin kısa sürede açılması bekleniyorsa.

Aksi halde fallback veya kontrollü hata üretilir.

## 5. Circuit breaker durumları

```text
closed
open
half_open
```

### Closed

Çağrılar normal geçer.

### Open

Provider çağrıları engellenir; cache/fallback kullanılır.

### Half-open

Sınırlı health probe çağrıları yapılır.

## 6. Circuit açma sinyalleri

- ardışık timeout,
- yüksek 5xx oranı,
- invalid response artışı,
- authentication/misconfiguration,
- provider latency eşiği,
- rate limit saturation.

Authentication hatasında circuit `misconfigured` olarak işaretlenebilir; otomatik retry yapılmaz.

## 7. Başlangıç eşikleri

Örnek:

```text
5 ardışık geçici hata
veya
son 20 çağrıda %50 hata
veya
p95 latency eşik üstü
```

Bu değerler provider bazında yapılandırılır.

## 8. Recovery

- cooldown süresi,
- half-open probe,
- başarılı N probe sonrası closed,
- başarısız probe sonrası yeniden open.

## 9. Retry fırtınası önleme

- exponential backoff,
- jitter,
- merkezi retry bütçesi,
- aynı workflow içinde duplicate retry engeli,
- circuit açıkken retry yasağı.

## 10. Testler

- bucket depletion,
- queue timeout,
- open/half-open/closed geçişleri,
- auth error davranışı,
- concurrent workflow limiti,
- retry budget,
- fallback aktivasyonu.
