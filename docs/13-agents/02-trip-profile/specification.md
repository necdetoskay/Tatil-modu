# Trip Profile Agent — Specification

| Alan | Değer |
|---|---|
| Document ID | AGENT-002 |
| Sürüm | 1.0 |
| Durum | Taslak (Review) |
| EOS Sürümü | EOS v1.0 |
| Bağımlılıklar | PRD-001 (Product Vision), TST-001 (Testing Standard), ARCH-002 (Agent Catalog) |
| Test Standard | TST-001 |
| Agent ID | `trip-profile` |
| Son Güncelleme | 2026-08-06 |

---

## 1. Kimlik ve Amaç

### 1.1. Tanım

Trip Profile Agent, kullanıcının tatil planlama sürecinin başlangıcındaki doğal dil girdilerini (sohbet, voice, form) alır ve sistem genelinde kullanılabilir, yapılandırılmış ve tiplanmış bir **TripProfile** nesnesine dönüştürür.

### 1.2. Amaç

- Kullanıcının tatil niyetini, kısıtlamalarını, tercihlerini ve profilini **tamamen anlamak**.
- Tüm downstream agentların (Destination, Accommodation, Route, Budget, vb.) ihtiyaç duyduğu tek tip schema'ya sahip bir profil üretmek.
- Belirsizlikleri **işaretlemek ve confidence skoru ile yönetmek** — asla "varsaymak" değil, "soru sormak".
- Kullanıcının girdilerindeki çelişkileri **tespit edip uyarı vermek**.

### 1.3. Amaç ve Sorumluluk (Responsibility Boundary)

✅ **Yapar**:
- Kullanıcı girdisini doğrular ve tipler.
- Eksik alanları tespit eder, confidence düşürür.
- Çelişkili girdileri fark eder, `conflictFlags` doldurur.
- Kullanıcı profilini (yetişkinler, çocuklar, yaşlar, engel durumları) normalize eder.
- Bütçeyi kişi başına dağıtır, TRY cinsinden standardizer.
- Vehicle tipini geçerli enum'a döker.
- Confidence skorunu hesaplar (kaynak: girdi completeness × rule compliance).

❌ **Yapmaz**:
- Destinasyon araştırması yapmaz.
- Bütçe optimize etmez.
- Otel, restoran, rota araştırması yapmaz.
- Kullanıcının kim olduğunu kimlik doğrular (auth, oturum yönetimi başka agent/vestibulde).

---

## 2. Tetiklenme Koşulları

| Tetikleyici | Açıklama |
|-------------|----------|
| `user.journey.start` | Kullanıcı ilk kez tatil planlama sürecini başlatır. |
| `user.profile.update` | Kullanıcı profilinde güncelleme yapar. |
| `trip.revise` | Kullanıcı mevcut planı yeniden düzenler. |
| `orchestrator.request` | Orchestrator, profili yenilemek için talepte bulunur. |

---

## 3. Girdi / Çıktı Sözleşmesi

### 3.1. Girdi (Input Schema)

Agent, doğal dil girdi veya yapılandırılmamış form verisi alır. Girdi formatı değişkendir; agent bunları normalize eder.

**Ham girdi tipleri**:
- `text`: Kullanıcının yazdığı sohbet mesajı
- `structured`: Kısmi form verisi (örn. sadece tarih ve bütçe doldurulmuş)
- `intent`: Kullanıcının seyahat niyeti (örn. "yaz tatili", "romantik", "macera")

```json
{
  "type": "object",
  "description": "Trip Profile Agent girdi (doğal dil veya yapılandırılmamış)",
  "properties": {
    "userInput": { "type": "string", "description": "Kullanıcının doğal dil ifadesi" },
    "partialStructured": { "type": "object", "description": "Kısmi form verisi" },
    "sessionContext": { "type": "object", "description": "Önceki mesajlar, ziyaret edilen hedefler" },
    "userHistory": { "type": "array", "description": "Geçmiş tatil planları (opsiyonel)" }
  }
}
```

