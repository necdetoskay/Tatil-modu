# Destination Discovery Agent — Decision Rules

## R-01 — Discovery scope

- destination.mode `open` → `discover_destination`
- destination.mode `suggest` → `discover_destination` veya sabit kapsam varsa `discover_subregions`
- destination fixed ve alt bölge bilinmiyor → `discover_subregions`
- hedef ve alt bölge kesin → agent çalışmaz

## R-02 — Hard constraint first

Hard constraint ihlal eden aday puanlamaya devam etmez; `rejectedCandidates` içine alınır.

## R-03 — Yol yükü

Seyahat süresi kısa oldukça erişim cezası artar.

Başlangıç kuralı:

- 2 günlük tatilde tek yön 5+ saat: yüksek risk
- 3 günlük tatilde tek yön 6+ saat: yüksek risk
- 4–5 günlük tatilde tek yön 8+ saat: koşullu
- bu eşikler otomatik ret değil; ulaşım modu ve kullanıcı tercihiyle birlikte değerlendirilir

## R-04 — Çocuklu aile

0–5 yaş çocuk varsa:

- çok parçalı transfer,
- sık otel değişimi,
- uzun kesintisiz yol,
- erişimi zor bölge

familyFit skorunu düşürür.

## R-05 — Tarih ve sezon

- ileri tarih için forecast yoksa climate normal kullanılır ve etiketlenir
- tarih dışı sezon varsayımı yapılamaz
- deniz tatilinde deniz sezonu/iklim uyumu değerlendirilir
- kış tatilinde kar garantisi verilmez

## R-06 — Bütçe

Yeterli fiyat verisi yoksa `budgetFit` kesin skor gibi sunulmaz; confidence düşürülür ve aralık/ön değerlendirme olarak işaretlenir.

## R-07 — Çeşitlilik

Top-3 aday aynı deneyimin kopyası olamaz. Aynı bölgenin adaylarıysa farklı kullanım senaryoları açıklanır.

## R-08 — Minimum kaynak

Her aday için en az:

- bir coğrafi/ulaşım kaynağı,
- bir destinasyon uygunluk kaynağı

bulunmalıdır. Fixture modunda bu kayıtlar hazır veriyle sağlanabilir.

## R-09 — Output limit

`candidates.length <= discoveryRequest.maxCandidates`

## R-10 — Sessiz karar yasağı

Agent en iyi adayı işaretleyebilir; ancak kullanıcı seçimi gerekiyorsa destinasyonu kesinleştiremez.
