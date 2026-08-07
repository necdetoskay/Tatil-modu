# 04 — Agent Contract Standard

## Purpose

Agent systems should communicate through explicit, versioned contracts.

A contract makes agent behavior testable, reusable and debuggable.

## Minimum contract fields

Every agent contract should define at least:

| Field | Meaning |
|---|---|
| `contract_id` | Stable identifier |
| `contract_version` | Semver or compatible version label |
| `producer_component` | Component that produces the output |
| `consumer_component` | Intended consumer or consumer class |
| `input_schema_ref` | Schema used by the producer |
| `output_schema_ref` | Schema produced |
| `required_context` | Context required to run |
| `disclosure_scope` | Memory/user data allowed |
| `tool_policy_ref` | Allowed capability/tool policy |
| `evidence_requirement` | Required evidence level |
| `confidence_semantics` | How confidence is represented |
| `error_semantics` | Expected failure/error codes |
| `compatibility_policy` | Version compatibility rules |

## Contract shape

A generic handoff envelope should separate metadata from payload.

```json
{
  "envelope": {
    "contract_id": "example.contract",
    "contract_version": "1.0.0",
    "producer_component": "component_a",
    "consumer_component": "component_b",
    "run_id": "run_...",
    "created_at": "2026-08-07T00:00:00Z"
  },
  "payload": {},
  "evidence_refs": [],
  "confidence": {},
  "errors": []
}
```

## Rules

1. Agents do not invent contract fields at runtime.
2. New required fields require a version change.
3. Optional fields must define default interpretation.
4. Evidence and confidence should be attached to claims, not only to the whole output.
5. Tool results should be normalized before entering agent contracts.
6. Memory content should arrive as a disclosure package, not as unrestricted memory access.
7. Error codes should come from a central registry.
8. A contract should be fixture-testable without live providers.

## Contract-first implementation

Before implementing an agent, create:

```text
agent-specification.md
input.schema.json
output.schema.json
handoff-contract.md
tool-policy.md
memory-disclosure-policy.md
evaluation-rubric.md
fixtures/
```

## Compatibility

Contracts must describe how producers and consumers behave when versions differ.

Recommended policy:

| Change | Version impact |
|---|---|
| Add optional field | minor |
| Add required field | major |
| Rename field | major |
| Remove field | major |
| Add enum value | minor or major depending on consumer tolerance |
| Tighten validation | major |
| Loosen validation | minor |

## Anti-patterns

Avoid:

- agent output as only natural language,
- hidden assumptions not present in schema,
- confidence without evidence,
- error messages without error codes,
- tool output copied directly into final contract,
- memory reads embedded inside prompts,
- one contract reused for unrelated tasks.
