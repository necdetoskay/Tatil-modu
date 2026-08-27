# TM-AG-002 — Handoff Contracts

## Inbound

Caller: `TM-ORCH-001`  
Required upstream: `TM-AG-001 TravelerProfile`.

Inbound package:

```yaml
requestId: string
tripRequest:
  userMessage: string
  preferenceStatements: []
travelerProfile: TravelerProfile.v1
policyVersion: string
contextManifestId: string|null
```

## Outbound

Target: `TM-ORCH-001` only.

Outbound package:

```yaml
preferences: PreferenceSet
constraints: ConstraintSet
conflicts: []
clarificationRequired: []
overallConfidence: number
```

## Downstream disclosure

Orchestrator ihtiyaç kadarını iletir:

- TM-AG-003 Destination Research: geo/radius/trip-type constraints.
- TM-AG-004 Place Intelligence: activity eligibility, accessibility, beach/privacy conditions.
- TM-AG-005 Accommodation: accommodation/budget/accessibility preferences.
- TM-AG-006 Food: dietary/meal preferences varsa yalnız ilgili alanlar.
- TM-AG-009 Route Planner: time/rest/drive/radius hard constraints.
- TM-AG-010 Budget: budget-related constraints.
- TM-AG-014 Verification: tüm aktif hard constraints + provenance refs.

## Forbidden handoff

- raw full user history,
- unrelated sensitive preference,
- hidden model reasoning,
- unscoped memory data.

## Validation

Outbound schema-invalid ise Orchestrator downstream execution başlatamaz.