### 3.2. Çıktı (Output Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TripProfile",
  "type": "object",
  "required": [
    "profileId", "tripPurpose", "temporal", "travelers",
    "budget", "vehicle", "accommodationPreference",
    "accessibilityNeeds", "childCareNeeds", "petFriendly",
    "riskTolerance", "confidence", "source", "conflictFlags"
  ],
  "properties": {
    "profileId": { "type": "string", "description": "UUID veya session-scoped ID" },
    "tripPurpose": { "$ref": "#/definitions/TripPurpose" },
    "temporal": { "$ref": "#/definitions/TemporalConstraint" },
    "travelers": { "$ref": "#/definitions/Travelers" },
    "budget": { "$ref": "#/definitions/Budget" },
    "vehicle": { "$ref": "#/definitions/Vehicle" },
    "accommodationPreference": { "$ref": "#/definitions/AccommodationPreference" },
    "accessibilityNeeds": { "type": "array", "items": { "type": "string" } },
    "childCareNeeds": { "type": "boolean" },
    "petFriendly": { "type": "boolean" },
    "riskTolerance": { "$ref": "#/definitions/RiskTolerance" },
    "confidence": { "$ref": "#/definitions/Confidence" },
    "source": { "$ref": "#/definitions/Source" },
    "conflictFlags": { "type": "array", "items": { "type": "string" } },
    "warnings": { "type": "array", "items": { "type": "string" } }
  },
  "definitions": {
    "TripPurpose": { "type": "string", "enum": [
      "relaxation", "exploration", "adventure", "family", "romantic", "culture", "wellness"
    ]},
    "TemporalConstraint": {
      "type": "object",
      "required": ["flexibility", "startDate", "endDate", "durationDays"],
      "properties": {
        "flexibility": { "type": "string", "enum": ["fixed", "flexible_3days", "flexible_7days", "month"] },
        "startDate": { "type": "string", "format": "date", "description": "null olabilir (flexible)" },
        "endDate": { "type": "string", "format": "date", "description": "null olabilir (flexible)" },
        "durationDays": { "type": "integer", "minimum": 1, "maximum": 60 },
        "seasonPreference": { "type": "string", "enum": ["summer", "winter", "spring", "autumn", "any"] }
      }
    },
    "Travelers": {
      "type": "object",
      "required": ["adults", "children", "elderlyCount"],
      "properties": {
        "adults": { "type": "integer", "minimum": 1, "maximum": 10 },
        "children": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["age"],
            "properties": {
              "age": { "type": "integer", "minimum": 0, "maximum": 17 },
              "specialNeeds": { "type": "string" }
            }
          }
        },
        "elderlyCount": { "type": "integer", "minimum": 0, "maximum": 5 },
        "accessibilityRequired": { "type": "boolean" }
      }
    },
    "Budget": {
      "type": "object",
      "required": ["totalTRY", "perPersonPerNightTRY", "currency"],
      "properties": {
        "totalTRY": { "type": "number", "minimum": 0 },
        "perPersonPerNightTRY": { "type": "number", "minimum": 0 },
        "currency": { "type": "string", "enum": ["TRY"] },
        "budgetFlexibility": { "type": "string", "enum": ["strict", "moderate", "flexible"] }
      }
    },
    "Vehicle": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["private_car", "public_transport", "walking", "electric_vehicle", "rental_car"] },
        "hasDriver": { "type": "boolean" },
        "drivingRangeKm": { "type": "integer", "minimum": 0, "maximum": 2000 },
        "chargingNeeded": { "type": "boolean" }
      }
    },
    "AccommodationPreference": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["hotel", "apartment", "villa", "hostel", "boutique", "resort", "camping", "any"] },
        "minStarRating": { "type": "integer", "minimum": 1, "maximum": 5 },
        "breakfastIncluded": { "type": "boolean" },
        "pool": { "type": "boolean" },
        "parking": { "type": "boolean" },
        "kidClub": { "type": "boolean" }
      }
    },
    "RiskTolerance": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    },
    "Confidence": {
      "type": "object",
      "required": ["score", "completeness", "missingFields"],
      "properties": {
        "score": { "type": "number", "minimum": 0, "maximum": 1 },
        "completeness": { "type": "number", "minimum": 0, "maximum": 1, "description": "Ne kadar alan dolduruldu" },
        "missingFields": { "type": "array", "items": { "type": "string" } },
        "uncertainFields": { "type": "array", "items": { "type": "string" } }
      }
    },
    "Source": {
      "type": "object",
      "required": ["method", "timestamp"],
      "properties": {
        "method": { "type": "string", "enum": ["user_input", "profile_update", "revision"] },
        "timestamp": { "type": "string", "format": "date-time" },
        "originalInput": { "type": "string" }
      }
    }
  }
}
```

### 3.3. Schema Dosyaları

- **Input schema**: `tests/schemas/trip-profile.input.json`
- **Output schema**: `tests/schemas/trip-profile.output.json`

---

## 4. Kullanılacak Veri Kaynakları

| Kaynak Tip | Açıklama | Güvenilirlik Sırası |
|------------|----------|-------------------|
| Kullanıcı doğrudan girdi | Sohbet, form, voice | 1 (en yüksek) |
| Kullanıcı profil kaydı | Geçmiş tatil planları, kaydedilmiş tercihler | 2 |
| Session geçmişi | Önceki mesajlar, ziyaret edilen hedefler | 3 |
| Varsayılan kalıplar | "Aile tatili" için varsayılan yaş aralıkları | 4 (fallback) |

> **Not**: Trip Profile Agent **harici** data kaynağı kullanmaz. Tek girdi kaynağı kullanıcıdır. Bu, test edilebilirliği maksimize eder.

---

## 5. Kullanılacak Tool'lar

Trip Profile Agent **hiçbir dış tool'u kullanmaz**. Kararları tamamen:

1. LLM inference (sistem promptu)
2. Deterministic rule validation (JSON Schema, enum kontrolü)

ile yapılır.

Bu, agentın **tamamen fixture-mode test edilebilir** olmasını sağlar.

---

## 6. Sistem Promptu

### 6.1. Evrensel Sistem Kuralları (Universal System Rules)

```
Sen, tatil planlama sürecinde kullanıcı profilini yapılandıran bir Trip Profile Agent'ısın.
Görevin, kullanıcının doğal dil girdisini veya kısmi form verisini tam, tiplanmış ve
validasyonu yapılmış bir TripProfile nesnesine dönüştürmektir.

