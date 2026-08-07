# Architecture Baseline — Post Knowledge Platform

Bu dizin, repodaki `docs/07-knowledge-platform` çalışmasından sonra hazırlanan
kanonik Tatil Modu mimari çalışmalarını toplar.

## Kapsam

- [Travel Knowledge Store](travel-knowledge-store.md)
- Verification Platform
- Activity / Route / Hotel / Day Planner agentları
- Budget Intelligence
- Optimization
- Environmental Intelligence
- Experience & Satisfaction
- End-to-End Execution Pipeline
- Agent Communication Protocol (ACP)
- Implementation Blueprint
- AI Engineering & Evaluation
- Golden Bursa Family Trip Fixture
- JSON Schema Library standardı
- Prompt Registry standardı
- Tool Adapter standardı
- Agent SDK
- Observability
- Security
- Runtime
- Deployment
- Operations
- Governance
- Configuration & Feature Flags
- Data Lifecycle & Governance
- Performance & Capacity Planning
- Backup & Disaster Recovery
- Version Management & Compatibility
- Architecture Review & Freeze Plan
- [Architecture Freeze Required Artifact Inventory](freeze-required-artifact-inventory.md)
- [Central Error Code Registry](error-code-registry.md)
- [Architecture Dependency Index](architecture-dependency-index.md)
- [Architecture Terminology Registry](architecture-terminology-registry.md)
- [Memory Platform Boundary](memory-platform-boundary.md)
- [Public Authority Layering](public-authority-layering.md)
- [Evaluation Standards Hierarchy](evaluation-standards-hierarchy.md)
- [Architecture Baseline Staging Policy](architecture-baseline-staging-policy.md)

## Knowledge ayrımı

Bu baseline içindeki runtime seyahat bilgisi `Travel Knowledge Store` adıyla anılır.

`Knowledge Platform` adı yalnız `docs/07-knowledge-platform/` altında tanımlanan kanonik ontology, claim, rule, formula, threshold, policy, prompt, schema, evaluation ve migration registry yönetişimi için kullanılır.

Travel Knowledge Store, Knowledge Platform registry snapshot'larını tüketir; onların canonical ownership sorumluluğunu üstlenmez.

## Travel Intelligence ayrımı

Bu baseline içinde `Budget Intelligence`, `Environmental Intelligence`, `Experience & Satisfaction` ve benzeri Travel Intelligence bileşenleri agent değildir.

Travel Intelligence bileşenleri domain assessment module olarak çalışır:

- kendi başına orkestrasyon yapmaz,
- başka agent çağırmaz,
- canonical veri sahipliği almaz,
- kullanıcı hafızasına doğrudan yazmaz,
- plan oluşturmaz,
- Travel Orchestrator veya ilgili Planner tarafından çağrılır,
- evidence ve verification durumunu input olarak tüketir,
- karar destek skoru, risk, açıklama ve trade-off üretir.

Agentlar görev yürütür; Travel Intelligence modülleri görev kararlarını zenginleştiren değerlendirme katmanıdır.

## Capability Platform / Tool Adapter ayrımı

`Tool Adapter standardı` bağımsız bir platform değildir. Capability Platform / Tool Gateway altında kullanılan provider adapter sözleşmesidir.

Capability Platform şu sorumlulukların sahibidir:

- tool discovery ve capability registry,
- permission ve policy enforcement,
- timeout, retry, rate limit ve circuit breaker,
- audit, observability ve cost tracking,
- online/offline/mock provider seçimi,
- tool response normalization ve error normalization.

Tool Adapter standardı ise her provider entegrasyonunun uyması gereken alt seviye sözleşmeyi tanımlar:

- request/response schema,
- source metadata,
- evidence handoff,
- cache/TTL bilgisi,
- mock implementation,
- provider-specific failure mapping.

Agentlar doğrudan provider adapter çağırmaz; Tool Gateway / Capability Platform üzerinden çağırır.

## Confidence ownership ayrımı

ARF-010 kararı: Confidence tek bir agentın veya tek bir platformun serbestçe ürettiği genel puan değildir. Confidence, ortak `Confidence Engine` semantiğiyle normalize edilen, evidence-bound ve açıklanabilir karar sinyalidir.

Confidence Engine şu ortak semantiğin sahibidir:

- confidence ölçeği ve aralıkları,
- confidence label sözlüğü,
- aggregation kuralları,
- minimum evidence requirement,
- uncertainty propagation,
- downgrade / escalation kuralları,
- explanation formatı,
- confidence lifecycle ve audit alanları.

