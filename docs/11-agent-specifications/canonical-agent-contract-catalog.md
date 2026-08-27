# Tatil Modu — Canonical Agent Contract Catalog

| Alan | Değer |
|---|---|
| Document ID | TM-AG-CATALOG-001 |
| Sürüm | 1.0 |
| Durum | CANONICAL |
| Son güncelleme | 2026-08-27 |
| Source of truth | `docs/11-agent-specifications/canonical-agent-contract-catalog.md` |
| Pre-freeze referans | `docs/02-agents/agent-catalog.md` |
| Tool kataloğu | `docs/04-tools/tool-catalog.md` |
| Kaynak güven politikası | `docs/01-architecture/data-source-trust-policy.md` |

## 1. Amaç

Bu belge Tatil Modu uygulamasındaki agent mimarisinin kanonik sözleşmesini tanımlar.

Her agent için aşağıdakiler burada sabitlenir:

- görev ve sorumluluk sınırı,
- input/output domain objeleri,
- izin verilen tool sınıfları,
- izin verilen veri kaynakları,
- authority envelope,
- yasak davranışlar,
- invariant'lar,
- temel PASS/FAIL test oracle'ları.

Bu belge runtime implementation değildir. Provider adapter, model, framework veya deployment ayrıntıları değişebilir; burada tanımlanan davranış sözleşmesi değişmez.

## 2. Ana mimari ilkeler

1. **Contract before code.** Agent kodlanmadan önce sözleşmesi test edilebilir olmalıdır.
2. **Structured handoff.** Agentlar serbest metinle değil sürümlü domain objeleriyle haberleşir.
3. **Tool-first facts.** Güncel/değişken gerçekler LLM hafızasından üretilmez; uygun tool ve evidence gerekir.
4. **Authority envelope.** Her agent yalnız kendi karar alanında işlem yapabilir.
5. **Deterministic before LLM.** Hesaplama, schema, constraint ve benzeri kurallar mümkün olduğunda deterministik tool ile yürütülür.
6. **No silent degradation.** Fallback kaynak kalitesini sessizce düşüremez; confidence ve provenance güncellenir.
7. **No invented facts.** Fiyat, çalışma saati, müsaitlik, rota süresi veya resmî politika uydurulamaz.
8. **Targeted repair.** Bir hata yalnız etkilenen plan parçasını onarmalıdır; gereksiz tam yeniden üretim yapılmaz.
9. **Evidence required.** Kritik iddialar provenance/evidence taşır.
10. **Orchestrator coordinates; specialists decide.** Orchestrator uzman agent rolünü üstlenmez.

## 3. Ortak domain objeleri

| Obje | Amaç |
|---|---|
| `TripRequest` | Kullanıcının ham tatil isteği |
| `TravelerProfile` | Yolcular, yaşlar, araç ve hareket bağlamı |
| `PreferenceSet` | Kullanıcı tercihleri |
| `ConstraintSet` | Hard/soft kısıtlar |
| `DestinationBrief` | Destinasyon/bölge intelligence özeti |
| `PlaceCandidate` | Aktivite/ziyaret noktası adayı |
| `AccommodationCandidate` | Konaklama adayı |
| `FoodCandidate` | Restoran/yemek adayı |
| `WeatherSignal` | Hava koşulu ve aktivite riski |
| `RouteLeg` | A→B ulaşım bilgisi |
| `DailyPlan` | Bir günlük zamanlanmış plan |
| `BudgetLedger` | Maliyet kalemleri ve durumları |
| `ReviewSignal` | Yorumlardan çıkarılmış tematik sinyal |
| `OfficialFact` | Birincil/resmî kaynaktan doğrulanmış bilgi |
| `Evidence` | Kaynak/provenance kaydı |
| `VerificationResult` | PASS/FAIL/REPAIR doğrulama sonucu |
| `Itinerary` | Çok günlük seyahat planı |
| `AlternativePlan` | Değişen koşullar sonrası hedefli alternatif |
| `AgentTrace` | Agent karar ve tool çağrı izi |

### 3.1 Evidence minimum alanları

```yaml
Evidence:
  sourceType: string
  sourceName: string
  sourceUrlOrId: string
  retrievedAt: datetime
  claim: string
  confidence: number
  freshness: string
  authoritative: boolean
```

### 3.2 Fiyat durumları

