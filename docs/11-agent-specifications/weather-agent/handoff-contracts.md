# TM-AG-007 Handoff Contracts

## To Orchestrator

Returns `WeatherSignalSet` only. No itinerary mutation.

## To TM-AG-009 Route Planner

May disclose:
- location/activity refs,
- data type,
- valid window,
- hazards/risk level,
- plan bias,
- freshness/confidence,
- evidence refs.

Planner owns schedule changes.

## To TM-AG-013 Adaptive Itinerary

May disclose a repair-trigger candidate when:
- HIGH/SEVERE weather risk,
- relevant outdoor/travel-leg exposure,
- current/fresh forecast evidence.

TM-AG-013 decides repair scope and alternatives.

## To TM-AG-008 Transportation

May disclose travel-leg weather caution signal bound to `journeySegmentRef`.

Must not disclose a reroute or duration calculation.

## To TM-AG-014 Verification

Disclose full weather provenance:
- source type/ref,
- issuedAt/retrievedAt,
- valid window,
- forecast horizon,
- freshness,
- climate-vs-forecast type,
- hazards and normalization rule refs.

## Issue #49

`journeySegmentRef` is preserved end-to-end when weather is evaluated for a corridor or travel leg.

## Issue #50

If a climate-normal knowledge snapshot is used, handoff must preserve the knowledge ref and data type so no downstream component can treat it as current forecast evidence.
