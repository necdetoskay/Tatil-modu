# Structured Output and Tool-Use Requirements

## Amaç
Model çıktısının agent contract'larına güvenli biçimde bağlanmasını ve tool/capability kullanımının model tarafından keyfi biçimde genişletilememesini sağlamak.

## Structured output
LLM kullanan her agent canonical runtime schema'ya uyan structured output üretmelidir.

Minimum beklenti:
```yaml
contract_version: required
trace_id: required
status: required
payload: required_or_state_dependent
reason_codes: []
evidence_refs: []
confidence: required_when_defined_by_contract
```

## Validation chain
```text
model output
→ parse
→ schema validation
→ semantic validation
→ policy validation
→ accept/retry/fail
```

Malformed output doğrudan downstream'e verilmez.

## Tool use
Model provider-native tool calling desteklese bile gerçek yetki agent capability policy'den gelir.

Model yalnız orchestrator/runtime tarafından expose edilen capability'leri görebilir. Provider SDK, URL, secret veya adapter detayına erişemez.

## P0 failures
- schema bypass
- fabricated tool result
- tool call without capability authorization
- final response composer live-tool call
- verification status fabrication
- evidence ref not emitted by capability/verification pipeline

## Evaluation
Model benchmark'ında şu oranlar ayrı ölçülür:
- structured_output_valid_rate
- repair_retry_rate
- unauthorized_tool_attempt_rate
- fabricated_evidence_rate
- tool_result_grounding_rate

P0 kategorilerindeki hata toleransı sıfırdır.
