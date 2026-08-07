# Tatil Modu — End-to-End Execution Pipeline Teknik Tasarımı

**Doküman türü:** Sistem yürütme ve orkestrasyon tasarımı
**Teknik kod adı:** `travel_execution_pipeline`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Bu doküman, bir kullanıcı isteğinin alınmasından seyahat sonrası öğrenme sürecine kadar bütün sistemin hangi sırayla çalışacağını tanımlar.

## 2. Yaşam Döngüsü

```text
Request
  ↓
Context Resolution
  ↓
Profile & Policy
  ↓
Travel Knowledge & Discovery
  ↓
Verification
  ↓
Activity / Hotel / Route Planning
  ↓
Budget & Environmental Analysis
  ↓
Optimization
  ↓
Adaptive Day Plan
  ↓
User Presentation
  ↓
Live Trip Replanning
  ↓
Experience Evaluation
  ↓
Memory Review
```

## 3. Faz 1 — Request Intake

Travel Orchestrator:

- kullanıcı talebini parse eder,
- trip intent oluşturur,
- eksik alanları sınıflandırır,
- trace ve trip kimliği üretir.

## 4. Faz 2 — Context Resolution

Paralel:

- Profile Agent
- Memory Platform
- Preference Agent

çalışır.

Ardından Policy Agent bağlayıcı kuralları üretir.

## 5. Faz 3 — Knowledge & Discovery

Paralel çalışabilecek bileşenler:

- Activity Discovery Agent
- Hotel Discovery Agent
- Public Authority Intelligence Agent
- Travel Knowledge Store retrieval
- Environmental Intelligence Platform

## 6. Faz 4 — Verification

Kritik claim'ler:

- fiyat
- müsaitlik
- açık/kapalı
- çocuk kabulü
- kadınlara özel alan
- yol kapanışı
- teleferik durumu
- park

Verification Platform'a gider.

## 7. Faz 5 — Planning

Sıralama:

1. Activity Discovery & Ranking
2. Hotel Discovery & Ranking
3. Route Planner
4. Budget Intelligence
5. Environmental scoring
6. Adaptive Day Planner

Bazı adımlar geri beslemeli olabilir.

## 8. Faz 6 — Optimization

Optimization Platform:

- feasible plan adaylarını karşılaştırır,
- Pareto frontier üretir,
- trade-off'ları açıklar,
- seçilen planı belirler.

## 9. Faz 7 — User Presentation

Explanation katmanı:

- ana plan
- alternatifler
- bütçe
- park
- riskler
- doğrulanmamış alanlar
- kaynak özeti

üretir.

## 10. Faz 8 — Live Trip

Seyahat sırasında Context Memory güncellenir.

Tetikleyiciler:

- aile yoruldu
- çocuk uyudu
- yağmur başladı
- yol kapandı
- park bulunamadı
- aktivite iptal
- bütçe aşıldı

Adaptive Day Planner delta replanning yapar.

## 11. Faz 9 — Post-Trip

Experience & Satisfaction Platform:

- gerçekleşen olayları analiz eder,
- memnuniyet çıkarır,
- agent performansını ölçer,
- öğrenme adayları üretir.

## 12. İnsan Onay Noktaları

- hard constraint çakışması
- önemli bütçe artışı
- rezervasyon
- geri ödemesiz işlem
- hassas hafıza güncellemesi
- kritik policy değişikliği
- destinasyon veya geceleme değişikliği

## 13. Paralel Çalışma

Paralel örnek:

```text
Weather
Hotel Discovery
Public Authority
Activity Discovery
Food Discovery
```

Bağımlı örnek:

```text
Policy → Filtering → Ranking
```

## 14. Cache Yazımı

Cache'e yazılabilecekler:

- resmî kaynak registry
- POI temel özellikleri
- genel rota karakteri
- mevsimsel bilgi

Cache'e kısa süreli yazılacaklar:

- hava
- trafik
- operasyonel duyuru
- açılış saati
- otel fiyatı

## 15. Memory Yazımı

Doğrudan Memory Platform'a yazılmaz.

Akış:

```text
Observation
  ↓
Learning Candidate
  ↓
Review
  ↓
User Confirmation (gerekiyorsa)
  ↓
Canonical Memory
```

## 16. Failure Handling

Tek agent hatasında:

- plan mümkünse partial devam eder,
- güven düşürülür,
- eksik alan kullanıcıya gösterilir,
- kritik bilgi eksikse ilgili aday elenir.

## 17. E2E Bursa Senaryosu

Girdi:

- Kocaeli çıkış
- 2 yetişkin
- 2 ve 6 yaşında iki çocuk
- 1 gece Bursa
- öğle dinlenmesi
- muhafazakâr termal otel
- havuz
- hayvanat bahçesi
- bilim merkezi
- teleferik
- 30.000 TL bütçe

Beklenen pipeline:

1. Profile ve Policy çözülür.
2. Aktivite ve otel adayları bulunur.
3. Kamu duyuruları ve çevresel koşullar kontrol edilir.
4. Kritik bilgiler doğrulanır.
5. Rota ve bütçe hesaplanır.
6. Optimization Platform planları karşılaştırır.
7. Adaptive Day Planner ana ve alternatif planları üretir.
8. Seyahat sırasında delta replanning yapılabilir.
9. Gezi sonrası öğrenme adayları oluşur.

## 18. Gözlemlenebilirlik

Her faz için:

- duration
- agent count
- tool calls
- cost
- confidence
- errors
- retries
- cache hit
- verification coverage

izlenir.

## 19. Kabul Kriterleri

- Bütün agent bağımlılıkları açık olmalı.
- Paralel ve sıralı görevler ayrılmalı.
- İnsan onay noktaları belirli olmalı.
- Cache ve Memory yazımları ayrılmalı.
- Live replanning desteklenmeli.
- Post-trip learning pipeline bulunmalı.
- Tek agent hatası sistemi tamamen düşürmemeli.
- Her karar trace edilebilir olmalı.
