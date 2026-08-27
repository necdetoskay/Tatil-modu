# Tatil Modu — Agent Contract Harness Baseline

| Alan | Değer |
|---|---|
| Document ID | TM-HAR-BSL-001 |
| Sürüm | 1.0 |
| Durum | CANONICAL BASELINE |
| Tarih | 2026-08-27 |
| Milestone | M1 — Agent Contract Harness |

## 1. Amaç

Bu belge Tatil Modu'ndaki 16 uzman agent + Travel Orchestrator için ortak, model/provider/runtime bağımsız test harness baseline'ını tanımlar.

Harness'in amacı yalnız agent cevabını değerlendirmek değildir. Aşağıdaki zincirin tamamını gözlenebilir, tekrar üretilebilir ve test edilebilir hale getirir:

```text
contract
→ context
→ execution
→ tool usage
→ output
→ evaluation
→ verification
→ state advancement
```

## 2. Tasarım hedefleri

Harness şu sorulara ayrı ayrı cevap verebilmelidir:

1. Agent doğru contract ile mi çalıştı?
2. Doğru context'i mi gördü?
3. İzinli tool ve source scope içinde mi kaldı?
4. Tool/provider doğru çalıştı mı?
5. Model görevi doğru yaptı mı?
6. Deterministic kurallar doğru mu?
7. Handoff doğru mu?
8. Hata modelden mi, harness'ten mi, tool'dan mı geldi?
9. Run tekrar üretilebilir mi?
10. Verification olmadan durable state ilerledi mi?

## 3. Kanonik bileşenler

```text
Harness
├── AgentRegistry
├── ContractLoader
├── ContextAssembler
├── ExecutionAdapter
├── ToolGateway
├── TraceRecorder
├── EvaluatorPipeline
├── FailureAttributor
├── OrchestrationRunner
├── VerifiedStateGate
└── ReportEmitter
```

## 4. AgentRegistry

Registry tekil agent identity ve sürümünü tutar.

```yaml
AgentRegistryEntry:
  agent_id: TM-AG-001
  name: Profile Agent
  contract_version: "1.0"
  input_schema_ref: string
  output_schema_ref: string
  authority_policy_ref: string
  tool_policy_ref: string
  source_policy_ref: string
  decision_rules_ref: string
  evaluation_rubric_ref: string
  lifecycle_state: specified|fixture_tested|live_tested|production_ready
```

### Invariant

Registry'de contract referansları eksik agent çalıştırılamaz.

## 5. ContractLoader

ContractLoader aşağıdakileri tek `ResolvedAgentContract` halinde çözer:

```yaml
ResolvedAgentContract:
  agent_id: string
  version: string
  input_schema: object
  output_schema: object
  allowed_tools: []
  forbidden_tools: []
  allowed_sources: []
  authority_rules: []
  forbidden_actions: []
  invariants: []
  deterministic_rules: []
  semantic_rubric: object|null
```

Contract hash her run manifest'e yazılır.

## 6. ContextAssembler

### 6.1 Amaç

Agent'a yalnız görevi için gerekli ve izinli context'i vermek.

### 6.2 ContextManifest

```yaml
ContextManifest:
  context_manifest_id: string
  run_id: string
  attempt: integer
  agent_id: string
  agent_contract_version: string
  contract_hash: string
  prompt_version: string|null
  source_refs: []
  normalized_fact_refs: []
  upstream_object_refs: []
  policy_versions: []
  selected_context_refs: []
  excluded_context_summary: []
  redaction_summary: []
  context_hash: string
  frozen_at: datetime
```

### 6.3 Lifecycle

```text
CANDIDATE
→ NORMALIZED
→ SCOPED
→ REDACTED
→ ASSEMBLED
→ VALIDATED
→ FROZEN
→ USED
→ COMPACTED/HANDED_OFF/RETIRED
```

### Invariants

- `FROZEN` context attempt içinde mutate edilemez.
- Retry farklı context kullanırsa yeni manifest oluşturulur.
- Agent forbidden context alanını göremez.
- Context minimization uygulanır.
- Sensitive raw payload sırf debug kolaylığı için loglanamaz.

## 7. ExecutionAdapter

Harness model/runtime bağımsızdır.

```text
ExecutionAdapter
├── FixtureExecutionAdapter
├── ModelExecutionAdapter
└── FutureExternalHarnessAdapter
```

### Interface contract

```yaml
ExecutionRequest:
  run_id: string
  attempt: integer
  agent_id: string
  context_manifest_id: string
  contract_hash: string
  input: object
  model_config_ref: string|null
  timeout_ms: integer
```

```yaml
ExecutionResult:
  status: completed|failed|timed_out|blocked
  raw_output_ref: string|null
  parsed_output: object|null
  model_id: string|null
  runtime_id: string
  usage:
    input_tokens: integer|null
    output_tokens: integer|null
    estimated_cost: number|null
  errors: []
```

Execution adapter business/domain kararı veremez.

