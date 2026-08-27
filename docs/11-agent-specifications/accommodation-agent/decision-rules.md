# TM-AG-005 — Decision Rules

## AC-001 — Query signature required
Every live availability/price fact must match the exact stay query signature.

## AC-002 — Stale is not live
Stale quote/availability cannot keep `LIVE` / `LIVE_AVAILABLE` semantics.

## AC-003 — Live unavailable rejects exact stay
`LIVE_UNAVAILABLE` → `REJECTED` for that check-in/out + occupancy query.

## AC-004 — Occupancy violation rejects
If requested adults/children/rooms cannot fit the returned product/policy → `REJECTED`.

## AC-005 — Children policy is explicit
Unknown child policy is `UNVERIFIED`, never silently accepted.

## AC-006 — Hard facility violation rejects
Required parking/accessibility/facility explicitly absent → `REJECTED`.

## AC-007 — Hard facility unknown blocks acceptance
Required facility unknown/conflicting → `NEEDS_VERIFICATION`.

## AC-008 — Price status discipline
No exact current provider evidence → not `LIVE`.

## AC-009 — Budget arithmetic deterministic
Total comparisons use TL-011/Rule Engine, not model arithmetic.

## AC-010 — Taxes/fees uncertainty visible
If taxes/fees coverage unknown, budget result cannot imply fully loaded exact total.

## AC-011 — No booking side effects
Search/details/availability only. Order/payment action forbidden.

## AC-012 — Route boundary
Accommodation can emit location fit signals, but cannot calculate driving minutes/km.

## AC-013 — Review boundary
Stable property entity can be handed to TM-AG-012; semantic review themes are not produced locally.

## AC-014 — Provider field absence is unknown
Missing facility/policy field is not equivalent to `ABSENT` unless provider semantics explicitly state so.

## AC-015 — Product-specific policy wins
For selected product/query, current product cancellation/meal/charge terms outrank generic property text.

## AC-016 — Stopover stay uses same rules
Issue #49 journey stays are not a special lower-quality mode; availability, occupancy, hard constraints and price provenance rules remain identical.

## AC-017 — Check-in/out compatibility visible
Known check-in/out rules must be preserved for TM-AG-009/TM-AG-014; Accommodation Agent does not schedule around them itself.

## AC-018 — Disposition provenance
Every reject/verification decision must include `dispositionReasons[]` with evidence refs or explicit unresolved code.
