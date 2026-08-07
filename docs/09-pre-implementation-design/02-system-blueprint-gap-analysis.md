# 02 — System Blueprint Gap Analysis

**Doküman türü:** Sistem blueprint boşluk analizi  
**Kapsam:** Tatil Modu pre-implementation design  
**Tarih:** 2026-08-07  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu belge, Tatil Modu'nun uçtan uca sistem blueprint'inde eksik kalan tasarım alanlarını görünür hale getirir.

Bu belge kodlama başlatmaz.

Bu belge, kodlamadan önce hangi mimari, ürün, agent, contract, schema, fixture, memory, tool, UX ve evaluation kararlarının tamamlanması gerektiğini belirler.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
current_phase: documentation_and_design_completion
blueprint_status: incomplete
next_goal: close_system_blueprint_gaps_before_any_code
```

## Mevcut güçlü temel

Tatil Modu için aşağıdaki temel kararlar güçlüdür:

- ürün hedefi çocuklu aile tatili planlama olarak netleşmiştir,
- Travel Intelligence OS yaklaşımı benimsenmiştir,
- tek büyük agent yerine Travel Orchestrator + uzman agent/platform yaklaşımı seçilmiştir,
- hard constraint'lerin skorla telafi edilemeyeceği kararlaştırılmıştır,
- kadınlar plajı, mahremiyet hassasiyeti, trafik, otopark, çocuk yorgunluğu gibi domain gerçekleri ürün ilkesi olarak eklenmiştir,
- Knowledge Platform, Travel Knowledge Store, Verification Platform, Data Source & Trust, Memory Platform ve Capability Platform sınırları ayrıştırılmıştır,
- generic AI Agent Architecture Handbook root seviyesinde hazırlanmıştır,
- kodlama/prototype başlamadan önce pre-implementation design alanı açılmıştır.

Bu temel yeterlidir; fakat eksiksiz tasarım için hâlâ kapatılması gereken boşluklar vardır.

## Blueprint seviyeleri

Tatil Modu blueprint'i şu katmanlarda tamamlanmalıdır:

```text
User Journey / UX Flow
        ↓
Travel Request Intake
        ↓
Travel Orchestrator
        ↓
Agent and Planner Layer
        ↓
Travel Intelligence Modules
        ↓
Knowledge / Memory / Data Stores
        ↓
Evidence / Verification / Trust
        ↓
Capability Gateway / Tool Adapters
        ↓
Fixtures / Mock Providers / Evaluation
        ↓
