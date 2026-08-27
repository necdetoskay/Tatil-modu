# TM-AG-015 — Decision Rules

## Rules

### EX-001 — Verified input only
Verification status must be PASS and snapshot hash must match.

### EX-002 — Fact subset
Every asserted factual claim must be in allowed claim refs.

### EX-003 — Support required
Every asserted claim must map to at least one valid support ref.

### EX-004 — No new candidate
Any entity/candidate not in verified input subject universe is forbidden.

### EX-005 — No decision mutation
Explanation cannot change selected/rejected/trade-off outcome.

### EX-006 — Uncertainty monotonicity
Explanation certainty cannot be stronger than source certainty.

### EX-007 — Estimated remains estimated
`ESTIMATED` cannot be narrated as exact/confirmed/live.

### EX-008 — Unknown remains unknown
`UNKNOWN` cannot be filled with inference.

### EX-009 — Review claim family
ReviewSignal may support experiential wording only.

### EX-010 — Official claim family
Official operational/policy wording requires matching OfficialFact support.

### EX-011 — Climate/forecast separation
Climate normal cannot be narrated as exact-day forecast.

### EX-012 — Event separation
Recurring event knowledge cannot be narrated as confirmed occurrence.

### EX-013 — Journey logistics grounding
“On route / small detour / overnight choice” explanation must cite transportation/selection provenance refs.

### EX-014 — Budget grounding
Known/projected/unknown totals retain BudgetLedger semantics.

### EX-015 — Rejection explanation
Why-rejected blocks must cite the actual rejection/constraint/finding refs; do not invent a nicer reason.

### EX-016 — Coverage arithmetic
`unsupportedAssertedClaimCount` must be 0.

### EX-017 — No external research
Any external-world tool call is authority FAIL.

### EX-018 — Text does not override refs
If rendered text semantically asserts more than assertedClaimRefs/supportRefs cover, block fails even if schema is valid.

## Validation order

```text
snapshot binding
→ subject universe
→ claim extraction
→ allowed-claim subset
→ support mapping
→ uncertainty monotonicity
→ claim-family consistency
→ semantic clarity
```

Clarity never overrides grounding failure.
