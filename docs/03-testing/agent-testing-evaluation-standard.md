# Agent Testing & Evaluation Standard

| Alan | Değer |
|---|---|
| Document ID | TST-001 |
| Sürüm | 1.1 |
| Durum | Onay Bekliyor |
| EOS Sürümü | EOS v1.0 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Tatil-Plan agentlarının **bağımsız, ölçülebilir, sürümlenebilir ve tekrarlanabilir** biçimde test edilmesini sağlar. Mobile uygulama bir vitrin iken, gerçek ürün agent sistemidir. Bu nedenle her agent'ın davranışı, güvenilirlik seviyesi ve hata yönetimi **kod yazılmadan önce** tanımlanmalı ve test edilmelidir.

## Temel ilke

> Bir agent başka agentlardan veri alsa bile test sırasında bu agentlar çalıştırılmaz. Agent'ın ihtiyaç duyduğu bütün girdileri hazır fixture (sabit veri) olarak veririz. Böylece sadece "çıkış formatı doğru mu?" değil, "davranış doğru mu?" sorusunu bağımsız test edebiliriz.

## Test modları

### Fixture Mode
Web, harita, hava durumu veya başka agent kullanılmaz. Unit, davranış, prompt, regresyon ve model karşılaştırma testleri için kullanılır.

### Live Tool Mode
Gerçek servisler kullanılır. Entegrasyon, güncellik, tool seçimi ve fallback davranışı ölçülür. CI'de varsayılan olarak çalıştırılmaz; `--live` flag ile aktifleştirilir.

### Hybrid Mode
Bazı girdiler fixture, bazıları canlı servislerden gelir.

## Zorunlu dosyalar

```text
docs/02-agents/agent-name/
  specification.md           ← 16 başlık standard (ARCH-001)
  input.schema.json          ← Girdi JSON Schema
  output.schema.json         ← Çıktı JSON Schema
  system-prompt.md           ← Composable prompt (5 katman)
  decision-rules.md          ← Deterministic rule engine
  tool-policy.md             ← Kullanılabilir tool'lar, kotalar, fallback
  handoff-contracts.md       ← Diğer agentlarla girdi/çıktı sözleşmeleri
  evaluation-rubric.md       ← Test değerlendirme kriterleri
  tests/
    fixtures/                 ← Test girdileri (.json)
    expected/                 ← Beklenen çıktılar
    schemas/                  ← JSON Schema dosyaları
    rubric/                   ← Test rubrikleri
    contract.test.ts          ← Schema + type + field testleri
    behavioral.test.ts       ← Rule compliance testleri
    scenario.test.ts          ← Zor senaryolar
    adversarial.test.ts      ← Çelişkili girdiler
```

## Test seviyeleri ve dört test türü

### 1. Schema Test
- JSON Schema'ya göre tipler, `required` alanlar, `additionalProperties: false`.
- **Geçme kuralı**: %100 geçmeli.

### 2. Contract Test
- Girdi/çıktı sözleşmesi doğru mu? Tipler doğru mu? Enum'lar geçerli mi?
- Confidence score 0-1 arasında mı? Kaynak referansları korumuş mu?

### 3. Behavioral Test
- Agent'ın decision-rules.md'deki kurallara uyduğunu doğrular.
- Örneğin: Yaş 6 çocuk → ageBand="elementary", yaş 2 → "baby"
- Negatif bütük → `conflicts` listesine `ACCOMMODATION_BUDGET_EXCEEDS_TOTAL` eklenir mi?

### 4. Decision Rule Test
- Her kural (CF-01, CF-02, vb.) ayrı ayrı test edilir.
- Rule engine deterministik olduğu için, aynı girdi → aynı çıktı garanti altındadır.

### 5. Scenario Test
| ID | Senaryo | Test Konusu |
|----|---------|-------------|
| S-01 | Normal aile tatili | Happy path |
| S-02 | Yağmur, 2. gün | Dinamik yeniden planlama |
| S-03 | Otel son anda iptal | Failover davranışı |
| S-04 | Bütçe %20 azalırsa | Budget kısıtlanması |
| S-05 | Yaşlı + engelli | Erişilebilirlik uyumu |
| S-06 | Son dakika | Zaman kısıtlaması |
| S-07 | Gastronomi odaklı | Lezzet tercihi |

### 6. Adversarial Test
Çelişkili veya yanıltıcı girdiler:

```json
{
  "hotelCheckIn": "14:00",
  "plannedHotelArrival": "10:30",
  "museumOpenHours": "10:00-17:00",
  "plannedMuseumVisit": "18:30",
  "dailyBudgetTRY": 3000,
  "plannedDailyCostTRY": 6200
}
```

Doğru davranış: planı **sessizce kabul etmek** değil; **violations listesine eklemek** ve/veya **yeniden planlamaktır**.

### 7. Regression Test
- Prompt veya kural değiştiğinde, eski testlerin aynı sonucu vermesini kontrol eder.
- Prompt sürümleme: `trip-profile-agent-prompt-v1.0.0` → `v1.1.0`

### 8. Live Integration Test
- Gerçek API servisleri kullanılır.
- `pnpm test -- --live` ile çalıştırılır.
- CI'de non-blocking; nightly cron.

