# 06 — Memory Disclosure and Privacy

> Generic rules for using user, organization, project and session memory in AI agent systems without overexposing context.

## Purpose

Agent systems often fail when every agent receives the full user profile, full project history or full memory store.

This section defines how memory should be accessed, filtered, disclosed, used and audited.

The goal is not to maximize memory usage. The goal is to give each agent the minimum context required to do its bounded task safely and correctly.

## Canonical principle

```text
Memory is owned by a Memory Platform.
Agents receive scoped disclosure packages.
Agents do not read or write canonical memory directly.
```

## Why this matters

Uncontrolled memory access creates several risks:

- privacy leakage,
- irrelevant context pollution,
- hidden prompt steering,
- overfitting to old preferences,
- accidental use of stale facts,
- cross-project contamination,
- unsafe personalization,
- impossible audit trails.

A robust agent system separates memory storage, memory retrieval, memory disclosure and memory mutation.

## Component responsibilities

| Component | Responsibility |
|---|---|
| Memory Platform | Owns canonical personal, organizational or project memory |
| Disclosure Service | Builds scoped context packages for a specific task |
| Policy / Privacy Layer | Decides what may be disclosed, retained or forgotten |
| Orchestrator | Requests scoped disclosure for each agent run |
| Agent | Uses provided disclosure package only for its assigned task |
| Audit Logger | Records memory access, disclosure and mutation events |
| User / Admin Controls | Provide consent, correction, deletion and visibility controls |

## Memory types

A generic agent system may contain several memory types.

| Memory type | Example | Default handling |
|---|---|---|
| Session memory | Current conversation facts | Available only within current workflow |
| User memory | Preferences, constraints, profile facts | Scoped disclosure only |
| Household/team memory | Family members, team roles, shared constraints | Purpose-limited disclosure |
| Project memory | Architecture decisions, backlog, status | Scoped by project |
| Operational memory | Recent runs, failures, tool outcomes | Runtime/audit scoped |
| Long-term preference memory | Stable likes/dislikes | Must carry recency/confidence |
| Sensitive memory | Health, children, finances, legal issues, identity | Strongest minimization and consent rules |

## Disclosure package

Agents should not receive raw memory dumps. They should receive a disclosure package.

A disclosure package is a bounded context object prepared for a specific agent run.

Minimum fields:

```yaml
memory_disclosure_package:
  package_id: string
  purpose: string
  recipient_component: string
  recipient_component_type: agent | planner | module | service
  user_or_subject_scope: string
  included_facts:
    - fact_id: string
      fact_text: string
      memory_type: string
      sensitivity: low | medium | high | restricted
      source: session | user_memory | project_memory | system
      confidence: high | medium | low | unknown
      last_confirmed_at: string | null
      expiry_or_review_at: string | null
      reason_for_disclosure: string
  excluded_categories:
    - string
  retention_policy: discard_after_run | retain_output_only | retain_with_audit
  audit_required: boolean
```

## Disclosure rules

### 1. Purpose limitation

Memory is disclosed only for the current task.

Bad:

```text
Give every agent the full user profile.
```

Good:

```text
Give the hotel-ranking planner only the budget, accessibility needs, room constraints and relevant travel preferences.
```

### 2. Minimum necessary context

Each agent receives only the facts needed for its bounded responsibility.

A route planner may need mobility constraints and car ownership. It does not need the user's unrelated work projects.

### 3. Sensitivity-aware filtering

Sensitive memory requires stronger checks.

Examples:

- children's ages,
- medical constraints,
- financial limits,
- legal disputes,
- identity data,
- location history,
- religious or privacy preferences.

Sensitive memory may be used when it is necessary for safety or plan quality, but it should be disclosed as narrowly as possible.

### 4. Recency and confidence

Memory facts can become stale.

Every long-term memory fact should ideally carry:

- last confirmed time,
- source,
- confidence,
- review/expiry hint,
- user correction path.

### 5. No direct canonical writes

