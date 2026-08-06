# Agent Testing & Evaluation Standard

| Alan | Değer |
|---|---|
| Document ID | TST-001 |
| Sürüm | 1.0 |
| Durum | Taslak (Review) |
| EOS Sürümü | EOS v1.0 |
| Bağımlılıklar | ARCH-001 (Agent Specification Template), PRD-001 (Product Vision) |
| Son Güncelleme | 2026-08-06 |

## Amaç

Bu doküman, tatil-plan agent sisteminin **her bir agent'ını** bağımsız, deterministik ve tekrarlanabilir biçimde test etmek ve değerlendirmek için kanonik standardı tanımlar.

Mobile uygulama bir vitrin (vitrin) iken, gerçek ürün onlarca uzman agent'ın karar mekanizmasıdır. Dolayısıyla **her agent'ın davranışı, güvenilirlik seviyesi ve hata yönetimi** kod yazılmadan önce tanımlanmalı ve test edilmelidir.

### Temel İlke

> **Agent, dış dünyadan doğrudan veri almak zorunda kalmadan test edilebilir olmalıdır. Agent'ın ihtiyaç duyduğu bütün girdileri hazır fixture (sabit veri) olarak veririz. Böylece sadece "çıkış formatı doğru mu?" değil, "davranış doğru mu?" sorusunu bağımsız test edebiliriz.**

---

## 1. Test Felsefesi

### 1.1. Belgesel Tanım

Agent testleri, agentın **belirtilen davranış kontratına (specification)** göre doğru çalışıp çalışmadığını doğrular. Test, agentın "iyi bir seyahat danışmanı" olup olmadığını değil, "**belirlenen kurallara ve kısıtlara göre mi karar verdiğini**" kontrol eder.

### 1.2. Dört Test Seviyesi

| Seviye | Tür | Açıklama | Soru |
|-------|-----|----------|------|
| **1** | Contract Test | Girdi/çıktı şeması ve tipler doğru mu? | "Gelen veriyi doğru okuyor mu ve beklenen JSON'de cevap veriyor mu?" |
| **2** | Behavioral Test | Görev kurallarına uyuyor mu? | "Çocuklu aile rota planında iki yaşındaki çocukla art arda dört uzun etkinlik koymuyor mu?" |
| **3** | Scenario Test | Zor senaryolarda doğru tepki veriyor mu? | "Yağmur, otel iptali, bütçe azalması gibi durumlarda planı yeniden yapıyor mu?" |
| **4** | Adversarial Test | Çelişkili/yanlış girdilerde hata mı veriyor, yoksa sessizce kabul mı ediyor? | "Check-in 14:00 ama oteline 10:30 varış planı yapıyorsa uyarı mı veriyor?" |

### 1.3. Üçlü Değerlendirme Sistemi (Triple Evaluation)

Her agent testinde üç farklı mekanizma paralel çalışır:

| Motor | Sorumluluk | Metod |
|-------|-----------|-------|
| **Schema Validator** | Çıktının teknik olarak geçerli olup olmadığını kontrol eder. | JSON Schema / Zod validasyonu |
| **Rule Evaluator** | Bütçe, saat, mesafe ve kısıtları kodla kontrol eder. | Deterministic rule engine |
| **LLM Reviewer** | Planın mantığı, rahatlığı ve öneri kalitesini değerlendirir. | Structured prompt → puan + gerekçe |

**Örnek çıktı:**

```json
{
  "schemaScore": 1.0,
  "ruleScore": 0.93,
  "reviewerScore": 0.86,
  "overallScore": 0.91,
  "passed": true,
  "violations": [],
  "reviewerNotes": "Plan mantıklı ama günlük 3. günde yürüyüş süresi fazla."
}
```

**Geçme kuralı**: `passed = true` için tüm üç skor ≥ 0.70 ve `schemaScore = 1.0` (zorunlu). `schemaScore < 1.0` durumunda otomatik başarısız.

---

## 2. Çalışma Modları

### 2.1. Fixture Mode (Fixture)

- Bütün girdiler önceden hazırlanmış JSON fixture'lardan gelir.
- Hiçbir web arama, API çağrısı veya harici servis kullanılmaz.
- **Avantajları**: Hızlı, ucuz, tekrarlanabilir, dış servis bozulmalarından etkilenmez.
- **Kullanım**: Unit test, behavioral test, scenario test, adversarial test — test piramidinin %90'ı.

### 2.2. Live Mode