Kurallar:
1. Asla varsayım yapma. Eksik bilgi varsa confidence düşür ve missingFields'e ekle.
2. Çelişkili girdileri fark et, conflictFlags'e ekle, uyarı üret.
3. Confidence skoru 0-1 arasındadır. 1.0 = %100 eksiksiz ve çelişkisiz.
4. Hiçbir zaman tahmin et. "Belki değil" demek confidence'yı düşürür.
5. Türkçe yanıt ver. JSON çıktısı İngilizce schema alanları kullanır.
6. Yalnızca JSON çıktı üret. Başka metin ekleme.
```

### 6.2. Agent Rol Promptu

```
Sen, aile tatilleri, çiftler gezileri, engelli erişimine ihtiyaç duyan grup tatilleri
ve diğer tüm seyahat tiplerine uyumlu profil oluşturabilen bir tatil danışmanısın.

Görevin sadece profil çıkarmaktır — destinasyon, otel, rota araştırması yapma.
Sadece kullanıcının kim olduğunu, ne istediğini, ne kısıtlıyor olduğunu öğrenip
bunu yapılandırılmış formata dök.
```

### 6.3. Göreve Özel Talimat (Task-Specific)

**Tatil Amaçları Sınıflandırması**:
- `relaxation`: Plajda dinlenmek, SPA, ayakta yürüyüş
- `exploration`: Yeni şehir keşfetmek, turistik birimler
- `adventure`: Doğa, tırmanış, su sporları
- `family`: Çocuklu aile, çocuk dostu
- `romantic`: Çiftler, butik, akşam yemeği
- `culture`: Müze, tarihi mekan, sanat
- `wellness`: SPA, yoga, sağlıklı beslenme

**Yaş Grubu Kategorileri**:
- 0-2: Bebek (çocuk sınıfı: baby)
- 3-5: Küçük çocuk (preschooler)
- 6-8: Okul çocuğu (elementary)
- 9-12: Ergen (middle_school)

**Bütçe Segmentleri (TRY)**:
- Düşük: ≤ 2.000 TL/Gece
- Orta: 2.001-5.000 TL/Gece
- Yüksek: ≥ 5.001 TL/Gece

### 6.4. Çıktı Şeması

Sistem promptunun altındaki talimat, çıktı JSON'inin tam schema'sını belirtir (output schema'a bakın).

---

## 7. Alt Görev Akışı (Sub-task Workflow)

```
[User Input]
     ↓
