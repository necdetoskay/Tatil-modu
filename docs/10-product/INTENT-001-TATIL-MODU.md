# Tatil Modu — Intent v1

| Alan | Değer |
|---|---|
| Document ID | INTENT-001 |
| Sürüm | 1.0 |
| Durum | Canonical Baseline |
| Son Güncelleme | 2026-09-04 |

## 1. Amaç

Tatil Modu'nun amacı, kullanıcının yalnızca nereye gitmek istediğini değil; ne zaman gideceğini, kimlerle seyahat edeceğini, ne kadar uzağa gitmek istediğini, hangi deneyimleri sevdiğini ve hangi koşullardan kaçınmak istediğini dikkate alarak uygulanabilir günlük gezi planları üretmektir.

Sistem yalnızca gezi noktaları listeleyen bir öneri motoru olmamalıdır.

**North-star:** Doğru yere, doğru zamanda, doğru kullanıcı için uygulanabilir bir plan üretmek.

## 2. Ana Kullanıcı Problemi

Klasik gezi uygulamalarında kullanıcı gezilecek yerleri, restoranları, etkinlikleri, hava durumunu, trafik ve park bilgisini, çocuklara uygunluğu ve mesafeleri ayrı ayrı araştırmak zorundadır.

Tatil Modu bütün bu bilgileri tek bir karar sürecinde birleştirmelidir.

Örnek olarak `Kocaeli'den Bursa'ya iki çocukla yarın gidiyorum` sorgusu yalnızca Bursa'daki popüler yerleri döndürmemelidir. Sistem çocukların yaşlarını, hava durumunu, mevsimi, seyahat süresini, trafik ve otoparkı, açılış saatlerini, etkinlikleri, kalabalık ihtimalini, öğün zamanlarını, yöresel deneyimleri, alternatif aktiviteleri ve mekânların birbirine uzaklığını birlikte değerlendirmelidir.

## 3. Temel Ürün İlkesi

Tatil Modu bir **Place Recommendation Engine** değil, bir **Context-Aware Trip Decision Engine** olmalıdır.

Bir yerin iyi olması tek başına yeterli değildir. Sistem şu soruya cevap verebilmelidir:

> Bu yer bu kullanıcı için, bu tarihte, bu günün bu saatinde ve mevcut koşullar altında gerçekten iyi bir seçenek mi?

## 4. Destination Intelligence

Sistem kullanıcı sorgusu geldiğinde bütün araştırmayı sıfırdan yapmak zorunda kalmamalıdır. Zaman içinde kendi **Destination Intelligence** katmanını oluşturmalıdır.

Bu bilgi katmanı en az şu alanları kapsamalıdır:

- tarihi mekânlar, müzeler, doğal alanlar, parklar, sahiller ve plajlar,
- hayvanat bahçeleri, akvaryumlar, bilim merkezleri ve çocuk aktiviteleri,
- seyir noktaları, yürüyüş rotaları, mağaralar, şelaleler, göller ve tematik parklar,
- yöresel yemekler, yerel ürünler, pazarlar, çarşılar ve alışveriş önerileri,
- festivaller, yıllık etkinlikler, konserler, fuarlar ve sezonluk etkinlikler,
- açılış günleri/saatleri, ücret, rezervasyon gereksinimi, park olanakları, yoğunluk, ulaşım zorluğu ve ortalama ziyaret süresi.

## 5. Idle Destination Research

Sistem aktif kullanıcı sorgusu olmadığı zamanlarda destinasyon bilgisi toplamak için çalışabilmelidir.

Araştırma rastgele değil, sistematik olmalıdır:

`Türkiye -> İl -> İlçe -> Bölge -> Gezi Noktaları -> Yerel Yemekler -> Yerel Ürünler -> Etkinlikler -> Mevsimsel Özellikler`

Amaç zaman içinde yeniden kullanılabilir ulusal bir seyahat bilgi tabanı oluşturmaktır.

## 6. Freshness İlkesi

Her bilgi aynı hızda eskimez.

- Tarihi bir yapının konumu: çok düşük değişim.
- Bir işletmenin çalışma saatleri: orta değişim.
- Festival tarihi: dönemsel/yıllık değişim.
- Hava durumu: yüksek değişim.
- Trafik: gerçek zamanlı değişim.

Her bilgi bir freshness sınıfına sahip olmalı; planlama sırasında yalnızca zaman açısından hassas bilgiler gerektiğinde yeniden doğrulanmalıdır.

## 7. Tarih ve Mevsim Bilinci

Seyahat tarihi planlamanın temel girdisidir.

Örneğin kış aylarında deniz aktiviteleri düşük puan alabilir; kapalı müzeler, termal bölgeler ve kış etkinlikleri yükseltilebilir. Yaz aylarında sahiller, göller, açık hava aktiviteleri ve akşam yürüyüşleri daha yüksek puan alabilir.

**Destination != Recommendation**

Recommendation, `Destination + Date + Context` sonucunda oluşmalıdır.

## 8. Festival ve Etkinlik Bilinci

Aynı etkinlik farklı kullanıcılar için farklı anlam taşıyabilir.

- Etkinliğe katılmak isteyen kullanıcı için güçlü tercih nedeni olabilir.
- Kalabalıktan kaçınmak isteyen kullanıcı için olumsuz sinyal olabilir.

