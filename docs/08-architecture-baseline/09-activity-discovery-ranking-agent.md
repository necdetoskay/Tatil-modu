# Tatil Modu — Activity Discovery & Ranking Agent Teknik Tasarımı

**Doküman türü:** Agent teknik tasarımı
**Agent adı:** Activity Discovery & Ranking Agent
**Teknik kod adı:** `activity_discovery_ranking_agent`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Planlama ve karar
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Bu agent, belirli bir destinasyon ve tarih için uygulanabilir aktivite adaylarını keşfeder, bağlayıcı kurallara göre filtreler ve aileye uygunluk açısından sıralar.

Temel soru:

> Bu aile için, bu tarihte, bu bölgede en uygun aktiviteler hangileri?

## 2. Kullandığı Bileşenler

- Profile Agent
- Preference Agent
- Policy Agent
- Memory Platform
- Travel Knowledge Store
- Verification Platform
- Public Authority Intelligence Agent
- Weather Agent
- Route Planner
- Budget Agent

## 3. İş Akışı

```text
Trip Context
   ↓
Candidate Discovery
   ↓
Normalization & Deduplication
   ↓
Policy Filtering
   ↓
Operational Filtering
   ↓
Suitability Scoring
   ↓
Family Satisfaction Scoring
   ↓
Confidence Adjustment
   ↓
Diversification
   ↓
Ranked Activity Set
```

## 4. Sorumluluklar

- aktivite adayları bulmak
- aynı yeri farklı adlarla gelen kayıtlardan ayıklamak
- hard constraint ihlallerini elemek
- kapanış, yol çalışması ve hava etkisini uygulamak
- yaş, tempo, yürüme ve dinlenme uyumunu puanlamak
- her aile bireyi için ayrı uygunluk hesaplamak
- birlikte deneyim değerini hesaba katmak
- benzer aktiviteler arasında çeşitlilik sağlamak
- ana ve alternatif adaylar üretmek
- her öneri için gerekçe ve güven seviyesi sağlamak

## 5. Yapmayacağı İşler

- günlük saat planını tek başına oluşturmaz
- otel seçmez
- rota hesaplamaz
- belirsiz bilgiyi kesin kabul etmez
- hard constraint ihlal eden adayı puanla kurtarmaz
- yalnızca popülerlik veya yorum puanına göre sıralama yapmaz

## 6. Girdiler

```json
{
  "task_id": "tsk_activity_001",
  "trip_context": {},
  "family_graph": {},
  "preference_package": {},
  "constraint_package": {},
  "knowledge_context": {},
  "operational_notices": [],
  "weather_context": {},
  "budget_context": {},
  "search_radius_km": 150
}
```

## 7. Aktivite Aday Modeli

```json
{
  "activity_id": "act_001",
  "entity_id": "poi_001",
  "name": "Bursa Hayvanat Bahçesi",
  "activity_type": "zoo",
  "location": {},
  "estimated_duration_minutes": 150,
  "effort_level": "medium",
  "indoor_outdoor": "outdoor",
  "age_fit": {},
  "parking": {},
  "accessibility": {},
  "cost_estimate": {},
  "evidence_refs": [],
  "verification_status": "verified"
}
```

## 8. Discovery Kaynakları

- Travel Knowledge Store
- resmî destinasyon siteleri
- belediye ve valilik kaynakları
- resmî tesis siteleri
- güvenilir harita/POI servisleri
- etkinlik kaynakları
- doğrulanmış geçmiş kullanıcı verileri

## 9. Hard Filter Aşaması

Aday şu durumlarda elenir:

- kapalı veya erişilemez
- tarih/saat uyumsuz
- hard constraint ihlali
- yaş veya güvenlik açısından uygunsuz
- bütçeyi tek başına aşırı ihlal ediyor
- rota sınırının dışında ve yeterli fayda üretmiyor
- kamu duyurusu nedeniyle kullanılamıyor

## 10. Puanlama Boyutları

Örnek ağırlıklar:

```json
{
  "constraint_compliance": 0.20,
  "family_age_fit": 0.14,
  "individual_preference_fit": 0.12,
  "shared_experience_value": 0.10,
  "rest_balance": 0.10,
  "weather_fit": 0.08,
  "travel_efficiency": 0.08,
  "budget_fit": 0.07,
  "parking_accessibility": 0.04,
  "novelty": 0.03,
  "evidence_quality": 0.04
}
```

