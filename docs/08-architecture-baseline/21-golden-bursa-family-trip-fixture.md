# Tatil Modu — Golden Bursa Family Trip Fixture

**Fixture ID:** `golden_bursa_family_trip_v1`
**Sürüm:** 1.0
**Amaç:** Tatil Modu E2E ve regresyon testleri için referans aile tatili senaryosu

## 1. Senaryo Özeti

- Çıkış: Kocaeli
- Destinasyon: Bursa
- Süre: 2 gün / 1 gece
- Katılımcılar: 2 yetişkin, 2 ve 6 yaşında iki çocuk
- Ulaşım: özel araç
- Bütçe: ideal 30.000 TL, flexible 33.000 TL, hard limit 35.000 TL
- Konaklama: muhafazakâr tercihlere uygun termal otel
- İstenen olanaklar: havuz, aile odası, otopark
- Günlük tempo: sabah aktivite, öğle otel dinlenmesi, öğleden sonra hafif veya orta tempo
- Ana ilgi alanları: hayvanat bahçesi, bilim merkezi, teleferik
- Dönüş: Kocaeli yönünde hafif aktiviteler

## 2. Hard Constraints

- Öğle dinlenme penceresi korunmalı.
- 2 yaş çocuk için yaş uygunluğu gözetilmeli.
- Otopark bulunmalı veya alternatif park planı olmalı.
- Hard bütçe sınırı aşılmamalı.
- Kapalı veya doğrulanamayan kritik tesis ana plana alınmamalı.
- Mahremiyet tercihi açıkça belirtilmeli; doğrulanmamış özellik kesin sunulmamalı.

## 3. Strong Preferences

- termal
- kapalı havuz
- aile odası
- kolay park
- düşük/orta yürüyüş
- hafta içi
- Eylül başı

## 4. Aktivite Adayları

### Bursa Hayvanat Bahçesi

Beklenen:

- çocuk uyumu yüksek
- sabah saatleri tercih
- 2–2.5 saat blok
- park ve bebek arabası uygunluğu değerlendirilmiş

### Bursa Bilim ve Teknoloji Merkezi

Beklenen:

- kapalı alan alternatifi
- 6 yaş çocuk için yüksek uyum
- yağmur planında güçlü aday
- hayvanat bahçesi ile aynı güne konulacaksa yoğunluk kontrolü

### Teleferik

Beklenen:

- rüzgâr ve çalışma durumu kritik
- akşamüstü uygun olabilir
- kuyruk ve park etkisi hesaba katılmalı
- kapalıysa düşük eforlu alternatif üretilmeli

## 5. Otel Beklentileri

- termal/havuz özelliği claim bazında doğrulanmalı
- aile odası kapasitesi doğrulanmalı
- öğle dinlenmesi için check-in/erken giriş etkisi açıklanmalı
- park maliyeti ve erişimi gösterilmeli
- ertesi gün Kocaeli çıkış yönüne etkisi puanlanmalı

## 6. Beklenen Gün 1 Yapısı

```text
Sabah:
  Bursa Hayvanat Bahçesi veya bilim merkezi

Öğle:
  otele geçiş
  yemek
  çocuk dinlenmesi / uyku
  ebeveyn dinlenmesi

Öğleden sonra:
  Ana seçenek: Teleferik (hava ve çalışma uygun)
  Düşük enerji: Otel havuzu / termal
  Yağmur: Bilim Merkezi veya kapalı alternatif

Akşam:
  düşük eforlu yemek ve otel dinlenmesi
```

## 7. Beklenen Gün 2 Yapısı

- otel kahvaltısı
- check-out
- Kocaeli dönüş yönüne uygun hafif rota
- gereksiz batı/güney sapması yapılmamalı
- çocukları yormayan 1–2 alternatif
- dönüş saati makul tutulmalı

## 8. Kabul Edilebilir Alternatifler

- Cumalıkızık + kısa gezi
- İznik yönü
- yakın park / göl kıyısı
- hava uygun değilse kapalı alan

## 9. Bütçe Beklentisi

Beklenen çıktı:

- tek sayı değil maliyet aralığı
- otel, yakıt, otoyol, aktivite, yemek, park, termal/havuz ayrımı
- hidden cost listesi
- risk reserve
- hard limit uyarısı

## 10. Beklenen Agent Davranışları

### Profile Agent
Dört Person Profile ve Family Graph üretmeli.

### Preference Agent
Termal, çocuk odaklı, öğle dinlenmesi, düşük yürüyüş tercihlerini normalize etmeli.

### Policy Agent
Öğle dinlenmesi ve bütçe hard constraint'lerini korumalı.

### Public Authority Intelligence
Yol, tesis, teleferik ve etkinlik duyurularını kontrol etmeli.

### Activity Agent
Ana, düşük enerji ve yağmur aktivite setleri üretmeli.

### Hotel Agent
Termal/havuz/mahremiyet claim'lerini doğrulamalı.

### Route Planner
Öğle otel dönüşünü ve park geçiş maliyetini hesaba katmalı.

### Budget Agent
Maliyet aralığı ve hidden cost üretmeli.

### Adaptive Day Planner
Delta replanning desteklemeli.

## 11. Negatif Kabul Kriterleri

Aşağıdakiler başarısızlık sayılır:

- aynı güne üç yoğun aktiviteyi zorla yerleştirmek
- öğle dinlenmesini atlamak
- doğrulanmamış kadınlara özel havuz özelliğini kesin sunmak
- teleferik kapanışını yok saymak
- bütçeyi tek kesin sayı olarak vermek
- park bilgisini atlamak
- düşük enerji alternatifi üretmemek
- kullanıcıya neden seçildiğini açıklamamak

## 12. Ölçümler

- constraint compliance
- plan feasibility
- family satisfaction estimate
- route efficiency
- budget accuracy
- evidence coverage
- verification coverage
- explanation quality
- latency
- cost

## 13. Minimum Geçiş Eşikleri

```json
{
  "constraint_compliance": 1.0,
  "plan_feasibility": 0.90,
  "evidence_coverage": 0.85,
  "verification_coverage": 0.80,
  "explanation_quality": 0.80,
  "budget_within_hard_limit": true,
  "critical_safety_failures": 0
}
```
