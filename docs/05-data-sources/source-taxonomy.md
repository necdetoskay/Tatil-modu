# Source Taxonomy v1.0

## 1. Amaç

Tatil Modu tarafından kullanılan veri kaynaklarını tek bir sınıflandırma altında toplamak.

Kaynak türü ile güvenilirlik aynı şey değildir.

Örneğin:

- resmî kaynak eski olabilir,
- kullanıcı yorumu güncel fakat subjektif olabilir,
- lisanslı provider doğru fakat kapsama alanı sınırlı olabilir.

## 2. Ana kaynak aileleri

### S1 — Birincil ve resmî kaynaklar

Bilginin sahibi veya yetkili yayımlayıcısıdır.

Alt türler:

```text
official_api
official_page
municipality
ministry
tourism_authority
transport_operator
facility_owner
event_organizer
```

Güçlü olduğu bilgi türleri:

- çalışma saatleri,
- ücretler,
- resmî politika,
- adres,
- erişilebilirlik beyanı,
- sezonluk kapanış,
- etkinlik tarihi,
- ulaşım tarifesi.

Sınırlılık:

- pazarlama dili,
- gerçek kullanıcı deneyimini göstermemesi,
- güncellemenin gecikmesi.

---

### S2 — Lisanslı yapılandırılmış sağlayıcılar

Veriyi API veya yapılandırılmış sözleşmeyle sunan ticari ya da kurumsal sağlayıcılardır.

Alt türler:

```text
map_provider
directions_provider
weather_provider
booking_provider
review_provider
price_provider
event_provider
```

Güçlü olduğu bilgi türleri:

- koordinat,
- rota,
- hava,
- müsaitlik,
- fiyat,
- place metadata,
- yorum kayıtları.

Sınırlılık:

- provider kapsamı,
- fiyatlandırma,
- schema değişimi,
- bölgesel eksiklik,
- lisans koşulları.

---

### S3 — Doğrulanabilir kullanıcı deneyimi kaynakları

Gerçek ziyaret veya konaklama deneyimine ilişkin kayıtlar.

Alt türler:

```text
verified_stay_review
verified_visit_review
verified_purchase_review
platform_review
structured_survey
post_trip_feedback
```

Güçlü olduğu bilgi türleri:

- temizlik,
- personel davranışı,
- gerçek otopark deneyimi,
- çocuk uygunluğu,
- erişim zorluğu,
- gürültü,
- fiyat/değer,
- yoğunluk,
- son dönem kalite değişimi.

Sınırlılık:

- subjektiflik,
- örneklem yanlılığı,
- sahte/spam yorum,
- segment farkı,
- duygusal aşırılık.

---

### S4 — Güvenilir editoryal ve uzman kaynaklar

Editoryal kontrol veya uzman değerlendirmesi bulunan içerikler.

Alt türler:

```text
trusted_travel_guide
professional_review
local_expert
industry_report
academic_source
```

Güçlü olduğu bilgi türleri:

- bağlam,
- bölgesel karşılaştırma,
- kültür,
- destinasyon karakteri,
- tarihsel açıklama.

Sınırlılık:

- güncellik,
- kişisel görüş,
- ticari ilişki,
- hedef kullanıcıdan farklı öncelikler.

---

### S5 — Genel web ve topluluk kaynakları

Editoryal veya resmî güvence seviyesi düşük kaynaklar.

Alt türler:

```text
blog
forum
social_post
video_description
community_page
unverified_listing
```

Güçlü olduğu bilgi türleri:

- yeni değişiklik sinyali,
- keşif,
- yerel ipucu,
- eksik resmî bilgiyi araştırma başlangıcı.

Sınırlılık:

- doğrulanmamış bilgi,
- eski içerik,
- kopya içerik,
- sponsorluk,
- anonim iddia.

Kritik kararlar tek başına S5 kaynağına dayanamaz.

---

### S6 — Kullanıcı tarafından sağlanan kaynaklar

Kullanıcının doğrudan verdiği bilgi veya belge.

Alt türler:

```text
user_statement
user_photo
user_document
user_preference
user_booking
user_location
```

Güçlü olduğu bilgi türleri:

- kullanıcının kendi tercihi,
- rezervasyon bilgisi,
- kişisel durum,
- gerçek başlangıç noktası,
- özel kısıtlar.

Sınırlılık:

- yazım hatası,
- yanlış hatırlama,
- eski belge,
- belirsiz bağlam.

Kullanıcı tercihi dış kaynakla geçersiz kılınamaz; fakat kullanıcı tarafından belirtilen dış dünya gerçeği doğrulanabilir.

---

### S7 — İç sistem ve türetilmiş kaynaklar

Sistem tarafından oluşturulan veya normalize edilen veri.

Alt türler:

```text
normalized_fact
aggregated_evidence
derived_assessment
decision_output
cache_record
fixture
replay_record
internal_feedback
```

Bu sınıf kaynak değil, lineage zincirindeki türetilmiş kayıtları kapsar.

Her S7 kayıt, kendisini üreten kaynaklara ve transformation kayıtlarına geri bağlanmalıdır.

## 3. Bilgi türü ile kaynak eşlemesi

| Bilgi | Birincil tercih | Destekleyici |
|---|---|---|
| Çalışma saati | S1 | S2, S3 |
| Giriş ücreti | S1 | S2 |
| Yol süresi | S2 | S1 ulaşım operatörü |
| Hava tahmini | S2 | birden fazla S2 |
| İklim normali | S1/S2 kurumsal | S4 akademik |
| Otel fiyatı | S2 booking/provider | S1 tesis |
| Müsaitlik | S2 canlı offer | S1 tesis |
| Temizlik deneyimi | S3 | S6 post-trip feedback |
| Otopark varlığı | S1/S2 | S3 gerçek kullanım |
| Otopark yeterliliği | S3 | S6 |
| Çocuk politikası | S1/S2 | S3 deneyim |
| Yerel lezzet | S4/S3 | S5 keşif |
| Etkinlik tarihi | S1 organizatör | S2 event provider |
| Erişilebilirlik beyanı | S1 | S3 gerçek deneyim |

## 4. Kaynak rolü

Bir kaynak her claim için farklı rol üstlenebilir:

```text
authoritative
corroborating
experiential
discovery_only
conflicting
historical
```

## 5. Kritik bilgi sınıfları

Aşağıdaki bilgi türleri daha yüksek doğrulama gerektirir:

```text
availability
price
opening_hours
safety_restriction
child_policy
accessibility
route_feasibility
reservation_condition
event_date
```

## 6. Kaynak kimliği

Her kaynak:

- internal source ID,
- provider ID,
- entity/page ID,
- canonical URL,
- retrievedAt,
- effectiveAt,
- trust tier,
- authority scope,
- license,
- privacy class

taşımalıdır.

## 7. Kaynak sınıfı değişmezliği

Bir kaynak türü, içerik hoşumuza gittiği için yükseltilmez.

Örnek:

```text
Blogda doğru bilgi bulunması
→ blogu resmî kaynak yapmaz.
```

Doğruluk, authority ve freshness ayrı boyutlardır.
