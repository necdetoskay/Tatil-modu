# Tatil Modu — Implementation Blueprint

**Doküman türü:** Uygulama ve gerçekleştirme planı
**Sürüm:** 1.0 Taslak
**Durum:** Dokümantasyon aşaması
**Hedef:** Kanonik mimarinin güvenli ve test edilebilir şekilde uygulanması

## 1. Amaç

Bu doküman, Tatil Modu mimarisinin hangi aşamalarla, hangi bileşenlerle ve hangi doğrulama kapılarından geçerek gerçek uygulamaya dönüştürüleceğini tanımlar.

## 2. Uygulama Stratejisi

Önerilen yaklaşım:

1. önce sözleşmeler,
2. sonra mock agentlar,
3. sonra izole gerçek agentlar,
4. sonra orkestrasyon,
5. sonra E2E,
6. sonra canlı tool entegrasyonu,
7. en son rezervasyon/işlem katmanı.

Kodlamaya agent promptlarından başlanmamalıdır.

## 3. Teknoloji Yaklaşımı

Mimari framework bağımsız kalmalıdır.

Olası uygulama seçenekleri:

- kendi TypeScript orkestrasyon katmanı
- OpenAI Agents SDK
- LangGraph
- Temporal
- Flowise prototipi
- n8n yardımcı entegrasyonları
- PostgreSQL tabanlı workflow/state store
- Redis queue/cache

### Tavsiye

- hızlı prototip ve agent testleri: Flowise
- üretim orkestrasyonu: TypeScript + state machine/workflow engine
- uzun süreli görev ve retry: Temporal veya benzeri
- kanonik veri: PostgreSQL
- kısa süreli state/cache: Redis
- gözlemlenebilirlik: OpenTelemetry

## 4. Repo Yapısı

```text
tatil-modu/
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
├── packages/
│   ├── acp/
│   ├── contracts/
│   ├── orchestrator/
│   ├── agents/
│   ├── platforms/
│   ├── tools/
│   ├── evals/
│   ├── observability/
│   └── shared/
├── docs/
│   ├── architecture/
│   ├── agents/
│   ├── platforms/
│   ├── protocols/
│   ├── testing/
│   └── adr/
└── infra/
```

## 5. Faz 0 — Governance

Çıktılar:

- repo kuralları
- branch stratejisi
- ADR standardı
- dokümantasyon standardı
- gizli bilgi yönetimi
- model/tool maliyet bütçesi
- kabul seviyeleri

## 6. Faz 1 — Contracts First

İlk uygulanacaklar:

- ACP envelope
- common error model
- Universal Evidence Model
- profile schemas
- preference/policy schemas
- plan schemas
- agent request/response schemas

Araçlar:

- JSON Schema
- Zod
- OpenAPI
- contract tests

## 7. Faz 2 — Platform Foundations

Öncelik sırası:

1. Observability Platform
2. Memory Gateway
3. Knowledge Registry
4. Verification Registry
5. Policy Enforcement
6. Optimization contracts

Bu aşamada LLM gerekmez.

## 8. Faz 3 — Mock Agent Harness

Her agent için:

- sabit girdiler
- mock tool cevapları
- beklenen JSON çıktısı
- hata senaryoları
- maliyet/süre metrikleri

hazırlanır.

Amaç agentları bağımsız test etmektir.

## 9. Faz 4 — Core Agents

Sıra:

1. Profile Agent
2. Preference Agent
3. Policy Agent
4. Travel Orchestrator
5. Activity Discovery Agent
6. Hotel Agent
7. Route Planner
8. Budget Agent
9. Adaptive Day Planner

## 10. Faz 5 — External Intelligence

- Weather
- Crowd & Timing
- Public Authority
- Maps/Route
- Hotel/POI
- Events
- Pricing

Her dış kaynak adapter arkasında olmalıdır.

## 11. Tool Adapter Standardı

Her adapter:

- timeout
- retry
- rate limit
- cache
- schema validation
- source metadata
- error normalization
- mock implementation

desteklemelidir.

## 12. Faz 6 — Orchestration

Uygulanacaklar:

- task DAG
- parallel execution
- dependency resolution
- cancellation
- timeout
- circuit breaker
- partial completion
- delta replanning

## 13. Faz 7 — Optimization

İlk sürüm:

- weighted scoring
- hard constraint filtering
- fairness checks
- trade-off explanation

İleri sürüm:

- Pareto frontier
- sensitivity analysis
- constraint solver
- regret minimization

## 14. Faz 8 — Evaluation Platform

- golden scenarios
- synthetic scenarios
- regression tests
- judge models
- deterministic rule checks
- cost benchmark
- latency benchmark
- safety tests

## 15. Faz 9 — E2E Golden Scenario

İlk referans:

```text
Kocaeli → Bursa
2 yetişkin
2 ve 6 yaşında çocuk
1 gece
30.000 TL
öğle dinlenmesi
muhafazakâr termal otel
havuz
hayvanat bahçesi
bilim merkezi
teleferik
```

