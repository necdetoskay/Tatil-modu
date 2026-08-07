# Tatil Modu — Experience & Satisfaction Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `experience_satisfaction_platform`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Öğrenme, geri bildirim ve değerlendirme
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Experience & Satisfaction Platform, gerçekleşen seyahat deneyimini analiz eder; aile memnuniyetini, öneri başarısını ve agent performansını ölçer.

Temel soru:

> Plan gerçekte ne kadar başarılı oldu ve bir sonraki seyahatte neyi değiştirmeliyiz?

## 2. Platform Bileşenleri

- Experience Collector
- Satisfaction Analyzer
- Feedback Interpreter
- Preference Evolution Engine
- Family Learning Engine
- Recommendation Evaluator
- Memory Update Coordinator
- Model Evaluation Engine

## 3. Experience Collector

Toplanan olaylar:

- gerçek ziyaret süresi
- gerçek bekleme süresi
- gerçek sürüş süresi
- aktivite tamamlandı/atlanıldı
- otel/havuz kullanımı
- öğle dinlenme süresi
- plan sapmaları

## 4. Satisfaction Dimensions

- çocuk mutluluğu
- yetişkin memnuniyeti
- dinlenme kalitesi
- stres seviyesi
- zaman kullanımı
- fiyat/performans
- tekrar tercih etme isteği

## 5. Feedback Interpreter

Doğal dil geri bildirimi yapılandırır.

Örnek:

> Teleferik güzeldi ama sıra çok uzundu.

```json
{
  "activity_sentiment": 0.85,
  "queue_sentiment": -0.72,
  "repeat_intent": true,
  "timing_issue": true
}
```

## 6. Preference Evolution Engine

Tek gezi kalıcı tercih oluşturmaz.

Kalıcı güncelleme için:

- tekrar eden kanıt,
- yeterli confidence,
- farklı bağlamlarda tutarlılık,
- gerekirse kullanıcı onayı

aranır.

## 7. Family Learning Engine

Her birey ayrı değerlendirilir.

Örnek:

- çocuk 1 bilim merkezlerini seviyor,
- çocuk 2 öğleden sonra yoruluyor,
- yetişkin 1 termal tesislerden memnun,
- yetişkin 2 uzun sürüşü tolere ediyor.

## 8. Recommendation Evaluator

Öneri ile gerçek sonuç karşılaştırılır.

Ölçümler:

- seçilen aktivite başarı oranı
- otel memnuniyeti
- rota sapması
- bütçe sapması
- hava etkisi tahmin doğruluğu
- crowd tahmin doğruluğu

## 9. Memory Update Coordinator

Platform doğrudan kanonik hafızaya yazmaz.

Yalnızca:

- preference candidate
- policy review candidate
- travel style candidate
- profile update candidate

üretir.

## 10. Model Evaluation Engine

Agent bazlı metrikler:

| Agent | Ana ölçüm |
|---|---|
| Activity Agent | öneri memnuniyet oranı |
| Hotel Agent | konaklama başarısı |
| Route Planner | süre/rota sapması |
| Budget Agent | tahmin-gerçekleşen farkı |
| Weather Agent | etki tahmini doğruluğu |
| Crowd Agent | sıra/yoğunluk tahmini |

## 11. Confidence Evolution

Başarılı önerilerin güveni artabilir; başarısız önerilerin güveni düşebilir.

Bu işlem:

- geri alınabilir,
- sürümlü,
- evidence tabanlı

olmalıdır.

## 12. Privacy by Design

- kullanıcı isterse geziyi öğrenme dışında bırakabilir,
- hassas veriler açık izin olmadan kullanılmaz,
- öğrenme adayları silinebilir,
- geçmiş değerlendirmeler geri alınabilir,
- en az veri ilkesi uygulanır.

## 13. Girdiler

```json
{
  "task_id": "tsk_exp_001",
  "trip_plan": {},
  "actual_events": [],
  "user_feedback": [],
  "family_graph": {},
  "agent_decisions": [],
  "budget_actuals": []
}
```

## 14. Çıktılar

```json
{
  "task_id": "tsk_exp_001",
  "platform": "experience_satisfaction_platform",
  "status": "completed",
  "satisfaction_summary": {},
  "member_satisfaction": [],
  "recommendation_evaluations": [],
  "learning_candidates": [],
  "memory_update_candidates": [],
  "agent_metrics": [],
  "warnings": [],
  "confidence": 0.87,
  "schema_version": "1.0"
}
```

## 15. Hata Modeli

- `EXPERIENCE_INPUT_INVALID`
- `FEEDBACK_AMBIGUOUS`
- `SATISFACTION_INSUFFICIENT_DATA`
- `LEARNING_EVIDENCE_INSUFFICIENT`
- `MEMORY_UPDATE_BLOCKED`
- `EVALUATION_DATA_CONFLICT`

## 16. Testler

- olumlu aktivite geri bildirimi
- olumlu aktivite/olumsuz sıra
- düşük veri
- tek gezi öğrenme adayı
- üç gezi tutarlı öğrenme
- bütçe sapması
- rota sapması
- opt-out learning

## 17. Kabul Kriterleri

- Deneyim ve memnuniyet ayrı tutulmalı.
- Her birey bağımsız değerlendirilmeli.
- Doğal dil geri bildirimi yapılandırılmalı.
- Tek gezi kalıcı preference oluşturmamalı.
- Memory Platform'a yalnızca aday güncellemeler gitmeli.
- Agent performansı ölçülebilmeli.
- Kullanıcı öğrenmeden çıkabilmeli.
