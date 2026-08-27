# TM-AG-016 — Final Composer Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-016 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
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
```

ve:

```text
final values = verified structured values
```

## 3. Inputs

- VerificationResult with `status=PASS`
- `verifiedSnapshotRef + verifiedSnapshotHash`
- verified Itinerary/JourneyPlan/DailyPlan refs
- verified AlternativePlan refs
- verified BudgetLedger ref
- ExplanationBundle ref with matching snapshot hash
- verified warnings/uncertainty refs
- locale/presentation preferences
- final-render policy snapshot
- `contextManifestId`

## 4. Output

Ana çıktı: `FinalTravelPlan.v1`.

Suggested sections:
- trip summary,
- journey/multi-city summary,
- day-by-day plan,
- alternatives,
- accommodation/food highlights if present,
- budget summary,
- event/season/weather notes where verified,
- warnings/unknowns,
- decision explanations.

## 5. No invention rule

Composer cannot:
- add new POI/restaurant/hotel/event,
- add an alternative missing upstream,
- change time/order,
- change route duration/distance,
- change price status/value,
- change event occurrence status,
- turn estimate into exact,
- turn unknown into known,
- turn ReviewSignal into OfficialFact.

## 6. Alternative rendering

If product preference asks for 2–3 alternatives/day but verified upstream has fewer safe alternatives:
- render available alternatives,
- render approved coverage warning if present,
- never invent filler alternatives.

## 7. Journey rendering — Issue #49

Final plan may render:
- origin/final destination,
- intermediate stop roles,
- full-day/overnight segments,
- selected accommodation refs,
- route/time summary.

User-fixed vs planner-selected stop meaning must not be reversed.

## 8. Knowledge/local experience — Issue #50

Verified stable local-taste/local-product/historical context may be shown as context/highlight if included in verified snapshot/explanation.

Current operational/shop price claims require verified current evidence upstream.

## 9. Event/season — Issue #51

- confirmed event occurrence can be displayed as confirmed.
- recurring-only knowledge must be worded as recurring/typical, not confirmed for current year.
- SEEK/AVOID rationale can be shown from ExplanationBundle.
- seasonal suitability must remain activity-specific.
- climate-normal and forecast language remain distinct.

## 10. Budget rendering

Preserve:
- knownTotal,
- projectedTotal,
- unknown exposure,
- `LIVE | OFFICIAL | ESTIMATED | UNKNOWN` semantics,
- currency.

Do not sum or recalculate differently from verified BudgetLedger.

## 11. Warning/uncertainty rendering

Final Composer cannot suppress a warning marked mandatory-for-display by verified policy.

Warnings may be formatted/shortened only if semantic meaning/severity is preserved.

## 12. Explanation rendering

ExplanationBundle blocks may be:
- placed near relevant day/decision,
- summarized without new claim,
- omitted only when presentation policy permits.

Any final fact-bearing explanation still must be supported by verified refs.

## 13. Allowed tools

No external-world tool.

Allowed:
- `TL-012` Schema Validator
- deterministic render-binding/value-preservation validator.

## 14. Provenance

Final output binds:
- verification result ref,
- verified snapshot ref/hash,
- explanation bundle ref,
- final render policy snapshot,
- render generation refs,
- section-level source/binding refs.

## 15. Failure modes

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

## 16. Harness binding

- R0 FinalTravelPlan schema
- R1 exact value/snapshot/ref/warning preservation
- R2 recorded verified render fixtures
- R3 schema/render-binding validator
- R4 readability/organization semantic quality
- R5 hallucination/value/uncertainty/warning attacks
- R6 external research/planning authority leakage
- R7 live only as final stage of verified E2E
- R8 final-render regressions

## 17. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
verified_input_only: true
```
