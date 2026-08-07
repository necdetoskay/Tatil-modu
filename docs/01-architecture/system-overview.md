# Tatil Modu — Pre-Freeze Agent System Overview

## Architecture Review durumu

**Canonical status:** Bu doküman pre-freeze mimari referanstır.

Architecture Freeze öncesi güncel canonical baseline `../08-architecture-baseline/` altında tutulur. İsimlendirme, ownership, platform sınırı veya katman modeli çakışmalarında `../08-architecture-baseline/README.md` ve ilgili ARF kararları önceliklidir.

Bu dosya eski agent akışını ve başlangıç tasarım niyetini korur; yeni mimari kararların tek kaynağı değildir.

## 1. Amaç

Tatil Modu, kullanıcının seyahat isteğini güncel ve doğrulanabilir verilerle uygulanabilir bir tatil planına dönüştüren agent tabanlı bir karar sistemidir.

Sistem yalnızca yer listesi üretmez. Kullanıcı profili, tarih, bütçe, ulaşım, çocukların yaşları, özel ihtiyaçlar, hava, çalışma saatleri, yorum eğilimleri ve rota yükünü birlikte değerlendirir.

## 2. Güncel mimari yönlendirme

Bu dokümandaki eski üç katmanlı anlatım artık canonical mimari modeli temsil etmez.

Architecture Freeze öncesi canonical baseline şu katman ayrımını kullanır:

```text
Product / User Experience
        ↓
Orchestration & Runtime
        ↓
Domain Agents / Planners
        ↓
Travel Intelligence Modules
        ↓
Travel Knowledge Store
        ↓
Data Source & Trust
        ↓
Capability Platform / Tool Gateway
        ↓
Providers / Local / Offline / Fixtures

Cross-cutting:
Knowledge Platform
Security
Observability
Evaluation
Governance
Configuration
Data Lifecycle
Version & Compatibility
```

Bu ayrım özellikle şu ARF kararlarına bağlıdır:

- ARF-001 — Knowledge Platform ile Travel Knowledge Store ayrıdır.
- ARF-002 — Verification Platform, Data Source & Trust'ın runtime façade katmanıdır.
- ARF-004 — Travel Intelligence bileşenleri agent değil domain assessment module'dür.
- ARF-005 — Tool Adapter standardı Capability Platform / Tool Gateway altında provider adapter sözleşmesidir.

## 3. Eski üç katmanlı modelin durumu

Önceki tasarım üç katmanlı özet kullanıyordu:

```text
Kullanıcı ve Uygulama Katmanı
            ↓
Orchestrator ve Karar Katmanı
            ↓
Uzman Agentlar ve Tool Katmanı
```

Bu model artık yalnızca tarihsel/pre-freeze sadeleştirme olarak korunur. Güncel mimaride agent, planner, intelligence module, knowledge store, trust layer ve capability platform ayrı ownership sınırlarına sahiptir.

### Kullanıcı ve uygulama katmanı

- kullanıcı talebini toplar,
- gerekli tercihleri gösterir,
- plan alternatiflerini sunar,
- kullanıcı revizyonlarını kaydeder.

### Orchestrator ve karar katmanı

- görevi parçalara ayırır,
- doğru agentları çalıştırır,
- agent girişlerini hazırlar,
- çıktıları doğrular,
- çelişkileri çözer,
- yeniden çalışma gerekip gerekmediğine karar verir,
- nihai planı oluşturur.

### Uzman agent ve tool katmanı

- profil çıkarma,
- destinasyon keşfi,
- konaklama,
- yeme-içme,
- gezilecek yer,
- yorum analizi,
- hava,
- rota,
- bütçe,
- kalite doğrulama

gibi uzman görevleri yerine getirir.

## 4. Tasarım ilkeleri

### 4.1 Agent yerine önce sözleşme

Her agent için önce giriş/çıkış şeması ve handoff sözleşmesi hazırlanır.

### 4.2 Bağımsız test edilebilirlik

Bir agentın testi sırasında diğer agentlar çalıştırılmak zorunda değildir. Gerekli veriler fixture olarak verilir.

### 4.3 Tool-first doğrulama

Güncel ve sayısal bilgiler LLM hafızasından değil uygun tool veya veri kaynağından alınır.

### 4.4 Kaynak izlenebilirliği

Çalışma saati, fiyat, mesafe ve benzeri değişken bilgiler kaynak ve kontrol zamanı ile saklanır.

### 4.5 Belirsizliği gizlememe

Kesin olmayan bilgi:

- varsayım,
- eksik bilgi,
- çelişki,
- doğrulanamadı

olarak açıkça işaretlenir.

### 4.6 Deterministik kurallar ve LLM ayrımı

Hesaplama, tarih, bütçe, mesafe, çalışma saati ve şema kontrolleri mümkün olduğunca kodla yapılır.

LLM:

- niyet anlama,
- yorum özetleme,
- alternatif değerlendirme,
- gerekçelendirme

gibi alanlarda kullanılır.

## 5. Pre-freeze agent akışı

Aşağıdaki akış tarihsel/pre-freeze agent ayrımını gösterir. Güncel canonical ownership için `../08-architecture-baseline/` kullanılmalıdır.

```text
Trip Profile Agent
        ↓
Destination Discovery Agent
        ↓
Research Coordinator
        ├── Places & Experiences Agent
        ├── Accommodation Agent
        ├── Food & Local Taste Agent
        ├── Weather Context Agent
        └── Review Intelligence Agent
        ↓
Route & Schedule Optimizer
        ↓
Budget & Constraint Evaluator
        ↓
Verification & Quality Reviewer
        ↓
Final Plan Composer
```

## 6. Agent çalıştırma politikası

Her kullanıcı isteğinde tüm agentlar çalıştırılmaz.

Orchestrator:

- görevin kapsamını,
- eldeki cache verisini,
- eksik bilgileri,
- maliyet bütçesini,
- güncellik ihtiyacını

değerlendirerek gerekli agentları seçer.

## 7. Tekrar planlama

Plan şu durumlarda yeniden değerlendirilebilir:

- hava koşulu değiştiğinde,
- işletme kapalı veya dolu olduğunda,
- bütçe aşıldığında,
- kullanıcı tercih değiştirdiğinde,
- yol veya süre kısıtı oluştuğunda,
- agent çıktıları arasında kritik çelişki bulunduğunda.

## 8. İlk sürüm sınırı

İlk sürüm:

- araştırır,
- karşılaştırır,
- plan üretir,
- gerekçelendirir,
- kaynak gösterir.

İlk sürüm kullanıcı adına:

- rezervasyon yapmaz,
- ödeme gerçekleştirmez,
- işletmeye mesaj göndermez,
- fiyat garantisi vermez.
