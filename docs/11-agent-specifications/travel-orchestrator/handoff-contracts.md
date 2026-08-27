# TM-ORCH-001 — Handoff Contracts

## Principle

Specialists do not directly invoke each other. OrchestrationRunner validates and mediates every handoff using immutable/versioned refs.

## Required handoff envelope

```yaml
HandoffEnvelope:
  handoffId: string
  producerNodeRef: string
  producerRunRef: string
  producerAgentId: string
  consumerNodeRef: string
  consumerAgentId: string
  objectType: string
  objectVersion: string
  objectRef: string
  objectHash: string
  producerContextManifestRef: string
  requiredConsumerContractHash: string
  validationStatus: VALID | INVALID | BLOCKED
  validationRuleRefs: []
  reasonCodes: []
```

## Validation gates

A handoff is VALID only when:
1. producer run succeeded,
2. object schema validates,
3. object type/version is accepted by consumer contract,
4. required provenance refs exist,
5. snapshot/context compatibility passes,
6. producer owned the output,
7. no authority/tool-policy violation invalidates the result.

## Major runtime handoffs

- TM-AG-001 → TM-AG-002: TravelerProfile
- TM-AG-002 → TM-AG-003/004/005/006/009: preferences/constraints
- TM-AG-003 → TM-AG-004 and Issue #49 corridor-city enrichment
- TM-AG-004/005/006/007/008 → TM-AG-009: eligible candidates and supporting signals/facts
- TM-AG-009 → TM-AG-010: DraftItinerary
- TM-AG-009/010/011/012 + evidence/traces → TM-AG-014: candidate verification package
- TM-AG-014 REPAIR → owner rechecks + TM-AG-013
- TM-AG-013 → TM-AG-010/014: repaired fragments + required rechecks
- TM-AG-014 PASS → TM-AG-015
- TM-AG-015 + matching PASS snapshot → TM-AG-016

## Repair handoff

A Verification `REPAIR` result must include actionable refs and required owner. Orchestrator may reactivate only the required nodes/dependency closure unless escalation is justified.

## Snapshot invariant

Explanation and Final Composer input hashes must match the exact Verification PASS snapshot hash.

## Invalid handoff behavior

Invalid handoff:
- consumer remains BLOCKED,
- failure attribution records HANDOFF/SCHEMA/AUTHORITY as appropriate,
- no fallback raw payload is silently passed,
- retry/repair must fix the producer or contract path first.

## Issue #49
JourneySegment/user-fixed stop ownership and route refs must survive all relevant handoffs.

## Issue #50
Knowledge-hit metadata can be handed to specialists for lookup strategy; knowledge value cannot bypass current-fact handoff requirements.

## Issue #51
RecurringEventKnowledge and exact EventOccurrence are different object families and cannot substitute for each other.