- Gerçek tool ve API'ler kullanılır: harita servisi, hava durumu, otel kaynağı, yorum platformları.
- **Avantajları**: Gerçek veri güncelliği ve entegrasyon doğrulaması.
- **Dezavantajları**: Yavaş, ücretli, dış servis değişebilir.
- **Kullanım**: E2E integration test, veri güncelliği kontrolü, canary deployment.
- **Kural**: Live mod testleri **asıl test suite'inden ayırt edilmelidir**. CI'de varsayılan olarak çalıştırılmaz; sadece `--live` flag ile aktifleştirilir.

---

## 3. Test Dosyası Standarları

### 3.1. Dizin Yapısı

```
agents/<agent-name>/
├── specification.md          ← Agent teknik tanımı (TST-001'e göre)
├── input.schema.json         ← Girdi JSON Schema
├── output.schema.json        ← Çıktı JSON Schema
├── system-prompt.md          ← Kullanılan sistem promptu (versiyonlu)
├── decision-rules.md         ← Karar kuralları, puanlama modeli
├── tests/
│   ├── fixtures/             ← Girdi test verileri (.json)
│   │   ├── <scenario-name>.json
│   │   └── ...
│   ├── expected/             ← Beklenen çıktılar (rule/scenario bazında)
│   │   └── <scenario-name>.expected.json
│   ├── rubric/               ← Test değerlendirme kriterleri
│   │   ├── contract-rubric.md
│   │   ├── behavioral-rubric.md
│   │   ├── scenario-rubric.md
│   │   └── adversarial-rubric.md
│   ├── contract.test.ts      ← Schema + type + field testleri
│   ├── behavioral.test.ts    ← Rule compliance testleri
│   ├── scenario.test.ts      ← Zor senaryo testleri
│   └── adversarial.test.ts   ← Çelişkili girdi testleri
└── README.md                 ← Bu agent için test özet, coverage, son durum
```

### 3.2. Fixture Format Standartları

Her fixture şu meta verileri içerir:

```json
{
  "fixtureId": "trip-profile-family-rainy",
  "agentName": "trip-profile",
  "testType": "scenario",
  "description": "Yağmurlu hafta sonu tatil planı — aile 3 günlük Bodrum tatili yapacak",
  "createdAt": "2026-08-06",
  "version": "1.0",
  "tags": ["rainy", "family", "domestic-travel", "3-days"],
  "input": { ... },
  "expectedOutput": { ... }
}
```

- **`fixtureId`**: Tek tek eşsiz, test loglarında referans.
- **`testType`**: `contract`, `behavioral`, `scenario`, `adversarial`.
- **`tags`**: Senaryo kategorileri (aile, yağmur, bütçe, engel, vb.).
- **`input`**: Agent'ın aldığı ham veri.
- **`expectedOutput`**: Beklenen çıktı yapısı (rule/scenario bazında kısmi).

---

## 4. Test Tipleri Detaylı Açıklama

### 4.1. Contract Test (Seviye 1)

**Amaç**: Agent'ın girdi/çıktı sözleşmesini yerine getirdiğini doğrulamak.

**Kontroller**:

- ✅ Zorunlu alanlar (`required`) mevcut mu?
- ✅ Tipler doğru mu? (örn. `children` array, `budgetTRY` number)
- ✅ Tanımsız alan üretmedi mi? (`additionalProperties: false`)
- ✅ Confidence değeri 0–1 arasında mı?
- ✅ Enum değerleri geçerli mi? (örn. `vehicleType`: `private_car`, `public_transport`, `walking`)
- ✅ Kaynak referansları (`sources`) doğru formatta mı?
- ✅ Çıktıdaki zorunlu alanlar (`days`, `warnings`, `confidence`) hep mevcut mu?

**Test dosyası**: `contract.test.ts`

### 4.2. Behavioral Test (Seviye 2)

**Amaç**: Agent'ın sistem promptu, karar kuralları ve puanlama modeline göre davrandığını doğrulamak.

**Örnek kontrol listesi** (Route Planner için):

- ✅ Üç günlük plan üretildi mi?
- ✅ Çocuklu aile için öğle dinlenmesi bırakıldı mı?
- ✅ Yaşı 2 olan çocukla art arda 4 uzun etkinlik yapıldı mı? (Hayır olmalı)
- ✅ Otel check-in saatinden önce otelde kalma planı var mı? (Hayır olmalı)
- ✅ Günlük sürüş süresi 4 saatten fazla mı? (Limit kontrolü)
- ✅ Kapalı mekânı açık saatlerinde dışarıda planlandı mı?

