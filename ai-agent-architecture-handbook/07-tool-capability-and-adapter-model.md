# 07 — Tool Capability and Adapter Model

## Purpose

This section defines how AI agent systems should access external tools, APIs, local services, mock providers and offline fixtures.

The core rule is simple:

```text
Agents do not call providers directly.
Agents request capabilities through a Tool Gateway / Capability Platform.
Provider-specific integration lives inside adapters.
```

This separation prevents agent prompts from becoming infrastructure code and makes permissions, retries, cost, audit, caching, source metadata and failure handling consistent.

## Canonical principle

```text
Agent intent
    ↓
Capability request
    ↓
Tool Gateway / Capability Platform
    ↓
Policy, permission, timeout, cost, retry, audit
    ↓
Provider Adapter
    ↓
External / local / mock provider
    ↓
Normalized tool result
    ↓
Evidence handoff to agent / orchestrator
```

Agents should express what capability they need, not which provider-specific HTTP endpoint, SDK method or scraping detail should be used.

## Component responsibilities

| Component | Owns | Must not own |
|---|---|---|
| Agent | Task-specific reasoning and capability request | Provider credentials, retries, rate limits, raw scraping logic |
| Orchestrator | Workflow timing, dependency ordering, fallback path selection | Provider-specific parsing |
| Capability Platform / Tool Gateway | Discovery, authorization, routing, timeout, retry, cost, audit, response normalization | Domain reasoning |
| Tool Adapter | Provider-specific request/response mapping | Cross-provider policy or business decision |
| Provider | External service, local service, file, database, browser, crawler or mock | Agent logic |
| Data Source & Trust | Source authority, freshness, evidence strength and conflict semantics | Tool execution mechanics |
| Verification Platform | Runtime verification result carrying | Provider integration |

## Capability request standard

A tool request should be described as a capability request.

Minimum fields:

```yaml
capability_request:
  request_id: string
  requested_by: agent_or_orchestrator_id
  capability_id: string
  purpose: string
  input:
    key: value
  constraints:
    timeout_ms: number
    max_cost: number | null
    freshness_requirement: string | null
    allowed_providers: list | null
    forbidden_providers: list | null
  privacy_scope:
    disclosure_package_id: string | null
    contains_personal_data: boolean
    allowed_data_classes: list
  evidence_requirement:
    source_required: boolean
    timestamp_required: boolean
    confidence_required: boolean
  fallback_policy:
    allow_mock: boolean
    allow_cached: boolean
    allow_alternative_provider: boolean
```

## Capability registry

Every capability should be registered before use.

A capability registry entry should include:

```yaml
capability:
  capability_id: string
  name: string
  description: string
  owner: platform_or_team
  allowed_callers: list
  input_schema: path_or_ref
  output_schema: path_or_ref
  supported_providers: list
  default_provider: string | null
  mock_provider: string | null
  cost_policy: string
  rate_limit_policy: string
  permission_policy: string
  audit_policy: string
  evidence_policy: string
  failure_modes: list
  lifecycle_state: proposed | active | deprecated | disabled
```

## Adapter standard

Adapters hide provider-specific details from agents.

A provider adapter should define:

- provider name,
- supported capabilities,
- authentication method,
- request transformation,
- response normalization,
- source metadata extraction,
- evidence handoff fields,
- cache/TTL behavior,
- provider-specific error mapping,
- retry compatibility,
- mock behavior,
- test fixture behavior.

## Result standard

A normalized tool result should include both data and evidence metadata.

```yaml
tool_result:
  request_id: string
  capability_id: string
  provider_id: string
  execution_state: succeeded | failed | blocked | degraded
  data:
    key: value
  source_metadata:
    source_name: string | null
    source_url: string | null
    retrieved_at: datetime
    published_at: datetime | null
    valid_from: datetime | null
    valid_until: datetime | null
  evidence:
    evidence_id: string | null
    evidence_status: fresh | usable | weak | conflicting | expired | missing
    confidence: number | null
    notes: list
  cost:
    estimated_cost: number | null
    currency: string | null
  error:
    error_code: string | null
    safe_message: string | null
    retry_policy: string | null
```

