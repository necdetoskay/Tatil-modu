# TM-AG-007 Decision Rules

| Rule | Deterministic davranış |
|---|---|
| WX-001 | Target window inside adapter-supported forecast horizon => FORECAST path. |
| WX-002 | Outside forecast horizon => CLIMATE_NORMAL only; no specific-day weather assertion. |
| WX-003 | `freshnessStatus=STALE` forecast cannot produce definitive current-trip signal. |
| WX-004 | Missing required provenance/freshness => risk may be UNKNOWN/CAUTION, never false certainty. |
| WX-005 | Climate normal cannot populate forecast-issuedAt semantics as if provider forecast. |
| WX-006 | Severe provider hazard may raise risk to HIGH/SEVERE according to canonical threshold/rule. |
| WX-007 | Unsupported provider field remains null/UNKNOWN. |
| WX-008 | Weather Agent never mutates itinerary or selects replacement activity. |
| WX-009 | TRAVEL_LEG exposure can emit caution but cannot reroute. |
| WX-010 | Journey segment ref supplied => preserve it in signal provenance. |
| WX-011 | Knowledge snapshot may satisfy climate-normal context only when provenance/status valid. |
| WX-012 | Knowledge/history cannot replace fresh forecast for current-trip date inside forecast horizon. |
| WX-013 | Conflicting trusted forecasts preserve conflict/uncertainty; false precision forbidden. |
| WX-014 | Plan bias is advisory signal, not plan decision. |

## Risk normalization order

```text
source validity/freshness
→ data type check
→ canonical hazard mapping
→ threshold/severity normalization
→ exposure relevance
→ riskLevel + planBias
```

## Hard failure examples

- `CLIMATE_AS_FORECAST`
- `STALE_FORECAST_FALSE_CURRENT`
- `ITINERARY_MUTATION_LEAKAGE`
- `ROUTE_AUTHORITY_LEAKAGE`
