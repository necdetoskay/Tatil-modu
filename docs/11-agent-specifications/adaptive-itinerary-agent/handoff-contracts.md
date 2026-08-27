# TM-AG-013 — Handoff Contracts

## Upstream inputs

Adaptive Itinerary may receive repair triggers from:

- TM-AG-007 Weather → fresh WeatherSignal
- TM-AG-008 Transportation → changed route facts
- TM-AG-010 Budget → BudgetLedger.repairNeeds
- TM-AG-011 Public Authority → OfficialFact change/contradiction
- TM-AG-012 Review Intelligence → experiential crowd/queue signals
- TM-AG-014 Verification → repair targets
- user/orchestrator → explicit plan change
- Issue #51 event layer → EventOccurrence/EventImpactSignal

No specialist calls another specialist directly; Orchestrator prepares validated handoff packages.

## Downstream outputs

### To TM-AG-008 Transportation
When location/route sequence changed:
- affected route refs
- new from/to refs
- requested departure window
- `ROUTE_RECHECK`

### To TM-AG-010 Budget
When any cost-bearing block/stay/route changed:
- changed itinerary refs
- invalidated cost item refs if known
- `BUDGET_RECHECK`

### To TM-AG-011 Public Authority
When replacement requires unresolved critical official claim:
- claim type
- subject ref
- applicable effective window
- `OFFICIAL_FACT_RECHECK`

### To TM-AG-007 Weather
When repair moves a weather-sensitive block into a new time window/location:
- affected block/location/window
- `WEATHER_RECHECK`

### To TM-AG-014 Verification
Always after mutation:
- AdaptiveRepairResult
- repaired fragment refs
- patch provenance
- preservation proofs
- invalidated refs
- unresolved verification needs
- `VERIFICATION_RECHECK`

## Orchestrator repair loop

```text
change signal
→ TM-AG-013 impact + patch
→ required specialist rechecks
→ revised fragment/ledger/evidence
→ TM-AG-014 Verification
   ├─ PASS → accept repaired state
   ├─ REPAIR → TM-AG-013 next targeted iteration
   └─ FAIL/BLOCKED → user-visible unresolved path downstream
```

## State advancement rule

Adaptive output is not automatically durable itinerary state.

```text
repair candidate
→ downstream rechecks
→ Verification PASS
→ Orchestrator state advancement
```

This prevents a locally plausible repair from becoming canonical before route/budget/evidence verification.
