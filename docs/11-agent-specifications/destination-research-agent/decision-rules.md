# TM-AG-003 — Decision Rules

| Rule ID | Kural |
|---|---|
| DR-001 | Fixed target varsa primary candidate kullanıcı hedefidir; open destination logic çalıştırılmaz. |
| DR-002 | Open destination modunda her candidate selection rationale + evidence taşır. |
| DR-003 | `relationToTarget=exceptional` yalnız exception policy/delegation varsa üretilebilir. |
| DR-004 | Driving radius constraint bu agent tarafından satisfied ilan edilemez; `routeValidationRequired=true`. |
| DR-005 | Geocoding koordinatı driving distance değildir. |
| DR-006 | Region theme tekil POI listesine dönüşemez. |
| DR-007 | Climate normal yalnız `CLIMATE_NORMAL` olarak etiketlenir. |
| DR-008 | Short-term weather fact üretilemez; TM-AG-007'ye bırakılır. |
| DR-009 | Tier 4 discovery kaynağı tek başına `VERIFIED_REGION_CONTEXT` üretemez. |
| DR-010 | Stale kritik evidence verified status veremez. |
| DR-011 | Beach/privacy conditional-hard region seviyesinde yalnız relevance üretir; place-level doğrulama TM-AG-004/TM-AG-011'e bırakılır. |
| DR-012 | Accessibility constraint region-level satisfied sayılamaz; downstream check zorunludur. |
| DR-013 | Kaynak çelişkisi çözülemiyorsa `unresolvedClaims` + confidence penalty. |
| DR-014 | Her verified region fact evidence ref taşır. |
| DR-015 | Place Search / Routes / Weather Forecast / Accommodation / Review tool çağrısı yasaktır. |

## Deterministic assertions

- `exceptional => exceptionPolicyExists == true`
- `drivingRadiusConstraint => routeValidationRequired == true`
- `seasonality.dataType == CLIMATE_NORMAL => noForecastClaim == true`
- `researchStatus == VERIFIED_REGION_CONTEXT => evidence.length > 0`
- `sourceTier == 4 only => researchStatus != VERIFIED_REGION_CONTEXT`
- POI collection fields forbidden
- drive duration/distance fields forbidden
