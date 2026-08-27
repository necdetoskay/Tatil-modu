# TM-AG-016 — Final Composer Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-016 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 READY |
| Tarih | 2026-08-27 |

## 1. Purpose

Final Composer Agent, Verification PASS almış yapılandırılmış planı kullanıcıya sunulan `FinalTravelPlan` formatına dönüştürür.

```text
verified itinerary + budget + alternatives + explanation + warnings
→ bind exact verified snapshot
→ format sections
→ preserve values/uncertainty
→ final claim/render validation
→ FinalTravelPlan
```

Final Composer renderer'dır; researcher/planner değildir.

## 2. Core invariants

```text
facts(final_plan) ⊆ facts(verified_snapshot + verified_explanation)
final values = verified structured values
```

## 3. Inputs

- VerificationResult with `status=PASS`
- `verifiedSnapshotRef + verifiedSnapshotHash`
- verified Itinerary/JourneyPlan/DailyPlan refs
- verified alternatives
- verified BudgetLedger
- ExplanationBundle with matching snapshot hash
- verified warnings/uncertainty refs
- locale/presentation preferences
- final-render policy snapshot
- `contextManifestId`

## 4. Output

`FinalTravelPlan.v1` carries:
- verification/snapshot binding,
- final render policy snapshot,
- `renderGenerationRefs[]`,
- section-level subject/source/claim/value/warning bindings,
- deterministic `renderValidation`.

Suggested sections:
- trip summary,
- journey/multi-city summary,
- day-by-day plan,
- alternatives,
- accommodation/food/local experience highlights,
- budget,
- event/season/weather notes,
- warnings/unknowns,
- decision explanations.

## 5. No invention rule

Composer cannot:
- add new POI/restaurant/hotel/event,
- add missing alternative,
- change time/order,
- change route duration/distance,
- change price status/value,
- change event status,
- estimate→exact,
- unknown→known,
- ReviewSignal→OfficialFact.

## 6. Alternative rendering

Fewer verified alternatives than desired product target:
- render available alternatives,
- render approved coverage warning if present,
- never fabricate filler alternative.

## 7. Journey rendering — Issue #49

May render verified origin/destination, intermediate stop roles, full-day/overnight segments, stay refs and route/time summary.

User-fixed vs planner-selected semantics cannot be reversed.

## 8. Knowledge/local experience — Issue #50

Verified stable local-taste/local-product/historical context may be shown. Current operational/shop price claims require verified current evidence upstream.

## 9. Event/season — Issue #51

- confirmed occurrence can be shown confirmed,
- recurring-only knowledge remains recurring/typical,
- SEEK/AVOID rationale from verified explanation,
- seasonal suitability remains activity-specific,
- climate normal and forecast remain distinct.

## 10. Budget rendering

Preserve exact verified:
- knownTotal,
- projectedTotal,
- unknown exposure,
- `LIVE | OFFICIAL | ESTIMATED | UNKNOWN`,
- currency.

No alternate recalculation.

## 11. Warning/uncertainty rendering

Mandatory-for-display warning cannot be suppressed or downgraded.

## 12. Explanation rendering

Explanation blocks may be placed/summarized only without new factual claim or meaning change.

## 13. Allowed tools

- `TL-012` Schema Validator
- deterministic render-binding/value-preservation validator

No external-world tool.

## 14. Render validation invariants

Output requires:

```yaml
unsupportedEntityRefCount: 0
unsupportedClaimRefCount: 0
changedVerifiedValueCount: 0
missingMandatoryWarningCount: 0
snapshotMatch: true
```

Any nonzero/failure blocks output.

## 15. Provenance

Final output binds:
- verification result,
- verified snapshot ref/hash,
- explanation bundle,
- render policy,
- render generation refs,
- section-level binding refs.

## 16. Failure modes

- `NEW_FACT_IN_FINAL`
- `NEW_CANDIDATE_IN_FINAL`
- `FAKE_ALTERNATIVE`
- `VALUE_CHANGED_FROM_VERIFIED`
- `UNCERTAINTY_UPGRADED`
- `MANDATORY_WARNING_DROPPED`
- `EXPLANATION_SNAPSHOT_MISMATCH`
- `EVENT_RECURRENCE_AS_CONFIRMED`
- `CLIMATE_AS_FORECAST`
- `BUDGET_RECALCULATED_DIFFERENTLY`
- `EXTERNAL_TOOL_LEAKAGE`
- `MISSING_RENDER_PROVENANCE`

## 17. Harness binding

- R0 FinalTravelPlan schema
- R1 exact value/snapshot/ref/warning preservation
- R2 recorded verified render fixtures
- R3 schema/render-binding validator
- R4 readability/organization semantic quality
- R5 hallucination/value/uncertainty/warning attacks
- R6 external research/planning leakage
- R7 terminal stage of live verified E2E
- R8 final-render regressions

## 18. Current status

```yaml
agent_spec_status: golden_v1_ready
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
verified_input_only: true
render_validation_required: true
```
