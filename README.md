# Tatil Modu

> **Tatil Modu; ailelerin tatil planını güvenilir bilgi, açık kısıtlar, doğrulanabilir kaynaklar ve uzman agent iş birliğiyle üreten bir Travel Intelligence OS çalışmasıdır.**

Tatil planlamak özellikle çocuklu aileler için yalnızca “nereye gidelim?” sorusu değildir. Rota, mola, trafik, otopark, çocukların yaşına uygun aktivite, bütçe, hava durumu, çalışma saatleri, resmi kurallar, kadınlar plajı gibi hassas tercihler, otel uygunluğu ve günlük yorgunluk dengesi birlikte değerlendirilmelidir.

Bu repo, bu karmaşık kararı tek bir sohbet cevabından çıkarıp; sözleşmeli agentlar, doğrulanabilir veri katmanları, açık mimari sınırlar ve test edilebilir planlama modülleriyle çalışan bir aile tatili karar sistemi haline getirmek için hazırlanmıştır.

## Repo iki ana bilgi alanı içerir

Bu repository içinde iki farklı ama ilişkili doküman alanı vardır:

| Alan | Yol | Kapsam |
|---|---|---|
| Tatil Modu ürün/mimari dokümantasyonu | [`docs/`](docs/README.md) | Bu ürüne özel PRD, mimari baseline, agent planı, freeze kararları |
| Generic AI Agent Architecture Handbook | [`ai-agent-architecture-handbook/`](ai-agent-architecture-handbook/README.md) | Tatil Modu dışındaki agent projelerinde de kullanılabilecek genel mimari rehber |

Bu ayrım bilinçlidir. Handbook, Tatil Modu içine hapsolmuş bir proje dokümanı değildir. Tatil Modu, handbook'un ilk reference implementation örneğidir.

```text
Generic handbook:
ai-agent-architecture-handbook/

Tatil Modu product documentation:
docs/

Tatil Modu reference example:
ai-agent-architecture-handbook/examples/tatil-modu-reference-implementation.md
```

## Ürün ne yapacak?

Tatil Modu’nun hedefi, kullanıcının serbest metin tatil isteğini alıp uygulanabilir, açıklanabilir ve alternatifli bir seyahat planına dönüştürmektir.

Örnek hedef:

```text
Kocaeli’den çıkıyorum. 2 yetişkin, 6 ve 2 yaşlarında 2 çocuk var.
Balıkesir veya Bursa çevresinde 3 günlük, çocuklara uygun, çok yormayan,
bütçesi kontrollü, trafik ve otoparkı düşünülmüş bir tatil planı istiyorum.
Deniz önerilecekse kadınlar plajı seçeneği de mutlaka değerlendirilsin.
```

Sistem bu isteği şu kararlara böler:

- kullanıcı ve aile profili,
- sert kısıtlar ve güçlü tercihler,
- hedef şehir / bölge keşfi,
- otel ve konaklama uygunluğu,
- çocuk yaşına uygun aktivite seçimi,
- rota, trafik, mesafe ve park değerlendirmesi,
- bütçe ve zaman optimizasyonu,
- hava durumu ve operasyonel riskler,
- resmi kaynak / public authority doğrulaması,
- günlük plan, alternatifler ve açıklamalar.

## Temel ürün ilkeleri

- **Aile odaklı planlama:** 2 ve 6 yaş gibi farklı çocuk ihtiyaçları, öğle dinlenmesi, kısa aktivite blokları ve yorulma riski dikkate alınır.
- **Alternatifli gün planı:** Her gün için tek cevap yerine 2–3 uygulanabilir seçenek üretilir.
- **Hard constraint önce gelir:** Güvenlik, resmi kural, kapalı mekan, yaş uygunluğu veya kullanıcı tarafından kesin belirtilen koşullar skorla telafi edilemez.
- **Doğrulanabilir bilgi:** Fiyat, saat, hava, mesafe, resmi kural ve müsaitlik gibi değişken bilgiler kanıt ve güven seviyesiyle taşınır.
- **Kadınlar plajı gibi hassas tercihler:** Deniz önerilerinde mahremiyet ve aile hassasiyetleri planlama girdisi olarak ele alınır.
- **Trafik ve otopark gerçekliği:** Teoride güzel ama pratikte yorucu planlar elenir veya açık uyarıyla sunulur.
- **Test edilebilir agent mimarisi:** Her agent ayrı fixture, contract ve değerlendirme standardıyla test edilebilir.

## Mimari yaklaşım