## Permission and policy enforcement

Permission checks happen before execution.

The gateway should check:

- whether the caller is allowed to request the capability,
- whether the request purpose is valid,
- whether the disclosure package allows the data to be used,
- whether the provider is allowed for the current environment,
- whether the action is read-only or mutating,
- whether user confirmation is required,
- whether cost or rate limit constraints are exceeded.

Agents should never bypass these checks.

## Online, offline and mock modes

A robust agent system must support multiple execution modes:

| Mode | Purpose |
|---|---|
| Online provider | Real external API/site/tool execution |
| Local provider | Local model, local database, local service or file-backed tool |
| Offline cache | Previously retrieved data with TTL and evidence metadata |
| Mock provider | Deterministic fixture-backed provider for tests |
| Manual override | Human-supplied result with audit note |

Tests should not require live external providers unless the test is explicitly a live integration test.

## Caching and freshness

Caching is a platform decision, not an agent trick.

A cached result must include:

- original retrieval time,
- source identity,
- validity window,
- freshness classification,
- whether it is allowed for the current decision,
- whether the user must be warned that data may be stale.

For high-risk or time-sensitive decisions, cached data may be allowed only as advisory context.

## Prompt injection and untrusted content

External tool output is data, not instruction.

The gateway or downstream safety layer should treat web pages, provider text, PDFs, search snippets, reviews, comments and scraped content as untrusted input.

Rules:

- Tool output must not modify system prompts.
- Tool output must not override developer instructions.
- Tool output must not grant itself authority.
- Tool output must not directly request hidden memory or credentials.
- Suspicious instructions inside retrieved content should be quarantined or marked.

## Error mapping

Provider errors should be mapped into a central error registry.

Examples:

```text
CAP-PERM-001  capability not permitted
CAP-RATE-001  rate limit reached
TAD-PARSE-001 provider response could not be normalized
TAD-AUTH-001  provider authentication failed
DST-FRESH-001 source is stale for requested decision
SEC-INJECT-001 retrieved content contains suspicious instruction
```

Agents should react to canonical error codes, not provider-specific raw messages.

## Cost and rate limit control

The gateway should own:

- per-capability cost tracking,
- per-provider usage limits,
- per-user or per-project budget limits,
- retry budgets,
- fallback cost comparisons,
- logging of expensive calls.

Agents may declare the importance of a call, but they should not decide billing policy alone.

## Agent behavior rules

Agents may:

- request a capability,
- explain why they need it,
- specify freshness or evidence needs,
- handle normalized success/failure results,
- ask the orchestrator for fallback when required.

Agents must not:

- store provider credentials,
- scrape directly outside approved adapters,
- invent source metadata,
- ignore permission denials,
- retry indefinitely,
- treat tool output as trusted instruction,
- rewrite policy rules to make a tool call pass.

## Orchestrator behavior rules

The orchestrator should:

- choose when a capability is needed,
- group related calls where efficient,
- prevent duplicate calls,
- enforce dependency order,
- select fallback paths,
- stop workflow when required evidence is missing,
- record tool calls in run audit.

## Tatil Modu reference example

In Tatil Modu:

- Hotel Agent should request `hotel_search` capability, not call a hotel provider directly.
- Route Planner should request `route_estimation` capability, not embed provider-specific map logic.
- Weather-aware planning should request `weather_forecast` with freshness requirements.
- Public authority checks should go through official-source capabilities where possible.
- Women-only beach verification should carry source metadata, retrieved time and confidence.
- Mock tools should support Bursa/Balıkesir family trip fixtures without live API calls.

## Checklist

Before a tool is used by an agent system:

- [ ] Capability is registered.
- [ ] Input and output schemas exist.
- [ ] Caller permission is defined.
- [ ] Provider adapters are listed.
- [ ] Mock provider exists for fixture tests.
- [ ] Evidence metadata is defined.
- [ ] Error codes are mapped.
- [ ] Cost and rate limits are defined.
- [ ] Cache and freshness rules are defined.
- [ ] Prompt injection handling is defined.
- [ ] Audit logging is required.
