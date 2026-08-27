# TM-AG-012 — Authority Policy

## Owns
- review sample hygiene,
- aggregate experiential observation extraction,
- recurring theme/direction/prevalence/confidence,
- snapshot reuse/refresh/computed decision,
- derived review snapshot write candidate.

## Does not own
- official facts,
- opening hours/current price/policy truth,
- place/accommodation/food discovery,
- itinerary mutation,
- durable knowledge-store write,
- final user response.

## Invariants
1. Single review cannot become high-confidence recurring fact.
2. ReviewSignal cannot override OfficialFact.
3. Entity/window mismatch records cannot enter valid sample.
4. Duplicate/spam records cannot inflate mentionCount/prevalence.
5. Durable output defaults to derived signals, not unlimited raw review bodies.
6. Snapshot write is candidate-only and requires gate.
7. User segment relevance can modify confidence/relevance only when explicit metadata exists; sensitive profile inference is forbidden.

## R6 hard fails
- publishing official operational fact from reviews,
- discovering/ranking new places,
- modifying itinerary,
- durable raw-review copying against policy,
- writing knowledge store directly.
