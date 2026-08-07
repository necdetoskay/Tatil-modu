# H5 — Agent Batch A

**Durum:** planned  
**Requires:** L0 + relevant L1/L2 PASS  
**Primary gate:** L3 Individual Agent

## Amaç
İlk agent grubunu orchestrator olmadan, yalnız canonical contract + mock capability + test memory ile bağımsız olarak kanıtlamak.

## Batch A seçimi
Canonical agent katalogu esas alınır. İlk batch'in görevi planın erken aşamasını üretmektir:
- Trip Intake / Request Understanding
- constraint extraction/normalization-facing agent behavior
- destination/candidate discovery
- early evidence/research behavior

Kesin agent isimleri `docs/11-agent-specifications/` source-of-truth'undan alınır; implementation dokümanı yeni agent uyduramaz.

## Isolation rule
Her agent testi:
```text
fixture input
+ mock capabilities
+ optional test memory snapshot
→ single agent
→ contract output
```
Başka agent doğrudan çalıştırılmaz.

## Test dimensions
- valid request
- incomplete request
- ambiguity
- hard constraint preservation
- irrelevant data resistance
- capability failure
- empty research result
- conflicting evidence
- memory/current-request conflict
- deterministic structured output where model is stubbed

## Agent acceptance
Her agent için:
```yaml
contract_validity: 100%
p0_failures: 0
forbidden_provider_calls: 0
direct_agent_calls: 0
hard_constraint_loss: 0
required_failure_modes_tested: true
```

## LLM boundary
H5 deterministic suite gerçek LLM gerektirmez. Model davranışı gerekiyorsa scripted/fake model adapter kullanılır. Gerçek model kalitesi L8'de benchmark edilir.

## Artifacts
Her agent için:
- implementation module
- fixtures
- positive tests
- negative tests
- capability dependency list
- failure-mode tests
- traceability row
- L3 result record

## Definition of Done
Batch A'daki her agent ayrı ayrı L3 PASS vermeden H6/H7 integration için eligible değildir.
