# TM-ORCH-001 — Authority Policy

## Authority envelope

Travel Orchestrator may:
- select specialist nodes,
- construct and revise the capability graph,
- validate structured handoffs,
- route retries/rechecks/repairs,
- enforce workflow budgets and timeouts,
- enforce context lifecycle and state advancement gates,
- terminate as COMPLETED/BLOCKED/FAILED.

It may not:
- research POIs, hotels, restaurants, weather, routes, reviews or prices itself,
- call domain tools directly,
- invent domain facts,
- decide specialist-owned tourism value, eligibility, budget arithmetic or official truth,
- mutate itinerary outside the TM-AG-013 repair path,
- bypass TM-AG-014 Verification,
- allow durable canonical state advancement without Verification PASS.

## Core invariant

```text
Orchestrator → Specialist Agent → ToolGateway → Domain Tool
```

`Orchestrator → Domain Tool` is always `ORCHESTRATOR_DOMAIN_TOOL_LEAKAGE`.

## Specialist ownership

- profile facts → TM-AG-001
- preferences/constraints → TM-AG-002
- region value → TM-AG-003
- POI eligibility → TM-AG-004
- accommodation → TM-AG-005
- food/local taste → TM-AG-006
- weather → TM-AG-007
- routes/corridor logistics → TM-AG-008
- schedule/order → TM-AG-009
- budget → TM-AG-010
- official claim verification → TM-AG-011
- experiential review signals → TM-AG-012
- targeted mutation → TM-AG-013
- PASS/REPAIR/FAIL gate → TM-AG-014
- rationale rendering → TM-AG-015
- final rendering → TM-AG-016

Orchestrator may choose which owner is needed but may not replace that owner’s decision.

## State authority

Working/ephemeral state may advance within a workflow according to policy. Durable canonical trip state requires:

```text
VerificationResult.status == PASS
AND verified snapshot hash == candidate snapshot hash
```

Anything else → commit blocked.

## User-fixed decisions

The Orchestrator may route conflicts involving user-fixed decisions but may not silently delete or weaken them.

## Backlog bindings

### Issue #49
Orchestrator may activate corridor/journey capabilities but may not select a stop based on tourism value itself.

### Issue #50
Orchestrator may choose `KNOWLEDGE_HIT | TARGETED_REFRESH | FULL_DISCOVERY` from freshness/coverage metadata, but knowledge contents remain specialist-owned.

### Issue #51
Orchestrator may activate event/season capabilities from trip dates/preferences but does not decide event value or seasonal suitability itself.

## R6 authority failures

- direct TL-001/TL-004/TL-005/TL-006/TL-008/TL-009/TL-010 domain call,
- direct model prompt to choose a hotel/POI/route outside specialist run,
- changing a hard constraint,
- creating an itinerary patch without TM-AG-013,
- marking a claim VERIFIED without TM-AG-011,
- committing state without TM-AG-014 PASS,
- composing final plan before verification.