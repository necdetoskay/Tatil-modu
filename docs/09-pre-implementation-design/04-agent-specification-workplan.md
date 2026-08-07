# 04 — Agent Specification Workplan

**Doküman türü:** Agent specification iş planı  
**Kapsam:** Tatil Modu pre-implementation design  
**Durum:** tasarım planı  
**Tarih:** 2026-08-07  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu doküman, Tatil Modu için ilk-phase agent specification dosyalarının hangi sırayla, hangi bağımlılıklarla ve hangi kabul kriterleriyle yazılacağını tanımlar.

Bu doküman agent implementasyonu değildir.

Amaç, her agent'ın koddan önce kağıt üzerinde eksiksiz tanımlanmasını sağlamaktır.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
agent_implementation_allowed: false
agent_specification_allowed: true
first_phase_agent_specs_required_before_code: true
```

## Neden agent specification workplan gerekli?

Tatil Modu gibi çok bileşenli agent sistemlerinde en büyük risk, agent'ları isimlendirip doğrudan prompt yazmaya başlamaktır.

Bu yaklaşım şu sorunları doğurur:

- agent sınırları karışır,
- aynı karar birden fazla agent'ta tekrar verilir,
- orchestrator yetkisi zayıflar,
- tool erişimi kontrolsüzleşir,
- memory disclosure gereğinden fazla genişler,
- output contract'ları tutarsızlaşır,
- test fixture'ları agent'a özel yazılamaz,
- hata davranışı öngörülemez.

Bu nedenle her agent, implementation'dan önce yazılı specification'a sahip olmalıdır.

## Agent spec yazım kuralı

Her agent specification şu şablona uymalıdır:

```text
ai-agent-architecture-handbook/12-agent-specification-template.md
```

Tatil Modu agent spec'leri ise ürün dokümantasyonu altında tutulmalıdır.

Önerilen hedef klasör:

```text
docs/11-agent-specifications/
```

Bu klasör oluşturulana kadar bu workplan yalnız tasarım sırasını belirler.

## First-phase agent set

İlk-phase için önerilen agent seti aşağıdaki gibidir.

| Sıra | Agent | Ana görev | Durum |
|---|---|---|---|
| 1 | Trip Intake Agent | Kullanıcı isteğini normalize eder, eksik bilgileri ve açık kısıtları çıkarır | spec gerekli |
| 2 | Constraint & Policy Agent | Hard constraint, güçlü tercih, soft preference ve güvenlik/policy ayrımını yapar | spec gerekli |
| 3 | Family Suitability Agent | Çocuk yaşları, öğle dinlenmesi, yorgunluk ve aile uygunluğunu değerlendirir | spec gerekli |
| 4 | Destination Candidate Agent | Şehir/bölge/POI adaylarını üretir; nihai plan yapmaz | spec gerekli |
| 5 | Route & Logistics Agent | Mesafe, trafik penceresi, otopark ve ulaşım zorluğunu değerlendirir | spec gerekli |
| 6 | Accommodation Fit Agent | Otel/konaklama uygunluğu, aile ihtiyaçları ve bütçe uyumunu değerlendirir | spec gerekli |
| 7 | Activity Fit Agent | Aktivite uygunluğu, yaş uyumu, süre ve yoruculuk değerlendirmesi yapar | spec gerekli |
| 8 | Day Plan Composer Agent | Günlük alternatifli plan adaylarını oluşturur | spec gerekli |
| 9 | Verification & Evidence Agent | Saat, fiyat, resmi bilgi, kaynak ve confidence değerlendirmesini toparlar | spec gerekli |
| 10 | Final Response Composer Agent | Kullanıcıya açıklanabilir, alternatifli ve uyarılı nihai cevap üretir | spec gerekli |

## Agent olmayan ama kritik bileşenler

Aşağıdaki bileşenler agent değildir ve agent spec altında yazılmamalıdır.

| Bileşen | Tür | Not |
|---|---|---|
| Travel Orchestrator | orchestrator/runtime | Agent çağrı sırası, retry, reconciliation ve final flow sahibi |
| Travel Knowledge Store | store | POI, destinasyon, otel, aktivite ve operasyonel bilgi tutar |
| Memory Platform | platform | Canonical kullanıcı/aile memory sahibidir |
| Capability Platform / Tool Gateway | gateway/platform | Tool erişimi, izin, provider adapter ve mock mode sahibidir |
| Verification Platform | platform | Doğrulama semantiğini runtime kararlarına taşır |
| Evaluation Platform | evaluator/platform | Fixture, rubric, regression ve pass/fail gate sahibidir |
| Data Source & Trust | platform | Kaynak otoritesi, freshness ve trust değerlendirmesi yapar |

## Specification dependency order

Agent spec'leri rastgele yazılmamalıdır.

Önerilen bağımlılık sırası:

```text
1. Trip Intake Agent
   ↓