Observability / Audit / Error Handling
```

Her katman için şu sorular cevaplanmadan kodlama başlamaz:

- katmanın görevi nedir?
- hangi bileşenler bu katmanda yer alır?
- hangi input/output contract'ları kullanılır?
- hangi kararlar bu katmanda alınır?
- hangi kararlar bu katmanda kesinlikle alınmaz?
- hangi evidence, memory, tool ve policy sınırları geçerlidir?
- hangi fixture ile test edilir?

## Gap 1 — User Journey / UX Flow

### Mevcut durum

Ürün ihtiyacı güçlü şekilde tanımlanmıştır: kullanıcı serbest metinle tatil isteği verecek ve sistem uygulanabilir, alternatifli, açıklanabilir plan üretecektir.

### Eksik

Koddan önce aşağıdaki UX akışları netleşmelidir:

- ilk istek alma ekranı / konuşma akışı,
- eksik bilgi tamamlama soruları,
- aile profili bilgisi alma akışı,
- hard constraint ve güçlü tercih ayrımı,
- destinasyon seçimi / destinasyon önerisi ayrımı,
- kullanıcıya alternatifleri gösterme formatı,
- reddedilen seçenekleri açıklama şekli,
- final planı revize ettirme akışı,
- gün gün alternatif gösterim akışı,
- belirsizlik ve doğrulanmamış bilgi uyarısı gösterimi.

### Gerekli artifact

```text
docs/09-pre-implementation-design/09-ui-ux-flow-workplan.md
```

## Gap 2 — Request Intake ve Normalization

### Mevcut durum

Kocaeli çıkışlı, 2 yetişkin + 2 çocuklu, düşük yorgunluk ve alternatifli tatil senaryosu referans kabul edilmiştir.

### Eksik

Serbest metin isteğin hangi canonical request formatına dönüştürüleceği netleşmelidir:

- yolculuk başlangıç noktası,
- hedef şehir / bölge,
- tarih veya mevsim,
- süre,
- yetişkin ve çocuk sayısı,
- çocuk yaşları,
- araç durumu,
- bütçe,
- konaklama tercihi,
- mahremiyet/hassasiyet tercihleri,
- deniz/plaj şartları,
- aktivite tipi,
- yorgunluk toleransı,
- günlük ritim,
- kesin yasaklar,
- bilinmeyen / sorulması gereken alanlar.

### Gerekli artifact

```text
docs/09-pre-implementation-design/05-contract-schema-workplan.md
```

## Gap 3 — Orchestrator Runtime Blueprint

### Mevcut durum

Travel Orchestrator'ın merkezi koordinasyon sahibi olduğu netleşmiştir.

### Eksik

Orchestrator için Tatil Modu özelinde şu akışlar yazılmalıdır:

- hangi sırayla agent çağrılır,
- hangi agent paralel çalışabilir,
- hangi agent sonucu diğerinden önce zorunludur,
- hangi failure durumunda hangi fallback uygulanır,
- hangi output planner'a gider,
- hard constraint gate hangi noktada çalışır,
- evidence verification hangi noktada çalışır,
- final composer hangi koşulda devreye girer,
- düşük confidence durumunda kullanıcıya ne sorulur,
- eksik veri durumunda sistem planı durdurur mu, uyarı ile devam mı eder.

### Gerekli artifact

```text
docs/09-pre-implementation-design/03-required-design-artifact-map.md
```

ve devamında orchestrator-specific spec.

## Gap 4 — First-Phase Agent Set

### Mevcut durum

Agent mimarisi için genel prensipler ve şablon hazırdır.

### Eksik

İlk fazda hangi agentların gerçekten gerekli olduğu dondurulmalıdır.

Önerilen ilk-phase adayları:

| Bileşen | Tip | Görev |
|---|---|---|
| Travel Orchestrator | orchestrator | Tüm workflow koordinasyonu |
| Trip Intake Agent | agent | Serbest isteği canonical trip request'e dönüştürme |
| Family Constraint Agent | agent | Aile, çocuk, mahremiyet ve hard constraint çıkarımı |
| Destination Candidate Agent | agent | Uygun bölge/şehir/rota adayları üretme |
| Activity Candidate Agent | agent | Çocuk dostu aktivite adayları üretme |
| Route & Fatigue Module | module | Mesafe, trafik, mola, yorgunluk değerlendirmesi |
| Policy / Public Authority Agent | agent/platform-facing | Resmi kural, çalışma saati, erişim ve kısıt kontrolü |
| Day Planner | planner | Günlük alternatif plan seçeneklerini oluşturma |
| Plan Ranker | planner/module | Alternatifleri constraint ve kaliteye göre sıralama |
| Final Plan Composer | composer | Kullanıcıya açıklanabilir plan sunma |

Bu liste henüz final değildir. Agent spec workplan içinde dondurulmalıdır.

### Gerekli artifact

```text
docs/09-pre-implementation-design/04-agent-specification-workplan.md
```

## Gap 5 — Agent Contracts and Schemas

### Mevcut durum

Contract-before-code ilkesi kabul edilmiştir.

### Eksik

Aşağıdaki schema ailesi tasarlanmadan kodlama başlamaz:

- `TravelRequestEnvelope`,
- `AgentHandoffEnvelope`,
- `AgentResultEnvelope`,
- `EvidenceEnvelope`,
- `ConfidenceEnvelope`,
- `ConstraintEnvelope`,
- `ErrorEnvelope`,
- `MemoryDisclosurePackage`,
- `CapabilityRequest`,
- `ToolResultEnvelope`,
- `PlanCandidate`,
- `DayPlanAlternative`,
- `FinalPlanResponse`.

### Gerekli artifact

```text
docs/09-pre-implementation-design/05-contract-schema-workplan.md
```

## Gap 6 — Memory Disclosure Blueprint

### Mevcut durum

Memory Platform'ın canonical memory sahibi olduğu ve agentların doğrudan memory yazmayacağı kararlaştırılmıştır.

### Eksik

Tatil Modu için hangi memory bilgisinin hangi agent'a açıklanacağı belirlenmelidir:

- aile üyeleri ve çocuk yaşları,
- şehir/başlangıç noktası,
- araç bilgisi,
- bütçe alışkanlığı,
- mahremiyet hassasiyetleri,
- önceki beğenilen/beğenilmeyen planlar,
- otel/aktivite tercihleri,
- sağlık/erişilebilirlik hassasiyetleri,
- hangi bilgiler kesinlikle agent'a verilmez,
- hangi bilgiler sadece final composer'a verilir,
- hangi bilgiler kullanıcı onayı olmadan kalıcı memory'ye yazılmaz.

### Gerekli artifact

```text
docs/09-pre-implementation-design/08-memory-and-privacy-workplan.md
```

## Gap 7 — Tool / Capability Blueprint

### Mevcut durum

Agentların provider'a doğrudan değil Capability Platform / Tool Gateway üzerinden erişmesi gerektiği kabul edilmiştir.

### Eksik

Capability registry Tatil Modu özelinde tasarlanmalıdır:

- weather lookup,
- route distance/time lookup,
- parking lookup,
- POI/activity lookup,
- hotel candidate lookup,
- public authority page lookup,
- pricing lookup,
- opening hours lookup,
- beach/privacy-specific facility lookup,
- mock provider karşılıkları,
- freshness policy,
- cost/rate limit policy,
- provider failure fallback.

### Gerekli artifact

```text
docs/09-pre-implementation-design/07-tool-and-capability-workplan.md
```

## Gap 8 — Evidence, Verification and Confidence Blueprint

### Mevcut durum

Değişken bilgilerin evidence ve confidence ile taşınması gerektiği kabul edilmiştir.

### Eksik

Tatil Modu için evidence kuralları netleşmelidir:

- çalışma saatleri hangi kaynakla doğrulanır,
- fiyat bilgisi ne zaman outdated kabul edilir,
- mesafe/trafik hangi confidence ile sunulur,
- kadınlar plajı / mahremiyet bilgisi hangi evidence seviyesinde kabul edilir,
- resmi kaynak ile blog/yorum çelişirse ne olur,
- kullanıcı girdisi evidence sayılır mı,
- doğrulanmamış bilgi final planda nasıl işaretlenir,
- düşük confidence durumunda plan engellenir mi, uyarıyla devam mı eder.

### Gerekli artifact

```text
docs/09-pre-implementation-design/05-contract-schema-workplan.md
```

ve evaluation workplan.

## Gap 9 — Policy / Hard Constraint Blueprint

### Mevcut durum

Hard constraint'lerin skorla telafi edilemeyeceği netleşmiştir.

### Eksik

Tatil Modu özel hard constraint sınıfları dondurulmalıdır:

- çocuk güvenliği,
- yaş uygunluğu,
- kapalı mekan / çalışma saati,
- resmi erişim kuralı,
- mesafe ve yorgunluk limiti,
- bütçe üst sınırı,
- mahremiyet/kadınlar plajı şartı,
- kullanıcı tarafından “kesinlikle istemiyorum” denilen seçenekler,
- rota riski,
- hava koşulu riski.

Her sınıf için reject/degrade/warn davranışı belirlenmelidir.

### Gerekli artifact

```text
docs/09-pre-implementation-design/03-required-design-artifact-map.md
```

## Gap 10 — Fixtures and Golden Scenarios

### Mevcut durum

Referans senaryolar bellidir: Kocaeli çıkışlı Bursa/Balıkesir, 2 yetişkin, 6 ve 2 yaş çocuklar, düşük yorgunluk, alternatifli plan.

### Eksik

Koddan önce fixture seti tasarlanmalıdır:

- golden scenario input,
- expected constraints,
- expected rejected candidates,
- expected daily plan shape,
- mock weather data,
- mock route data,
- mock POI/activity data,
- mock opening hours,
- mock evidence records,
- expected final answer structure,
- pass/fail criteria.

### Gerekli artifact

```text
docs/09-pre-implementation-design/06-fixture-and-evaluation-workplan.md
```

## Gap 11 — Evaluation Rubrics

### Mevcut durum

Evaluation hierarchy belirlenmiştir.

### Eksik

Tatil Modu domain rubricleri netleşmelidir:

- aile uygunluğu,
- çocuk yaş uyumu,
- yorgunluk dengesi,
- rota uygulanabilirliği,
- otopark/trafik gerçekçiliği,
- mahremiyet hassasiyeti,
- kanıt kalitesi,
- final plan açıklanabilirliği,
- alternatif çeşitliliği,
- budget coherence,
- gün içi ritim ve dinlenme uygunluğu.

### Gerekli artifact

```text
docs/09-pre-implementation-design/06-fixture-and-evaluation-workplan.md
```

## Gap 12 — Observability and Audit Blueprint

### Mevcut durum

Trace, error, audit yaklaşımı generic handbook içinde tanımlanmıştır.

### Eksik

Tatil Modu için hangi kararların audit edileceği belirlenmelidir:

- neden bir destinasyon önerildi,
- neden bir aktivite elendi,
- hard constraint hangi adımda çalıştı,
- hangi evidence final plana etki etti,
- hangi confidence düşük kaldı,
- hangi provider/mock veri kullanıldı,
- hangi kullanıcı tercihi hangi agent'a disclose edildi,
- final plan hangi candidate'lardan oluştu.

### Gerekli artifact

```text
docs/09-pre-implementation-design/03-required-design-artifact-map.md
```

ve observability-specific artifact.

## Gap 13 — Data Model / Store Boundary

### Mevcut durum

Travel Knowledge Store, Memory Platform ve Data Source & Trust ayrılmıştır.

### Eksik

Tatil Modu domain entity tasarımı tamamlanmalıdır:

- trip request,
- family profile snapshot,
- destination,
- POI,
- activity,
- hotel,
- route segment,
- constraint,
- evidence record,
- plan candidate,
- day plan,
- rejected candidate,
- final plan,
- evaluation result,
- audit event.

### Gerekli artifact

```text
docs/09-pre-implementation-design/03-required-design-artifact-map.md
```

## Gap 14 — Documentation Source-of-Truth Map

### Mevcut durum

Docs README kanonik belge haritası görevini görmektedir.

### Eksik

Pre-implementation design altında üretilecek yeni belgelerin hangi eski pre-freeze belgeyi geçersiz kıldığı veya referans aldığı netleşmelidir.

Özellikle:

- pre-freeze agent catalog,
- eski handoff standardı,
- eski testing standardı,
- capability docs,
- baseline staging docs,
- generic handbook.

### Gerekli artifact

```text
docs/09-pre-implementation-design/03-required-design-artifact-map.md
```

## Gap öncelik sırası

| Sıra | Gap | Öncelik | Neden |
|---|---|---|---|
| 1 | Required design artifact map | Çok yüksek | Tüm eksik dosya setini kilitler |
| 2 | Agent specification workplan | Çok yüksek | Agent sınırları netleşmeden contract yazılamaz |
| 3 | Contract/schema workplan | Çok yüksek | Koddan önce interface gerekir |
| 4 | Fixture/evaluation workplan | Çok yüksek | Test edilemeyen tasarım güven vermez |
| 5 | Tool/capability workplan | Yüksek | Provider bağımlılığı kontrol altına alınır |
| 6 | Memory/privacy workplan | Yüksek | Family context ve hassas bilgiler korunur |
| 7 | UI/UX flow workplan | Yüksek | Kullanıcıdan eksik bilgi alma ve final plan deneyimi netleşir |
| 8 | Pre-code freeze checklist | Çok yüksek | Son kapı kontrolü olur |

## Sonuç

Tatil Modu'nun sistem blueprint'i güçlü bir mimari temele sahiptir; fakat hâlâ eksiksiz değildir.

Bu nedenle karar değişmez:

```yaml
implementation_allowed: false
prototype_allowed: false
blueprint_state: gaps_identified
required_next_document: 03-required-design-artifact-map.md
```

Kodlama veya prototype ancak bu pre-implementation design seti tamamlandıktan ve pre-code freeze checklist geçti kabul edildikten sonra tartışılabilir.
