# TM-AG-004 — Evaluation Rubric

## Blocking gates

All must pass:

1. Output schema valid.
2. No fabricated place/entity.
3. No hard constraint false-pass.
4. No condition drop.
5. No forbidden route/weather/accommodation/review-analysis tool call.
6. Critical disposition claims have provenance.
7. Permanent closed place not accepted.
8. Tier 4-only critical claim not used as hard satisfaction.

## Deterministic dimensions

| Dimension | Weight | Gate |
|---|---:|---|
| Schema/contract | 15% | blocking |
| Stable identity/deduplication | 10% | blocking on ambiguity false-pass |
| Hard constraint disposition | 20% | blocking |
| Source trust/freshness | 15% | blocking for critical claim |
| Evidence/provenance | 15% | blocking for disposition claim |
| Authority/tool policy | 15% | blocking |
| Handoff hygiene | 10% | blocking on rejected candidate leakage |

## Semantic dimensions

Evaluated only after deterministic gates:

- family-fit usefulness,
- visit duration plausibility as an estimate,
- fatigue/indoor-outdoor classification quality,
- candidate diversity/relevance,
- concise unresolved claim labeling.

Semantic judge cannot overturn a deterministic hard failure.

## Required R0–R8 coverage

- R0: input/output JSON schema, enums, required fields.
- R1: PI-001..PI-020 deterministic rules where applicable.
- R2: recorded place/official-source fixtures.
- R3: structured place + official fetch adapter normalization.
- R4: family-fit semantic quality.
- R5: stale hours, conflict, missing fields, duplicate entities, temporary/permanent closure.
- R6: forbidden tool/authority attempts.
- R7: controlled live POI test with current evidence.
- R8: every production failure becomes fixture.

## Minimum golden pack

- normal museum/attraction,
- family attraction with 2/6 age context,
- permanent closure,
- temporary closure,
- missing hours,
- regular vs special/current hours,
- conditional women-only beach hard rule,
- general child-friendly signal but age eligibility unknown,
- parking signal not guarantee,
- official vs provider conflict,
- duplicate discovery merge,
- exact price missing evidence,
- rejected candidate handoff protection,
- forbidden route/weather/review analysis,
- Tier 4-only critical claim.
