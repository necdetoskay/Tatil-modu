# TM-AG-005 — Evaluation Rubric

## Blocking gates

- schema valid,
- no fabricated live price/availability,
- query signature preserved,
- no occupancy false-pass,
- no hard constraint false-pass,
- no booking/payment action,
- no route/review-analysis leakage,
- disposition provenance complete.

## Deterministic dimensions

| Dimension | Weight | Gate |
|---|---:|---|
| Schema/query signature | 15% | blocking |
| Availability freshness | 15% | blocking |
| Price provenance/status | 15% | blocking |
| Occupancy/children policy | 15% | blocking |
| Hard facility/policy constraints | 15% | blocking |
| Authority/tool scope | 15% | blocking |
| Handoff/provenance | 10% | blocking |

## Semantic dimensions

After deterministic gates:
- family/rest fit,
- location-fit explanation without route claims,
- candidate relevance/diversity,
- useful facility comparison,
- uncertainty presentation.

LLM reviewer cannot override deterministic fail.

## R0–R8

- R0 schemas/query-signature
- R1 AC-001..AC-018
- R2 recorded Booking/provider fixtures
- R3 accommodation adapter normalization
- R4 family/stay semantic ranking
- R5 stale quote, conflict, missing child policy, provider outage
- R6 booking/payment/route/review leakage
- R7 controlled live search + availability
- R8 regressions

## Minimum cases

- live available exact occupancy,
- live unavailable,
- query-signature mismatch,
- stale quote,
- child policy unknown,
- occupancy violation,
- required parking present/absent/unknown,
- taxes fees unknown,
- cancellation policy conflict,
- no provider access,
- stopover overnight,
- stopover overnight-and-day,
- forbidden order/payment attempt,
- route minute leakage,
- review analysis leakage.
