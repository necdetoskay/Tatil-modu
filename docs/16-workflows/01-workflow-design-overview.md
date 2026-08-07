# 01 — Workflow Design Overview

**Doküman türü:** workflow design overview  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu dosya Tatil Modu workflow tasarımının temel kavramlarını, karar kapılarını ve runtime dışı sınırlarını tanımlar.

Bu dosya workflow engine, job runner veya agent execution implementation değildir.

## Ana karar

```yaml
artifact_id: workflow_design_overview
artifact_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_orchestration_allowed: false
source_of_truth: docs/16-workflows/01-workflow-design-overview.md
```

## Workflow nedir?

Workflow, agent ve platform çıktılarının hangi sırayla üretileceğini, hangi contract ile taşınacağını ve hangi gate'lerden geçeceğini tanımlar.

```text
Workflow = sıralama + karar kapıları + handoff + fallback + final assembly kuralları.
```

## Temel workflow aktörleri

```yaml
workflow_actors:
  travel_orchestrator:
    role: workflow coordination and gate ownership
  expert_agents:
    role: bounded domain reasoning
  verification_evidence_agent:
    role: evidence aggregation and verification gap ownership
  final_response_composer_agent:
    role: user-facing response assembly from approved data only
```

## Temel gate tipleri

```yaml
gate_types:
  contract_validation_gate:
    purpose: input/output shape and required field check
  hard_constraint_gate:
    purpose: non-negotiable user requirement enforcement
  evidence_gate:
    purpose: variable claims and verification status check
  family_suitability_gate:
    purpose: child age, fatigue and parent burden check
  final_response_gate:
    purpose: no invented facts and user-visible disclosure check
```

## Canonical workflow ilkesi

Expert agent'lar birbirini doğrudan çağırmaz.

```text
User request -> Orchestrator -> bounded agent calls -> contract outputs -> gates -> final assembly
```

## Output beklentisi

Her workflow tasarımı şunları tanımlamalıdır:

```yaml
required_workflow_fields:
  - workflow_id
  - purpose
  - entry_conditions
  - participating_agents
  - input_contracts
  - output_contracts
  - decision_gates
  - fallback_behavior
  - forbidden_runtime_assumptions
```

## Current status

```yaml
artifact_state: drafted
next_artifact: 02-end-to-end-travel-planning-workflow.md
implementation_allowed: false
runtime_orchestration_allowed: false
```
