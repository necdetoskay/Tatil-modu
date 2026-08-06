# Tatil Modu — Tool Catalog

## 1. Amaç

Tool Catalog, agentların dış dünyadan bilgi almak veya deterministik işlem yapmak için kullanacağı araç sınıflarını tanımlar.

Bu doküman belirli bir servis sağlayıcıyı zorunlu kılmaz. Önce ihtiyaç ve sözleşme tanımlanır; sağlayıcı daha sonra seçilir.

## 2. Tool sınıfları

### TL-001 — Web Search

**Amaç:** Güncel kaynak ve sayfa keşfi.

**Kullanım:**

- resmî site bulma,
- güncel duyuru,
- etkinlik,
- işletme bilgisi doğrulama.

**Kullanılmaması gereken durum:**

- kesin mesafe hesaplama,
- canlı hava,
- matematik,
- yapılandırılmış place verisi mevcutken rastgele blog tarama.

**Çıktı:** `SearchResultSet`

---

### TL-002 — Official Page Fetcher

**Amaç:** Resmî kurum veya işletme sayfasındaki çalışma saati, ücret, politika ve iletişim bilgisini almak.

**Çıktı:** `OfficialFactRecord`

**Zorunlu metadata:**

- URL,
- erişim zamanı,
- sayfa başlığı,
- bilgi türü,
- geçerlilik tarihi varsa tarih.

---

### TL-003 — Geocoding

**Amaç:** Yer adını koordinata ve standart adres kimliğine çevirmek.

**Çıktı:** `GeoLocation`

---

### TL-004 — Place Search

**Amaç:** Belirli alan ve kategori içinde işletme veya ziyaret noktası bulmak.

**Çıktı:** `PlaceRecordSet`

**Alanlar:**

- place ID,
- isim,
- kategori,
- koordinat,
- puan,
- yorum sayısı,
- çalışma saatleri,
- fiyat seviyesi,
- özellikler.

---

### TL-005 — Directions & Distance Matrix

**Amaç:** Yol mesafesi, seyahat süresi ve rota sırasını hesaplamak.

**Çıktı:** `RouteMatrix` veya `DirectionsResult`

**Kural:** Düz çizgi mesafesi sürüş süresi yerine kullanılamaz.

---

### TL-006 — Weather Forecast

**Amaç:** Güncel hava tahmini almak.

**Çıktı:** `WeatherForecastRecord`

**Alanlar:**

- sıcaklık,
- yağış olasılığı,
- rüzgâr,
- hissedilen sıcaklık,
- veri zamanı,
- tahmin zamanı,
- sağlayıcı güven bilgisi.

---

### TL-007 — Climate Normals

**Amaç:** İleri tarih için uzun dönem ortalamalarını sağlamak.

**Kural:** Tahmin değil, iklimsel beklenti olarak etiketlenir.

---

### TL-008 — Accommodation Search

**Amaç:** Tarih, kişi sayısı ve oda yapısına göre konaklama adayları bulmak.

**Çıktı:** `AccommodationOfferSet`

**Kritik alanlar:**

- toplam fiyat,
- vergi/ücret dahil durumu,
- oda kapasitesi,
- çocuk politikası,
- iptal koşulu,
- kahvaltı,
- otopark,
- müsaitlik kontrol zamanı.

---

### TL-009 — Review Data Provider

**Amaç:** Analiz için izinli ve normalize edilmiş yorum verisi sağlamak.

**Çıktı:** `ReviewRecordSet`

**Gereksinimler:**

- kaynak,
- tarih,
- puan,
- metin,
- dil,
- doğrulanmış konaklama/ziyaret bilgisi varsa işaret.

---

### TL-010 — Price & Fee Lookup

**Amaç:** Müze, plaj, otopark, otoyol ve benzeri ücretleri almak.

**Çıktı:** `FeeRecord`

**Kural:** Fiyatın hangi tarihte kontrol edildiği zorunludur.

---

### TL-011 — Calculator

**Amaç:** Bütçe, yakıt, süre ve oran hesaplamalarını deterministik yapmak.

**LLM hesaplama yerine tercih edilir.**

---

### TL-012 — Schema Validator

**Amaç:** Agent giriş ve çıkışlarının JSON Schema uyumunu kontrol etmek.

**Çıktı:** `SchemaValidationResult`

---

### TL-013 — Rule Engine

**Amaç:** Hard constraint ve iş kurallarını deterministik biçimde değerlendirmek.

Örnek:

- bütçe aşımı,
- kapalı saatte ziyaret,
- çocuk yaşı kısıtı,
- günlük sürüş limiti,
- check-in/check-out çakışması.

---

### TL-014 — Cache

**Amaç:** Aynı veri için gereksiz tool çağrılarını azaltmak.

Cache anahtarı en az şunları içermelidir:

- tool,
- lokasyon veya entity ID,
- tarih aralığı,
- kişi/oda yapısı gerekiyorsa bu bilgiler,
- sağlayıcı,
- veri sürümü.

## 3. Güncellik sınıfları

| Veri | Önerilen azami cache |
|---|---:|
| Koordinat/adres | 30 gün |
| Sabit müze açıklaması | 30 gün |
| Çalışma saatleri | 24 saat–7 gün |
| Giriş ücreti | 24 saat–7 gün |
| Otel fiyatı/müsaitlik | 15–60 dakika |
| Hava tahmini | 1–3 saat |
| Yol süresi/trafik | 5–15 dakika |
| Yorum özeti | 1–7 gün |
| İklim normali | 90 gün |

Bu değerler başlangıç varsayımlarıdır ve sağlayıcı sözleşmesine göre değişebilir.

## 4. Tool seçim ilkesi

Her bilgi için en uygun yapılandırılmış tool tercih edilir.

Örnek güven sırası:

```text
Resmî/veri sahibi API
Resmî web sayfası
Lisanslı yapılandırılmış sağlayıcı
Güvenilir platform
Genel web kaynağı
```

## 5. Tool hata sınıfları

```text
timeout
rate_limited
authentication_failed
not_found
invalid_response
stale_data
conflicting_data
provider_unavailable
```

Her tool adapter bu hata sınıflarına normalize edilmelidir.

## 6. Fallback

Fallback kaynak kalitesini sessizce düşürmemelidir.

Örnek:

- resmî çalışma saati bulunamadı,
- harita platformundaki saat kullanıldı,
- confidence azaltıldı,
- kaynak tipi açıkça kaydedildi.

## 7. Yasal ve sözleşmesel gereksinimler

Tool seçilirken:

- kullanım şartları,
- scraping izni,
- yorumların saklanması,
- kişisel veri,
- yeniden yayınlama hakkı,
- oran sınırları,
- ticari kullanım

ayrıca değerlendirilmelidir.
