# Tatil Modu — Adaptive Day Planner Agent Teknik Tasarımı

**Doküman türü:** Agent teknik tasarımı
**Agent adı:** Adaptive Day Planner Agent
**Teknik kod adı:** `adaptive_day_planner_agent`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Planlama ve karar
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Adaptive Day Planner Agent; aktivite, rota, otel, bütçe, hava, trafik ve aile enerji verilerini tek günlük uygulanabilir plana dönüştürür.

Temel soru:

> Bu aile bugün hangi sırayla, hangi tempoda ve hangi alternatiflerle hareket etmelidir?

## 2. Temel Özellik

Plan statik değildir.

Her gün:

- ana plan
- düşük enerji planı
- yüksek enerji planı
- yağmur planı
- kapanış planı

içerir.

## 3. Girdiler

```json
{
  "task_id": "tsk_day_001",
  "trip_context": {},
  "family_graph": {},
  "ranked_activities": [],
  "route_plan": {},
  "hotel_plan": {},
  "weather_context": {},
  "traffic_context": {},
  "budget_context": {},
  "operational_notices": [],
  "current_context": {}
}
```

## 4. Günlük Plan Modeli

```json
{
  "date": "2026-09-08",
  "segments": [
    {
      "type": "morning_activity",
      "start": "09:00",
      "end": "11:30",
      "primary": "activity_001",
      "alternatives": []
    },
    {
      "type": "hotel_rest",
      "start": "13:30",
      "end": "16:00",
      "primary": "hotel_001"
    }
  ],
  "fallbacks": {}
}
```

## 5. Replan Tetikleyicileri

- FAMILY_FATIGUED
- CHILD_SLEEPING
- WEATHER_CHANGED
- ROAD_CLOSED
- PARKING_UNAVAILABLE
- ACTIVITY_CANCELLED
- HOTEL_DELAYED
- BUDGET_EXCEEDED
- ARRIVAL_DELAYED

## 6. Delta Replanning

Yalnızca etkilenen blok değişir.

Örnek:

```json
{
  "reason": "family_fatigued",
  "affected_segment": "afternoon",
  "removed": "teleferik",
  "added": "hotel_pool",
  "budget_delta": -600
}
```

## 7. Family State Inputs

- bireysel enerji
- çocuk uyku durumu
- yemek ihtiyacı
- huysuzluk/yorgunluk
- ebeveyn dinlenme ihtiyacı
- mevcut konum
- gecikme

## 8. Plan Yoğunluğu Kuralları

2 yaş çocuk bulunan aile için:

- iki yoğun aktivite arka arkaya konulmaz
- öğle dinlenmesi korunur
- kesintisiz dış mekân süresi sınırlanır
- akşam planı düşük eforlu tutulur

## 9. Çıktılar

```json
{
  "task_id": "tsk_day_001",
  "agent": "adaptive_day_planner_agent",
  "status": "completed",
  "primary_day_plan": {},
  "low_energy_plan": {},
  "high_energy_plan": {},
  "rain_plan": {},
  "closure_plan": {},
  "decision_points": [],
  "warnings": [],
  "confidence": 0.89,
  "schema_version": "1.0"
}
```

## 10. Decision Points

Plan içinde kullanıcıya sorulabilecek noktalar:

- çocuklar nasıl?
- yağmur başladı mı?
- havuza dönmek ister misiniz?
- teleferik kuyruğu kabul edilebilir mi?

## 11. Hata Modeli

- `DAY_PLAN_INPUT_INVALID`
- `NO_FEASIBLE_DAY_PLAN`
- `REST_WINDOW_VIOLATION`
- `ACTIVITY_SEQUENCE_CONFLICT`
- `REPLAN_FAILED`
- `CURRENT_CONTEXT_STALE`

## 12. Testler

- normal enerji
- düşük enerji
- çocuk uyudu
- yağmur
- teleferik kapandı
- park bulunamadı
- geç check-in
- bütçe aşıldı
- dönüş rotası öne alındı

## 13. Kabul Kriterleri

- Plan birden fazla senaryo içermeli.
- Öğle dinlenmesi hard constraint ise korunmalı.
- Replan yalnızca etkilenen blokta yapılmalı.
- Kullanıcıya açıklanabilir karar noktaları sunulmalı.
- Aile enerji ve çocuk rutinleri plana etki etmeli.
- Plan rota, otel ve aktivite çıktılarını birlikte kullanmalı.