## Değerlendirme (Triple Evaluation)

Her agent testi üç farklı motorla değerlendirilir:

| Motor | Sorumluluk | Metod |
|-------|-----------|-------|
| **Schema Validator** | Çıktının teknik olarak geçerli olup olmadığını kontrol eder | JSON Schema / Zod |
| **Rule Evaluator** | Bütçe, saat, çelişki ve kısıtları kodla kontrol eder | Deterministic rule engine |
| **LLM Reviewer** | Planın mantığı, rahatlığı ve öneri kalitesini değerlendirir | Structured prompt → puan + gerekçe |

**LLM Reviewer tek başına geçme/kalma kararı veremez.** Kod tabanlı kontroller ile birlikte kullanılmalıdır.

### Triple Evaluation Çıktısı

```json
{
  "schemaScore": 1.0,
  "ruleScore": 0.93,
  "reviewerScore": 0.86,
  "overallScore": 0.91,
  "passed": true,
  "violations": [],
  "reviewerNotes": "..."
}
```

## Puanlama

```text
Schema ve contract: %25
Kesin iş kuralları: %30
Senaryo başarısı: %20
LLM reviewer: %15
Maliyet ve performans: %10
```

## Geçme kriterleri

- Schema testleri **%100** geçmeli.
- Kritik iş kuralı hatası olmamalı.
- Genel skor en az **0.85** olmalı.
- Kritik testlerden biri başarısızsa agent **başarısız** sayılmalı.
- Kaynaksız kesin bilgi üretilmemeli.
- Handoff sözleşmeleri bozulmamalı.
- LLM Reviewer'ın puanı %15 ağırlıkta olduğundan, tek başına geçemez.

## Confidence

Confidence şu faktörlerden hesaplanır:

- veri tamlığı (completeness)
- açık bilgi oranı (explicit information ratio)
- çelişki (conflict penalty)
- doğrulama hatası (validation penalty)
- varsayım miktarı (assumption penalty)
- kaynak güvenilirliği (source reliability)
- güncellik (freshness)

Trip Profile Agent için örneklek formül:

```
completeness = (filled_required_fields) / (total_required_fields)
rule_compliance = 1.0 - (conflict_count × 0.15) - (invalid_enum × 0.10)
confidence = completeness × 0.7 + rule_compliance × 0.3
```

## Prompt sürümleme

Örnek:

```text
trip-profile-agent-prompt-v1.0.0
trip-profile-agent-prompt-v1.1.0
trip-profile-agent-prompt-v2.0.0
```

Her değişiklikte regresyon testleri yeniden çalıştırılır.

## Test Matrisi (Coverage Matrix)

### Trip Profile Agent

| Fixture ID | Test Type | Schema | Rule | LLM Review | Expected Outcome |
|-----------|-----------|--------|------|------------|-----------------|
| TPA-001 | Normal | ✅ | ✅ | ✅ | origin=Kocaeli, destination=Balıkesir, travelers=4, budget=30000 |
| TPA-002 | Missing Info | ✅ | ✅ | ✅ | budget=null, missingInformation includes "budget.amount" |
| TPA-003 | Normal | ✅ | ✅ | — | dates.mode=fixed, durationDays=3 |
| TPA-004 | Conflict | ✅ | ✅ | ✅ | conflicts: DATE_DURATION_MISMATCH, status=invalid |
| TPA-005 | Invalid Input | ✅ | ✅ | — | validationErrors: INVALID_CHILD_AGE |
| TPA-006 | Preference | ✅ | ✅ | ✅ | preferences.tripTypes[0].type=sea |
| TPA-007 | Preference | ✅ | — | ✅ | mustHaveFeatures includes free_parking |
| TPA-008 | Special Req. | ✅ | ✅ | ✅ | specialRequirements: beach.hard=true |
| TPA-009 | Context Conflict | ✅ | ✅ | ✅ | adults=1, conflicts: CURRENT_MESSAGE_CONTEXT_CONFLICT |
| TPA-010 | Date Flexibility | ✅ | ✅ | — | dates.agentMayRecommendDates=true |
| TPA-011 | Budget Scope | ✅ | ✅ | — | budget.scope=accommodation_only |
| TPA-012 | Budget Conflict | ✅ | ✅ | ✅ | conflicts: ACCOMMODATION_BUDGET_EXCEEDS_TOTAL |
| TPA-013 | EV | ✅ | — | ✅ | transportation.vehicleType=electric_car |
| TPA-014 | Accessibility | ✅ | ✅ | ✅ | mustHaveFeatures includes step_free_access, accessible_bathroom |
| TPA-015 | Critical Missing | ✅ | ✅ | ✅ | status=invalid, confidence < 0.5 |

**Coverage**: 15 fixture, 4 adversarial, 7 scenario, 4 behavioral. Schema coverage: 100%.

## Yayın kapısı

Bir agent ancak:
1. Kritik testleri geçmiş,
2. Handoff sözleşmeleri doğrulanmış,
3. En az bir canlı entegrasyon testi yapılmış,
4. Maliyet sınırları doğrulanmışsa

üretime alınabilir.