Etkinlikler yalnızca var/yok biçiminde tutulmamalı; planlama motoru etkinliğin kullanıcı tercihlerine etkisini değerlendirmelidir.

## 9. Aile ve Çocuk Uygunluğu

Seyahat grubunun yapısı karar mekanizmasının parçası olmalıdır. Bebek, küçük çocuk, okul çağındaki çocuk, yetişkin ve yaşlı gibi farklı profiller farklı ihtiyaçlara sahiptir.

Çocuklu aileler için en az şu kriterler değerlendirilmelidir:

- çocuk ilgisi ve yaş uygunluğu,
- güvenlik,
- yürüyüş mesafesi,
- bebek arabası uygunluğu,
- tuvalet ve yemek erişimi,
- dinlenme ve oyun alanları,
- ortalama ziyaret süresi.

## 10. Mesafe İlkesi

Kullanıcı bir hedef şehir verdiğinde sistem yalnızca şehir sınırlarıyla sınırlı kalmamalıdır.

Örnek adaylık kuralı:

- 0-30 km: doğal aday,
- 30-75 km: güçlü aday,
- 75-150 km: ancak yüksek değer sunuyorsa aday.

**Mesafe arttıkça gitmeye değer olma eşiği yükselmelidir.**

## 11. Günlük Planlama

Sistem yalnızca yer önermemeli, gerçek bir günlük program üretmelidir. Program; trafik, seyahat süresi, ziyaret süresi, açılış saatleri, öğün zamanları ve seyahat grubunun yorulma ihtimali gibi faktörlere göre oluşturulmalıdır.

## 12. Alternatif Plan İlkesi

Her gün için tercihen üç seviyeli çıktı sunulmalıdır:

- Plan A: ana öneri,
- Plan B: güçlü alternatif,
- Plan C: hava, yoğunluk veya operasyonel koşullar değişirse kullanılacak yedek plan.

## 13. Plan Dayanıklılığı

Plan gerçek dünyadaki değişikliklere dayanıklı olmalıdır. Yağmur, kapanma, trafik artışı, çocukların yorulması veya beklenmedik kalabalık gibi durumlarda sistem planın kalan bölümünü yeniden düzenleyebilmelidir.

## 14. Evidence First

Önemli seyahat bilgilerinin mümkün olduğunca kaynağı, araştırılma tarihi, güven seviyesi ve son doğrulama zamanı tutulmalıdır. Sistem emin olmadığı bilgiyi kesin bilgi olarak sunmamalıdır.

## 15. Hardcoded Bilgi İlkesi

Gezi kategorileri, etkinlik kategorileri, yemek türleri, çocuk uygunluğu kriterleri, ulaşım türleri ve benzeri seçimlik alanlar mümkün olduğunca yönetilebilir olmalı; uygulama koduna sabit biçimde gömülmemelidir.

## 16. Sistem Öğrenmesi

Sistem zaman içinde kullanıcının tercihlerini öğrenebilmelidir; ancak geçmiş tercih hiçbir zaman yeni seyahatin açık talebinin önüne geçmemelidir.

## 17. Planlama Denklemi

Konsept olarak:

`Travel Plan = Destination Intelligence + User Context + Travel Party + Date + Season + Weather + Events + Distance + Traffic + Parking + Opening Hours + Local Experiences + Historical Preferences + Live Verification`

## 18. Sistem Katmanları

Tatil Modu dört ana katman üzerine kurulmalıdır:

1. **Knowledge Layer** — önceden araştırılmış destinasyon bilgisi.
2. **Live Context Layer** — hava, trafik, etkinlik ve operasyonel güncel veri.
3. **Decision Layer** — adayları filtreleyen, puanlayan ve karşılaştıran karar sistemi.
4. **Planning Layer** — seçilen adaylardan uygulanabilir günlük program oluşturan sistem.

## 19. Başarı Kriteri

Sistem `Burada nerelere gidebilirim?` sorusuna değil, esas olarak şu soruya cevap vermelidir:

> Bugün / mevcut sürem içerisinde, benim ve seyahat grubumun koşullarına göre en mantıklı şekilde ne yapmalıyım?

## 20. V1 Intent Sınırı

İlk sürüm odağı:

- destinasyon araştırması,
- seyahat bağlamı,
- aile uygunluğu,
- tarih ve mevsim,
- etkinlikler,
- yerel yemek ve ürünler,
- mesafe,
- günlük alternatif plan üretimi.

İleri aşamalara bırakılacak konular:

- rezervasyon yapma,
- otomatik bilet alma,
- ödeme,
- otel/uçak satın alma akışları,
- sosyal ağ,
- kullanıcı içerik platformu.

## 21. Ana Mimari İlkesi

**Research once -> verify when needed -> reuse many times.**

Her kullanıcı sorgusunda aynı destinasyonu baştan araştırmak yerine sistem bilgiyi önceden toplar, saklar ve yalnızca zaman açısından hassas bölümleri gerektiğinde yeniden doğrular.

## 22. North Star

Tatil Modu'nun nihai hedefi kullanıcının araştırma yükünü minimuma indirerek, bulunduğu koşullarda gerçekten uygulanabilir ve kişiye uygun seyahat kararını vermesine yardımcı olmaktır.

Sistemin değeri öneri sayısında değil, **verdiği kararların isabetinde** ölçülmelidir.
