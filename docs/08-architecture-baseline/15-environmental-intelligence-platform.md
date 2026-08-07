# Tatil Modu — Environmental Intelligence Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `environmental_intelligence_platform`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Çevresel veri ve zamanlama zekâsı
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Environmental Intelligence Platform; hava, kalabalık, gün ışığı, hava kalitesi, mevsimsellik ve çevresel riskleri aktivite bazında değerlendirir.

Temel soru:

> Bu aktivite, bu aile için, bu konumda ve bu zaman aralığında ne kadar uygun?

## 2. Platform Bileşenleri

- Weather Agent
- Crowd & Timing Agent
- Air Quality Agent
- Daylight Agent
- Seasonal Intelligence Agent
- Hazard Intelligence Agent
- Comfort Engine
- Environmental Timeline Service

## 3. Weather Agent

Weather Agent yalnızca hava tahmini vermez; aktivite etkisi üretir.

```json
{
  "activity_id": "act_teleferik",
  "weather_impact": {
    "wind_risk": "high",
    "rain_impact": "medium",
    "temperature_fit": 0.82,
    "recommendation": "avoid"
  }
}
```

## 4. Crowd & Timing Agent

- yoğunluk eğilimi
- sıra tahmini
- park doluluk riski
- aile stres etkisi
- ideal ziyaret zamanı

üretir.

## 5. Air Quality Agent

Özellikle çocuklu aileler için:

- PM2.5
- PM10
- ozon
- genel hava kalitesi
- açık hava aktivitesi uygunluğu

değerlendirilir.

## 6. Daylight Agent

- gün doğumu
- gün batımı
- altın saat
- yeterli gün ışığı
- gece sürüş riski

hesaplanır.

## 7. Seasonal Intelligence

- mevsimsel yoğunluk
- sıcaklık eğilimleri
- çiçeklenme/yaprak dönemi
- deniz suyu sıcaklığı
- kar/yağış eğilimleri
- sezonluk kapanışlar

gibi davranış bilgilerini sağlar.

## 8. Hazard Intelligence

Desteklenen riskler:

- kuvvetli rüzgâr
- aşırı sıcak
- yüksek UV
- yoğun sis
- sel
- orman yangını riski
- yıldırım
- buzlanma
- aşırı yağış

## 9. Comfort Engine

Comfort Score şu sinyalleri birlikte değerlendirir:

- sıcaklık
- nem
- rüzgâr
- UV
- hava kalitesi
- yürüyüş süresi
- gölgelik oranı
- çocuk yaşları
- bireysel enerji modeli

```json
{
  "comfort_score": 0.88,
  "best_window": {
    "start": "09:00",
    "end": "11:30"
  }
}
```

## 10. Microclimate

Aynı şehir içindeki farklı bölgeler ayrı değerlendirilir.

Örnek:

- şehir merkezi
- Uludağ
- göl kıyısı
- termal bölge

## 11. Dynamic Time Windows

Her aktivite için zaman bazlı uygunluk:

```json
{
  "activity_id": "act_zoo",
  "time_windows": [
    {"start": "09:00", "end": "11:30", "score": 0.94},
    {"start": "12:00", "end": "15:00", "score": 0.58},
    {"start": "16:00", "end": "18:00", "score": 0.81}
  ]
}
```

## 12. Girdiler

```json
{
  "task_id": "tsk_env_001",
  "trip_context": {},
  "family_graph": {},
  "activity_candidates": [],
  "locations": [],
  "time_windows": [],
  "current_conditions": {},
  "forecast": {}
}
```

## 13. Çıktılar

```json
{
  "task_id": "tsk_env_001",
  "platform": "environmental_intelligence_platform",
  "status": "completed",
  "activity_impacts": [],
  "comfort_scores": [],
  "crowd_windows": [],
  "hazards": [],
  "environmental_timeline": [],
  "warnings": [],
  "confidence": 0.89,
  "schema_version": "1.0"
}
```

## 14. Hata Modeli

- `ENV_INPUT_INVALID`
- `WEATHER_DATA_STALE`
- `CROWD_DATA_UNAVAILABLE`
- `AIR_QUALITY_UNKNOWN`
- `HAZARD_DATA_CONFLICT`
- `MICROCLIMATE_UNRESOLVED`
- `TIME_WINDOW_UNAVAILABLE`

## 15. Testler

- sıcak hava
- kuvvetli rüzgâr
- yağmur
- hava kalitesi düşük
- gün batımı optimizasyonu
- Uludağ/merkez sıcaklık farkı
- yoğunluk tahmini
- çocuk comfort score

## 16. Kabul Kriterleri

- Aktivite bazlı çevresel etki üretilebilmeli.
- Şehir geneli yerine mikro konum desteklenmeli.
- Comfort Score aile profiline göre değişmeli.
- Crowd ve weather birlikte değerlendirilmeli.
- Dynamic time windows üretilebilmeli.
- Hazard sinyalleri planlama katmanına aktarılmalı.
