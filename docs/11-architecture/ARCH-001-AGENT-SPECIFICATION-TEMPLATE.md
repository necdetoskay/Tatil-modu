# Agent Specification Template (ARCH-001)

| Alan | Değer |
|---|---|
| Document ID | ARCH-001 |
| Sürüm | 1.0 |
| Durum | Onay Bekliyor |
| EOS Sürümü | EOS v1.0 |
| Bağımlılıklar | PRD-001, TST-001 |
| Son Güncelleme | 2026-08-06 |

---

## Amaç

Bu template, tatil-plan sistemindeki **her yeni agent'ın** tekrarlanabilir ve tutarlı specification oluşturmak içindir. Bir agent specification'ı bu 16 başlık altında tamlanmadan kodlanamaz.

---

## 16-Başlık Standard

Aşağıdaki şablonu kopyalayıp doldurun.

---

### 1. Kimlik ve Amaç

**Agent ID**: `xx-agent-name` (örn. `03-destination-research`)
**Sürüm**: v1.0
**Kısa Tanım**: Tek cümleyle ne yaptığı.

---

### 2. Sorumluluk Sınırı (Responsibility Boundary)

**✅ Yapar** (maksimum 5 madde)

**❌ Yapmaz** (maksimum 5 madde — başkalarının müsait alanlarını korumak)

---

### 3. Tetiklenme Koşulları (Trigger Conditions)

| Event | Tetikler |
|-------|----------|
| `orchestrator.request.destination` | Destination Research Agent devreye girer |
| `trip-profile.ready` | confidence ≥ 0.80 |

---

### 4. Girdi / Çıktı Sözleşmesi

**Girdi schema**: `tests/schemas/<agent-id>.input.json`
**Çıktı schema**: `tests/schemas/<agent-id>.output.json`

Girdi ve çıktı JSON Schema'ları burada dokümente edilir veya referans verilir.

---

### 5. Kullanılan Veri Kaynakları

| Kaynak Tip | Sağlayıcı | Güvenilirlik Sırası | Not |
|------------|----------|-------------------|-----|
| Resmî turizm sites | — | 1 | URL kaydı zorunlu |
| Google Maps | — | 2 | Geocoding + yol |
| TripAdvisor | — | 3 | Yorum |
| Booking | — | 4 | Otel fiyat |

> **Kural**: Agent, kaynağını bilinmeden kesin gerçek gibi sunmaz. Her veri parçasının `source` ve `confidence` alanı olur.

---

### 6. Kullanılan Tool'lar

| Tool | Amaç | Kullanım Kotaları | Güvenlik |
|------|------|------------------|---------|
| Web Search | — | 100 req/gg | Rate limit |
| Geocoding | — | 500 req/gg | API key |
| Directions API | — | 500 req/gg | API key |
| Places API | — | 1000 req/gg | API key |

---

### 7. Sistem Promptu

**Composable prompt katmanları:**

| Katman | Dosya | Açıklama |
|--------|-------|----------|
| Universal System Rules | `prompts/universal-system-rules.md` | Tüm agentlar için ortak |
| Agent Role Prompt | `prompts/<agent-id>-role.md` | Rol tanımı |
| Task-Specific Instruction | `prompts/<agent-id>-task.md` | Göreve özel |
| Output Schema | `schemas/<agent-id>.output.json` | Çıktı şeması |
| Quality Control | `prompts/<agent-id>-quality.md` | Kontrol |

Prompt uzunluğu: maksimum 500 satır (katmanlar ayrı olduğu sürece).

---

### 8. Alt Görev Akışı (Sub-task Workflow)

```
[Girdi]
  ↓
1. Entity Extraction (LLM)
  ↓
2. Deterministic Validation (Rule Engine)
  ↓
3. Scoring / Ranking
  ↓
4. Confidence Calculation
  ↓
[Çıktı]
```

---

### 9. Karar Algoritması ve Puanlama Modeli

**Puanlama formülü:**

```
score = w1×criterion1 + w2×criterion2 + ... + confidence
```

| Kriter | Ağırlık | Açıklama |
|--------|---------|----------|
| Location centrality | 0.25 | Merkeze yakınlık |
| Price fit | 0.20 | Bütçeye uygunluk |
| Cleanliness | 0.15 | Temizlik skoru |
| Review recency | 0.10 | Son 30 günlük yorum |
| Child-friendly | 0.10 | Çocuk skoru |
| Cancellation | 0.10 | İptal esnekliği |
| Parking | 0.10 | Otopark |
| **Toplam** | **1.00** | |

