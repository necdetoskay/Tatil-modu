# Tatil Modu — Radar + DeepSeek Harness Adoption Review

| Alan | Değer |
|---|---|
| Document ID | TM-HAR-REV-001 |
| Sürüm | 1.0 |
| Durum | CANONICAL DECISION RECORD |
| Tarih | 2026-08-27 |
| Hedef | Tatil Modu Agent Contract Harness |

## 1. Amaç

Bu belge Technology Opportunity Radar içinde analiz edilmiş `deepseek-ai/deepseek-harness` ve ilgili harness pattern'lerinin Tatil Modu'na nasıl uygulanacağını karara bağlar.

Amaç DeepSeek Harness runtime'ını projeye taşımak değildir. Amaç, yeniden kullanılabilir mimari fikirleri mevcut Tatil Modu contracts, ACP, evidence ve test sistemine kontrollü biçimde adapte etmektir.

## 2. Radar kaynak özeti

Radar kaydı DeepSeek Harness'i developer-preview, plugin-oriented ve hızla değişen bir harness olarak değerlendirir. Doğrudan dependency kararı konusunda konservatif kalınmasını; dar ilkelerin `PATTERN` veya `INSPIRE` seviyesinde alınmasını önerir.

Radar tarafından DeepSeek Harness için çıkarılan ana pattern'ler:

```yaml
system-level-provenance:
  strength: medium
  mode: pattern
explicit-context-lifecycle:
  strength: high
  mode: pattern
plugin-oriented-harness-composition:
  strength: high
  mode: inspire
harness-vs-model-evaluation-separation:
  strength: high
  mode: pattern
```

İlgili Radar pattern'leri ayrıca iki güçlü ilkeyi destekler:

- observable system boundary üzerinden provenance,
- structured external state + independent audit.

## 3. Tatil Modu mevcut durum değerlendirmesi

### 3.1 Zaten güçlü olan alanlar

Tatil Modu mevcut dokümanlarında aşağıdaki altyapı zaten vardır:

- Agentlar birbirini doğrudan çağırmaz; Orchestrator/gateway üzerinden ACP mesajları kullanılır.
- ACP mesajları `request_id`, `trace_id`, `trip_id`, `task_id`, `parent_task_id` taşır.
- ACP lifecycle `created → accepted → running → completed/failed/...` olarak tanımlıdır.
- Security/data/tool scope alanları vardır.
- Audit event ve observability alanları vardır.
- Evidence claim-level olarak taşınabilir.
- Agent testleri fixture/live/hybrid olarak ayrılmıştır.
- Schema Validator + deterministic Rule Evaluator + LLM Reviewer ayrımı vardır.
- Tool/capability çıktısı doğrudan final cevap kabul edilmez; claim/evidence/confidence/freshness envelope'a çevrilir.
- Provider/adaptor ve source trust sınırları ayrı tasarlanmıştır.

Sonuç: Tatil Modu sıfırdan harness mimarisi kurmuyor; mevcut tasarımı tamamlıyor.

### 3.2 Eksik veya yeterince açık olmayan alanlar

#### G1 — Explicit context lifecycle

ACP görev lifecycle'ı tanımlıdır ancak **model-visible context'in yaşam döngüsü** kanonik değildir.

Eksik olanlar:

- hangi kaynakların context'e aday olduğu,
- hangi parçaların seçildiği,
- hangi policy ile filtrelendiği,
- modelin tam olarak hangi sürümlü context manifest'i gördüğü,
- compaction/summarization sonrası neyin atıldığı,
- context snapshot/hash,
- retry sırasında context'in değişip değişmediği.

#### G2 — Harness-vs-model failure attribution

Triple Evaluation kaliteyi ölçüyor fakat bir FAIL'in sebebini yeterince ayrıştırmıyor.

Ayrılması gereken sınıflar:

- model failure,
- prompt failure,
- context assembly failure,
- tool selection failure,
- tool/provider failure,
- adapter/normalization failure,
- schema/parser failure,
- deterministic rule failure,
- authority/policy failure,
- handoff/orchestration failure,
- evaluator failure.

#### G3 — Harness plugin boundary

Tool/provider adapter sınırı vardır; ancak harness'in kendi bileşenlerinin composable lifecycle/interface sözleşmesi kanonik değildir.

#### G4 — End-to-end system provenance

Claim evidence güçlüdür fakat aşağıdaki zincirin tek kayıtta yeniden kurulması garanti değildir:

```text
input sources
→ normalized facts
→ context selection
→ policy/config versions
→ model/tool execution
→ agent output
→ verification
→ downstream decision
```

#### G5 — Verified state advancement

