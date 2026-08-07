# 05 — Contract Schema Workplan

**Doküman türü:** Contract ve schema tasarım iş planı  
**Kapsam:** Tatil Modu pre-implementation design  
**Durum:** tasarım iş planı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
schema_implementation_allowed: false
current_phase: contract_and_schema_design
```

Bu belge kod yazmak için değildir.

Bu belge, Tatil Modu'nda koddan önce hangi contract ve schema tasarımlarının üretileceğini, hangi sırayla üretileceğini ve hangi artifact'lara bağlanacağını tanımlar.

## Neden önce contract/schema?

Tatil Modu tek bir prompt cevabı olmayacak.

Sistem; orchestrator, agent, planner, memory platform, capability gateway, verification platform, evidence, policy gate ve final composer arasında düzenli veri taşıyacak.

Bu nedenle önce şu sorular cevaplanmalıdır:

- Agentlar hangi ortak request envelope ile çağrılacak?
- Agentlar hangi response envelope ile cevap dönecek?
- Hatalar nasıl standart taşınacak?
- Evidence, verification ve confidence alanları hangi formatta olacak?
- Hard constraint violation nasıl ifade edilecek?
- Lifecycle/status değerleri hangi sözlükten gelecek?
- Schema versiyonları nasıl yönetilecek?
- Fixture'lar hangi schema ile uyumlu olacak?

## Contract/schema tasarım ilkeleri

- Schema'lar provider bağımsız olmalıdır.
- Agent contract'ları serbest metin üzerine kurulmaz.
- Her contract versiyonlanmalıdır.
- Hata formatı merkezi olmalıdır.
- Evidence ve confidence alanları bütün önemli kararlarda taşınmalıdır.
- Hard constraint sonuçları ranking skorlarına gömülmemelidir.
- Memory disclosure package açık schema ile taşınmalıdır.
- Tool/provider çıktısı doğrudan agent output'u olmamalıdır; normalize edilmelidir.
- Final user response, internal schema'yı birebir sızdırmamalıdır.

## Contract/schema artifact sırası

### 1. ACP envelope standard

Önerilen dosya:

```text
docs/12-contracts/acp-envelope-standard.md
```

Amaç:

- agent-to-orchestrator veri taşıma standardı,
- request/response ortak metadata,
- trace id / run id / agent id,
- schema version,
- locale/timezone,
- input source,
- privacy scope,
- evidence references.

Minimum alanlar:

```yaml
schema_version: string
run_id: string
trace_id: string
caller: string
target_component: string
request_type: string
locale: string
timezone: string
privacy_scope: string
input_payload: object
context_refs: array
```

### 2. Agent request schema

Önerilen dosya:

```text
docs/12-contracts/agent-request-schema.md
```

Amaç:

- bütün agent çağrılarının ortak giriş biçimi,
- user intent,
- normalized constraints,
- memory disclosure package,
- allowed capabilities,
- evidence requirements,
- evaluation mode / fixture mode.

Örnek alanlar:

```yaml
request_id: string
agent_id: string
agent_version: string
normalized_user_goal: object
constraints: array
preferences: array
memory_disclosure: object
allowed_capabilities: array
required_outputs: array
fixture_mode: boolean
```

### 3. Agent response schema

Önerilen dosya:

```text
docs/12-contracts/agent-response-schema.md
```

Amaç:

- agent çıktılarının ortak formatı,
- claim listesi,
- candidate listesi,
- decisions,
- rejected options,
- warnings,
- evidence references,
- confidence,
- error / partial failure.

Örnek alanlar:

```yaml
response_id: string
agent_id: string
status: success | partial | failed
claims: array
candidates: array
decisions: array
rejections: array
warnings: array
evidence_refs: array
confidence_summary: object
errors: array
```

### 4. Error response schema

Önerilen dosya:

```text
docs/12-contracts/error-response-schema.md
```

Amaç:

- bütün agent, orchestrator, tool gateway ve evaluator hataları için ortak format,
- merkezi error code registry ile uyum,
- user display policy,
- retryability,
- severity,
- redaction.

Örnek alanlar:

```yaml
error_code: string
error_category: string
severity: info | warning | error | critical
message_internal: string
message_user_safe: string
retryable: boolean
owner_component: string
redaction_applied: boolean
```

### 5. Evidence envelope schema

Önerilen dosya:

```text
docs/12-contracts/evidence-envelope-schema.md
```

Amaç:

- kaynak, tarih, tazelik, authority, limitation ve claim ilişkisini standartlaştırmak.

Örnek alanlar:

```yaml
evidence_id: string
evidence_type: user_input | memory_disclosure | tool_result | authority_source | calculation | inference | fixture
source_name: string
source_type: string
retrieved_at: string
published_at: string | null
freshness_status: current | stale | unknown
supports_claim_ids: array
limitations: array
```

### 6. Verification result schema

Önerilen dosya:

```text
docs/12-contracts/verification-result-schema.md
```

Amaç:

- verified / partially_verified / unverified / conflicting / stale durumlarını runtime kararlarına taşımak.

Örnek alanlar:

```yaml
verification_id: string
claim_id: string
verification_status: verified | partially_verified | unverified | conflicting | stale | not_applicable
verified_by: string
verification_method: string
confidence_impact: increase | decrease | neutral
blocking_impact: none | warning | block | needs_user_input
```

### 7. Confidence schema

Önerilen dosya:

```text
docs/12-contracts/confidence-schema.md
```

Amaç:

- confidence değerini sezgisel değil evidence-bound hale getirmek.

Örnek alanlar:

```yaml
confidence_level: very_high | high | medium | low | unknown
confidence_reason: string
evidence_quality: string
freshness_quality: string
conflict_state: none | minor | major
user_visible_uncertainty: string | null
```

### 8. Constraint and policy result schema

Önerilen dosya:

```text
docs/12-contracts/constraint-policy-result-schema.md
```

Amaç:

- hard constraint, soft preference ve policy gate sonuçlarını ranking'den önce standartlaştırmak.

Örnek alanlar:

```yaml
constraint_id: string
constraint_type: policy | safety | legal | user_hard_constraint | domain_hard_constraint | soft_preference
subject_id: string
result: passed | blocked | warning | needs_verification | needs_user_input | not_applicable
decision_impact: blocking | high | medium | low | none
reason: string
evidence_refs: array
```

### 9. Candidate schema

Önerilen dosya:

```text
docs/12-contracts/candidate-schema.md
```

Amaç:

- destination, hotel, activity, route, daily plan gibi öneri adaylarının ortak modelini belirlemek.

Örnek alanlar:

```yaml
candidate_id: string
candidate_type: destination | accommodation | activity | route | day_plan | full_itinerary
title: string
location: object
fit_reasons: array
constraint_results: array
evidence_refs: array
confidence: object
ranking_inputs: object
```

### 10. Lifecycle and status schema

Önerilen dosya:

```text
docs/12-contracts/lifecycle-status-schema.md
```

Amaç:

- run, request, agent call, verification, evaluation ve final output status değerlerini tek sözlükte toplamak.

Örnek alanlar:

```yaml
lifecycle_subject_type: run | request | agent_call | tool_call | verification | evaluation | final_output
status: created | normalized | running | waiting | partial | completed | failed | blocked
status_reason: string
updated_at: string
```

## Contract dependency order

```text
01 ACP envelope
  ↓
