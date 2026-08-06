# Tatil Modu — Agent System Overview

## 1. Amaç

Tatil Modu, kullanıcının seyahat isteğini güncel ve doğrulanabilir verilerle uygulanabilir bir tatil planına dönüştüren agent tabanlı bir karar sistemidir.

Sistem yalnızca yer listesi üretmez. Kullanıcı profili, tarih, bütçe, ulaşım, çocukların yaşları, özel ihtiyaçlar, hava, çalışma saatleri, yorum eğilimleri ve rota yükünü birlikte değerlendirir.

## 2. Temel mimari yaklaşım

Sistem üç katmandan oluşur:

```text
Kullanıcı ve Uygulama Katmanı
            ↓
Orchestrator ve Karar Katmanı
            ↓
Uzman Agentlar ve Tool Katmanı
```

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

## 3. Tasarım ilkeleri

### 3.1 Agent yerine önce sözleşme

Her agent için önce giriş/çıkış şeması ve handoff sözleşmesi hazırlanır.

### 3.2 Bağımsız test edilebilirlik

Bir agentın testi sırasında diğer agentlar çalıştırılmak zorunda değildir. Gerekli veriler fixture olarak verilir.

### 3.3 Tool-first doğrulama

Güncel ve sayısal bilgiler LLM hafızasından değil uygun tool veya veri kaynağından alınır.

### 3.4 Kaynak izlenebilirliği

Çalışma saati, fiyat, mesafe ve benzeri değişken bilgiler kaynak ve kontrol zamanı ile saklanır.

### 3.5 Belirsizliği gizlememe

Kesin olmayan bilgi:

- varsayım,
- eksik bilgi,
- çelişki,
- doğrulanamadı

olarak açıkça işaretlenir.

### 3.6 Deterministik kurallar ve LLM ayrımı

Hesaplama, tarih, bütçe, mesafe, çalışma saati ve şema kontrolleri mümkün olduğunca kodla yapılır.

LLM:

- niyet anlama,
- yorum özetleme,
- alternatif değerlendirme,
- gerekçelendirme

gibi alanlarda kullanılır.

## 4. İlk agent akışı

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

## 5. Agent çalıştırma politikası

Her kullanıcı isteğinde tüm agentlar çalıştırılmaz.

Orchestrator:

- görevin kapsamını,
- eldeki cache verisini,
- eksik bilgileri,
- maliyet bütçesini,
- güncellik ihtiyacını

değerlendirerek gerekli agentları seçer.

## 6. Tekrar planlama

Plan şu durumlarda yeniden değerlendirilebilir:

- hava koşulu değiştiğinde,
- işletme kapalı veya dolu olduğunda,
- bütçe aşıldığında,
- kullanıcı tercih değiştirdiğinde,
- yol veya süre kısıtı oluştuğunda,
- agent çıktıları arasında kritik çelişki bulunduğunda.

## 7. İlk sürüm sınırı

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
