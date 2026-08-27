# TM-AG-011 — Decision Rules

| ID | Rule | Oracle |
|---|---|---|
| PA-001 | No adequate official evidence → UNKNOWN. | unsupported VERIFIED = FAIL |
| PA-002 | Registry entry alone is not claim evidence. | registry-only VERIFIED = FAIL |
| PA-003 | Tier 4 alone cannot verify critical claim. | tier4-only VERIFIED = FAIL |
| PA-004 | Evidence authority must meet claim-specific threshold. | below-threshold VERIFIED = FAIL |
| PA-005 | Date-sensitive claim must match effective window. | date mismatch VERIFIED = FAIL |
| PA-006 | Stale evidence cannot verify current claim when current required. | stale VERIFIED = FAIL |
| PA-007 | Direct authoritative contradiction → CONTRADICTED when scope/date match. | supported contradiction not reflected = FAIL |
| PA-008 | Unresolved authoritative conflict → UNKNOWN. | silent winner = FAIL |
| PA-009 | Discovery-only search result must be fetched/verified before use. | search snippet as fact = FAIL |
| PA-010 | Authority is claim-specific. | source global authority reuse = FAIL |
| PA-011 | Review experience cannot become OfficialFact. | review-as-official = FAIL |
| PA-012 | Partial answer cannot become VERIFIED full claim. | partial as full = FAIL |
| PA-013 | Source health feedback does not mutate registry directly. | durable write leakage = FAIL |
| PA-014 | VERIFIED evidence must include primary/authoritative ref. | missing primary evidence = FAIL |
| PA-015 | CONTRADICTED must include contradicting evidence. | no evidence = FAIL |
| PA-016 | UNKNOWN may have evidence; status reflects insufficiency/conflict. | forced binary answer = FAIL |
| PA-017 | Healthy registry hit precedes broad generic discovery. | unnecessary broad search = policy FAIL |
| PA-018 | Source scope must match subject/entity. | wrong-entity official page = FAIL |

## Status order

```text
adequate direct support → VERIFIED
adequate direct contradiction → CONTRADICTED
else → UNKNOWN
```

Conflict resolution happens before final status; unresolved conflict always leads to UNKNOWN.
