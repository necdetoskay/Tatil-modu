# Trip Profile Agent Specification

| Alan | Değer |
|---|---|
| Document ID | AGENT-002 |
| Sürüm | 1.1 |
| Durum | Review |
| EOS Sürümü | EOS v1.0 |
| Test Standard | TST-001 |
| Bağımlılıklar | PRD-001, ARCH-001 |
| Son Güncelleme | 2026-08-06 |

## 1. Kimlik

- **Agent ID**: `trip-profile-agent`
- **Sürüm**: `1.0.0`
- **Tip**: analiz ve veri yapılandırma agentı
- **Prompt ID**: `trip-profile-agent-prompt-v1.0.0`

## 2. Amaç

Kullanıcının serbest metin tatil talebini diğer agentların kullanabileceği yapılandırılmış **TripProfile** çıktısına dönüştürür.

## 3. Sorumluluklar

- ✅ Kullanıcı mesajındaki tarih, süre, kişi sayısı, çocuk yaşları, bütçe, ulaşım, konaklama ve özel gereksinimleri çıkarır
- ✅ Eksik bilgileri `missingInformation` alanına yazar
- ✅ Çelişkileri `conflicts` alanına yazar
- ✅ Geçersiz verileri `validationErrors` alanına yazar
- ✅ Varsayımları `assumptions` alanında ayırır
- ✅ Güncel kullanıcı mesajını eski bağlamdan öncelikli kabul eder
- ✅ Confidence değerini veri tamlığı ve belirsizliğe göre hesaplar
- ✅ Standart JSON üretir (output.schema.json'ye uygun)

## 4. Sorumluluk dışı

- ❌ Rota üretme
- ❌ Otel / restoran araştırması
- ❌ Hava durumu kontrolü
- ❌ Web araması
- ❌ Bütçe dağılımı (sadece çıkarma)
- ❌ Rezervasyon
- ❌ Kimlik doğrulama / oturum yönetimi

## 5. Girdi / Çıktı Sözleşmesi

### 5.1. Girdi (input.schema.json)

```json
{
  "schemaVersion": "1.0.0",
  "requestId": "string",
  "locale": "tr-TR",
  "userMessage": "string",
  "knownUserContext": { ... },
  "previousTripProfile": { ... },
  "runtimeContext": {
    "currentDate": "YYYY-MM-DD",
    "timezone": "Europe/Istanbul",
    "channel": "test|web|mobile|api",
    "testMode": false
  }
}
```

### 5.2. Çıktı (output.schema.json)

Zorunlu alanlar:

```
schemaVersion, agent, requestId, status, tripProfileId,
origin, destination, travelParty, dates, transportation,
budget, preferences, familyConstraints, specialRequirements,
missingInformation, assumptions, conflicts, validationErrors,
clarificationPriority, sourceTrace, confidence, confidenceFactors
```

### 5.3. Durumlar

| Durum | Tanım |
|-------|-------|
| `complete` | Temel bilgiler yeterli |
| `partial` | Plan yapılabilir fakat önemli eksikler var |
| `invalid` | Kritik eksik, geçersiz veri veya çözülemeyen çelişki var |

## 6. Karar Kuralları (Decision Rules)

### 6.1. Kaynak Önceliği

```text
current_user_message      ← en yüksek öncelik
previous_trip_profile     ← fallback
known_user_context        ← ek bağlam
inference                 ← en düşük öncelik, varsayılan
```

Güncel mesaj eski bağlamla çelişirse güncel mesaj kullanılır ve çelişki raporlanır (`CURRENT_MESSAGE_CONTEXT_CONFLICT`).

### 6.2. Çocuk Yaş Grupları

```text
0–1  infant
2    toddler
3–5  preschool
6–12 child
13–17 teenager
```

Negatif yaş veya 18+ değer çocuk olarak kabul edilmez (`INVALID_CHILD_AGE`).

### 6.3. Toplam Kişi

```text
totalTravelers = adults + children.length
```

### 6.4. Tarih ve Süre

- Sabit tarih aralığının dahil gün sayısı ve belirtilen süre uyuşmazsa:
  - code: `DATE_DURATION_MISMATCH`
  - severity: `high`
  - resolution: `ask_user`
- `agentMayRecommendDates = true` ise, tarih esnektir ve agent önerebilir.

### 6.5. Bütçe

- Sıfır veya negatif bütçe geçersizdir (`budget_invalid`).
- Yalnızca otel bütçesi verilirse scope `accommodation_only` olur.
- Otel bütçesi toplam bütçeyi aşarsa `ACCOMMODATION_BUDGET_EXCEEDS_TOTAL` üretilir.
- `TL` ifadesi `TRY` olarak normalize edilir.

### 6.6. Varsayım

Çocuk yaşına göre dinlenme veya bebek arabası uygunluğu olasılık olarak işaretlenebilir; kesin rutin uydurulamaz.

### 6.7. Görev Sınırı

Agent rota, tarih seçimi, otel, restoran veya fiyat önerisi üretmez.

## 7. Confidence Hesaplama

```
completeness = (doldurulmuş_zorunlu_alan_sayısı) / (toplam_zorunlu_alan_sayısı)

conflict_penalty = min(1.0, conflict_count × 0.15)
validation_penalty = min(1.0, validation_error_count × 0.10)
assumption_penalty = min(0.5, assumption_count × 0.05)

confidence = completeness × 0.7
           - conflict_penalty
           - validation_penalty
           - assumption_penalty

confidence = max(0.0, min(1.0, confidence))
```

### Confidence Thresholds

| Range | Orchestrator Eylemi |
|-------|-------------------|
| 0.0 – 0.50 | Profil yetersiz, kullanıcıdan temel sorular sor |
| 0.51 – 0.80 | Uyarı, takip soruları |
| 0.81 – 1.00 | Profil onay, diğer agentlar devreye alınabilir |

## 8. Diğer Agentlarla İletişim (Handoff Contracts)

### 8.1. Çıktı → Diğer Agentlar

| Consumer Agent | TripProfile alanları | Handoff Contract |
|----------------|---------------------|-----------------|
| Destination Research Agent | `budget.totalTRY`, `dates.durationDays`, `preferences.tripTypes`, `transportation.vehicleType` | `TripProfileSummary` |
| Accommodation Agent | `travelParty`, `budget`, `preferences.mustHaveFeatures`, `budget.scope` | `AccommodationRequest` |
| Route Planner Agent | `travelParty.children` (yaşlar), `transportation.vehicleType`, `dates.durationDays` | `RouteRequest` |
| Budget Evaluator | `budget` | `BudgetConstraint` |
| Orchestrator | `status`, `confidence`, `conflicts`, `validationErrors`, `missingInformation`, `clarificationPriority` | `ProfileReadiness` |

### 8.2. Diğer Agentlardan Girdi

| Producer Agent | Trip Profile Agent'a sağladığı |
|---------------|-------------------------------|
| (hiçbiri) | Trip Profile, sistemdeki ilk agent'tır; dış girdi almaz |

### 8.3. Handoff Contract: ProfileReadiness (Orchestrator → bu agent sonrası)

```json
{
  "tripProfileId": "string",
  "status": "complete|partial|invalid",
  "confidence": 0.0-1.0,
  "conflictCount": 0,
  "validationErrorCount": 0,
  "missingFieldCount": 0,
  "canProceed": true|false,
  "reason": "string"
}
```

---

## 9. Hata Yönetimi ve Yedek Stratejileri

| Hata | Durum | Davranış |
|------|-------|----------|
| LLM inference hatası | Kritik | Fallback: keyword-based extraction |
| Girdi çok kısa / boş | Kritik | `missingInformation` tümü, confidence = 0.0 |
| Geçersiz enum | Kritik | `validationErrors` ekle, normalize et |
| Çelişkili tarih | Kritik | `conflicts` ekle, confidence düşür |
| Bütçe aşımı | Kritik | `conflicts.ACCOMMODATION_BUDGET_EXCEEDS_TOTAL` |

**Retry politikası**: 3 kez
**Timeout**: 10 saniye
**Cache**: Aynı `requestId` için 5 dakika

---

## 10. Test Senaryoları

15 fixture test (TPA-001 → TPA-015). Detaylar [tests/README.md](tests/README.md) ve [evaluation-rubric.md](evaluation-rubric.md) dosyalarında.

| Fixture | Kategori | Kritik | Açıklama |
|---------|----------|--------|----------|
| TPA-001 | normal | ✅ | Temel çocuklu aile tatili |
| TPA-002 | missing_information | ✅ | Bütçe belirtilmemiş |
| TPA-003 | normal | ✅ | Sabit tarih uyumlu |
| TPA-004 | conflict | ✅ | Tarih-süre çelişkisi |
| TPA-005 | invalid_input | ✅ | Negatif çocuk yaşı |
| TPA-006 | preference | ✅ | Tatil öncelikleri |
| TPA-007 | preference | ❌ | Konaklama ve otopark |
| TPA-008 | special_requirement | ✅ | Muhafazakâr tesis |
| TPA-009 | context_conflict | ✅ | Güncel mesaj bağlamı çelişiyor |
| TPA-010 | date_flexibility | ✅ | Esnek tarih |
| TPA-011 | budget | ✅ | Konaklama bütçesi |
| TPA-012 | conflict | ✅ | Bütçe çelişkisi |
| TPA-013 | transportation | ❌ | Elektrikli araç |
| TPA-014 | accessibility | ✅ | Erişilebilirlik |
| TPA-015 | critical_missing | ✅ | Yetersiz talep |

---

## 11. Başarı Metrikleri

| Metrik | Tanım | Hedef |
|--------|-------|-------|
| Schema Validity | Çıktı JSON Schema'ya uyma | %100 |
| Information Extraction Accuracy | Bilgi çıkarma doğruluğu | ≥ %98 |
| Child Ages | Yaş doğruluğu | 100% |
| Budget Extraction | Bütçe çıkarma | ≥ %99 |
| Conflict Detection | Çelişki tespit | ≥ %95 |
| Assumption Rate | Uydurma tercih oranı | ≤ %1 |
| Test Coverage | Test edilen kod/kural yüzdesi | ≥ 90% |

## 12. Versiyonlama

| Sürüm | Tarih | Değişiklik |
|-------|-------|-----------|
| v1.0 | 2026-08-06 | İlk specification |
| v1.1 | 2026-08-06 | ARCH-001 template entegrasyonu, handoff contract, confidence hesaplama |
