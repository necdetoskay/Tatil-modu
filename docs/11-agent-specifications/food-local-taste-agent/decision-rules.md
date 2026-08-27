# TM-AG-006 Decision Rules

| Rule | Deterministic davranış |
|---|---|
| FD-001 | Regional local-taste knowledge never proves a venue currently serves that item. |
| FD-002 | Hard dietary `VIOLATED` => candidate `REJECTED`. |
| FD-003 | Applicable hard dietary/menu requirement `UNVERIFIED` => `NEEDS_VERIFICATION`. |
| FD-004 | `CLOSED_PERMANENTLY` => `REJECTED`. |
| FD-005 | Required meal-window opening overlap unverified => cannot be `ACCEPTED` for that meal slot. |
| FD-006 | Exact price without current/official/explicit-estimate evidence => `UNKNOWN`; never fabricated. |
| FD-007 | Review-derived popularity/quality never overrides FD-002/FD-003. |
| FD-008 | Review semantic synthesis is delegated to TM-AG-012. |
| FD-009 | Route duration/detour/order is delegated to TM-AG-008/TM-AG-009. |
| FD-010 | If knowledge/source coverage exists, broad rediscovery is skipped unless coverage gap is recorded. |
| FD-011 | Knowledge hit does not bypass freshness checks for hours/menu/price/status. |
| FD-012 | `journeySegmentRef` received in scope must be preserved in output provenance. |
| FD-013 | Tier 4 discovery-only evidence cannot satisfy a hard dietary/menu claim. |
| FD-014 | Conflicting official/structured operational claims stay `CONFLICTING` until resolved. |
| FD-015 | Family-fit scoring occurs only after hard eligibility disposition is established. |
| FD-016 | Order/reservation/payment attempts are forbidden regardless of user wording. |

## Disposition algorithm

```text
if permanently_closed:
  REJECTED
else if any hard check == VIOLATED:
  REJECTED
else if any applicable hard check == UNVERIFIED:
  NEEDS_VERIFICATION
else if required meal-window hours are not supported:
  NEEDS_VERIFICATION
else:
  ACCEPTED
```

## LocalTasteBrief algorithm

```text
stable regional claim
→ source trust + provenance
→ VERIFIED/PARTIAL/DISCOVERY_ONLY
→ never auto-project onto venue menu
```
