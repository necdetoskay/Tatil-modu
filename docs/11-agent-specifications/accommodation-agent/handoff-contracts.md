# TM-AG-005 — Handoff Contracts

## Caller
Travel Orchestrator / authorized gateway.

## Upstream minimum disclosure
- TravelerProfile ref / occupancy fields,
- TM-AG-002 relevant accommodation constraints,
- target region or journey stopover segment,
- stay dates,
- room count/currency/budget context if applicable.

## → TM-AG-008 Transportation
Disclose only selected property identity/location and stay-window anchors. Transportation calculates route/time.

## → TM-AG-009 Route Planner
Disclose:
- property location,
- check-in/out policy facts,
- exact stay window,
- availability/eligibility state,
- unresolved scheduling blockers.

Route Planner cannot convert `LIVE_UNAVAILABLE` or `REJECTED` property to accepted.

## → TM-AG-010 Budget
Disclose normalized price quote, taxes/fees known state, currency and evidence refs. No raw provider payload.

## → TM-AG-012 Review Intelligence
Disclose stable property/provider IDs only plus review request scope.

## → TM-AG-014 Verification
Full normalized candidate, evidence, query signature and trace refs.

## Journey Issue #49
For stopover stays preserve:
- journeySegmentRef,
- stayRole,
- check-in/out dates.

Accommodation Agent does not change journey segment order or duration.

## Invariants
1. Live facts retain query signature.
2. Rejected/unavailable candidate cannot leak into normal stay selection pool.
3. Price status and freshness survive handoff unchanged.
4. Provider-specific response fields stay behind adapter boundary.
5. Payment/booking credentials are never part of cross-agent handoff.
