# Tatil Modu — Agent SDK Standardı

**Doküman türü:** Agent geliştirme standardı
**Teknik kod adı:** `agent_sdk_standard`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Agent SDK, Tatil Modu içindeki bütün agentların aynı yaşam döngüsü, mesajlaşma, izin, hata, gözlemlenebilirlik ve test kurallarıyla geliştirilmesini sağlayan ortak geliştirme katmanıdır.

Amaç:

- her agentta tekrar eden altyapı kodunu azaltmak,
- ACP uyumunu zorunlu kılmak,
- güvenlik ve disclosure kontrollerini merkezi hale getirmek,
- hata ve retry davranışını standartlaştırmak,
- agentların mock ortamda bağımsız test edilmesini kolaylaştırmak,
- model ve tool bağımlılığını adapter arkasına almak.

## 2. Temel İlkeler

- Agent yalnızca iş mantığını uygular; altyapı SDK tarafından sağlanır.
- ACP mesaj doğrulaması agent koduna bırakılmaz.
- Agent doğrudan provider SDK kullanmaz.
- Agent doğrudan Memory veya Knowledge deposuna yazmaz.
- Her agent request/response şeması taşır.
- Her agent açık izin ve tool scope bildirir.
- Her agent timeout, cancellation ve retry sinyallerine uyar.
- Her agent izlenebilir karar ve hata kaydı üretir.

## 3. SDK Bileşenleri

```text
Agent SDK
├── BaseAgent
├── ACP Client
├── Contract Validator
├── Permission Guard
├── Tool Gateway Client
├── Prompt Registry Client
├── Memory Disclosure Client
├── Evidence Builder
├── Retry & Timeout Controller
├── Cancellation Token
├── Observability Hooks
├── Cost Meter
├── Error Normalizer
└── Test Harness
```

## 4. BaseAgent Sözleşmesi

```ts
interface BaseAgent<TInput, TOutput> {
  readonly id: string;
  readonly version: string;
  readonly inputSchema: string;
  readonly outputSchema: string;

  execute(
    input: TInput,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult<TOutput>>;
}
```

## 5. AgentExecutionContext

```ts
interface AgentExecutionContext {
  requestId: string;
  traceId: string;
  tripId?: string;
  taskId: string;
  deadlineAt?: string;
  locale: string;
  currency: string;
  permissionScopes: string[];
  toolScopes: string[];
  cancellationToken: CancellationToken;
  observability: ObservabilityContext;
}
```

## 6. AgentExecutionResult

```ts
interface AgentExecutionResult<TOutput> {
  status:
    | "completed"
    | "partial"
    | "needs_input"
    | "blocked"
    | "failed";
  data?: TOutput;
  confidence: number;
  warnings: string[];
  assumptions: string[];
  unknowns: string[];
  evidence: Evidence[];
  metrics: AgentMetrics;
}
```

## 7. Yaşam Döngüsü

```text
validate envelope
  ↓
validate input schema
  ↓
check permissions
  ↓
load prompt bundle
  ↓
load disclosure context
  ↓
execute domain logic
  ↓
validate output schema
  ↓
attach evidence
  ↓
emit metrics
  ↓
return ACP response
```

## 8. Permission Guard

Agent başlamadan önce:

- data scope,
- tool scope,
- purpose,
- sensitivity,
- target resource

kontrol edilir.

Yetki ihlali agent koduna ulaşmadan engellenir.

## 9. Prompt Registry Client

SDK:

- prompt id/version çözer,
- checksum doğrular,
- locale fallback uygular,
- linked eval bilgisini kontrol eder,
- rollout durumunu doğrular,
- inline production prompt kullanımını engeller.

## 10. Tool Gateway Client

Agent tool çağrısını doğrudan adaptera göndermez.

SDK çağrısı:

```ts
const result = await tools.call(
  "weather.forecast",
  request,
  context
);
```

Gateway:

- scope doğrular,
- request şemasını kontrol eder,
- timeout ve retry uygular,
- cache kullanır,
- source metadata ve evidence döndürür.

## 11. Disclosure Client

Agent ihtiyacı olan veriyi şu şekilde ister:

```ts
const familyContext = await memory.readDisclosure({
  purpose: "route_planning",
  scopes: ["trip.mobility", "trip.rest_windows"]
});
```

SDK, agentın gereksiz alan istemesini engeller veya audit eder.

## 12. Evidence Builder

Agent çıktısındaki her dış claim evidence ile ilişkilendirilebilir.

