# TM-ORCH-001 — Source Policy

## Principle

Travel Orchestrator does not consume external travel sources as domain evidence. It consumes:
- structured specialist outputs,
- registry/contract metadata,
- policy snapshots,
- context manifests,
- verification/failure/state-gate records.

## Allowed source families

- AgentRegistry snapshot,
- canonical agent contracts,
- orchestration policy snapshot,
- product feature flags,
- workflow/checkpoint refs,
- upstream specialist result refs,
- HarnessRunManifest / AgentTrace / ToolCallTrace / DecisionTrace,
- VerificationResult,
- user-originated workflow controls where explicitly exposed.

## Forbidden source behavior

The Orchestrator cannot read a web/blog/provider payload and turn it into a domain fact. Such content must be routed through the owning specialist.

## Knowledge-first metadata — Issue #50

Allowed orchestration metadata:
- coverage present/missing,
- freshness class/status,
- known source-registry availability,
- refresh-required flag.

Not allowed as Orchestrator truth:
- attraction quality,
- restaurant suitability,
- official opening hours,
- event confirmation,
- review sentiment.

## Event/season metadata — Issue #51

Trip dates and event/season capability-need flags may select graph nodes. Exact event status or seasonal suitability remains specialist evidence.

## Provenance

Every node selection and graph revision must reference the policy/feature/input metadata that caused it.