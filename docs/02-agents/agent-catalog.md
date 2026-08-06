# Tatil Modu — Initial Agent Catalog

## 1. Katalog amacı

Bu katalog sistemde planlanan agentları, görev sınırlarını ve bağımlılıklarını tanımlar.

Agent sayısı başlangıçta bilinçli olarak sınırlı tutulur. Bir görev ancak bağımsız prompt, tool, sözleşme ve test ihtiyacı varsa ayrı agenta dönüştürülür.

## 2. Agent sınıfları

### A. Girdi ve profil agentları

#### AG-001 — Trip Profile Agent

**Amaç:** Kullanıcının serbest metin isteğini yapılandırılmış seyahat profiline dönüştürmek.

**Girdi:**

- kullanıcı mesajı,
- bilinen kullanıcı bağlamı,
- önceki seyahat profili.

**Çıktı:** `TripProfile`

**Tool:** Yok. (Fixture-mode test uyumlu)

**Durum:** ✅ Tamamlandı v1.0

**Belgeler:**
- [Specification](trip-profile-agent/specification.md)
- [System Prompt](trip-profile-agent/system-prompt.md)
- [Decision Rules](trip-profile-agent/decision-rules.md)
- [Input Schema](trip-profile-agent/input.schema.json)
- [Output Schema](trip-profile-agent/output.schema.json)
- [Tool Policy](trip-profile-agent/tool-policy.md)
- [Handoff Contracts](trip-profile-agent/handoff-contracts.md)
- [Evaluation Rubric](trip-profile-agent/evaluation-rubric.md)
- [Test Fixtures (15)](trip-profile-agent/tests/fixtures/)
- [Tests README](trip-profile-agent/tests/README.md)

**Test matrisi**: 15 fixture (normal, missing-info, conflict, invalid-input, preference, special-requirement, context-conflict, date-flexibility, budget, transportation, accessibility, critical-missing). Schema coverage: 100%.

---

### B. Keşif ve araştırma agentları

#### AG-002 — Destination Discovery Agent

**Amaç:** Kullanıcı sabit bir il veya bölge vermediyse uygun destinasyon adaylarını bulmak; sabit hedef verildiyse hedef içindeki alt bölgeleri karşılaştırmak.

**Girdi:**

- `TripProfile`,
- ulaşılabilirlik verisi,
- sezon ve iklim bağlamı.

**Çıktı:** `DestinationCandidateSet`

**Tool ihtiyaçları:**

- web search,
- geocoding,
- mesafe matrisi,
- resmî turizm kaynakları.

---

#### AG-003 — Places & Experiences Agent

**Amaç:** Gezilecek yerleri, plajları, doğa alanlarını, müzeleri, çocuk etkinliklerini ve deneyimleri araştırmak.

**Girdi:**

- `TripProfile`,
- seçilmiş destinasyon,
- tarih aralığı.

**Çıktı:** `PlaceCandidateSet`

**Tool ihtiyaçları:**

- place search,
- resmî web doğrulaması,
- harita,
- çalışma saati araştırması.

---

#### AG-004 — Accommodation Agent

**Amaç:** Konaklama adaylarını aile, bütçe, konum ve özel gereksinimlere göre karşılaştırmak.

**Girdi:**

- `TripProfile`,
- destinasyon,
- rota tercihleri,
- güncel konaklama verisi.

**Çıktı:** `AccommodationCandidateSet`

**Tool ihtiyaçları:**

- otel arama,
- fiyat/müsaitlik,
- harita,
- yorum kaynakları,
- tesis resmî sitesi.

---

#### AG-005 — Food & Local Taste Agent

**Amaç:** Yerel lezzetleri ve uygun restoran adaylarını araştırmak.

**Girdi:**

- `TripProfile`,
- destinasyon ve günlük rota alanları,
- yeme-içme tercihleri.

**Çıktı:** `FoodCandidateSet`

**Tool ihtiyaçları:**

- place search,
- menü/fiyat araştırması,
- resmî işletme sayfası,
- yorum kaynakları.

---

#### AG-006 — Review Intelligence Agent

**Amaç:** Çok sayıda kullanıcı yorumunu ortak olumlu/olumsuz temalara dönüştürmek ve son dönem kalite eğilimini çıkarmak.

**Girdi:**

- normalize edilmiş yorum kayıtları,
- işletme veya yer kimliği,
- analiz dönemi.

