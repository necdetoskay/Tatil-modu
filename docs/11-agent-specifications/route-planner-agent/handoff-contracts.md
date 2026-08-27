# TM-AG-009 — Handoff Contracts

## Upstream

- TM-AG-001 → TravelerProfile summary
- TM-AG-002 → hard/conditional constraints + preferences + exception refs
- TM-AG-003 → destination/stopover region refs
- TM-AG-004 → eligible PlaceCandidate refs
- TM-AG-005 → eligible AccommodationCandidate refs + stay windows
- TM-AG-006 → eligible FoodCandidate refs + meal windows
- TM-AG-007 → WeatherSignal refs
- TM-AG-008 → RouteLeg/Matrix refs

## Downstream

### TM-AG-010 Budget
Receives:
- itinerary/day/segment refs,
- selected paid entity refs,
- route distance/toll metadata refs,
- stay refs,
- meal/activity refs.

Route Planner fiyat hesaplamaz.

### TM-AG-014 Verification
Receives:
- full DraftItinerary,
- rejectedCombinations,
- verificationNeeds,
- constraintSummary,
- upstream provenance refs.

### TM-AG-013 Adaptive Itinerary
Receives when repair needed:
- affected day/block/segment refs,
- original feasibility context,
- immutable/fixed user choices.

## Issue #49 provenance chain

```text
CorridorCandidate (TM-AG-008)
→ Destination value (TM-AG-003)
→ selected stop role
→ JourneySegment (TM-AG-009)
→ Accommodation/Food/Place block refs
→ Verification
```

Aşağıdaki ref'ler sessizce kaybolamaz:
- `journeySegmentRef`
- `routeLegRef`
- selected accommodation ref
- user-fixed stopover identity
- final-arrival deadline

## Invalid handoff

- REJECTED candidate upstream'den geldiğinde planlanması.
- Route evidence'sız travel block.
- Accommodation stay window olmadan check-in/out fact uydurulması.
- WeatherSignal olmadan weather-based rejection fact'i.
