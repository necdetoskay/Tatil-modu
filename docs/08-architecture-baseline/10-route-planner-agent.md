# Tatil Modu — Route Planner Agent Teknik Tasarımı

**Doküman türü:** Agent teknik tasarımı
**Agent adı:** Route Planner Agent
**Teknik kod adı:** `route_planner_agent`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Planlama ve karar
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Route Planner Agent, aktivite ve konaklama adaylarını yalnızca mesafeye göre değil; aile enerjisi, dinlenme pencereleri, trafik, park, geçiş maliyeti, çocuk rutinleri ve plan dayanıklılığına göre sıralar.

Temel soru:

> Bu aile için günün en uygulanabilir ve dengeli akışı hangi sırayla oluşmalıdır?

## 2. Temel İlke

Route Planner navigasyon servisi değildir.

Navigasyon sistemi A → B → C yolunu hesaplar. Route Planner ise:

- hangi noktanın önce gelmesi gerektiğini,
- öğle dinlenmesinin nereye yerleşeceğini,
- araç ve yürüme yükünün nasıl dengeleneceğini,
- alternatif senaryoların nasıl korunacağını

belirler.

## 3. Alt Bileşenler

- Day Segmentation Engine
- Route Optimizer
- Transition Optimizer
- Parking Optimizer
- Buffer Planner
- Energy Planner
- Lunch Planner
- Robustness Planner
- Scenario Generator

## 4. Girdiler

```json
{
  "task_id": "tsk_route_001",
  "trip_context": {},
  "family_graph": {},
  "constraint_package": {},
  "ranked_activities": [],
  "hotel_candidates": [],
  "weather_context": {},
  "traffic_context": {},
  "operational_notices": [],
  "budget_context": {}
}
```

## 5. Gün Segmentleri

Varsayılan segmentler:

- sabah
- öğle
- dinlenme
- öğleden sonra
- akşam
- gece

Her segment farklı efor, süre ve ulaşım kurallarına sahip olabilir.

## 6. Energy-Aware Routing

Her plan bloğu aile ve bireysel enerji modelleriyle eşleştirilir.

Örnek:

```json
{
  "segment": "morning",
  "expected_family_energy": 0.88,
  "preferred_effort_level": "medium_to_high"
}
```

## 7. Transition Cost

Geçiş maliyeti yalnızca sürüş süresi değildir.

Hesaba katılır:

- araca dönüş
- çocukları hazırlama
- bebek arabasını toplama
- otopark çıkışı
- park yeri arama
- giriş kuyruğu
- yürüme bağlantısı

## 8. Buffer Planner

Çocuklu ailelerde aktivite süresine tampon eklenir.

```json
{
  "activity_duration_minutes": 120,
  "buffer_minutes": 30,
  "planned_block_minutes": 150
}
```

## 9. Parking Intelligence

Park değerlendirmesi:

- kapasite
- ücret
- girişe mesafe
- doluluk eğilimi
- bebek arabası erişimi
- gölgelik
- çıkış kolaylığı

## 10. Lunch & Rest Integration

Öğle yemeği, dinlenme ve çocuk uykusu tek blok olarak planlanabilir.

Örnek:

```json
{
  "block_type": "hotel_rest",
  "start": "13:30",
  "end": "16:00",
  "includes": ["lunch", "nap", "rest"]
}
```

## 11. Route Robustness

Her gün için:

- ana plan
- düşük enerji planı
- yağmur planı
- tesis kapanış planı
- trafik bozulma planı

üretilir.

## 12. Çıktılar

```json
{
  "task_id": "tsk_route_001",
  "agent": "route_planner_agent",
  "status": "completed",
  "primary_route": {},
  "alternative_routes": {},
  "segment_buffers": [],
  "parking_plan": [],
  "transition_costs": [],
  "warnings": [],
  "confidence": 0.87,
  "schema_version": "1.0"
}
```

## 13. Hata Modeli

- `ROUTE_INPUT_INVALID`
- `NO_FEASIBLE_SEQUENCE`
- `PARKING_DATA_UNAVAILABLE`
- `TRAFFIC_DATA_STALE`
- `REST_CONSTRAINT_UNSATISFIABLE`
- `ROUTE_OPERATIONAL_CONFLICT`
- `ROUTE_TIME_WINDOW_CONFLICT`

## 14. Testler

- en kısa rota ile en iyi aile rotası farkı
- öğle dinlenmesi zorunluluğu
- park verisi etkisi
- çocuk enerji modeli
- trafik gecikmesi
- teleferik kapanışı
- düşük enerji alternatifi
- dönüş yönü optimizasyonu

## 15. Kabul Kriterleri

- Yalnızca kilometre optimizasyonu yapılmamalı.
- Öğle dinlenmesi korunmalı.
- Geçiş maliyetleri hesaba katılmalı.
- Park bilgisi rota skoruna etki etmeli.
- Buffer süreleri eklenmeli.
- Alternatif senaryolar üretilmeli.
- Delta replanning desteklenmeli.
