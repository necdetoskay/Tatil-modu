# TM-AG-006 Handoff Contracts

## To Orchestrator

Returns:
- `LocalTasteBrief[]`
- accepted / needs-verification / rejected `FoodCandidate[]`
- warnings + unresolved claims
- source/knowledge/journey provenance.

## To TM-AG-008 Transportation

May disclose only:
- stable candidate ID,
- coordinates/address,
- intended meal window,
- journey segment ref.

Must not disclose a route decision.

## To TM-AG-009 Route Planner

May disclose:
- only `ACCEPTED` candidates, plus candidates explicitly repaired/verified later,
- opening-hours fact/status,
- meal-window fit,
- expected meal burden,
- location,
- hard-constraint checks,
- journey segment ref.

`NEEDS_VERIFICATION` cannot silently become a fixed meal stop.

## To TM-AG-010 Budget

May disclose:
- normalized `priceFact`,
- price status,
- currency,
- evidence refs.

Budget Agent must preserve `LIVE|OFFICIAL|ESTIMATED|UNKNOWN` semantics.

## To TM-AG-012 Review Intelligence

May disclose:
- stable food entity ID/provider IDs,
- review-provider reference/availability,
- requested analysis window if supplied by Orchestrator.

No pre-synthesized review themes are emitted by TM-AG-006.

## To TM-AG-014 Verification

Disclose full candidate evidence package, including:
- business/opening/menu/price facts,
- eligibility reasons,
- local-taste provenance,
- knowledge/source registry refs,
- refresh decisions.

## Issue #50 knowledge lineage

When a knowledge hit is used, handoff trace should preserve:

```yaml
knowledgeRef: string
knowledgeSnapshotStatus: string
refreshRequiredClaims: []
refreshCompletedClaims: []
```

Precomputed knowledge is not automatically `VERIFIED` for current-trip dynamic claims.