02 Agent request schema
  ↓
03 Agent response schema
  ↓
04 Error response schema
  ↓
05 Evidence envelope schema
  ↓
06 Verification result schema
  ↓
07 Confidence schema
  ↓
08 Constraint / policy result schema
  ↓
09 Candidate schema
  ↓
10 Lifecycle / status schema
```

## Schema acceptance criteria

Her schema için kabul kriterleri:

- amacı açık olmalı,
- owner component belirtilmeli,
- hangi agent/platform tarafından üretildiği ve tüketildiği yazılmalı,
- zorunlu ve opsiyonel alanlar ayrılmalı,
- enum değerleri tanımlı olmalı,
- fixture mode ile kullanılabilir olmalı,
- error handling davranışı belirtilmeli,
- backward compatibility notu olmalı,
- en az bir Tatil Modu örneği içermeli.

## Tasarım tamamlanmadan yasak olan işler

Aşağıdakiler bu schema seti tamamlanmadan yapılmaz:

- agent runtime implementation,
- orchestrator implementation,
- live provider integration,
- persistent memory integration,
- final response generator coding,
- production UI integration.

## İlk üretilecek contract dosyaları

```yaml
first_contract_batch:
  - docs/12-contracts/README.md
  - docs/12-contracts/acp-envelope-standard.md
  - docs/12-contracts/agent-request-schema.md
  - docs/12-contracts/agent-response-schema.md
  - docs/12-contracts/error-response-schema.md
```

## İkinci üretilecek contract dosyaları

```yaml
second_contract_batch:
  - docs/12-contracts/evidence-envelope-schema.md
  - docs/12-contracts/verification-result-schema.md
  - docs/12-contracts/confidence-schema.md
  - docs/12-contracts/constraint-policy-result-schema.md
  - docs/12-contracts/candidate-schema.md
  - docs/12-contracts/lifecycle-status-schema.md
```

## Current decision

```yaml
contract_schema_workplan_state: created
implementation_allowed: false
prototype_allowed: false
next_design_document: 06-fixture-and-evaluation-workplan.md
```
