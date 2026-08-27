# TM-AG-010 — Evaluation Rubric

## Hard deterministic gates

- schema valid,
- arithmetic reproducible,
- UNKNOWN not counted as zero,
- dedupe keys not double-counted,
- live/query-context validity preserved,
- stale price not promoted,
- currency conversion evidence-backed,
- hard budget failures visible,
- itinerary provenance complete,
- no itinerary mutation/discovery leakage.

Any one fails → run FAIL.

## Semantic quality

After deterministic PASS, score 1–5:

1. uncertainty communication,
2. category attribution quality,
3. repair targeting usefulness,
4. estimate transparency,
5. user-budget constraint interpretation consistency.

Target: `>= 4.0/5`.

## Metrics

- item_count
- known_item_count
- estimated_item_count
- unknown_item_count
- duplicate_suppression_count
- arithmetic_error_count (target 0)
- hard_budget_false_pass_count (target 0)
- missing_provenance_count (target 0)
- mixed_currency_without_rate_count
- repair_need_count
- journey_segment_cost_coverage

## RIVE mapping

- R0 schema
- R1 BG-001..BG-018
- R2 recorded ledger fixtures
- R3 TL-010/Calculator integration
- R4 uncertainty/repair semantic quality
- R5 stale/missing/mixed-currency/dedupe/adversarial
- R6 discovery/mutation/payment leakage
- R7 controlled current fee lookup
- R8 regression
