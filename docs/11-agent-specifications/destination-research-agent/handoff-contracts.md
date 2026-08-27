# TM-AG-003 — Handoff Contracts

## Inbound

Caller: `TM-ORCH-001`.

Required upstream:
- TM-AG-001 `TravelerProfile.v1`
- TM-AG-002 `PreferencePolicyOutput.v1`

Inbound ayrıca destination scope ve context manifest taşır.

## Outbound

Target: `TM-ORCH-001` only.

```yaml
DestinationBriefSet.v1:
  destinations: []
  researchWarnings: []
  overallConfidence: number
```

## Downstream disclosure

### TM-AG-004 Place Intelligence
- destination identity
- region-level themes
- relevant hard/conditional constraints
- unresolved place-level checks

### TM-AG-005 Accommodation
- destination identity
- region relation
- accommodation-relevant constraints

### TM-AG-006 Food
- destination identity
- gastronomy theme varsa ilgili region context

### TM-AG-008 Transportation
- origin/destination geo identities
- active radius/drive constraints
- `routeValidationRequired`

### TM-AG-014 Verification
- evidence refs
- unresolved claims
- source/freshness warnings

## Forbidden handoff

- raw web page dump,
- hidden reasoning,
- unrelated user profile data,
- unverified discovery claim presented as fact.

## Gate

Schema-invalid veya `exceptional` candidate policy ref'siz ise Orchestrator downstream'e gönderemez.