```text
LIVE
OFFICIAL
ESTIMATED
UNKNOWN
```

`UNKNOWN` olan değer gerçek fiyat gibi sunulamaz.

## 4. Kaynak güven modeli

Bu katalog `docs/01-architecture/data-source-trust-policy.md` politikasını kullanır.

- **Tier 1:** resmî kurum, tesisin resmî sitesi, veri sahibinin API'si.
- **Tier 2:** yetkili/lisanslı structured provider.
- **Tier 3:** güvenilir yorum veya seyahat platformu.
- **Tier 4:** genel web, blog, forum, sosyal içerik.

Kritik ve değişken bilgiler yalnız Tier 4 ile kesinleştirilemez.

### 4.1 V1 provider tercihleri

Bunlar provider adapter tercihleridir; agent sözleşmesinin kendisi değildir.

- Place discovery/enrichment: Google Places tercih edilir.
- Directions/traffic/distance matrix: Google Routes tercih edilir.
- Accommodation live price/availability: Booking.com Demand API erişim varsa tercih edilir; erişim yoksa değer `UNKNOWN` kalabilir.
- Türkiye kültür/müze/ören yeri doğrulaması: resmî Bakanlık/Kültür Portalı/MüzeKart ve ilgili kurum/işletme sayfaları önceliklidir.
- Weather provider: adapter sözleşmesi sabit, somut provider ayrı kararla seçilecektir.

## 5. Tool sınıfları

Mevcut `docs/04-tools/tool-catalog.md` kanoniktir.

- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-003` Geocoding
- `TL-004` Place Search
- `TL-005` Directions & Distance Matrix
- `TL-006` Weather Forecast
- `TL-007` Climate Normals
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price & Fee Lookup
- `TL-011` Calculator
- `TL-012` Schema Validator
- `TL-013` Rule Engine
- `TL-014` Cache

## 6. Kanonik agent seti

### TM-AG-001 — Profile Agent

**Mission:** `TripRequest` içindeki kullanıcı seyahat bağlamını yapılandırılmış `TravelerProfile` haline getirmek.

**Input:** `TripRequest`, izinli kayıtlı kullanıcı bağlamı.  
**Output:** `TravelerProfile`.  
**Allowed tools:** `TL-012` yalnız schema doğrulama için; normal extraction için dış dünya tool'u yok.  
**Allowed sources:** kullanıcı girdisi, izinli kayıtlı profil verisi.  
**Authority:** profil alanlarını çıkarma/normalize etme.  
**Forbidden:** web aramak, yaş/ulaşım/kişi sayısı uydurmak, politika üretmek, POI önermek.  
**Invariant:** bilinmeyen alan bilinmiyor olarak kalır; tahmin gerçeğe çevrilemez.  
**Primary oracle:** açıkça verilen yetişkin/çocuk yaşları, ulaşım ve hedef bire bir korunur; tool leakage = FAIL.

### TM-AG-002 — Preference & Policy Agent

**Mission:** kullanıcı tercihlerini `PreferenceSet` ve hard/soft `ConstraintSet` haline getirmek.

**Input:** `TripRequest`, `TravelerProfile`.  
**Output:** `PreferenceSet`, `ConstraintSet`.  
**Allowed tools:** `TL-012`, `TL-013`.  
**Allowed sources:** kullanıcı girdisi ve açıkça kayıtlı tercih/politikalar.  
**Authority:** kural sınıflandırma, şartlı kısıt üretme.  
**Forbidden:** mekân bulmak, kullanıcının hard constraint'ini soft'a çevirmek, olmayan tercih uydurmak.  
**Invariant:** kullanıcı tarafından “zorunlu/mutlaka/olmazsa olmaz” biçiminde verilen şartlar açık bir çelişki yoksa hard constraint olarak korunur.  
**Primary oracle:** condition + requirement + strength doğru üretilecek; hard→soft downgrade = FAIL.

### TM-AG-003 — Destination Research Agent

**Mission:** hedef destinasyon veya çevre bölgeler için seyahat intelligence üretmek.

**Input:** `TripRequest`, `TravelerProfile`, `ConstraintSet`.  
**Output:** `DestinationBrief[]`.  
**Allowed tools:** `TL-001`, `TL-002`, `TL-003`, gerektiğinde `TL-007`, `TL-014`.  
**Allowed sources:** Tier 1 resmî turizm/belediye/valilik kaynakları, Tier 2 structured geo/iklim sağlayıcıları, discovery için Tier 4.  
**Authority:** bölge keşfi, alt bölge karşılaştırması, sezon/risk özeti.  
**Forbidden:** günlük rota yazmak, otel seçmek, kesin hava tahmini yerine iklim normali kullanmak.  
**Invariant:** uzak bölge önerisi constraint/radius gerekçesi taşımalıdır.  
**Primary oracle:** güncel iddiaların evidence'ı vardır; climate-as-forecast = FAIL.

### TM-AG-004 — Place Intelligence Agent

**Mission:** gezilecek yer ve deneyim adaylarını bulmak, zenginleştirmek ve uygunluk sinyalleri üretmek.

**Input:** `DestinationBrief`, `TravelerProfile`, `ConstraintSet`, tarih aralığı.  
**Output:** `PlaceCandidate[]`.  
**Allowed tools:** `TL-004`, `TL-002`, `TL-001`, `TL-003`, `TL-010`, `TL-014`.  
**Allowed sources:** Tier 1 resmî işletme/kurum, Tier 2 place provider, gerektiğinde Tier 3/4 discovery.  
**Authority:** candidate discovery, enrichment, eligibility/ranking sinyali.  
**Forbidden:** günlük sıralama yapmak, otel rezervasyonu yapmak, çalışma saatini LLM hafızasından kesinleştirmek.  
**Invariant:** `PlaceCandidate` en az stable place identity + konum + kategori + evidence taşır.  
**Primary oracle:** hard constraint'e uymayan aday accepted set'e giremez; unsupported opening-hours claim = FAIL.

### TM-AG-005 — Accommodation Agent

**Mission:** aile, lokasyon, bütçe ve tarih koşullarına uygun konaklama adaylarını karşılaştırmak.

**Input:** `TravelerProfile`, `DestinationBrief`, tarih aralığı, `ConstraintSet`.  
**Output:** `AccommodationCandidate[]`.  
**Allowed tools:** `TL-008`, `TL-004`, `TL-002`, `TL-009`, `TL-011`, `TL-014`.  
**Allowed sources:** Tier 1 tesis sitesi, Tier 2 accommodation provider, Tier 3 review provider.  
**Authority:** accommodation candidate discovery/ranking.  
**Forbidden:** doğrulanmayan canlı fiyat/müsaitlik iddiası, rezervasyon veya ödeme.  
**Invariant:** fiyat kaydı `LIVE|OFFICIAL|ESTIMATED|UNKNOWN` durumlarından birini taşır.  
**Primary oracle:** erişim yoksa fiyat uydurmak yerine `UNKNOWN`; fake live price = FAIL.

### TM-AG-006 — Food & Local Taste Agent

**Mission:** rota alanına ve tercihlere uygun restoran/yemek/yerel tat adayları üretmek.

**Input:** konum/rota alanı, `TravelerProfile`, `PreferenceSet`, `ConstraintSet`.  
**Output:** `FoodCandidate[]`.  
**Allowed tools:** `TL-004`, `TL-002`, `TL-001`, `TL-009`, `TL-010`, `TL-014`.  
**Allowed sources:** Tier 1 işletme kaynakları, Tier 2 place provider, Tier 3 yorum kaynakları, discovery için Tier 4.  
**Authority:** food candidate discovery/ranking.  
**Forbidden:** günlük rota sırasını değiştirmek, doğrulanmamış menü/fiyatı kesinleştirmek.  
**Invariant:** özel beslenme hard constraint'leri filtrelemeden önce uygulanır.  
**Primary oracle:** hard dietary conflict accepted = FAIL.

### TM-AG-007 — Weather Agent

**Mission:** lokasyon ve tarih için hava/iklim verisini aktivite risk sinyaline çevirmek.

**Input:** location, datetime/date range, activity type.  
**Output:** `WeatherSignal[]`.  
**Allowed tools:** `TL-006`, ileri tarih için `TL-007`, `TL-014`.  
**Allowed sources:** Tier 2 weather/climate provider.  
**Authority:** weather risk ve indoor/outdoor preference signal üretmek.  
**Forbidden:** planı tek başına iptal etmek/değiştirmek; iklim ortalamasını canlı tahmin olarak sunmak.  
**Invariant:** forecast ve climate-normal veri türleri açıkça ayrılır.  
**Primary oracle:** weather risk doğru; itinerary mutation = FAIL.

### TM-AG-008 — Transportation Agent

**Mission:** iki veya daha fazla konum arasındaki ulaşım seçeneklerini, mesafe ve süreyi hesaplamak.

**Input:** origin/destination, transport mode, datetime.  
**Output:** `RouteLeg[]` veya route matrix.  
**Allowed tools:** `TL-005`, gerektiğinde `TL-003`, `TL-014`.  
**Allowed sources:** Tier 1/2 directions/traffic sağlayıcısı.  
**Authority:** yol, trafik-aware süre ve ulaşım karşılaştırması.  
**Forbidden:** günlük etkinlik sıralaması veya POI seçimi.  
**Invariant:** sürüş süresi için düz çizgi mesafesi kullanılmaz.  
**Primary oracle:** A→B ölçümü doğru adapter'dan gelir; itinerary ordering = FAIL.

### TM-AG-009 — Route Planner Agent

**Mission:** aday yerleri çalışma saatleri, yol, trafik, aile temposu ve constraint'lere göre optimum günlük sıraya yerleştirmek.

**Input:** `PlaceCandidate[]`, `RouteLeg[]/RouteMatrix`, `ConstraintSet`, `TravelerProfile`, accommodation context.  
**Output:** `DailyPlan` / `Itinerary` taslağı.  
**Allowed tools:** `TL-005`, `TL-011`, `TL-012`, `TL-013`, `TL-014`.  
**Allowed sources:** yalnız girdilerdeki doğrulanmış facts + route provider sonuçları.  
**Authority:** zamanlama, sıralama, süre slotları.  
**Forbidden:** yeni POI uydurmak, hard constraint'i skorla telafi etmek.  
**Invariant:** hard constraint violation bir “ceza puanı” değil rejection sebebidir.  
**Primary oracle:** kapalı mekân slotu, impossible travel time veya hard constraint violation = FAIL.

### TM-AG-010 — Budget Agent

**Mission:** planın toplam ve kalem bazlı maliyetlerini deterministik olarak hesaplamak ve bütçe sınırını değerlendirmek.

**Input:** `Itinerary`, accommodation/transport/fee records, `ConstraintSet`.  
**Output:** `BudgetLedger`.  
**Allowed tools:** `TL-010`, `TL-011`, `TL-013`, `TL-014`.  
**Allowed sources:** doğrulanmış ücret kayıtları, Tier 1/2 fiyat sağlayıcıları.  
**Authority:** maliyet hesabı, budget status ve belirsizlik.  
**Forbidden:** bilinmeyen fiyatı gerçek fiyat yapmak, rota veya mekân seçmek.  
**Invariant:** her parasal kalem provenance + `LIVE|OFFICIAL|ESTIMATED|UNKNOWN` statüsü taşır.  
**Primary oracle:** arithmetic deterministik; fabricated amount = FAIL.

### TM-AG-011 — Public Authority Intelligence Agent

**Mission:** kritik iddiaları resmî/birincil kaynaklardan doğrulamak.

**Input:** claim + entity/location + date context.  
**Output:** `OfficialFact`.  
**Allowed tools:** `TL-001`, `TL-002`, `TL-010`, `TL-014`.  
**Allowed sources:** Tier 1 öncelikli: Bakanlık, belediye, valilik, milli park, müze, tesis/işletme resmî sayfası ve resmî tarife/duyuru.  
**Authority:** `VERIFIED|CONTRADICTED|UNKNOWN` fact verification.  
**Forbidden:** kullanıcı yorumu analizi, POI ranking, plan yazımı.  
**Invariant:** resmî kanıt bulunamazsa `UNKNOWN`; guess yok.  
**Primary oracle:** source mismatch veya unsupported `VERIFIED` = FAIL.

### TM-AG-012 — Review Intelligence Agent

**Mission:** normalize edilmiş yorumlardan pratik deneyim sinyalleri ve ortak temalar çıkarmak.

**Input:** `ReviewRecordSet`, entity identity, analysis window.  
**Output:** `ReviewSignal[]`.  
**Allowed tools:** `TL-009`, `TL-011`, `TL-014`; duplicate/spam temizliği deterministik servis olarak kullanılabilir.  
**Allowed sources:** Tier 3 review providers; gerektiğinde structured place review alanları.  
**Authority:** trend/theme/signal/confidence üretmek.  
**Forbidden:** tek yorumu gerçek kabul etmek, resmî fact üretmek.  
**Invariant:** sample size, freshness ve source coverage confidence'a yansır.  
**Primary oracle:** single-review→high-confidence fact = FAIL.

### TM-AG-013 — Adaptive Itinerary Agent

**Mission:** yeni hava, kapanma, yoğunluk veya benzeri sinyal geldiğinde mevcut planı hedefli olarak onarmak.

**Input:** `Itinerary` + change signal + relevant current evidence.  
**Output:** `AlternativePlan` / repaired itinerary fragment.  
**Allowed tools:** gerektiğinde `TL-004`, `TL-005`, `TL-006`, `TL-010`, `TL-011`, `TL-013`, `TL-014`.  
**Allowed sources:** yalnız değişikliği doğrulamak ve alternatif parçayı yeniden planlamak için gerekli kaynaklar.  
**Authority:** etkilenen gün/slot üzerinde targeted repair.  
**Forbidden:** etkilenmeyen günleri gereksiz yeniden üretmek, hard constraint'i gevşetmek.  
**Invariant:** minimal repair scope + before/after diff üretilebilir olmalıdır.  
**Primary oracle:** tek günlük olay nedeniyle tüm 5 günlük planı sebepsiz değiştirmek = FAIL.

### TM-AG-014 — Verification Agent

**Mission:** plan ve agent çıktılarında schema, evidence, constraint, saat, rota, bütçe ve tutarlılık kalite kapısını işletmek.

**Input:** itinerary + selected candidates + budget + evidence + traces.  
**Output:** `VerificationResult`.  
**Allowed tools:** öncelikle `TL-012`, `TL-013`, `TL-011`; gerektiğinde yeniden doğrulama için ilgili read-only tool'lar.  
**Allowed sources:** mevcut evidence; yalnız eksik/çelişkili kritik fact için yeniden doğrulama.  
**Authority:** `PASS|FAIL|REPAIR` ve repair target üretmek.  
**Forbidden:** nihai planı kendi başına yazmak veya yeni aday uydurmak.  
**Invariant:** deterministic check mümkünse LLM judgement kullanılmaz.  
**Primary oracle:** hard violation bulunan plan `PASS` alamaz; reviewer-generated POI = FAIL.

### TM-AG-015 — Explanation Agent

**Mission:** doğrulanmış kararların nedenlerini kullanıcıya anlaşılır biçimde açıklamak.

**Input:** verified decisions + `AgentTrace` + evidence summaries.  
**Output:** explanation blocks.  
**Allowed tools:** normalde yok; `TL-012` output validation için kullanılabilir.  
**Allowed sources:** yalnız doğrulanmış plan ve decision trace.  
**Authority:** gerekçe/karşılaştırma açıklaması.  
**Forbidden:** yeni fact, yeni fiyat, yeni POI veya yeni karar eklemek.  
**Invariant:** `facts(explanation) ⊆ facts(verified_plan/evidence)`.  
**Primary oracle:** açıklamada yeni unsupported fact = FAIL.

### TM-AG-016 — Final Composer Agent

**Mission:** doğrulanmış yapılandırılmış çıktıları kullanıcıya sunulan nihai tatil planına dönüştürmek.

**Input:** verified itinerary, alternatives, budget, explanation, warnings.  
**Output:** user-facing `FinalTravelPlan`.  
**Allowed tools:** dış dünya tool'u yok; yalnız schema/format validator kullanılabilir.  
**Allowed sources:** yalnız doğrulanmış upstream objeler.  
**Authority:** sunum, düzenleme, özetleme.  
**Forbidden:** web search, yeni mekân/fiyat/fact ekleme, doğrulanmış değeri değiştirme.  
**Invariant:** composer renderer'dır; researcher değildir.  
**Primary oracle:** tool call leakage veya upstream'de olmayan place = FAIL.

## 7. TM-ORCH-001 — Travel Orchestrator

**Mission:** kullanıcı isteğini capability graph'a dönüştürmek, uzman agentları doğru sırada çalıştırmak, handoff'ları doğrulamak ve verification/repair döngüsünü yönetmek.

**Input:** `TripRequest` + workflow state.  
**Output:** orchestration trace + verified final pipeline result.  
**Allowed tools:** `TL-012`, orchestration state/cache için `TL-014`; uzman domain dış dünya tool'larını doğrudan çağırmaz.  
**Authority:** agent seçimi, dependency graph, retry/fallback, timeout, budget/cost guard, repair routing.  
**Forbidden:** POI/otel/restoran araştırmak, rota hesaplamak, hava/fiyat fact'i üretmek, uzman kararını gizlice üstlenmek.  
**Invariant:** normal dış-dünya erişimi `Orchestrator → Specialist Agent → Tool` biçimindedir; `Orchestrator → Domain Tool` authority violation sayılır.  
**Primary oracle:** uzman tool'unu doğrudan çağırmak = FAIL; schema-invalid handoff'u downstream'e geçirmek = FAIL.

## 8. Authority matrisi

| Agent | Araştırabilir | Karar verebilir | Planı değiştirebilir | Final metin yazabilir |
|---|---:|---:|---:|---:|
| Profile | Hayır | Profil | Hayır | Hayır |
| Preference & Policy | Hayır | Constraint | Hayır | Hayır |
| Destination Research | Evet | Bölge adayları | Hayır | Hayır |
| Place Intelligence | Evet | POI adayları | Hayır | Hayır |
| Accommodation | Evet | Konaklama adayları | Hayır | Hayır |
| Food & Local Taste | Evet | Food adayları | Hayır | Hayır |
| Weather | Evet | Risk sinyali | Hayır | Hayır |
| Transportation | Evet | Route facts | Hayır | Hayır |
| Route Planner | Sınırlı | Zamanlama/sıra | Evet, taslak | Hayır |
| Budget | Sınırlı | Bütçe durumu | Hayır | Hayır |
| Public Authority | Evet | Fact doğrulama | Hayır | Hayır |
| Review Intelligence | Evet | Review signal | Hayır | Hayır |
| Adaptive Itinerary | Sınırlı | Repair | Evet, hedefli | Hayır |
| Verification | Sınırlı | PASS/FAIL/REPAIR | Hayır | Hayır |
| Explanation | Hayır | Hayır | Hayır | Açıklama |
| Final Composer | Hayır | Hayır | Hayır | Evet |
| Orchestrator | Hayır | Workflow | Routing | Hayır |

## 9. Kanonik execution graph

```text
TripRequest
   │
   ▼
