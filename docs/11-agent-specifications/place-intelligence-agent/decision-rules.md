# TM-AG-004 — Decision Rules

## PI-001 — Resolve identity before acceptance
A candidate without stable provider/official identity and usable location evidence cannot be `ACCEPTED`.

## PI-002 — Permanent closure rejects
`businessStatus=CLOSED_PERMANENTLY` → `eligibility.disposition=REJECTED`.

## PI-003 — Temporary closure is date-sensitive
Temporary closure without current reopening evidence cannot silently become operational.

## PI-004 — Hard violation rejects
Any applicable hard constraint `VIOLATED` → candidate `REJECTED`.

## PI-005 — Unverified hard rule blocks acceptance
Applicable hard constraint `UNVERIFIED` and no violation → candidate `NEEDS_VERIFICATION`.

## PI-006 — Conditional hard scope preserved
A conditional constraint is evaluated only when its condition is true. Condition must never be dropped or generalized.

## PI-007 — Family fit cannot override eligibility
Rating, popularity, child-friendly heuristic or family-fit score cannot rescue a hard eligibility failure.

## PI-008 — Unknown is not false
Missing provider field is represented as `UNKNOWN`; absence cannot be interpreted as negative or positive fact.

## PI-009 — Current vs regular hours
Current/special-date hours outrank regular hours for the relevant visit window. Regular hours cannot overwrite an exceptional closure.

## PI-010 — Official conflict visibility
If a current Tier 1 claim conflicts with Tier 2, preserve both evidence refs, mark conflict, and do not finalize the critical claim until resolved.

## PI-011 — Parking is a facility signal
Parking option evidence may state types/options; it may not guarantee a free space at arrival time.

## PI-012 — Age fit separation
General child-friendly signal may affect `familyFit`, but specific age eligibility requires explicit evidence when used as hard acceptance criterion.

## PI-013 — Review boundary
Rating/count may be copied as aggregate signal. Review text/theme synthesis is forbidden and routed to TM-AG-012.

## PI-014 — Route boundary
No driving time/distance/detour calculation. Route validation goes to TM-AG-008.

## PI-015 — Weather boundary
No forecast/current weather interpretation. Weather sensitivity may be labeled from activity type, but weather state comes from TM-AG-007.

## PI-016 — Deduplicate
Same real-world entity found through multiple searches must merge into one candidate with multiple evidence/provider refs.

## PI-017 — Exact price requires evidence
Exact amount requires fee evidence and explicit status. No evidence → amount null / `UNKNOWN`.

## PI-018 — Accepted-set rule
`candidates[]` may contain `ACCEPTED` and `NEEDS_VERIFICATION`; `REJECTED` candidates belong in `rejectedCandidates[]` with reason/evidence preserved.

## PI-019 — Source tier restriction
Tier 4-only critical fact cannot mark a hard constraint as `SATISFIED`.

## PI-020 — Provenance completeness
Every critical operational/eligibility claim used in disposition must point to evidence IDs.