Verification Agent vardır; fakat uzun akışlarda durable state'in yalnız **verified** sonuçla ilerlemesi açık harness invariant'ı olarak dondurulmamıştır.

## 4. Adoption kararları

| Radar / Harness fikri | Karar | Tatil Modu uygulaması |
|---|---|---|
| System-level provenance | **ADOPT** | `HarnessRunManifest`, `ContextManifest`, `AgentTrace`, evidence refs ve downstream decision refs |
| Explicit context lifecycle | **ADOPT** | context assemble/freeze/execute/compact/handoff/retire lifecycle |
| Plugin-oriented harness composition | **ADAPT** | Tatil Modu-owned plugin interfaces; DeepSeek API dependency yok |
| Harness vs model evaluation separation | **ADOPT** | component-level failure attribution + model evaluation ayrı rapor |
| Explicit external state | **ADOPT** | durable workflow state model context dışında tutulur |
| Independent audit before state advancement | **ADOPT** | Verification PASS olmadan durable itinerary/state commit yok |
| DeepSeek Harness runtime dependency | **DEFER** | developer-preview stabilitesi yeterli değil |
| DeepSeek plugin API'lerini doğrudan kullanmak | **DEFER** | internal interfaces provider/runtime-neutral kalır |
| Tam runtime migration | **REJECT (v1)** | mevcut ACP/contracts mimarisi korunur |

## 5. Neden DeepSeek Harness dependency olarak alınmıyor?

1. Radar analizi compatibility-breaking değişim riskine dikkat çekmektedir.
2. Tatil Modu'nun ACP, evidence, capability ve test contract'ları zaten büyük ölçüde bağımsız bir harness omurgası oluşturmuştur.
3. Runtime dependency değişirse agent contract'larının etkilenmemesi gerekir.
4. Test sonuçlarında harness ve model etkisini ayırmak istiyoruz; harness'i harici unstable runtime'a bağlamak bu kontrolü azaltır.
5. Gerekirse ileride DeepSeek Harness için bir execution adapter yazılabilir; domain mimarisi değişmez.

## 6. Kanonik Harness katmanları

Tatil Modu Harness aşağıdaki katmanlara ayrılır:

```text
1. Agent Registry
2. Contract Loader
3. Context Assembler
4. Execution Adapter
5. Tool Gateway
6. Trace & Provenance Recorder
7. Evaluation & Failure Attribution
8. Orchestration Runner
9. Verified State Gate
10. Report/Evidence Emitter
```

### 6.1 Agent Registry

Kanonik `TM-AG-*` ve `TM-ORCH-*` kayıtlarını, sürümlerini ve capability ownership'ini tutar.

### 6.2 Contract Loader

Input/output schema, authority, tool/source policy, decision rules ve evaluation rubric'i yükler.

### 6.3 Context Assembler

Agent'a gönderilecek minimum gerekli context'i üretir ve `ContextManifest` olarak freeze eder.

### 6.4 Execution Adapter

Model/runtime bağımsız interface'tir. Fixture executor, gerçek model executor veya ileride DeepSeek Harness adapter aynı interface'i kullanabilir.

### 6.5 Tool Gateway

Allowed tool whitelist ve authority scope'u enforce eder. Agent tool'a doğrudan uncontrolled erişmez.

### 6.6 Trace & Provenance Recorder

Sistem sınırında gözlenebilir zinciri kaydeder; hidden chain-of-thought kaydetmeye çalışmaz.

### 6.7 Evaluation & Failure Attribution

Schema/rule/semantic/authority/tool/handoff kontrollerini ayrı skor ve failure class olarak üretir.

### 6.8 Orchestration Runner

Agent dependency graph, retry, repair ve cancellation akışını ACP kurallarıyla yönetir.

### 6.9 Verified State Gate

```text
Manage → Execute → Verify/Audit → Commit
```

`VerificationResult != PASS` ise durable plan/state ana sürüme ilerletilemez.

### 6.10 Report/Evidence Emitter

Her run için tekrarlanabilir test/evidence kaydı üretir.

## 7. Context lifecycle kararı

Her model execution için aşağıdaki lifecycle kanoniktir:

```text
candidate_sources
   ↓
normalize
   ↓
select_by_scope
   ↓
apply_policy_and_redaction
   ↓
assemble
   ↓
validate
   ↓
FREEZE ContextManifest
   ↓
execute
   ↓
record usage/outcome
   ↓
compact if needed
   ↓
handoff or retire
```

### 7.1 Context freeze invariant

Bir attempt başladıktan sonra aynı attempt'in model-visible context'i sessizce değiştirilemez.

Retry farklı context ile yapılacaksa:

```text
attempt += 1
context_manifest_id = new value
change_reason = required
```

### 7.2 Context provenance