**Çıktı:** `ReviewInsight`

**Tool ihtiyaçları:**

- yorum sağlayıcıları,
- metin işleme,
- duplicate/spam filtreleme.

**Not:** Ham yorum toplama ile yorum analizi ayrı bileşenler olmalıdır.

---

#### AG-007 — Weather Context Agent

**Amaç:** Tarih ve lokasyon için hava şartlarını aktivite uygunluğuna çevirmek.

**Girdi:**

- lokasyonlar,
- tarih aralığı,
- aktivite türleri.

**Çıktı:** `WeatherAssessment`

**Tool ihtiyaçları:**

- hava tahmin API,
- geçmiş iklim verisi.

**Kural:** Uzun dönem iklim ortalaması güncel tahmin olarak sunulamaz.

---

### C. Planlama ve karar agentları

#### AG-008 — Route & Schedule Optimizer

**Amaç:** Aday yerleri yol, süre, çalışma saati, aile temposu ve dinlenme ihtiyacına göre günlere yerleştirmek.

**Girdi:**

- `TripProfile`,
- `PlaceCandidateSet`,
- `AccommodationSelection`,
- `WeatherAssessment`,
- mesafe ve süre matrisi.

**Çıktı:** `ItineraryDraft`

**Tool ihtiyaçları:**

- directions,
- distance matrix,
- takvim/zaman hesaplama.

---

#### AG-009 — Budget & Constraint Evaluator

**Amaç:** Planın bütçe ve tüm hard constraint'lere uyup uymadığını kontrol etmek.

**Girdi:**

- `TripProfile`,
- `ItineraryDraft`,
- maliyet tahminleri.

**Çıktı:** `ConstraintEvaluation`

**Tool ihtiyaçları:**

- calculator,
- ücret verileri,
- otoyol/yakıt hesapları.

**Kural:** Bu agent öneri araştırmaz; verilen planı değerlendirir.

---

#### AG-010 — Verification & Quality Reviewer

**Amaç:** Agent çıktılarındaki kaynak, tarih, çalışma saati, bütçe, rota ve kullanıcı tercihi uyumunu son kez denetlemek.

**Girdi:**

- tüm seçilmiş adaylar,
- nihai plan taslağı,
- kaynak kayıtları.

**Çıktı:** `QualityReview`

**Tool ihtiyaçları:**

- gerektiğinde kaynak yeniden doğrulama,
- deterministic validator.

**Kural:** Reviewer kendi başına yeni yer uyduramaz.

---

#### AG-011 — Final Plan Composer

**Amaç:** Doğrulanmış yapılandırılmış sonuçları kullanıcıya anlaşılır, gerekçeli ve alternatifli nihai plan olarak sunmak.

**Girdi:**

- doğrulanmış `ItineraryDraft`,
- `ConstraintEvaluation`,
- `QualityReview`.

**Çıktı:** `FinalTravelPlan`

**Tool:** Normalde yok.

---

### D. Orkestrasyon

#### AG-012 — Orchestrator

**Amaç:** İş akışını yönetmek, agentları seçmek, handoff doğrulamak ve hata/fallback kararlarını vermek.

**Orchestrator araştırma yapmaz.**

Sorumlulukları:

- görev grafiği oluşturma,
- agent tetikleme,
- schema doğrulama,
- retry/fallback,
- cache kararı,
- maliyet sınırı,
- çelişki yönlendirme,
- final kalite kapısı.

## 3. Ayrı agent yapılmaması gereken ilk bileşenler

İlk sürümde aşağıdakiler bağımsız agent değil, tool veya deterministic service olabilir:

- tarih hesaplama,
- para toplama,
- mesafe matrisi,
- JSON Schema doğrulama,
- çalışma saati ihlal kontrolü,
- duplicate yorum temizleme,
- kaynak güncellik skoru.

## 4. Agent olgunluk durumları

```text
proposed
specified
contracted
fixture-tested
live-tested
production-ready
deprecated
```

## 5. İlk geliştirme sırası

1. Trip Profile Agent
2. Destination Discovery Agent
3. Places & Experiences Agent
4. Accommodation Agent
5. Review Intelligence Agent
6. Route & Schedule Optimizer
7. Budget & Constraint Evaluator
8. Verification & Quality Reviewer
9. Orchestrator
10. Final Plan Composer
