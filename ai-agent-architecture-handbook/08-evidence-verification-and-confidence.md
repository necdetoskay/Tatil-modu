# 08 — Evidence, Verification and Confidence

## Purpose

This section defines how AI agent systems should represent evidence, verification status and confidence.

The goal is to prevent agent outputs from becoming unsupported assertions. Any important claim, recommendation or decision should carry enough context for the system, reviewer or user to understand why it was produced and how trustworthy it is.

## Canonical principle

```text
Agents may produce claims and recommendations.
Evidence and verification semantics must be explicit.
Confidence must be evidence-bound, explainable and comparable.
```

Confidence is not a decorative score. It is a decision signal that must be tied to source quality, freshness, evidence strength, uncertainty and domain-specific risk.

## Core distinction

| Concept | Meaning | Owner |
|---|---|---|
| Evidence | The source-backed material supporting a claim | Data Source & Trust / Tool Gateway |
| Verification | Assessment of whether a claim is supported, stale, uncertain or rejected | Verification Platform |
| Confidence | Normalized decision signal derived from evidence, verification and domain context | Confidence Engine |
| Explanation | Human-readable reason for the decision and uncertainty | Producing agent/planner + Final Composer |

## Evidence model

Every important claim should be able to reference evidence.

Minimum evidence fields:

```json
{
  "evidence_id": "ev_001",
  "source_type": "official|provider|user_input|internal_registry|derived|manual_review",
  "source_name": "string",
  "source_url": "string|null",
  "retrieved_at": "ISO-8601|null",
  "published_at": "ISO-8601|null",
  "valid_from": "ISO-8601|null",
  "valid_until": "ISO-8601|null",
  "evidence_status": "fresh|usable|weak|conflicting|expired|missing",
  "claim_supported": "string",
  "raw_reference": "string|null",
  "notes": "string|null"
}
```

## Verification status

Verification status describes the system's assessment of a claim.

Canonical values:

| Status | Meaning |
|---|---|
| `verified` | Supported by sufficient current evidence |
| `likely` | Reasonably supported but not fully confirmed |
| `uncertain` | Evidence is incomplete, weak or ambiguous |
| `rejected` | Evidence contradicts the claim |
| `stale` | Evidence may have been valid but is too old for the decision |

Verification must not be treated as the same thing as confidence. A claim may be verified but low-impact, or uncertain but still useful if clearly labeled.

## Confidence semantics

Confidence must be normalized by a shared Confidence Engine.

Minimum confidence fields:

```json
{
  "confidence_score": 0.0,
  "confidence_label": "very_low|low|medium|high|very_high",
  "confidence_reason": "string",
  "confidence_inputs": [
    "source_authority",
    "freshness",
    "evidence_strength",
    "conflict_level",
    "domain_risk",
    "model_uncertainty"
  ],
  "computed_at": "ISO-8601",
  "computed_by": "confidence_engine"
}
```

Confidence scores should not be compared across domains unless they use the same scale and semantics.

## Claim envelope

Important agent outputs should use a claim envelope.

```json
{
  "claim_id": "claim_001",
  "claim_type": "fact|recommendation|constraint|risk|assumption|derived_metric",
  "claim_text": "string",
  "producer": "agent_or_planner_id",
  "evidence_refs": ["ev_001"],
  "verification_status": "verified|likely|uncertain|rejected|stale",
  "confidence": {
    "confidence_score": 0.82,
    "confidence_label": "high",
    "confidence_reason": "Supported by official source and recent retrieval."
  },
  "decision_impact": "blocking|strong_signal|weak_signal|explanation_only",
  "user_visible_explanation": "string|null"
}
```

## Decision impact

Evidence and confidence only matter when they affect decisions.

| Decision impact | Meaning |
|---|---|
| `blocking` | Claim can stop or invalidate a plan |
| `strong_signal` | Claim strongly affects ranking or selection |
| `weak_signal` | Claim provides context but should not dominate |
| `explanation_only` | Claim is shown for transparency but does not drive logic |

Hard constraints should never be overridden by high preference scores or low latency benefits.

## Conflict handling

When evidence conflicts, the system must not silently pick the answer it likes.

Conflict handling steps:

1. identify conflicting evidence,
2. compare source authority,
3. compare freshness,
4. compare specificity,
5. downgrade confidence if conflict remains,
6. escalate to user, reviewer or fallback plan when needed.

## Freshness rules

Freshness depends on domain.

| Domain | Freshness sensitivity |
|---|---|
| Weather | very high |
| Prices and availability | very high |
| Opening hours | high |
| Legal/public authority rules | high |
| Static descriptions | medium |
| Historical facts | low |

The handbook does not define exact TTLs for every domain. Each product should define TTL policy in a registry or configuration layer.

## User input as evidence

User input can be evidence, but it has a different trust profile.

Examples:

- family size,
- budget,
- travel date,
- preferences,
- exclusions,
- prior experience,
- accessibility needs.

User input should usually have high authority for personal preference, but not for external facts.

Example:

```text
User says: "We have two children, ages 6 and 2."
→ strong evidence for family profile.

User says: "That hotel has a pool."
→ weak external-fact evidence unless verified.
```

## Agent behavior rules

Agents must:

- attach evidence references when producing factual or decision-driving claims,
- mark unsupported assumptions clearly,
- distinguish user preferences from verified external facts,
- avoid inventing confidence scores outside the shared semantics,
- preserve verification status from upstream systems,
- downgrade claims when evidence is stale or conflicting.

Agents must not:

- treat model fluency as evidence,
- cite another agent's claim as evidence unless that claim carries evidence,
- hide uncertainty in final recommendations,
- convert soft preferences into hard constraints without policy support.

## Orchestrator behavior rules

The Orchestrator must:

- require evidence for decision-driving claims,
- route claims to verification when needed,
- stop or defer decisions when hard-constraint evidence is missing,
- reconcile conflicting claims,
- pass confidence and verification status into planner decisions,
- preserve audit trace across the workflow.

## Planner behavior rules

Planners must:

- use verification status and confidence as decision inputs,
- treat blocking claims differently from weak signals,
- avoid optimizing around rejected or stale claims,
- explain trade-offs when a lower-confidence option is still selected,
- provide fallback plans when evidence is insufficient.

## Final composer behavior rules

The final user-facing response should translate evidence and confidence into understandable explanations.

It should not expose internal metadata unnecessarily, but it should communicate important uncertainty.

Example:

```text
This option looks suitable, but the opening hours should be rechecked before departure because the latest source is not current enough for a same-day plan.
```

## Tatil Modu reference example

Generic claim:

```text
A recommendation involving opening hours, travel time or beach policy must carry evidence, freshness and verification status.
```

Tatil Modu mapping:

```text
Claim: "This beach is suitable for a family plan and has a women-only section."

Required evidence:
- official or reliable local source,
- retrieved_at timestamp,
- policy or facility description,
- verification_status,
- confidence label,
- uncertainty explanation if source is stale or indirect.
```

Planner effect:

```text
If women-only beach is a hard user constraint and verification is missing,
the planner must not present the beach as satisfying that constraint.
It may present it only as an unverified option with warning or ask for confirmation.
```

## Checklist

Before implementation, verify that:

- evidence model is defined,
- verification status values are standardized,
- confidence labels and score semantics are centralized,
- unsupported assumptions are explicitly marked,
- stale and conflicting evidence downgrade confidence,
- hard constraints require sufficient evidence,
- final user explanations preserve important uncertainty,
- product-specific TTL rules are defined outside the agent prompt,
- evidence and confidence are included in audit logs.
