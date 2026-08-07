# Tatil Modu — Hotel Discovery & Ranking Agent Teknik Tasarımı

**Doküman türü:** Agent teknik tasarımı
**Agent adı:** Hotel Discovery & Ranking Agent
**Teknik kod adı:** `hotel_discovery_ranking_agent`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Veri, araştırma ve planlama
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Bu agent, seyahat bağlamına en uygun konaklama seçeneklerini keşfeder, doğrular, filtreler ve aileye uygunluk açısından sıralar.

Temel soru:

> Bu aile ve bu günlük akış için en doğru konaklama hangisidir?

## 2. Değerlendirme Boyutları

- aile odası
- çocuk yaşı uyumu
- bebek yatağı
- termal havuz
- kapalı havuz
- kadınlara özel alan veya saatler
- özel aile hamamı
- otopark
- erken giriş
- geç çıkış
- bagaj bırakma
- check-out sonrası tesis kullanımı
- rota uyumu
- ertesi gün çıkış kolaylığı
- gizli maliyetler
- dinlenme değeri

## 3. Pipeline

```text
Trip Context
  ↓
Candidate Discovery
  ↓
Deduplication
  ↓
Policy Filtering
  ↓
Feature Verification
  ↓
Route Integration
  ↓
Family Suitability
  ↓
Hidden Cost Analysis
  ↓
Ranking
  ↓
Alternative Sets
```

## 4. Girdiler

```json
{
  "task_id": "tsk_hotel_001",
  "trip_context": {},
  "family_graph": {},
  "preference_package": {},
  "constraint_package": {},
  "route_context": {},
  "budget_context": {},
  "operational_notices": []
}
```

## 5. Rest Score

Dinlenme değeri şu sinyallerle hesaplanır:

- oda büyüklüğü
- sessizlik
- karartma perde
- klima
- çocuk uyku uygunluğu
- havuz yoğunluğu
- bahçe/ortak alan
- öğle kullanım kolaylığı

## 6. Day Integration

Otel puanı günlük plana göre değişir.

Örneğin öğle dinlenmesi zorunluysa:

- check-in saati
- erken giriş
- aktivitelere dönüş süresi
- otoparktan çıkış kolaylığı

daha yüksek ağırlık alır.

## 7. Hidden Cost Engine

Toplam maliyet:

- oda ücreti
- otopark
- kahvaltı
- çocuk ücreti
- termal kullanım
- havuz
- zorunlu hizmet
- vergi/ek ücret

kalemleriyle hesaplanır.

## 8. Alternatif Kümeler

- en dengeli
- en iyi fiyat/performans
- termal odaklı
- çocuk odaklı
- dinlenme odaklı
- dönüş rotasına uygun

## 9. Çıktılar

```json
{
  "task_id": "tsk_hotel_001",
  "agent": "hotel_discovery_ranking_agent",
  "status": "completed",
  "ranked_hotels": [],
  "alternative_sets": {},
  "rejected_candidates": [],
  "feature_conflicts": [],
  "hidden_costs": [],
  "warnings": [],
  "confidence": 0.84,
  "schema_version": "1.0"
}
```

## 10. Kritik Doğrulamalar

- müsaitlik
- toplam fiyat
- çocuk kabulü
- havuz erişimi
- termal kullanım
- kadınlara özel alan
- özel aile hamamı
- otopark
- check-in/check-out

## 11. Hata Modeli

- `HOTEL_DISCOVERY_FAILED`
- `NO_COMPLIANT_HOTEL`
- `HOTEL_PRICE_UNVERIFIED`
- `HOTEL_FEATURE_CONFLICT`
- `HOTEL_AVAILABILITY_UNKNOWN`
- `HOTEL_POLICY_VIOLATION`
- `HOTEL_HIDDEN_COST_UNKNOWN`

## 12. Testler

- muhafazakâr termal otel
- öğle dinlenmesi
- erken giriş yok
- check-out sonrası havuz
- fiyat ve gizli maliyet
- rota çıkışı
- otopark zorunluluğu
- çocuk havuzu çelişkisi

## 13. Kabul Kriterleri

- Oteller yalnızca yıldız ve puana göre sıralanmamalı.
- Günlük rota ve öğle dinlenmesi hesaba katılmalı.
- Kritik özellikler doğrulanmalı.
- Gizli maliyetler ayrıştırılmalı.
- Alternatif kümeler üretilmeli.
- Uygunluk ve güven ayrı gösterilmeli.