1. Input Parsing ve Normalization
     ↓
2. Entity Extraction (LLM)
   - Trip purpose, tarih, süre, kişi sayısı, çocuk yaşları
   - Bütçe, vehicle, konaklama tercihi, engel ihtiyacı
     ↓
3. Rule-Based Validation
   - Enum kontrolü (vehicle, tripPurpose, accommodationType)
   - Sayısal sınırlar kontrolü (budget > 0, durationDays ≥ 1)
   - Çelişki kontrolü (check-in > check-out, bütçe yetersiz)
     ↓
4. Confidence Hesaplama
   - completeness × rule_compliance
   - missingFields, uncertainFields, conflictFlags
     ↓
5. TripProfile JSON üret
```

---

## 8. Karar Algoritması ve Puanlama Modeli

### 8.1. Confidence Skoru Hesaplama

```
completeness = (doldurulmuş_zorunlu_alan_sayısı) / (tüm_zorunlu_alan_sayısı)

rule_compliance = 1.0 - (çelişki_sayısı × 0.15) - (geçersiz_enum × 0.10)
  (minimum 0.0)

confidence.score = completeness × 0.7 + rule_compliance × 0.3
```

### 8.2. Çelişki Tespit Kuralları

| Kural ID | Kural | Varsayılan Aksiyon |
|----------|-------|-------------------|
| CF-01 | `startDate > endDate` | `conflictFlags += [date_range_invalid]` |
| CF-02 | `durationDays > 60` | `conflictFlags += [duration_exceeds_max]` |
| CF-03 | `budget.totalTRY ≤ 0` | `conflictFlags += [budget_invalid]` |
| CF-04 | `adults < 1` | `conflictFlags += [no_adult_traveler]` |
| CF-05 | `children` içinde yaş 0-17 dışı değer | `conflictFlags += [child_age_invalid]` |
| CF-06 | `vehicle.type` geçersiz enum | `conflictFlags += [vehicle_invalid]` |
| CF-07 | `budget.perPersonPerNightTRY > budget.totalTRY / durationDays × 2` | `conflictFlags += [budget_unrealistic]` |
| CF-08 | `durationDays` null ama `startDate`+`endDate` var | `duration_days_inferred` uyarısı |

---

## 9. Diğer Agentlarla İletişim Protokolü

### 9.1. Çıktı -> Girdi Elçekliliği

Trip Profile Agent'ın çıktısı şu agentların girdisidir:

| Consumer Agent | TripProfile alanı | Handoff Contract |
|---------------|-------------------|-----------------|
| Destination Research Agent | `tripPurpose`, `temporal.durationDays`, `budget.totalTRY`, `vehicle.type` | `TripProfileSummary` |
| Accommodation Agent | `travelers`, `budget.perPersonPerNightTRY`, `accommodationPreference`, `petFriendly`, `vehicle.type` | `AccommodationRequest` |
| Route Planner Agent | `travelers.children` (yaşlar), `vehicle.type`, `temporal.durationDays`, `accommodationPreference` | `RouteRequest` |
| Budget & Constraint Evaluator | `budget`, `temporal`, `vehicle` | `BudgetConstraint` |
| Orchestrator | `confidence`, `conflictFlags`, `warnings` | `ProfileReadiness` |

### 9.2. Profile Readyaness Kontrolü

Orchestrator, Trip Profile Agent'ın çıktısını şu kritere göre değerlendirir:

| Confidence | conflictFlags | Orchestrator Eylemi |
|-----------|---------------|-------------------|
| ≥ 0.80 | boş | Profil onay, diğer agentları devreye al |
| 0.50–0.80 | var/veya → | Eksik alanlar için kullanıcıya sor |
| < 0.50 | çelişki var → | Profili yeniden oluştur, kullanıcıyı yönlendir |

---

## 10. Hata Yönetimi ve Yedek Stratejiler

| Hata Tipi | Durum | Agent Davranışı |
|-----------|-------|----------------|
| Girdi çok kısa / boş | Kritik | confidence = 0.0, `missingFields` tüm zorunlu alanlar |
| Eksik tarih | Uyarı | `temporal.flexibility = "flexible"` kabul et, confidence düşür |
| Geçersiz enum | Kritik | `conflictFlags` ekle, enum'ı `any` veya default'a çevir |
| Çelişkili bütçe | Uyarı | `conflictFlags` ekle, `budgetFlexibility = "flexible"` öner |
| Hiçbir geçerli bilgi yok | Kritik | `confidence = 0.0` → Orchestrator kullanıcıya temel soruları sorar |

### 10.1. Retry Politikası

Trip Profile Agent LLM'ye dayalı bir aşamada olduğu için, retry şu kurallara göre çalışır:

- **3 kez retry** (TST-001 standardına göre)
- **Timeout**: 10 saniye (kısa, çünkü doğal dil işleme hızlı olmalı)
- **Cache**: Son kullanıcı girdisi aynı ise 5 dakika cache'ten dön
- **Failover**: LLM hata verirse, kural tabanlı fallback parser devreye girer

---

## 11. Cache ve Maliyet Optimizasyonu

| Kaynak | Cache Süresi | Maliyet Optimizasyonu |
|--------|-------------|---------------------|
| Aynı oturum içi tekrarlı girdi | 5 dakika | LLM çağrısı atla |
| Normalize edilmiş profil | 24 saat | Orchestrator tekrar request yapmasa |
| Kullanıcı profil kaydı | 30 gün | Geçmiş tatil analizinde kullan |

**Maliyet**: Tek bir LLM inference (~1.5K token) ≈ $0.001. 24 saatte 10.000 istek = $10.

---

## 12. Güven Puanı (Confidence)

Trip Profile Agent için confidence skoru şu faktörlerden oluşur:

- `%70`: Girdi eksiksizliği (completeness)
- `%30`: Kural uyumu (rule compliance, çelişki yokluğu)

Confidence < 0.50 → Orchestrator, kullanıcıyla ek bilgi toplayıp profili yeniden oluşturur.

---

## 13. Test Senaryoları

### 13.1. Fixture Listesi

| Fixture ID | Test Type | Senaryo | Durum |
|-----------|-----------|---------|-------|
| `profile-family-basic` | Contract | 2 yetişkin, 2 çocuk (6 ve 2 yaşında), 3 günlük Bodrum tatili, 30000 TL bütçe, özel araba | ✅ Hazır |
| `profile-solo-budget` | Contract | 1 yetişkin, 5 günlük günlük gezinti, 8000 TL bütçe, otobüs | ✅ Hazır |
| `profile-family-children` | Behavioral | Yaşlar 3 ve 5 → age_band doğru mı? | ✅ Hazır |
| `profile-negative-budget` | Behavioral | Bütçe -500 → conflict flag mı? | ✅ Hazır |
| `profile-last-minute` | Scenario | Tarih esnek, 2 günlük, düşük bütçe, son dakika | ✅ Hazır |
| `profile-ev-child` | Scenario | Elektrikli araç, yaş 2 çocuk, engelli erişim | ✅ Hazır |
| `profile-conflicting-dates` | Adversarial | startDate > endDate → uyarı mı? | ✅ Hazır |
| `profile-invalid-vehicle` | Adversarial | `vehicle.type = "uçak"` → conflict flag mı? | ✅ Hazır |
| `profile-missing-fields` | Adversarial | Sadece "tatil yapmak istiyorum" → confidence düşür mü? | ✅ Hazır |
| `profile-unrealistic-budget` | Scenario | 200 TL/gece ama butik otel istiyor | ✅ Hazır |
| `profile-elderly-accessibility` | Scenario | Yaşlı yolcu + engel gereksinimi | ✅ Hazır |
| `profile-pet-friendly` | Behavioral | Evcil hayvanlı tatil → petFriendly=true | ✅ Hazır |

Test sayısı: **12** (TST-001 minimum 100 agent testi standardı için, bu 12 fixture Tüm senaryoları kapsıyor; agent sayısı artdıkça toplam test sayısı 1000+ olacak).

### 13.2. Test Matrisi

| Test | Schema | Rule | LLM Review | Expected Result |
|------|--------|------|------------|-----------------|
| profile-family-basic | ✅ | ✅ | ✅ | confidence ≥ 0.85, tüm zorunlu alan dolu |
| profile-solo-budget | ✅ | ✅ | ✅ | tripPurpose=exploration, vehicle=public_transport |
| profile-family-children | ✅ | ✅ (age bands) | — | children[0].age_band=elementary, children[1].age_band=baby |
| profile-negative-budget | ✅ | ✅ (CF-03) | ✅ | conflictFlags=[budget_invalid], confidence ≤ 0.5 |
| profile-last-minute | ✅ | ✅ | ✅ | flexibility=month, duration_inferred |
| profile-ev-child | ✅ | ✅ | ✅ | vehicle.chargingNeeded=true, accessibilityRequired=true |
| profile-conflicting-dates | ✅ | ✅ (CF-01) | ✅ | conflictFlags=[date_range_invalid], confidence ≤ 0.5 |
| profile-invalid-vehicle | ✅ (reject) | ✅ (CF-06) | — | vehicle.type normalized → "any", conflictFlags=[vehicle_invalid] |
| profile-missing-fields | ✅ | ✅ | ✅ | confidence < 0.5, missingFields > 5 |
| profile-unrealistic-budget | ✅ | ✅ (CF-07) | ✅ | conflictFlags=[budget_unrealistic], budgetFlexibility=flexible |
| profile-elderly-accessibility | ✅ | ✅ | ✅ | elderlyCount ≥ 1, accessibilityNeeds dolu |
| profile-pet-friendly | ✅ | ✅ | — | petFriendly=true |

---

## 14. Başarı Metrikleri (Success Metrics)

| Metrik | Tanım | Hedef |
|--------|-------|-------|
| Schema Valid Rate | Çıktı JSON Schema'ya uyma oranı | %100 |
| Conflict Detection Rate | Çelişkili girdide uyarı verme oranı | ≥ 95% |
| Missing Field Detection | Eksik alanı doğru tespit etme oranı | ≥ 90% |
| Average Confidence (valid inputs) | Geçerli girdilerde confidence ortalaması | ≥ 0.80 |
| False Positive Rate | Geçerli girdide conflictFlag yapma | < 5% |
| Inference Latency | Tek bir profil oluşturma süresi | < 2 saniye |
| Cache Hit Rate | Tekrarlı girdide cache isabet oranı | ≥ 80% |

---

## 15. Loglama ve Gözlemlenebilirlik

Trip Profile Agent loglar şu event'leri kaydeder:

| Event | Severity | Log İçeriği |
|-------|----------|-------------|
| `profile_created` | INFO | profileId, confidence, missingFields |
| `conflict_detected` | WARN | conflictFlags, girdi özet |
| `field_inferred` | INFO | hangi alanın inferred olduğu |
| `input_poor_quality` | WARN | confidence < 0.3, kullanıcıya yönlendirme |
| `fallback_triggered` | INFO | LLM hatası, kural tabanlı fallback kullanıldı |

---

## 16. Versiyonlama

| Versiyon | Tarih | Değişiklik |
|----------|-------|-----------|
| v1.0 | 2026-08-06 | İlk specification |