Tatil Modu, tek bir büyük agent yerine, merkezi bir Travel Orchestrator etrafında çalışan uzman agentlar ve ortak platformlardan oluşur.

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
Memory Platform
Security
Observability
Evaluation
Governance
Configuration
Data Lifecycle
Version & Compatibility
```

### Ana ayrım

- **Agentlar** görev yürütür.
- **Planner bileşenleri** plan kararı verir.
- **Travel Intelligence Modules** bütçe, çevresel risk, memnuniyet, rota kalitesi gibi domain değerlendirmeleri üretir.
- **Travel Knowledge Store** destinasyon, POI, otel, aktivite ve operasyonel seyahat bilgisini tutar.
- **Memory Platform** kullanıcı ve aileye ilişkin izinli, kalıcı ve yaşam döngüsü yönetilen bilgileri tutar.
- **Data Source & Trust** kaynak otoritesi, tazelik, kanıt gücü ve çelişki semantiğini yönetir.
- **Verification Platform** doğrulama sonucunu runtime kararlara taşır.
- **Capability Platform / Tool Gateway** dış araçlara güvenli ve denetlenebilir erişim sağlar.

## Architecture Freeze durumu

Repo şu anda kodlamadan önce mimari sınırları sağlamlaştırma aşamasındadır.

Güncel architecture baseline staging alanı:

```text
docs/08-architecture-baseline/
```

Freeze kapanış durumu:

```text
critical_blockers: closed
high_blockers: closed
medium_blockers: closed
freeze_state: closure_review
next_gate: ai-agent-architecture-handbook/
```

Kapanan ana karar alanları:

- Knowledge Platform ile Travel Knowledge Store ayrımı,
- Verification Platform ile Data Source & Trust ayrımı,
- Agent Catalog pre-freeze / canonical baseline ayrımı,
- Travel Intelligence modüllerinin agent olmaması,
- Capability Platform ile Tool Adapter ayrımı,
- eksik schema / fixture / registry artifact envanteri,
- confidence ownership,
- lifecycle / status vocabulary,
- merkezi error code registry,
- cross-reference ve dependency metadata,
- architecture terminology registry,
- Memory Platform boundary,
- Public Authority layering,
- Evaluation Standards Hierarchy,
- Architecture Baseline Staging Policy,
- Architecture Freeze Closure Checklist.

## Önemli dokümanlar

| Alan | Güncel belge |
|---|---|
| Generic AI Agent Architecture Handbook | [ai-agent-architecture-handbook/README.md](ai-agent-architecture-handbook/README.md) |
| Tatil Modu reference implementation örneği | [tatil-modu-reference-implementation.md](ai-agent-architecture-handbook/examples/tatil-modu-reference-implementation.md) |
| Dokümantasyon haritası | [docs/README.md](docs/README.md) |
| Architecture Freeze baseline | [docs/08-architecture-baseline/README.md](docs/08-architecture-baseline/README.md) |
| Freeze closure checklist | [architecture-freeze-closure-checklist.md](docs/08-architecture-baseline/architecture-freeze-closure-checklist.md) |
| Required artifact inventory | [freeze-required-artifact-inventory.md](docs/08-architecture-baseline/freeze-required-artifact-inventory.md) |
| Dependency index | [architecture-dependency-index.md](docs/08-architecture-baseline/architecture-dependency-index.md) |
| Terminology registry | [architecture-terminology-registry.md](docs/08-architecture-baseline/architecture-terminology-registry.md) |
| Memory boundary | [memory-platform-boundary.md](docs/08-architecture-baseline/memory-platform-boundary.md) |
| Public authority layering | [public-authority-layering.md](docs/08-architecture-baseline/public-authority-layering.md) |
| Evaluation hierarchy | [evaluation-standards-hierarchy.md](docs/08-architecture-baseline/evaluation-standards-hierarchy.md) |
| Product vision | [PRD-001](docs/10-product/PRD-001-URUN-VIZYONU.md) |
| Governance | [docs/00-governance/README.md](docs/00-governance/README.md) |

## Tasarım yaklaşımı

Bu projede öncelik hızlı kod yazmak değil, doğru sistemi tasarlamaktır.

Çalışma ilkeleri:

- **Documentation First:** Agent kodlanmadan önce specification, schema, prompt ve test paketi hazırlanır.
- **Contract Before Code:** Agentlar serbest metin yerine sürümlü sözleşmelerle iletişim kurar.
- **Fixture Mode:** Her agent başka agentlara veya canlı servislere ihtiyaç duymadan bağımsız test edilebilir.
- **Tool-First Verification:** Güncel fiyat, çalışma saati, hava, rota ve resmi kural gibi bilgiler uygun araçlardan alınır.
- **Single Source of Truth:** Her mimari konu için tek canonical belge veya registry tanımlanır.
- **Privacy by Design:** Agentlara yalnız gerekli minimum kullanıcı/aile bilgisi disclosure package olarak verilir.

## İlk referans senaryolar

Proje testleri aile tatili gerçek ihtiyaçlarından türetilmektedir:

- Kocaeli çıkışlı Bursa / Balıkesir kısa tatil planı,
- 2 yetişkin + 2 çocuk, yaşlar 6 ve 2,
- çocuk dostu aktivite seçimi,
- öğle dinlenmesi ve düşük yorgunluk planı,
- trafik, otopark ve mesafe değerlendirmesi,
- kadınlar plajı ve mahremiyet hassasiyeti,
- bütçe kontrollü otel / aktivite karşılaştırması,
- her gün için alternatifli plan üretimi.

## Mevcut durum

Bu repo şu anda **Architecture Review & Freeze closure review** aşamasındadır.

Kodlama başlamadan önce hedef:

1. mimari ownership çakışmalarını kapatmak,
2. agent / platform / module sınırlarını dondurmak,
3. schema, registry ve fixture artifact listesini kesinleştirmek,
4. test ve evaluation hiyerarşisini netleştirmek,
5. generic AI Agent Architecture Handbook'u implementation-ready hale getirmek,
6. ardından agent bazlı implementation sprintlerine geçmek.

## Sonraki büyük aşama

Sıradaki ana çalışma:

```text
ai-agent-architecture-handbook/
```

Bu handbook; agent, planner, module, platform, contract, tool, memory, evidence, verification, confidence, policy, evaluation, observability ve implementation readiness standartlarını generic şekilde tanımlayacaktır.

Tatil Modu bu standardın ilk gerçek uygulama örneği olarak kullanılacaktır.
