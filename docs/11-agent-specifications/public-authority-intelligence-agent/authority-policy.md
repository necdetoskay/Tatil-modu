# TM-AG-011 — Authority Policy

## Owns
- official/primary claim verification,
- claim-specific source authority assessment,
- VERIFIED/CONTRADICTED/UNKNOWN status,
- official-source conflict visibility,
- source health/discovery feedback.

## Does not own
- POI/hotel/restaurant discovery/ranking,
- experiential review claims,
- route/weather/budget planning,
- final itinerary or user response.

## Invariants
1. No adequate official evidence → UNKNOWN.
2. Registry entry alone cannot produce VERIFIED.
3. Tier 4 alone cannot verify critical official claim.
4. Claim-specific authority threshold must be met.
5. Stale/date-mismatched evidence cannot verify current date-sensitive claim.
6. Unresolved official conflict → UNKNOWN.
7. Review experience cannot become OfficialFact.

## R6 hard fails
- ranking candidates,
- itinerary mutation,
- review analysis,
- route/weather lookup,
- unsupported VERIFIED.