Bu senaryo bütün agent zincirini test eder.

## 16. Faz 10 — Live Trip Mode

- context memory
- live events
- replan triggers
- push notifications
- live budget
- offline fallback
- audit trail

## 17. Faz 11 — Post-Trip Learning

- feedback collection
- satisfaction analysis
- learning candidates
- memory review
- agent scorecards
- model calibration

## 18. Air-Gap Tasarımı

Air-gap destekleri:

- local model adapter
- local embedding/vector store
- cached POI/authority registry
- offline map datasets
- file-based import/export
- local secrets vault
- no direct internet mode
- controlled sync gateway

Her tool için:

- online adapter
- offline adapter
- mock adapter

tanımlanmalıdır.

## 19. Güvenlik

- least privilege
- scoped memory access
- prompt injection quarantine
- secret isolation
- outbound domain allowlist
- PII minimization
- immutable audit
- human approval for transactions
- signed tool responses where possible

## 20. Observability

OpenTelemetry tabanlı:

- traces
- metrics
- logs
- model usage
- tool usage
- cost
- confidence
- retries
- cache hit
- policy violations

izlenir.

## 21. CI/CD Kalite Kapıları

Merge öncesi:

- lint
- typecheck
- unit tests
- contract tests
- security tests
- golden scenario subset
- cost budget check
- schema compatibility

Release öncesi:

- full regression
- E2E
- prompt injection suite
- load test
- rollback test
- migration test

## 22. Model Yönetimi

Model seçimi alias ile yapılır:

- `fast_classifier`
- `structured_extractor`
- `planner`
- `verifier`
- `judge`

Kod doğrudan sağlayıcı model adına bağlanmamalıdır.

## 23. Prompt Yönetimi

- prompt registry
- versioning
- checksum
- eval linkage
- rollback
- environment promotion
- no inline production prompt

## 24. Veri Depoları

### PostgreSQL
- canonical entities
- trips
- policies
- memory versions
- evidence
- audit references

### Redis
- task state
- cache
- rate limit
- locks

### Object Storage
- snapshots
- imported data
- reports
- media

### Vector/Graph
İhtiyaca göre ayrı veya PostgreSQL üzerinde başlanabilir.

## 25. İlk MVP Kapsamı

MVP:

- tek ülke: Türkiye
- özel araç
- 1–3 günlük aile gezileri
- çocuklu aile profili
- aktivite/hotel/route/budget
- public authority checks
- weather
- static + adaptive alternatives
- no booking transaction

MVP dışı:

- uçuş
- uluslararası vize
- ödeme
- tam otonom rezervasyon
- gerçek zamanlı kalabalık garantisi

## 26. Sprint Önerisi

### Sprint 0
Contracts, repo, CI, observability skeleton

### Sprint 1
Profile, Preference, Policy, Memory mock

### Sprint 2
Activity Discovery + Knowledge mock

### Sprint 3
Hotel + Route + Budget mock

### Sprint 4
Orchestrator + Adaptive Day Planner

### Sprint 5
Weather + Public Authority adapters

### Sprint 6
Optimization + Explanation

### Sprint 7
Golden Bursa E2E

### Sprint 8
Regression, safety, cost tuning

## 27. Definition of Done

Bir agent tamamlanmış sayılmaz yalnızca promptu çalıştığında.

Gerekli:

- versioned contract
- mock tests
- negative tests
- permission tests
- observability
- cost limit
- timeout/retry
- evidence handling
- acceptance criteria
- E2E coverage

## 28. Riskler

- agent sayısının gereksiz büyümesi
- tool verisinin güvensizliği
- model maliyeti
- latency
- stale data
- prompt drift
- over-personalization
- yanlış memory learning
- vendor lock-in

## 29. Risk Azaltma

- contracts first
- platform reuse
- model aliases
- cache/TTL
- partial completion
- human approval
- golden scenarios
- staged rollout
- feature flags
- rollback

## 30. İlk Uygulama Kararı

İlk gerçek kodlama öncesi tamamlanması gerekenler:

1. ACP JSON Schema
2. Universal Evidence Schema
3. Family Graph Schema
4. Trip Plan Schema
5. Error Registry
6. Golden Bursa Fixture
7. Mock Tool Interfaces
8. Agent Test Harness

## 31. Kabul Kriterleri

- Framework bağımsız olmalı.
- Agentlar mock ile tek tek test edilebilmeli.
- Online/offline/mock adapter yapısı bulunmalı.
- Contracts first uygulanmalı.
- CI kalite kapıları tanımlı olmalı.
- MVP sınırları açık olmalı.
- Air-gap mod gerçekçi olmalı.
- E2E golden scenario ile doğrulanmalı.
- Patch/kod aşamasına geçmeden blueprint tamamlanmış olmalı.
