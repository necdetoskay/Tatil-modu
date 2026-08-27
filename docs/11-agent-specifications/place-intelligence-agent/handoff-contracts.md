# TM-AG-004 — Handoff Contracts

## Caller

Travel Orchestrator / authorized gateway.

## Required upstream

- TM-AG-001 TravelerProfile ref
- TM-AG-002 PreferencePolicy ref + active hard/conditional constraints
- TM-AG-003 DestinationBrief[]

Raw full conversation is not a required handoff field.

## Downstream disclosures

### → TM-AG-007 Weather
Only place location, indoor/outdoor/weather-sensitivity context and intended date window.

### → TM-AG-008 Transportation
Only stable place IDs/coordinates/address and selected/eligible candidate status. No review text or unrelated profile data.

### → TM-AG-009 Route Planner
- accepted candidate identity,
- opening-hours fact/status,
- estimated visit duration,
- family-fit/fatigue signal,
- unresolved operational warnings,
- hard constraint checks.

Route Planner may not reinterpret rejected candidate as accepted.

### → TM-AG-010 Budget
Only fee/price facts with status/evidence refs.

### → TM-AG-011 Public Authority Intelligence
Claim requiring official verification + candidate entity identity + existing evidence refs.

### → TM-AG-012 Review Intelligence
Stable entity/provider IDs and review-analysis request scope. Place Agent does not precompute review themes.

### → TM-AG-014 Verification
Full normalized candidate/evidence package and tool/provenance trace refs.

## Handoff invariants

1. `REJECTED` candidate cannot enter ordinary planning pool.
2. `NEEDS_VERIFICATION` must retain unresolved hard checks.
3. Downstream receives normalized facts, not raw provider payload by default.
4. Provider-specific field names do not become cross-agent contract fields.
5. Evidence refs and constraint refs are preserved across handoff.
6. Context manifest records which candidate fields were disclosed.