**Test dosyası**: `behavioral.test.ts`

> **Not**: Behavioral testler, `expected/` klasöründeki "kural tablosu" (rule table) dosyalarını okur ve her kural için boolean assertion yapar.

### 4.3. Scenario Test (Seviye 3)

**Amaç**: Gerçek dünya senaryolarında agent'ın dayanıklılığını test etmek.

**Senaryo koleksiyonu** (örnek):

| ID | Senaryo | Test Konusu |
|----|---------|-------------|
| S-01 | Normal güneşli tatil | Happy path |
| S-02 | İkinci gün yağmur | Hava durumuna göre yeniden planlama |
| S-03 | Otelin son anda iptal olması | Failover davranışı |
| S-04 | Restoranın kapalı çıkması | Alternatif öneri |
| S-05 | Bütçenin %20 azalması | Budget kısıtlanması |
| S-06 | Çocuğun yürüyememesi | Erişilebilirlik uyumu |
| S-07 | Plajın rüzgâr nedeniyle uygun olmaması | Outdoor alternatifi |
| S-08 | Son dakika tatili | Zaman kısıtlaması |
| S-09 | Kalabalıktan kaçınan kullanıcı | Az yoğunluk tercihi |
| S-10 | Gastronomi odaklı gezi | Lezzet odaklı alternatif |

**Test dosyası**: `scenario.test.ts`

> Her senaryo için `fixtures/<scenario-id>.json` ve `expected/<scenario-id>.expected.json` dosyaları bulunur.

### 4.4. Adversarial Test (Seviye 4)

**Amaç**: Çelişkili, yanıltıcı veya kötü niyetli girdilerde agent'ın doğru tepki vermesini sağlamak.

**Örnek adversarial girdiler**:

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

**Doğru davranış**: Bu planı **sessizce kabul etmek** değil; **violations listesine eklemek** ve/veya **yeniden planlamak**.

**Kontrol**:

- ✅ Agent çelişkiyi fark ettikten sonra `constraintViolations` doldurdu mu?
- ✅ Confidence skoru düştü mü?
- ✅ Hata mesajı / uyarı üretti mi?
- ✅ Agent "bunca kadar fiyat kazandırdım ama 6200 TL oldu" gibi açıklaması yapıyor mu?

**Test dosyası**: `adversarial.test.ts`

---

## 5. Handoff Contract Testing (Agentlar Arası)

Agentlar birbirlerinin çıktılarını girdi olarak kullanır. Bu bağlantı **"handoff contract"** ile tanımlanır.

### 5.1. Handoff Contract Formatı

```json
{
  "fromAgent": "weather-agent",
  "toAgent": "route-planner-agent",
  "contractName": "WeatherAssessment",
  "inputSchemaRef": "schemas/weather-assessment.input.json",
  "requiredFields": ["location", "date", "condition", "precipitationProbability", "outdoorSuitability", "confidence"],
  "optionalFields": ["recommendedTimeWindows", "sources"],
  "validValues": {
    "condition": ["sunny", "cloudy", "rain", "storm"],
    "outdoorSuitability": ["excellent", "good", "fair", "poor"]
  }
}
```

### 5.2. Bağımsızlık Garantisi

- Weather Agent'ı test ederken Route Planner'a ihtiyaç duyulmaz.
- Route Planner'ı test ederken Weather Agent gerçekleştirilmez.
- Weather Agent'ın çıktısı fixture olarak Route Planner'ın girdisi olarak verilir.

### 5.3. Contract Test

Her handoff contract için ayrı bir **contract test** yazılır:

```typescript
test('WeatherAssessment → RoutePlanner input contract', () => {
  const weatherOutput = loadFixture('weather-agent/output/rainy-day.json');
  const { valid, errors } = validateHandoff('WeatherAssessment', weatherOutput);
  expect(valid).toBe(true);
  if (errors.length > 0) fail(formatErrors(errors));
});
```

---

## 6. Başarı Metrikleri (Metrics)

### 6.1. Agent Seviyesi

| Metrik | Açıklama | Hedef |
|--------|----------|-------|
| Schema Score | Çıktı şeması geçerlilik oranı | 100% |
| Rule Compliance | Karar kurallarına uyma oranı | ≥ 98% |
| Scenario Pass Rate | Zor senaryolarda doğru yanıt verme oranı | ≥ 95% |
| Adversarial Detection | Çelişkili girdide uyarı verme oranı | ≥ 90% |
| Average Confidence | Üretilen planların güven skoru ortalaması | ≥ 0.80 |
| Live vs Fixture Delta | Canlı ve fixture mode skorları arasındaki fark | ≤ 0.10 |
| Test Coverage | Test edilen karar yolu yüzdesi | ≥ 90% |

