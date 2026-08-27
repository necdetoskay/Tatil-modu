# TM-AG-016 — Source Policy

Final Composer does not discover or refresh sources.

## Allowed source universe

Only:
- verified snapshot refs,
- VerificationResult PASS package,
- ExplanationBundle with same snapshot hash,
- verified warnings/alternatives/budget/itinerary refs.

## Claim-family preservation

- OfficialFact remains official/operational.
- ReviewSignal remains experiential.
- Forecast remains exact-date weather evidence.
- Climate normal remains seasonal context.
- Recurring event knowledge remains recurring context.
- EventOccurrence remains exact occurrence.
- ESTIMATED/UNKNOWN semantics remain unchanged.

## Source freshness

Final Composer cannot fetch newer source material. If underlying data changes after Verification PASS, old verified snapshot remains the only allowed render universe; a fresh plan requires upstream rerun/reverification.
