# TM-AG-009 — Evaluation Rubric

## Hard gate — deterministic

Any one fails → agent run FAIL:

- schema valid,
- no block overlap,
- all travel transitions backed by route fact,
- hard constraints respected,
- no rejected candidate used,
- final-arrival deadline respected,
- hard rest/daily-drive limits respected,
- check-in/out feasible,
- opening-window conflicts not silently accepted,
- journey provenance preserved,
- no forbidden tool/research leakage.

## Semantic quality — after hard gate

Score 1–5:

1. **Pacing realism** — gün insan tarafından uygulanabilir mi?
2. **Family fit** — soft tempo/yorgunluk tercihleri iyi optimize edilmiş mi?
3. **Route efficiency** — gereksiz gidip-gelmeler azaltılmış mı?
4. **Alternative quality** — alternatifler anlamlı ve farklı mı?
5. **Journey coherence** — multi-city travel + overnight + daily plan akıcı mı?
6. **Uncertainty handling** — verification need doğru yerde görünür mü?

Minimum semantic target: `>= 4.0/5` after deterministic PASS.

## Metrics

- scheduled_blocks
- rejected_combinations
- hard_constraint_violations (target 0)
- impossible_transitions (target 0)
- unbacked_route_blocks (target 0)
- verification_blockers
- alternative_count_per_day
- duplicate_alternative_rate
- total_travel_seconds_per_day
- schedule_buffer_violations (target 0)
- user_fixed_stop_preservation (target 100%)
- journey_segment_provenance_coverage (target 100%)

## RIVE mapping

- R0: input/output schema
- R1: deterministic rules RP-001..RP-020
- R2: fixture replay
- R3: missing-leg TL-005 integration
- R4: semantic rubric
- R5: adversarial/stale/conflict
- R6: authority/tool policy
- R7: controlled live route facts
- R8: regression corpus