## 8. ToolGateway

Agent/tool erişiminin tek enforce noktasıdır.

```yaml
ToolCallRequest:
  run_id: string
  agent_id: string
  tool_id: string
  capability: string
  input: object
  context_manifest_id: string
```

ToolGateway sırası:

```text
request
→ agent identity check
→ tool whitelist
→ capability scope
→ source policy
→ quota/cost guard
→ adapter call
→ normalize result/error
→ evidence emit
→ trace
```

### Authority violation

Forbidden tool/capability çağrısı adapter'a ulaşmadan bloklanır ve `AUTHORITY_VIOLATION` olarak kaydedilir.

## 9. TraceRecorder ve system provenance

Her run observable system boundary'i kaydeder.

### 9.1 HarnessRunManifest

```yaml
HarnessRunManifest:
  run_id: string
  test_case_id: string|null
  mode: fixture|hybrid|live
  started_at: datetime
  completed_at: datetime|null
  agent_id: string
  agent_contract_version: string
  contract_hash: string
  context_manifest_id: string
  prompt_version: string|null
  model_id: string|null
  runtime_id: string
  tool_call_refs: []
  evidence_refs: []
  upstream_run_refs: []
  output_ref: string|null
  evaluation_ref: string|null
  verification_ref: string|null
  state_commit_ref: string|null
  final_status: pass|fail|blocked|error
```

### 9.2 ToolCallTrace

```yaml
ToolCallTrace:
  tool_call_id: string
  run_id: string
  agent_id: string
  tool_id: string
  adapter_id: string
  input_hash: string
  started_at: datetime
  completed_at: datetime|null
  latency_ms: integer|null
  cache_hit: boolean
  status: completed|failed|blocked
  normalized_error: string|null
  cost: number|null
  evidence_refs: []
```

### 9.3 DecisionTrace

Hidden chain-of-thought değildir.

```yaml
DecisionTrace:
  decision_id: string
  run_id: string
  decision_type: string
  input_fact_refs: []
  applied_rule_refs: []
  selected_refs: []
  rejected_refs: []
  reason_codes: []
  downstream_refs: []
```

## 10. EvaluatorPipeline

Evaluation sırası mümkün olduğunda ucuz ve deterministik kontrolden pahalı/semantik kontrole gider.

```text
schema
→ contract
→ deterministic rules
→ authority
→ context policy
→ tool policy
→ handoff
→ semantic rubric
→ verification
```

### EvaluationBreakdown

```yaml
EvaluationBreakdown:
  run_id: string
  schema:
    status: pass|fail
  contract:
    status: pass|fail
  deterministic_rules:
    status: pass|fail
    violations: []
  authority:
    status: pass|fail
    violations: []
  context_policy:
    status: pass|fail
    violations: []
  tool_policy:
    status: pass|fail|not_run
    violations: []
  tool_integration:
    status: pass|fail|not_run
  handoff:
    status: pass|fail|not_applicable
  semantic_quality:
    status: pass|fail|not_run
    score: number|null
  verification:
    status: pass|fail|not_applicable
  final: pass|fail
```

### Kural

LLM semantic reviewer schema, hard constraint, authority veya tool-policy failure'ını override edemez.

## 11. FailureAttributor

Bir FAIL en az bir canonical sınıfa atanır.

```text
CONTRACT
SCHEMA
DETERMINISTIC_RULE
CONTEXT_ASSEMBLY
CONTEXT_SCOPE
PROMPT
MODEL
TOOL_SELECTION
TOOL_POLICY
TOOL_PROVIDER
TOOL_ADAPTER
NORMALIZATION
AUTHORITY
HANDOFF
ORCHESTRATION
VERIFICATION
EVALUATOR
STATE_COMMIT
UNKNOWN
```

### FailureAttribution

```yaml
FailureAttribution:
  run_id: string
  primary_class: string
  secondary_classes: []
  component: string
  agent_id: string
  attempt: integer
  model_id: string|null
  tool_call_refs: []
  evidence_refs: []
  reproducible: boolean
  smallest_failing_scope: string|null
```

### RIVE uyumu

Failure attribution RIVE descent için başlangıç noktasıdır:

```text
full run
→ failing agent/handoff
→ failing harness component
→ failing contract/rule/adapter
→ minimal reproducer
→ fix
→ focused rerun
→ scope expansion
→ regression fixture
```

## 12. OrchestrationRunner

Orchestrator domain tool'u doğrudan kullanmaz.

OrchestrationRunner görevleri:

- dependency graph çözmek,
- ACP envelope oluşturmak,
- handoff schema doğrulamak,
- timeout/retry/cancel uygulamak,
- blocked/failure durumunu route etmek,
- targeted repair tetiklemek,
- verified state gate'e teslim etmek.

### Execution rule

```text
Orchestrator
→ Agent task
→ Agent Harness Run
→ ToolGateway (if needed)
→ Evaluation
→ Verification
→ next task / repair / stop
```

## 13. VerifiedStateGate

