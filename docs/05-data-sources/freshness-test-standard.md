# Freshness Scoring Test Standard

## 1. Genel testler

- score `0–1`,
- confidence `0–1`,
- status score aralığıyla uyumlu,
- hardExpired ise score `0`,
- expected lifetime pozitif,
- target date horizon kontrolü,
- zaman alanı önceliği.

## 2. Claim testleri

### FS-001 — Güncel otel fiyatı

- 20 dakika yaş,
- expected lifetime 30 dakika,
- acceptable veya fresh,
- hardExpired false.

### FS-002 — Eski otel müsaitliği

- 3 saat yaş,
- expected lifetime 15 dakika,
- expired veya stale,
- canlı teklif olarak kullanılamaz.

### FS-003 — Hava tahmini horizon dışı

- veri bugün alınmış,
- hedef tarih 8 ay sonrası,
- score 0,
- `OUTSIDE_VALID_HORIZON`.

### FS-004 — Climate normal

- 2 yıllık veri,
- expected lifetime 3 yıl,
- acceptable,
- forecast etiketi yok.

### FS-005 — Eski doğrulanmış yorum

- 18 aylık yorum,
- tekil record freshness düşmüş,
- tarihsel analizde tamamen elenmeyebilir.

### FS-006 — Güncel review trend

- son 90 gün,
- yeterli yeni yorum,
- trend freshness yüksek.

### FS-007 — Resmî sayfa yalnız retrievedAt

- bugün çekilmiş,
- içerik güncelleme tarihi bilinmiyor,
- score yüksek olabilir,
- confidence düşürülür,
- `ONLY_RETRIEVED_AT_AVAILABLE`.

### FS-008 — validUntil geçmiş

- score 0,
- hardExpired true,
- `VALID_UNTIL_PASSED`.

## 3. Stale-if-error testleri

- policy kapalıysa stale kullanılmaz,
- kritik claim'de stale engellenir,
- kullanılırsa warning ve reason code zorunlu,
- confidence cezası uygulanır.

## 4. Kritik başarısızlıklar

- horizon dışı forecast fresh kabul edilmesi,
- expired fiyatın canlı teklif olarak gösterilmesi,
- retrievedAt ile content updatedAt eşit sayılması,
- climate normal'in forecast değerlendirmesine girmesi,
- status/score uyumsuzluğu.