Hard constraint ihlali puanlanmaz; doğrudan elenir.

## 11. Bireysel Uygunluk

Her birey için ayrı skor tutulur:

```json
{
  "member_fit": [
    {"person_id": "per_001", "score": 0.82},
    {"person_id": "per_002", "score": 0.88},
    {"person_id": "per_003", "score": 0.96},
    {"person_id": "per_004", "score": 0.91}
  ]
}
```

## 12. Family Satisfaction

Toplam skor şu unsurları içerir:

- bireysel memnuniyet
- minimum bireysel memnuniyet
- birlikte deneyim kalitesi
- dinlenme dengesi
- adalet
- çocuk temel ihtiyaçları

## 13. Fairness Kuralları

- aynı birey art arda düşük uyumlu aktivitelere maruz kalmamalı
- çocuk temel ihtiyacı puanla telafi edilemez
- yalnızca çoğunluğun tercihi seçilmemeli
- gün içinde en az bir ortak yüksek uyumlu aktivite hedeflenmeli

## 14. Çeşitlilik

Sıralama yalnızca en yüksek skorlu benzer aktivitelerden oluşmamalıdır.

Çeşitlilik boyutları:

- aktivite türü
- iç/dış mekân
- efor seviyesi
- maliyet seviyesi
- çocuk/yetişkin dengesi
- doğa/kültür/eğlence dengesi

## 15. Ana ve Alternatif Çıktılar

```json
{
  "ranked_sets": {
    "primary": [],
    "low_energy": [],
    "high_energy": [],
    "rainy_weather": [],
    "budget_friendly": []
  }
}
```

## 16. Confidence Adjustment

Nihai uygunluk skoru evidence ve verification seviyesine göre ayarlanır.

Örnek:

- suitability 0.92
- evidence confidence 0.60
- final recommendation confidence 0.71

## 17. Çıktılar

```json
{
  "task_id": "tsk_activity_001",
  "agent": "activity_discovery_ranking_agent",
  "status": "completed",
  "ranked_activities": [],
  "ranked_sets": {},
  "rejected_candidates": [],
  "warnings": [],
  "unknowns": [],
  "decision_log": [],
  "confidence": 0.88,
  "schema_version": "1.0"
}
```

## 18. Karar Günlüğü

Her seçim için:

- seçilme nedeni
- elenen alternatifler
- kural etkisi
- aile üyesi skorları
- trade-off
- evidence kalitesi

saklanır.

## 19. Hata Modeli

- `ACTIVITY_DISCOVERY_FAILED`
- `NO_VALID_ACTIVITY`
- `ACTIVITY_DATA_STALE`
- `ACTIVITY_POLICY_CONFLICT`
- `ACTIVITY_VERIFICATION_UNCERTAIN`
- `ACTIVITY_DUPLICATE_UNRESOLVED`
- `ACTIVITY_RANKING_FAILED`

## 20. Testler

### Birim testleri

- aday keşfi
- duplicate birleştirme
- hard constraint eleme
- aile üyesi skorları
- fairness
- çeşitlilik
- düşük güven düzeltmesi
- yağmur alternatifi

### E2E Bursa Senaryosu

Girdi:

- 2 yetişkin
- 2 ve 6 yaşında çocuklar
- öğle dinlenmesi
- düşük/orta yürüyüş
- hayvanat bahçesi, bilim merkezi, teleferik ilgisi
- muhafazakâr termal konaklama
- hafta içi Eylül başı

Beklenen:

- Hayvanat Bahçesi yüksek çocuk uyumu
- Bilim Merkezi güçlü kapalı alan alternatifi
- Teleferik hava/rüzgâr ve çalışma durumuna bağlı
- aynı güne üç yoğun aktivite zorla eklenmemeli
- düşük enerji ve yağmur alternatifleri üretilmeli
- park ve operasyonel durumlar skora yansıtılmalı

## 21. Kabul Kriterleri

- Hard constraint ihlal eden adaylar elenmeli.
- Her aile bireyi için uygunluk hesaplanmalı.
- Family Satisfaction ve fairness uygulanmalı.
- Evidence ve verification skora etki etmeli.
- Benzer adaylar çeşitlendirilmiş setlerde sunulmalı.
- Ana, düşük enerji, yüksek enerji ve yağmur setleri üretilebilmeli.
- Karar nedenleri izlenebilir olmalı.
- Mock Travel Knowledge Store/Policy/Profile verileriyle bağımsız test edilebilmeli.