Katmanlar kendi domain confidence girdilerini üretebilir; fakat canonical confidence semantiğini tekrar tanımlamaz:

- Data Source & Trust, source confidence ve evidence strength girdilerini üretir.
- Verification Platform, Data Source & Trust sonucunu verification confidence olarak taşır; authority/freshness/conflict algoritmalarını yeniden sahiplenmez.
- Travel Intelligence modülleri suitability/risk confidence üretir; kaynak güveni yerine domain değerlendirme güvenini ifade eder.
- Planner ve Orchestrator confidence değerlerini karar kapılarında kullanır; genel confidence ölçeğini değiştirmez.
- Final Plan Composer confidence'ı kullanıcıya açıklanabilir uyarı, varsayım ve alternatif gerekçesi olarak sunar; yeni confidence hesaplama otoritesi değildir.

Confidence değeri kanıtsız taşınamaz. Her confidence sinyali mümkün olduğunda Universal Evidence Model referansı, üreten katman, hesaplama zamanı ve açıklama ile birlikte taşınmalıdır.

## Lifecycle / status vocabulary ayrımı

ARF-011 kararı: `status`, `state`, `lifecycle`, `maturity` ve `verification_status` aynı kavram gibi kullanılmaz. Her statü alanı kendi domain'inde tanımlanır ve alan adı domain niyetini açıkça taşır.

Canonical statü grupları:

| Grup | Alan adı | Sahip | Değerler | Kullanım |
|---|---|---|---|---|
| Doküman durumu | `document_status` | Governance / Documentation | `draft`, `review`, `approved`, `superseded`, `deprecated` | Dokümanın yayın ve geçerlilik durumu |
| Artifact durumu | `artifact_status` | Architecture Freeze Artifact Inventory | `required`, `drafted`, `implemented`, `validated`, `deprecated` | Schema, registry, fixture ve test artifact takibi |
| Agent olgunluğu | `agent_maturity` | Agent Catalog / Evaluation | `proposed`, `specified`, `contracted`, `fixture-tested`, `live-tested`, `production-ready`, `deprecated` | Agent geliştirme ve test seviyesi |
| Runtime execution | `execution_state` | Orchestrator / Runtime | `queued`, `running`, `succeeded`, `failed`, `cancelled`, `blocked` | Çalışan iş veya agent run durumu |
| Verification sonucu | `verification_status` | Verification Platform | `verified`, `likely`, `uncertain`, `rejected`, `stale` | Claim doğrulama sonucu |
| Evidence durumu | `evidence_status` | Data Source & Trust | `fresh`, `usable`, `weak`, `conflicting`, `expired`, `missing` | Kanıtın kullanılabilirliği |
| Plan karar durumu | `decision_state` | Planner / Orchestrator | `accepted`, `alternative`, `deferred`, `requires_user_input`, `rejected` | Plan içindeki karar kapısı sonucu |

Kurallar:

- Genel `status` alanı yeni contract'larda tek başına kullanılmaz; domain-specific alan adı seçilir.
- Bir dokümanın `document_status` değeri runtime doğrulama sonucu gibi yorumlanamaz.
- Bir claim'in `verification_status` değeri agent maturity veya artifact readiness anlamına gelmez.
- Lifecycle değerleri geriye dönük compatibility için registry'de versiyonlanır.
- Yeni schema, prompt, registry ve agent contract'ları bu vocabulary ile uyumlu olmak zorundadır.

## Error Code Registry ayrımı

ARF-012 kararı: Hata kodları agent veya platform dokümanlarında dağınık biçimde tanımlanmaz. Merkezi hata kodu sözlüğü `[Central Error Code Registry](error-code-registry.md)` dosyasıdır.

Error Code Registry şu semantiğin sahibidir:

- error code formatı,
- domain prefix sözlüğü,
- severity sözlüğü,
- kullanıcıya gösterim politikası,
- retry policy,
- audit gereksinimi,
- provider-specific hata mapping kuralları.

Katmanlar hata üretebilir; fakat yeni hata kodunu registry dışında tanımlayamaz.

## Cross-reference / dependency metadata ayrımı

ARF-013 kararı: Canonical mimari dokümanlar yalnız içerik taşımaz; hangi ARF kararına, hangi ownership boundary'ye ve hangi artifact'a bağlı oldukları da izlenebilir olmalıdır.

Cross-reference ve dependency metadata için canonical takip noktası `[Architecture Dependency Index](architecture-dependency-index.md)` dosyasıdır.