TM-AG-001 Profile
   │
   ▼
TM-AG-002 Preference & Policy
   │
   ▼
TM-AG-003 Destination Research
   │
   ├──────────────┬──────────────┐
   ▼              ▼              ▼
TM-AG-004       TM-AG-005       TM-AG-006
Places          Accommodation   Food
   │              │              │
   ├───────┬──────┴──────┬───────┘
   ▼       ▼             ▼
TM-AG-011 TM-AG-012    TM-AG-007
Official  Reviews      Weather
   │       │             │
   └───────┴──────┬──────┘
                  ▼
             TM-AG-008
           Transportation
                  │
                  ▼
             TM-AG-009
            Route Planner
                  │
                  ▼
             TM-AG-010
               Budget
                  │
                  ▼
             TM-AG-014
            Verification
                  │
            FAIL/REPAIR ──────► TM-AG-013 Adaptive Itinerary
                  │                         │
                  └───────────────◄─────────┘
                  │ PASS
          ┌───────┴────────┐
          ▼                ▼
     TM-AG-015         verified data
     Explanation           │
          └───────┬────────┘
                  ▼
             TM-AG-016
           Final Composer

TM-ORCH-001 bütün graph'ı koordine eder; domain tool'larını doğrudan kullanmaz.
```

## 10. Ortak test merdiveni

Her agent aynı test seviyelerini desteklemelidir.

| Seviye | Amaç |
|---|---|
| `R0 Contract` | Input/output schema ve required fields |
| `R1 Deterministic` | Saf kural ve invariant'lar |
| `R2 Fixture` | Kayıtlı tool cevaplarıyla bağımsız agent testi |
| `R3 Tool Integration` | Gerçek adapter/tool sözleşmesi |
| `R4 Semantic` | Görev kalitesi ve uygunluk |
| `R5 Adversarial` | Eksik, çelişkili, stale ve bozuk veri |
| `R6 Authority` | Agent sınır ihlali / tool leakage |
| `R7 Live` | Güncel gerçek kaynaklarla kontrollü test |
| `R8 Regression` | Geçmiş hata fixture'larının kalıcı testi |

Live test ilk doğrulama seviyesi değildir. Önce fixture/deterministic testler geçmelidir.

## 11. Tool trace sözleşmesi

Her dış tool çağrısı gözlemlenebilir olmalıdır.

```yaml
ToolCall:
  agentId: string
  toolId: string
  input: object
  outputRef: string
  timestamp: datetime
  latencyMs: number
  cost: number|null
  cacheHit: boolean
  status: string
  evidenceRefs: []
