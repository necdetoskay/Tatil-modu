# TM-AG-012 — Evaluation Rubric

## Deterministic hard gates

Any fail → run FAIL:

- schema valid,
- entity/window filtering correct,
- duplicate/spam/unusable hygiene applied,
- prevalence arithmetic exact,
- valid sample metadata complete,
- single/small sample confidence policy respected,
- stale/incompatible snapshot not reused as current,
- snapshot mode provenance valid,
- license/retention policy respected,
- no official-fact/place/planning authority leakage.

## Semantic quality — after hard gate

Score 1–5:

1. theme extraction precision,
2. direction classification quality,
3. mixed/opposing experience handling,
4. useful limitation wording,
5. segment relevance discipline,
6. practical experiential signal usefulness.

Target: `>= 4.0/5`.

## Metrics

- raw_review_count
- valid_review_count
- duplicate_removed_count
- spam_removed_count
- unusable_removed_count
- source_provider_count
- signal_count
- single_review_high_confidence_count (target 0)
- prevalence_arithmetic_error_count (target 0)
- stale_snapshot_false_reuse_count (target 0)
- entity_mismatch_in_valid_sample_count (target 0)
- raw_retention_policy_violation_count (target 0)
- snapshot_reuse_rate
- targeted_refresh_rate
- unnecessary_broad_refresh_rate
- snapshot_write_candidate_count

## RIVE mapping

- R0: input/output schema
- R1: RV-001..RV-024
- R2: recorded review fixture replay
- R3: TL-009 provider integration
- R4: theme/direction semantic quality
- R5: small, biased, duplicate, stale, conflicting sample cases
- R6: official fact/place/plan/raw-retention authority leakage
- R7: controlled live targeted review refresh
- R8: production regressions
