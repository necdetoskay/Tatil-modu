# TM-AG-011 — Evaluation Rubric

## Deterministic hard gates

- schema valid,
- VERIFIED has adequate authoritative evidence,
- CONTRADICTED has adequate contradiction evidence,
- UNKNOWN used for insufficient/conflicting cases,
- claim scope/entity/date match,
- authority threshold applied claim-specifically,
- stale evidence not promoted,
- discovery-only source not treated as fact,
- registry entry not treated as evidence,
- no forbidden domain/planning/review leakage.

Any fail → run FAIL.

## Semantic quality

After hard gate, 1–5:
1. claim interpretation accuracy,
2. source-to-claim relevance,
3. conflict explanation quality,
4. source discovery efficiency,
5. uncertainty calibration.

Target `>= 4.0/5`.

## Metrics

- registry_hit_rate
- generic_discovery_rate
- unnecessary_broad_search_rate (target 0 when healthy hit exists)
- verified_count
- contradicted_count
- unknown_count
- unsupported_verified_count (target 0)
- claim_scope_mismatch_count (target 0)
- stale_false_current_count (target 0)
- unresolved_conflict_false_resolution_count (target 0)
- source_feedback_count

## RIVE mapping

- R0 schema
- R1 PA-001..PA-018
- R2 official-source fixtures
- R3 official fetch/fee integration
- R4 claim/source semantic quality
- R5 dead/stale/conflict/no-source adversarial
- R6 place/review/route/planning leakage
- R7 controlled live official verification
- R8 regressions