### 6.2. Sistem Seviyesi

| Metrik | Açıklama | Hedef |
|--------|----------|-------|
| E2E Plan Quality | Orchestrator tarafından üretilen nihai plan puanı | ≥ 0.85 |
| Constraint Violation Rate | Nihai planda kısıtlama ihlal oranı | < 2% |
| Recovery Success Rate | Hata sonrası yeniden planlama başarı oranı | ≥ 90% |
| Average Planning Latency | Nihai plan üretilmeye ortalama süre | < 5 saniye (fixture), < 30 saniye (live) |

---

## 7. Test Matrisi (Coverage Matrix)

### 7.1. Trip Profile Agent — Test Matrisi

| Test Türü | Senaryo | Fixture ID | Schema | Rule | LLM Review | Durum |
|-----------|---------|-----------|--------|------|------------|-------|
| Contract | Aile profili temel doğruluk | `profile-family-basic` | ✅ | — | — | Hazır |
| Contract | Bireysel gezgin | `profile-solo-budget` | ✅ | — | — | Hazır |
| Behavioral | Çocuk yaşları 3-12 arası | `profile-family-children` | ✅ | ✅ (age validation) | ✅ | Hazır |
| Behavioral | Bütçe negatif olamaz | `profile-negative-budget` | ✅ | ✅ (budget > 0) | — | Hazır |
| Scenario | Son dakika tatil | `profile-last-minute` | ✅ | ✅ | ✅ | Hazır |
| Scenario | Elektrikli araç + 2 çocuk | `profile-ev-child` | ✅ | ✅ | ✅ | Hazır |
| Adversarial | Çelişkili tarih aralığı | `profile-conflicting-dates` | ✅ | ✅ (detect conflict) | ✅ | Hazır |
| Adversarial | Tanımsız vehicle tipi | `profile-invalid-vehicle` | ✅ (reject) | — | — | Hazır |

### 7.2. Agent Bazlı Coverage

Her yeni agent eklendikten sonra, bu matris buna göre güncellenir. Matriksiz agent **kodlanamaz**.

---

## 8. Test Çalıştırma ve CI Entegrasyonu

### 8.1. Komutlar

```bash
# Sadece fixture modda tüm testler (hızlı, varsayılan)
pnpm test

# Belirli bir agentın testleri
pnpm test -- --agent trip-profile

# Sadece contract testler
pnpm test -- --level contract

# Live mod (entegrasyon testi — yavaş, API gerektirir)
pnpm test -- --live

# Triple evaluation raporu
pnpm test -- --report triple-eval
```

### 8.2. CI Pipeline

```
1. Schema validation (Zod/JSON Schema)
2. Rule evaluation (deterministic)
3. LLM Reviewer (optional — sadece --review flag)
4. Coverage report (her agent için)
5. Score aggregation → dashboard
```

Live testler CI'de çalıştırılmaz. Canary ya da nightly cron ile çalıştırılır.

---

## 9. Bağımlılıklar ve İlgili Dokümanlar

| Doküman | ID | Açıklama |
|---------|-----|----------|
| Agent Specification Template | ARCH-001 | Her agent'ın tekrarlayan yapısı |
| Product Vision & Scope | PRD-001 | Ürün sınırları ve kapsamı |
| Agent Catalog | ARCH-002 | Tüm agentların listesi ve sorumlulukları |
| Tool Catalog | ARCH-003 | Kullanılabilir araçlar ve kotaları |
| Decision Engine | ARCH-004 | Puanlama modeli ve karar kuralları |

---

## 10. Versiyonlama ve Değişiklik Yönetimi

- Test standardı versiyonu tutulur (`v1.0`, `v1.1`).
- Test senaryoları yeni agent veya kural eklendikçe genişletilir.
- Her değişiklik ADR formatında kaydedilir.
- Mevcut testlerde **regresyon** testi yapılır — yeni bir değişiklik eski testi kırmamalı.

---

## 11. Backlog

- Test veri seti oluşturma otomasyonu (fixture generator).
- LLM Reviewer için rubric standardizasyonu.
- Cross-agent integration test harness geliştirme.
- Live mod için canary deployment stratejisi.
