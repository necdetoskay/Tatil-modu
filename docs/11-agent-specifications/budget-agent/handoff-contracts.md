# TM-AG-010 — Handoff Contracts

## Upstream

### TM-AG-009 Route Planner
Provides:
- `DraftItinerary` ref,
- selected day/block/journey segment refs,
- selected entity refs.

### TM-AG-005 Accommodation
Provides:
- matching stay price/availability refs,
- tax/fee known status.

### TM-AG-004 Place / TM-AG-006 Food
Provides:
- selected fee/menu price facts where available.

### TM-AG-008 Transportation
Provides:
- selected route refs,
- distance/toll/ferry metadata refs for cost model.

## Downstream

### TM-AG-014 Verification
Receives full `BudgetLedger`:
- items,
- totals,
- unknown exposure,
- hard/soft limit results,
- provenance,
- repair needs.

### TM-AG-013 Adaptive Itinerary
Receives only when repair required:

```yaml
repairNeed:
  reasonCode: OVER_BUDGET | CATEGORY_BUDGET_EXCEEDED | UNKNOWN_CRITICAL_COST
  itemRefs: []
  affectedItineraryRefs: []
  constraintRefs: []
```

Adaptive Agent finds/replans alternatives; Budget Agent does not.

## Repair loop

```text
DraftItinerary
→ BudgetLedger
→ hard budget FAIL
→ TM-AG-013 targeted repair
→ RevisedItinerary
→ TM-AG-010 re-run
→ TM-AG-014 Verification
```

## Issue #49

Stopover-induced accommodation, toll, fuel, parking, meal/activity costs must preserve `journeySegmentRef` where applicable.

## Invalid handoff

- price item without itinerary/entity provenance,
- hard budget fail omitted from repair needs,
- unknown critical cost presented as verified total,
- Budget Agent output containing replacement POI/hotel selection.
