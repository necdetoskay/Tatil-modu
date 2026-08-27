# TM-AG-015 — Source Policy

Explanation Agent does not discover sources.

## Allowed source universe

Only refs already admitted into the verified snapshot and Verification PASS package:
- selected/rejected decision refs,
- constraint refs,
- OfficialFact refs,
- ReviewSignal refs,
- WeatherSignal refs,
- route/budget refs,
- EventOccurrence/SeasonalSuitability refs,
- verified warnings/uncertainty refs,
- AgentTrace decision refs.

## Claim-family preservation

- Official fact stays official/operational.
- Review signal stays experiential.
- Climate normal stays seasonal context.
- Forecast stays current weather evidence.
- Recurring event knowledge stays recurring context.
- EventOccurrence stays exact occurrence.
- ESTIMATED stays estimated.
- UNKNOWN stays unknown.

## Forbidden source promotion

Explanation cannot promote lower-certainty or different-claim-family evidence into a stronger claim simply for readability.

## Snapshot rule

All source refs must belong to the exact `verifiedSnapshotRef + verifiedSnapshotHash` package. A later/refreshed source is not automatically allowed until re-verification.