```

## 12. Ortak authority failure örnekleri

Aşağıdakiler doğrudan test failure'dır:

- Weather Agent'ın POI önermesi veya itinerary değiştirmesi.
- Profile Agent'ın web araması yapması.
- Place Intelligence Agent'ın otel rezervasyonu/ödeme yapması.
- Route Planner'ın hard constraint'i sadece skor cezasına dönüştürmesi.
- Budget Agent'ın fiyat uydurması.
- Verification Agent'ın yeni mekân üretmesi.
- Final Composer'ın web araması yapması veya yeni fact eklemesi.
- Orchestrator'ın Place/Routes/Weather gibi domain tool'larını uzman agent yerine doğrudan çağırması.

## 13. Eski canonical-draft setiyle reconciliation haritası

`docs/11-agent-specifications/` içindeki 2026-08-27 öncesi ilk-phase dosyaları silinmez; önceki tasarım kanıtı olarak korunur ancak ownership açısından bu katalog önceliklidir.

| Önceki spec | Yeni kanonik ownership |
|---|---|
| `trip-intake-agent.md` | TM-AG-001 Profile |
| `constraint-policy-agent.md` | TM-AG-002 Preference & Policy |
| `family-suitability-agent.md` | TM-AG-001 + TM-AG-002 + TM-AG-004 scoring responsibility |
| `destination-candidate-agent.md` | TM-AG-003 Destination Research |
| `route-logistics-agent.md` | TM-AG-008 Transportation + TM-AG-009 Route Planner |
| `accommodation-fit-agent.md` | TM-AG-005 Accommodation |
| `activity-fit-agent.md` | TM-AG-004 Place Intelligence |
| `day-plan-composer-agent.md` | TM-AG-009 Route Planner + TM-AG-013 Adaptive Itinerary |
| `verification-evidence-agent.md` | TM-AG-011 Public Authority + TM-AG-014 Verification |
| `final-response-composer-agent.md` | TM-AG-015 Explanation + TM-AG-016 Final Composer |

Bu reconciliation tamamlanana kadar eski spec dosyalarındaki isim/ownership çakışmalarında bu belge kazanır.

## 14. Değişiklik yönetimi

Yeni agent ancak aşağıdaki soruların tamamı olumluysa eklenebilir:

- bağımsız ve net bir sorumluluk sınırı var mı,
- ayrı input/output contract var mı,
- farklı tool/model/prompt politikası gerekiyor mu,
- bağımsız fixture testi yazılabilir mi,
- ayrı authority envelope anlamlı mı,
- ayrı confidence/quality metriği var mı?

Agent sayısı keyfî biçimde artırılmaz.

Bu katalogda görev sınırı veya ownership değişikliği mimari değişiklik sayılır ve sürüm artırımı gerektirir.

## 15. Sonraki kanonikleştirme adımı

Bu belge agent **catalog/contract baseline**'ını dondurur. Sonraki aşamada her `TM-AG-*` için ayrı specification paketi aşağıdaki alanlarla oluşturulur/güncellenir:

1. Purpose
2. Non-goals
3. Inputs
4. Outputs
5. Required context
6. Forbidden context
7. Dependencies
8. Handoff rules
9. Hard constraints
10. Evidence requirements
11. Confidence rules
12. Failure modes
13. Clarification triggers
14. Fixture requirements
15. Evaluation rubric
16. Example contract sketch
17. Open design questions

Bu paketler test harness'in agent bazında çalıştıracağı contract, fixture, adversarial, authority ve live testlerin kaynağı olacaktır.