Agents must not directly mutate canonical memory.

They may emit memory write candidates.

```yaml
memory_write_candidate:
  candidate_id: string
  proposed_fact: string
  source_run_id: string
  confidence: high | medium | low
  reason: string
  sensitivity: low | medium | high | restricted
  requires_user_confirmation: boolean
```

The Memory Platform validates and commits, rejects or queues the candidate for confirmation.

### 6. Explicit exclusion support

Users or governance policy may exclude some memory from a workflow.

Examples:

- do not use previous travel preferences,
- do not use family information,
- do not personalize this answer,
- do not remember this,
- do not share this with downstream agents.

The exclusion must travel with the run context.

## Agent behavior rules

Agents must follow these rules:

1. Use only the disclosure package provided.
2. Do not infer hidden user profile facts from unrelated context.
3. Do not ask for or retrieve memory outside the assigned purpose.
4. Do not expose memory facts in final output unless relevant and safe.
5. Do not convert a one-time session detail into persistent memory.
6. Emit memory write candidates only when the fact is stable, useful and allowed.
7. Respect redaction and exclusion markers.
8. Treat stale or low-confidence memory as a hypothesis, not a fact.

## Orchestrator behavior rules

The Orchestrator is responsible for memory routing.

It should:

- determine which components need memory,
- request disclosure packages from the Memory Platform,
- pass only scoped packages to agents,
- enforce exclusion rules,
- collect memory write candidates,
- send candidates back to the Memory Platform,
- keep audit references for the run.

## Privacy gates

Before a disclosure package is sent, the system should check:

| Gate | Question |
|---|---|
| Purpose gate | Is this fact necessary for the current task? |
| Recipient gate | Is this component allowed to receive this category? |
| Sensitivity gate | Does this fact require stricter handling? |
| Consent gate | Is user consent required or already present? |
| Freshness gate | Is the memory still current enough to use? |
| Output gate | May this fact be revealed back to the user or third party? |
| Retention gate | Should the agent output or intermediate reasoning be retained? |

## Redaction model

Disclosure packages may include redacted facts.

Example:

```yaml
included_facts:
  - fact_text: "Family includes young children."
    redaction: "exact ages hidden from this component"
    reason_for_disclosure: "activity suitability"
```

Redaction allows a component to make safer decisions without receiving unnecessary precise data.

## Memory and tools

Tool calls should not receive memory by default.

When a tool requires personal context, the Orchestrator or Capability Platform must minimize and transform the data.

Bad:

```text
Send the full family profile to a hotel search provider.
```

Good:

```text
Send only guest count, city, date range and room requirement.
```

## Audit requirements

Every memory disclosure should be auditable.

Audit event fields:

```yaml
audit_event:
  event_type: memory_disclosure
  run_id: string
  package_id: string
  recipient_component: string
  disclosed_fact_ids: string[]
  excluded_categories: string[]
  policy_decision: allowed | denied | redacted
  timestamp: string
```

## Tatil Modu reference example

Generic rule:

```text
Agents receive only scoped disclosure packages.
```

Tatil Modu example:

- Activity Planner may receive children's ages and activity tolerance.
- Hotel Planner may receive room needs, budget range and privacy preferences.
- Route Planner may receive departure city, car availability and mobility limits.
- Public Authority verification does not need full family memory.
- Final Plan Composer may mention relevant constraints to explain the plan.

The system should not send the complete family profile to every travel agent.

## Checklist

Before implementation, confirm:

- [ ] There is a Memory Platform boundary.
- [ ] Agents do not directly read canonical memory.
- [ ] Agents do not directly write canonical memory.
- [ ] Disclosure packages have a schema.
- [ ] Sensitive categories are classified.
- [ ] Exclusion rules are supported.
- [ ] Memory write candidates are validated before commit.
- [ ] Tool calls receive minimized context.
- [ ] Disclosure events are auditable.
- [ ] Stale memory is marked with confidence or review metadata.