2. Constraint & Policy Agent
   ↓
3. Family Suitability Agent
   ↓
4. Destination Candidate Agent
   ↓
5. Route & Logistics Agent
   ↓
6. Accommodation Fit Agent
   ↓
7. Activity Fit Agent
   ↓
8. Day Plan Composer Agent
   ↓
9. Verification & Evidence Agent
   ↓
10. Final Response Composer Agent
```

Bu sıra, ham kullanıcı isteğinden final cevaba doğru bilgi akışını izler.

## Neden Trip Intake Agent ilk?

Çünkü bütün sistemin girdisi burada normalize edilir.

Trip Intake Agent netleşmeden diğer agent'lar yanlış varsayımla tasarlanabilir.

Bu agent şunları çıkarmalıdır:

- çıkış noktası,
- hedef il / bölge,
- gün sayısı,
- kişi sayısı,
- çocuk yaşları,
- araç durumu,
- bütçe,
- tarih / sezon,
- sert kısıtlar,
- güçlü tercihler,
- belirsiz alanlar,
- eksik bilgi toleransı,
- kullanıcıya sorulması gereken minimum sorular.

## Neden Constraint & Policy Agent ikinci?

Çünkü hard constraint'ler planlamadan önce ayrıştırılmalıdır.

Örnek:

```text
Deniz önerilecekse kadınlar plajı mutlaka olmalı.
```

Bu ifade sıradan soft preference değildir. Deniz planı yapılacaksa candidate filtering aşamasına giren güçlü/hard koşuldur.

Bu agent şunları belirlemelidir:

- hard constraint,
- strong preference,
- soft preference,
- safety constraint,
- public authority constraint,
- candidate rejection reason,
- ranking öncesi gate sonuçları.

## Neden Family Suitability Agent üçüncü?

Tatil Modu'nun değer önerisi çocuklu ailelere pratik plan üretmektir.

Bu agent, önerilerin sadece popüler veya güzel olmasına değil, aile açısından uygulanabilir olmasına bakmalıdır.

Örnek değerlendirme alanları:

- 2 yaş çocuk için puset/uyku ihtiyacı,
- 6 yaş çocuk için oyun/keşif ihtiyacı,
- öğle dinlenmesi,
- aşırı yürüme riski,
- uzun araç süresi,
- bekleme/kuyruk riski,
- akşam geç saat yorgunluğu,
- kapalı/açık alan dengesi.

## Candidate üreten agent'lar

Aşağıdaki agent'lar nihai karar vermez; aday veya değerlendirme üretir:

- Destination Candidate Agent,
- Route & Logistics Agent,
- Accommodation Fit Agent,
- Activity Fit Agent.

Bu agent'lar şu formatta çıktı üretmelidir:

```text
candidate + evidence + confidence + risks + rejection_possible
```

## Plan oluşturan agent

Day Plan Composer Agent, adayları kullanarak gün bazlı alternatif planlar üretir.

Fakat hard constraint ihlali yapan adayı kullanamaz.

Bu agent şunları üretmelidir:

- gün planı,
- 2-3 alternatif,
- sabah / öğle / öğleden sonra / akşam blokları,
- çocuk yorgunluğu tahmini,
- rota mantığı,
- fallback seçeneği,
- risk açıklaması.

## Final cevap agent'ı

Final Response Composer Agent nihai kullanıcı cevabını yazar.

Bu agent yeni gerçek iddia üretmemeli, upstream kanıt ve kararları kullanıcı diline çevirmelidir.

Görevleri:

- seçenekleri anlaşılır sunmak,
- neden seçildiğini açıklamak,
- riskleri saklamamak,
- confidence bilgisini sadeleştirmek,
- reddedilen önemli alternatifleri gerekçesiyle açıklamak,
- kullanıcıya uygulanabilir plan vermek.

## Her agent spec dosyasında zorunlu alanlar

Her specification dosyasında şu alanlar olmalıdır:

- metadata,
- purpose,
- scope,
- non-goals,
- upstream caller,
- downstream consumers,
- input contract,
- output contract,
- allowed capabilities,
- forbidden capabilities,
- memory disclosure package,
- evidence requirements,
- hard constraint behavior,
- failure behavior,
- evaluation fixtures,
- observability requirements,
- acceptance criteria,
- prompt contract outline.

## İlk yazılacak agent specs

İlk küçük spec paketi aşağıdaki dört agent ile başlamalıdır:

```text
1. Trip Intake Agent
2. Constraint & Policy Agent
3. Family Suitability Agent
4. Destination Candidate Agent
```

Bu dört agent tamamlanmadan plan composer veya final response composer yazılmamalıdır.

## Agent spec dosya önerileri

Hedef dosyalar:

```text
docs/11-agent-specifications/README.md
docs/11-agent-specifications/01-trip-intake-agent.md
docs/11-agent-specifications/02-constraint-policy-agent.md
docs/11-agent-specifications/03-family-suitability-agent.md
docs/11-agent-specifications/04-destination-candidate-agent.md
docs/11-agent-specifications/05-route-logistics-agent.md
docs/11-agent-specifications/06-accommodation-fit-agent.md
docs/11-agent-specifications/07-activity-fit-agent.md
docs/11-agent-specifications/08-day-plan-composer-agent.md
docs/11-agent-specifications/09-verification-evidence-agent.md
docs/11-agent-specifications/10-final-response-composer-agent.md
```

## Specification completion states

Use these states:

```text
not_started | drafted | reviewed | accepted_for_design | blocked
```

Implementation-specific states are not allowed in this phase.

## Cross-artifact dependencies

Agent specs depend on the following design artifacts:

| Dependency | Needed for |
|---|---|
| ACP envelope schema | input/output contracts |
| Evidence envelope schema | evidence requirements |
| Constraint classification registry | hard constraint behavior |
| Capability registry | allowed/forbidden tool access |
| Memory disclosure schema | scoped family/user memory |
| Golden fixtures | evaluation fixtures |
| Error code registry | failure behavior |
| Observability run envelope | trace requirements |

## Acceptance criteria for this workplan

This workplan is complete when:

- first-phase agent list is explicit,
- agent olmayan bileşenler ayrılmıştır,
- spec yazım sırası bellidir,
- ilk yazılacak agent specs bellidir,
- her spec'in zorunlu alanları bellidir,
- spec dosya yolları önerilmiştir,
- implementation/prototype kapısı kapalı kalmıştır.

## Current decision

```yaml
agent_spec_workplan_state: created
implementation_allowed: false
prototype_allowed: false
next_design_step: contract_schema_workplan
first_agent_spec_to_write: Trip Intake Agent
minimum_first_spec_package:
  - Trip Intake Agent
  - Constraint & Policy Agent
  - Family Suitability Agent
  - Destination Candidate Agent
```
