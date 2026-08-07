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

## Freeze durumu

Bu paket Architecture Freeze öncesi kanonik baseline'dır.
`architecture-review/` altındaki checklist ve gap register, freeze incelemesinde
kullanılacaktır.

AI Agent Architecture Handbook, Architecture Freeze tamamlandıktan sonra
hazırlanacaktır.