Yeni canonical agent, platform, schema, registry veya prompt dokümanı mümkün olduğunda owner, depends_on, related_artifacts, canonical_status ve architecture_review metadata'sı taşımalıdır.

## Architecture terminology ayrımı

ARF-014 kararı: Platform, service, agent, planner, module, registry, store, gateway ve adapter terimleri birbirinin yerine kullanılmaz.

Canonical terminoloji takip noktası `[Architecture Terminology Registry](architecture-terminology-registry.md)` dosyasıdır.

Yeni canonical dokümanlarda bileşen türü mümkün olduğunda `component_type` metadata alanıyla belirtilmelidir. Bileşen bir görev yürütüyorsa `agent`, plan kararı veriyorsa `planner`, yalnız domain değerlendirmesi yapıyorsa `module`, ortak altyapı sağlıyorsa `platform`, canonical sözlük tutuyorsa `registry`, kalıcı veri tutuyorsa `store`, provider girişini normalize ediyorsa `gateway`, tekil provider entegrasyonunu temsil ediyorsa `adapter` olarak adlandırılır.

## Memory Platform ayrımı

ARF-015 kararı: Memory; agent, planner veya Travel Knowledge Store içinde dağınık tutulmaz. Kullanıcıya ve aileye ilişkin kalıcı, izinli, açıklanabilir ve yaşam döngüsü yönetilen bilgiler için canonical sınır `[Memory Platform Boundary](memory-platform-boundary.md)` dosyasıdır.

Hiçbir expert agent canonical memory'ye doğrudan yazmaz. Agent ve planner bileşenleri memory write candidate üretebilir; kalıcı mutation yalnız Memory Platform validation, consent/policy check ve audit kaydı sonrasında yapılır.

Travel Knowledge Store destinasyon/POI/otel/aktivite bilgisini tutar; Memory Platform kullanıcı ve aile bağlamını tutar. Bu iki store birbirinin yerine kullanılmaz.

## Public Authority layering ayrımı

ARF-016 kararı: Public Authority sorumluluğu tek katmanda toplanmaz. Kaynak erişimi Capability Platform'da, authority/freshness/evidence semantiği Data Source & Trust'ta, runtime taşıma Verification Platform'da, kural etkisi Policy / Constraint Layer'da, plan uygulaması Planner / Orchestrator'da ve kullanıcı açıklaması Final Plan Composer'da tutulur.

Canonical public authority boundary takip noktası `[Public Authority Layering](public-authority-layering.md)` dosyasıdır.

Public authority claim'leri hard constraint, soft warning, operational advisory veya source note olarak sınıflandırılır. Planner hard constraint olarak sınıflandırılmış resmi kuralı gevşetemez; kullanıcıya gösterilecek açıklama Final Plan Composer tarafından kaynak ve belirsizlik bilgisiyle taşınır.

## Evaluation standards hierarchy ayrımı

ARF-017 kararı: Evaluation standardı tek bir skor sistemi değildir. Safety, contract, hard constraint, evidence, domain quality, coherence, runtime ve regression katmanlarından oluşan hiyerarşik gate sistemidir.

Canonical evaluation hiyerarşisi `[Evaluation Standards Hierarchy](evaluation-standards-hierarchy.md)` dosyasında tutulur.

Evaluation sonuçları çelişirse daha üst sıradaki gate önceliklidir. Safety veya hard constraint failure, yüksek domain quality skoru ya da düşük latency ile telafi edilemez.

## Architecture baseline staging ayrımı

ARF-018 kararı: `docs/08-architecture-baseline/` kalıcı canonical tree değildir. Bu klasör Architecture Freeze öncesi staging alanıdır.

Canonical staging policy `[Architecture Baseline Staging Policy](architecture-baseline-staging-policy.md)` dosyasında tutulur.

Architecture Freeze tamamlanana kadar ownership ve boundary çakışmalarında bu klasör geçici önceliklidir. Freeze tamamlandıktan sonra içerikler kalıcı canonical dokümantasyon alanlarına taşınır, bağlanır veya arşiv snapshot olarak işaretlenir.

## Freeze durumu

Bu paket Architecture Freeze öncesi staging baseline'dır.

`architecture-review/` altındaki checklist ve gap register freeze incelemesinde kullanılacaktır. Freeze tamamlandığında bu klasör kalıcı mimari kök olarak genişletilmeyecek; içeriği kalıcı dokümantasyon ağacına migrate edilecek, ilgili canonical dosyalara bağlanacak veya freeze snapshot olarak arşivlenecektir.

AI Agent Architecture Handbook, Architecture Freeze tamamlandıktan sonra hazırlanacaktır.
