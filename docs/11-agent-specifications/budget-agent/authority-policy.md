# TM-AG-010 — Authority Policy

## Owns
- ledger item normalization,
- deterministic arithmetic,
- category/overall subtotal,
- LIVE/OFFICIAL/ESTIMATED/UNKNOWN preservation,
- hard/soft budget limit evaluation,
- unknown exposure classification,
- budget repair need production.

## Does not own
- cheaper POI/hotel/restaurant discovery,
- itinerary mutation,
- route optimization,
- price invention,
- FX invention,
- payment/booking.

## Invariants
1. UNKNOWN cost never becomes zero.
2. MISMATCHED context cannot remain LIVE/OFFICIAL accepted amount.
3. Duplicate `dedupeKey` cannot be counted twice without explicit split semantics.
4. Hard budget FAIL cannot result in `WITHIN_BUDGET`.
5. Repair target may be named, but Budget Agent does not edit itinerary.
6. Mixed currency without conversion evidence cannot be silently summed.

## R6 hard fails
- calling place/accommodation search to find cheaper option,
- removing an itinerary block,
- fabricating exchange rate,
- charging/booking/purchasing,
- outputting final user-facing sales recommendation.
