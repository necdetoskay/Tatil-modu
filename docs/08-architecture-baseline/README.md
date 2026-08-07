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

## Freeze durumu

Bu paket Architecture Freeze öncesi kanonik baseline'dır.
`architecture-review/` altındaki checklist ve gap register, freeze incelemesinde
kullanılacaktır.

AI Agent Architecture Handbook, Architecture Freeze tamamlandıktan sonra
hazırlanacaktır.
