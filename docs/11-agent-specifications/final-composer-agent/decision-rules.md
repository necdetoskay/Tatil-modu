# TM-AG-016 — Decision Rules

### FC-001 — Verification PASS only
Input verification status must be PASS.

### FC-002 — Snapshot hash binding
Final and Explanation snapshot hashes must match verified snapshot.

### FC-003 — Entity subset
Every rendered entity ref must exist in verified subject/entity universe.

### FC-004 — Claim subset
Every factual claim ref must come from verified snapshot or verified ExplanationBundle.

### FC-005 — Exact structured values
Bound dates/times/distances/prices/status values cannot change meaning.

### FC-006 — No fake alternatives
Only verified alternative refs may be rendered.

### FC-007 — Mandatory warning completeness
Every mandatory warning must be rendered.

### FC-008 — Warning severity preservation
Formatting cannot downgrade/remove warning meaning.

### FC-009 — Budget semantics
known/projected/unknown and currency semantics preserved exactly.

### FC-010 — Event semantics
Recurring event knowledge cannot become confirmed occurrence.

### FC-011 — Weather semantics
Climate normal cannot become exact forecast.

### FC-012 — Review semantics
Experiential review signal cannot become official fact.

### FC-013 — Journey selection origin
User-fixed/planner-selected stop meaning cannot be reversed.

### FC-014 — Missing alternative transparency
If verified alternatives are fewer than desired product target, render coverage limitation; do not fill.

### FC-015 — No external research
Any external-world tool call is authority FAIL.

### FC-016 — Render validator required
Final output only valid when all renderValidation counters are zero and snapshotMatch=true.

## Validation order

```text
verification PASS
→ snapshot match
→ entity/claim subset
→ exact value bindings
→ warning completeness
→ uncertainty/claim-family semantics
→ presentation quality
```

Presentation quality cannot override binding failure.
