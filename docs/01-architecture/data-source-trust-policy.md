# Data Source Trust & Freshness Policy

## 1. Amaç

Tatil Modu tarafından kullanılan bilgilerin güvenilirlik, güncellik ve doğrulanabilirlik kurallarını tanımlar.

## 2. Kaynak güven seviyeleri

### Tier 1 — Birincil kaynak

- resmî kurum,
- müze veya tesisin resmî sitesi,
- veri sahibinin API'si,
- resmî ulaşım/otoyol servisi.

### Tier 2 — Yetkili yapılandırılmış sağlayıcı

- lisanslı harita/place sağlayıcısı,
- rezervasyon sağlayıcısı,
- hava durumu sağlayıcısı.

### Tier 3 — Güvenilir platform

- yüksek hacimli yorum platformu,
- sektörel rehber,
- doğrulanmış kullanıcı içeriği.

### Tier 4 — Genel web kaynağı

- blog,
- haber,
- forum,
- sosyal medya.

Kritik ve değişken bilgiler yalnız Tier 4 kaynağa dayanarak kesinleştirilemez.

## 3. Bilgi türüne göre tercih

### Çalışma saati

```text
Resmî site
Resmî sosyal hesap/duyuru
Harita kaydı
Güvenilir rehber
```

### Fiyat

```text
Rezervasyon/fiyat sağlayıcısı
Resmî işletme sitesi
Resmî tarife
Diğer kaynak
```

### Yorum ve deneyim

Tek kaynak yerine farklı platformlardaki ortak eğilimler tercih edilir.

### Mesafe ve süre

Directions veya distance matrix tool kullanılır. Blog tahmini kullanılmaz.

## 4. Freshness

Her değişken kayıtta:

- `retrievedAt`,
- `effectiveDate`,
- `expiresAt` veya TTL,
- kaynak

bulunmalıdır.

## 5. Çelişkili veri

Kaynaklar çelişirse:

1. birincil kaynak tercih edilir,
2. veri tarihleri karşılaştırılır,
3. bilgi türüne uygun sağlayıcı önceliği uygulanır,
4. çelişki çözülmezse kullanıcıya belirsizlik gösterilir.

## 6. Doğrulama durumu

```text
verified
cross_checked
single_source
unverified
conflicting
stale
```

## 7. Kullanıcıya sunum

Kritik bilgi için sistem:

- bilgiyi,
- kontrol tarihini,
- belirsizliği,
- gerekirse yeniden kontrol önerisini

sunabilmelidir.