```ts
evidence.claim({
  key: "parking_available",
  value: true,
  sourceRef: "src_001",
  confidence: 0.93
});
```

## 13. Retry ve Timeout

SDK iki farklı retry türünü ayırır:

### Tool Retry
Geçici provider hataları için.

### Agent Retry
Şema bozukluğu veya repairable structured output için.

Aynı deterministik hata sonsuz tekrarlanmaz.

## 14. Cancellation

Agent:

- cancellation token'ı düzenli kontrol eder,
- iptal sonrası yeni tool çağrısı başlatmaz,
- kısmi sonucu güvenli biçimde döndürebilir,
- cleanup hook çalıştırır.

## 15. Structured Output

Agent çıktısı:

- JSON Schema ile doğrulanır,
- schema dışı alanlar reddedilir,
- repair prompt yalnızca izinli deneme sayısı kadar çalışır,
- raw model çıktısı audit/debug dışında kullanılmaz.

## 16. Error Normalizer

Agent ve tool hataları ortak modele çevrilir.

```ts
throw AgentError.policyViolation("RULE_001");
```

SDK bunu ACP hata mesajına dönüştürür.

## 17. Cost Meter

Her agent çalıştırmasında:

- input token
- output token
- model maliyeti
- tool maliyeti
- cache tasarrufu
- toplam tahmini maliyet

ölçülür.

## 18. Observability Hooks

SDK otomatik olarak:

- trace span açar,
- task state event üretir,
- model/tool alt spanları oluşturur,
- hata ve retry sayaçlarını artırır,
- confidence ve evidence coverage metriklerini yazar.

## 19. Agent Manifest

Her agent manifest taşır.

```json
{
  "agent_id": "route_planner_agent",
  "version": "1.0.0",
  "input_schema": "route-planner.request.v1",
  "output_schema": "route-plan.schema.json",
  "required_data_scopes": [
    "trip.mobility",
    "trip.rest_windows"
  ],
  "allowed_tool_scopes": [
    "maps.route.read",
    "traffic.read"
  ],
  "prompt_bundle": "bundle.route_planner.v1",
  "default_timeout_ms": 15000,
  "max_cost_usd": 0.08
}
```

## 20. Agent Capability Registry

Registry şunları tutar:

- agent id/version
- görev türleri
- input/output şemaları
- gerekli scopes
- timeout
- maliyet sınıfı
- prompt bundle
- production readiness level
- linked evals

## 21. Test Harness

SDK test harness şu yetenekleri sağlar:

- ACP request üretme
- mock disclosure
- mock tool adapter
- deterministic model response
- timeout simulation
- cancellation simulation
- schema failure
- permission denial
- prompt injection fixture
- cost assertion

## 22. Unit Test Örneği

```ts
it("hard constraint ihlal eden oteli reddeder", async () => {
  const result = await harness.run(hotelAgent, fixture);

  expect(result.status).toBe("completed");
  expect(result.data.rejectedCandidates).toContainEqual(
    expect.objectContaining({ reason: "constraint_violation" })
  );
});
```

## 23. Agent Readiness Seviyeleri

- `draft`
- `contract_ready`
- `mock_tested`
- `tool_integrated`
- `security_verified`
- `e2e_verified`
- `production_ready`

## 24. Güvenlik

SDK zorunlu olarak:

- scope enforcement
- prompt injection quarantine
- secret isolation
- output schema validation
- memory minimization
- immutable audit event
- transaction approval gate

uygular.

## 25. Hata Modeli

- `SDK_AGENT_MANIFEST_INVALID`
- `SDK_INPUT_SCHEMA_FAILED`
- `SDK_OUTPUT_SCHEMA_FAILED`
- `SDK_PERMISSION_DENIED`
- `SDK_PROMPT_NOT_AVAILABLE`
- `SDK_TOOL_SCOPE_DENIED`
- `SDK_DEADLINE_EXCEEDED`
- `SDK_CANCELLED`
- `SDK_COST_LIMIT_EXCEEDED`
- `SDK_EVIDENCE_REQUIRED`

## 26. Kabul Kriterleri

- Yeni agent BaseAgent sözleşmesini uygulamalı.
- ACP, şema ve izin kontrolleri SDK tarafından yapılmalı.
- Agent provider SDK'larına doğrudan erişmemeli.
- Tool ve Memory erişimi gateway üzerinden olmalı.
- Test harness bağımsız agent testi desteklemeli.
- Maliyet, tracing ve error normalization otomatik olmalı.
- Agent manifest zorunlu olmalı.
- Air-gap ve mock modları desteklenmeli.
