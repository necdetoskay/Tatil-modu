# TM-AG-014 — Source Policy

Verification Agent source discovery yapmaz; mevcut evidence package ve owner-agent outputs üzerinden çalışır.

## Claim-family source requirements

| Claim family | Acceptable evidence family |
|---|---|
| official opening/closure/policy/event occurrence | OfficialFact / primary-source evidence |
| route/duration/traffic | TransportationResult/provider-backed route evidence |
| current weather | WeatherSignal with `FORECAST` + freshness |
| climate/season context | Climate-normal/seasonal signal; exact-day weather yerine geçmez |
| live accommodation availability/price | matching current provider query/price evidence |
| budget totals | BudgetLedger + item provenance |
| experiential crowd/parking/cleanliness | ReviewSignalSet |
| user-fixed choice | explicit user source / policy provenance |

## Issue #50 knowledge rule

Precomputed knowledge is acceptable for stable context but cannot satisfy a current critical operational claim if freshness/volatility policy requires runtime verification.

## Issue #51 event rule

- `RecurringEventKnowledge` → event identity/history/typical calendar context.
- `EventOccurrence` / current OfficialFact → exact-year date/status/program.

Recurring knowledge cannot satisfy exact-occurrence gate.

## Conflict rule

Conflicting critical authoritative evidence cannot be collapsed into PASS unless an upstream owner has produced a traceable resolution under the correct authority/freshness policy.

## Evidence gap rule

Missing required critical evidence must remain visible as UNKNOWN/REPAIR/FAIL according to severity. Confidence alone cannot replace evidence.