Context manifest en az şunları taşır:

```yaml
context_manifest_id: string
agent_id: string
agent_contract_version: string
prompt_version: string
source_refs: []
normalized_fact_refs: []
policy_versions: []
selected_context_refs: []
redaction_summary: []
context_hash: string
created_at: datetime
```

Hassas ham veri sırf provenance için zorunlu olarak loglanmaz; referans/hash/minimized metadata tercih edilir.

## 8. Harness-vs-model evaluation separation

Bir test sonucu artık tek `passed` alanından ibaret olmayacaktır.

```yaml
EvaluationBreakdown:
  contract: pass|fail
  schema: pass|fail
  deterministic_rules: pass|fail
  context_assembly: pass|fail
  authority: pass|fail
  tool_policy: pass|fail
  tool_integration: pass|fail|not_run
  semantic_quality: score|null
  handoff: pass|fail|not_applicable
  verification: pass|fail|not_applicable
  final: pass|fail
```

Failure attribution örneği:

```yaml
failure:
  primary_class: CONTEXT_ASSEMBLY
  component: context_assembler
  agent_id: TM-AG-004
  model_id: model_alias
  model_output_schema_valid: true
  evidence: []
```

Bu durumda test “model kötü” olarak raporlanamaz.

## 9. Plugin composition kararı

Harness bileşenleri dar interface'lerle değiştirilir:

```text
ExecutionAdapter
ToolAdapter
ContextProvider
PolicyEvaluator
TraceSink
Evaluator
StateStore
```

Kurallar:

- domain objeleri plugin API'sine göre şekillenmez,
- plugin hata tipleri canonical harness error'larına normalize edilir,
- plugin değişimi agent contract değişikliği gerektirmez,
- fixture plugin her gerçek plugin için bulunmalıdır,
- live plugin testleri ayrı gate'tir.

## 10. Provenance kararı

Her test/run aşağıdaki observable boundary zincirini yeniden kurabilmelidir:

```text
TripRequest/fixture
→ contract version
→ source/evidence refs
→ ContextManifest
→ prompt/model/runtime config
→ tool calls
→ normalized tool results
→ agent output
→ evaluation breakdown
→ verification result
→ repair/decision
→ final downstream artifact
```

Hidden model reasoning saklanması bir gereksinim değildir ve provenance yerine kullanılamaz.

## 11. Test sistemine etkisi

Kanonik agent test seviyeleri:

| Seviye | Kapsam |
|---|---|
| R0 Contract | schema/contract/version |
| R1 Deterministic | decision rules/invariants |
| R2 Fixture | isolated agent, fixture context/tools |
| R3 Tool Integration | gerçek adapter/tool |
| R4 Semantic | görev kalitesi |
| R5 Adversarial | eksik/çelişkili/stale veri |
| R6 Authority | capability/tool/context scope ihlali |
| R7 Live | gerçek model + güncel provider |
| R8 Regression | geçmiş production/test hataları |

Radar/DeepSeek review sonrası ek zorunlu cross-cutting assertion'lar:

- context manifest produced,
- context freeze respected,
- tool calls attributable,
- model vs harness failure attributable,
- provenance chain complete,
- durable state commit only after verification.

## 12. M1 scope kararı

M1 Agent Contract Harness'te gerçek provider entegrasyonu zorunlu değildir.

M1'de yapılacaklar:

```text
17 component registry entries
contract loader
context manifest contract
fixture context provider
fixture execution adapter
fixture tool gateway
trace/provenance recorder
R0/R1/R2/R6 runners
failure attribution
run report format
verified-state gate contract
```

M1'de yapılmayacaklar:

```text
DeepSeek Harness runtime dependency
paid provider calls
production orchestration
live reservation/payment
full UI
R7 live suite
```

## 13. Release gate

M1 tamamlandı sayılamaz, eğer:

- herhangi bir agent contract olmadan registry'ye girebiliyorsa,
- agent forbidden tool çağrısı yapıp test geçebiliyorsa,
- execution'ın model-visible context'i yeniden oluşturulamıyorsa,
- FAIL'in model mi harness mi olduğu sınıflandırılamıyorsa,
- verification olmadan durable state commit edilebiliyorsa,
- fixture run deterministik biçimde tekrar üretilemiyorsa.

## 14. Son karar

```yaml
deepseek_harness_runtime: DEFER
radar_patterns:
  system_level_provenance: ADOPT
  explicit_context_lifecycle: ADOPT
  plugin_oriented_composition: ADAPT
  harness_vs_model_evaluation_separation: ADOPT
  explicit_external_state: ADOPT
  independent_audit: ADOPT
next_artifact: 02-agent-contract-harness-baseline.md
```