### Amaç

Unverified agent output'un durable canonical trip state'e ilerlemesini engeller.

```yaml
StateCommitRequest:
  trip_id: string
  source_run_ids: []
  candidate_state_ref: string
  verification_result_ref: string
```

### Gate

```text
verification = PASS  → COMMIT_ALLOWED
verification = REPAIR → COMMIT_BLOCKED
verification = FAIL   → COMMIT_BLOCKED
verification missing  → COMMIT_BLOCKED
```

Partial/ephemeral working state ayrı tutulabilir; canonical durable state değildir.

## 14. Test runner seviyeleri

### R0 — Contract

- registry completeness
- schema references
- version/hash consistency
- required policies

### R1 — Deterministic

- decision rules
- invariant checks
- calculators/rule engine

### R2 — Fixture

- fixture context provider
- fixture execution/tool adapters
- deterministic repeatability
- expected outputs

### R3 — Tool Integration

- real adapter
- normalization
- provider error mapping
- evidence emission

### R4 — Semantic

- rubric
- judge/reviewer
- task quality

### R5 — Adversarial

- missing data
- conflicting data
- stale data
- malformed context
- injection attempts

### R6 — Authority

- forbidden tool
- forbidden source
- forbidden context
- cross-agent ownership violation
- orchestrator domain-tool leakage

### R7 — Live

- current model/provider
- fresh evidence
- cost/latency
- no hidden fixture fallback

### R8 — Regression

- every confirmed defect becomes replayable fixture/test

## 15. M1 zorunlu testleri

M1 yalnız R0/R1/R2/R6 ile tamamlanabilir; R3/R4/R5/R7/R8 sonraki genişletmelerde eklenir, fakat regression altyapısı M1'de hazır olmalıdır.

Her agent için minimum:

```yaml
minimum_m1_suite:
  R0_contract_cases: 1+ complete validation suite
  R1_rule_cases: every deterministic rule
  R2_fixture_cases: 10 minimum, target 15-25
  R6_authority_cases: 5 minimum
  context_lifecycle_cases: 4 minimum
  provenance_completeness_cases: 2 minimum
  state_gate_cases: if agent can affect canonical state
```

## 16. Golden Agent Template

Her agent paketi hedef olarak:

```text
docs/11-agent-specifications/<agent>/
├── specification.md
├── input.schema.json
├── output.schema.json
├── authority-policy.md
├── tool-policy.md
├── source-policy.md
├── decision-rules.md
├── handoff-contracts.md
├── evaluation-rubric.md
└── tests/
    ├── fixtures/
    ├── expected/
    ├── adversarial/
    ├── authority/
    └── regressions/
```

Harness tarafındaki runtime package daha sonra bu belgeye göre tasarlanır; bu aşamada implementation zorunlu değildir.

## 17. Test report standardı

Örnek:

```text
TM-AG-004 Place Intelligence
run: place-family-bursa-001
mode: fixture

R0 Contract          PASS
R1 Deterministic     PASS
R2 Fixture           PASS
R3 Tool Integration  NOT RUN
R4 Semantic          NOT RUN
R5 Adversarial       NOT RUN
R6 Authority         PASS
R7 Live              NOT RUN
R8 Regression        0 cases

Context Manifest     PASS
Context Freeze       PASS
Provenance           PASS
Forbidden Tools      0
Failure Attribution  N/A

FINAL                PASS
```

## 18. M1 completion gate

Aşağıdakilerin tamamı gerekir:

- 17 registry entry.
- Her registry entry canonical contract'a bağlı.
- ContractLoader validation geçiyor.
- ContextManifest ve freeze kuralları test edilmiş.
- Fixture ExecutionAdapter hazır.
- Fixture ToolGateway hazır.
- Tool/authority leakage bloklanıyor.
- Trace/provenance chain üretiliyor.
- R0/R1/R2/R6 runner çalışıyor.
- Failure attribution raporlanıyor.
- Verification olmadan state commit engelleniyor.
- Aynı fixture run tekrarında semantik olmayan harness state deterministik yeniden üretilebiliyor.

## 19. DeepSeek Harness gelecekte nasıl denenebilir?

DeepSeek Harness stabil kabul edildiği bir gelecekte yalnız `ExecutionAdapter` veya belirli harness plugin adapter seviyesinde deney yapılır.

A/B test:

```text
TatılModuNativeExecutionAdapter
vs
DeepSeekHarnessExecutionAdapter
```

Aynı:

- agent contract,
- fixture,
- ContextManifest,
- evaluator,
- tool policy,
- expected output

kullanılır.

Bu sayede gerçekten harness farkı ölçülür; domain mimarisi değiştirilmez.

## 20. Sonraki işlem

İlk golden implementation/spec target:

```text
TM-AG-001 Profile Agent
```

Önce tam specification paketi canonical katalogla reconcile edilir; sonra M1 harness sözleşmesine göre R0/R1/R2/R6 fixture seti hazırlanır.