> Ağırlıklar kullanıcı profiline göre dinamik değişebilir.

**Confidence hesaplama:**

```
confidence = source_reliability × 0.6 + rule_compliance × 0.4
```

---

### 10. Diğer Agentlarla İletişim Protokolü

| Consumer Agent | Bu agent'dan alan | Handoff Contract |
|----------------|-------------------|-----------------|
| route-scheduler | DailyPlan → | `RouteInput` schema |
| budget-constraint | BudgetReport → | `BudgetInput` schema |

Bu agentdan **gelen** veri:

| Producer Agent | Gönderdiği alan |
|----------------|----------------|
| trip-profile | TripProfile |

---

### 11. Hata Yönetimi ve Yedek Stratejileri

| Hata | Durum | Davranış |
|------|-------|----------|
| Primary API çalışmıyor | Kritik | Failover: ikincil kaynağa geç |
| Timeout (>30s) | Kritik | Retry 3 kez, sonra fail |
| Düşük confidence (<0.5) | Uyarı | Orchestrator'a bildir |
| Çelişkili girdi | Kritik | conflictFlags, confidence düşür |

**Retry politikası**: 3 kez, exponential backoff (1s, 2s, 4s)
**Timeout**: 30 saniye
**Cache**: 24 saat (live mode için)

---

### 12. Cache ve Maliyet Optimizasyonu

| Kaynak | Cache Süresi | Maliyet (~$) |
|--------|-------------|-------------|
| API yanıtı | 24 saat | 0.002/req |
| LLM inference | 5 dakika | 0.001/req |
| Geocoding | 30 gün | 0.0005/req |

**Günlük maliyet tahmini**: 1000 profil × $0.01 = $10/gün

---

### 13. Güven Puanı (Confidence)

**Confidence =** `source_reliability × 0.6 + rule_compliance × 0.4`

| Source Reliability | Açıklama |
|-------------------|----------|
| 1.0 | Resmî site / doğrulanmış harita |
| 0.8 | Yüksek hacimli yorum platformu |
| 0.6 | Orta güvenilir |
| 0.3 | Düşük güvenilir (blog, forum) |
| 0.0 | Bilinmiyor |

**Confidence thresholds**:

| Range | Orchestrator Eylemi |
|-------|-------------------|
| 0.0 - 0.50 | Agent'ın çıktısı kullanılmaz, yeniden dene |
| 0.51 - 0.80 | Uyarı, alternatif agent devreye alınabilir |
| 0.81 - 1.00 | Kabul edilebilir |

---

### 14. Test Senaryoları

**Fixture listesi**: `tests/fixtures/` klasöründe

| Fixture ID | Test Type | Kısa Açıklama |
|-----------|-----------|---------------|
| `xxx-basic` | Contract | Happy path |
| `xxx-scenario1` | Scenario | Zor senaryo |
| `xxx-adversarial1` | Adversarial | Çelişkili girdi |

**Test matrisi**: `tests/test-matrix.md`

---

### 15. Başarı Metrikleri

| Metrik | Tanım | Hedef |
|--------|-------|-------|
| Schema Score | Çıktı şeması geçerlilik | 1.0 |
| Rule Compliance | Karar kurallarına uyma | ≥ 0.95 |
| Scenario Pass | Zor senaryolarda başarı | ≥ 0.90 |
| Adversarial Detection | Çelişkiyi yakalama | ≥ 0.90 |
| Average Confidence | Ortalama güven skoru | ≥ 0.80 |
| Live vs Fixture Delta | Canlı vs sabit fark | ≤ 0.10 |

---

### 16. Loglama ve Gözlemlenebilirlik

| Event | Severity | Log İçeriği |
|-------|----------|-------------|
| `agent.started` | INFO | agentId, trigger, inputRef |
| `agent.completed` | INFO | agentId, confidence, outputRef |
| `conflict.detected` | WARN | conflictFlags |
| `fallback.triggered` | INFO | primarySource, fallbackSource |
| `agent.failed` | ERROR | agentId, error, retryCount |

---

## Versiyonlama

| Versiyon | Tarih | Değişiklik |
|----------|-------|-----------|
| v1.0 | 2026-08-06 | İlk şablon |
