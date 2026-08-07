# Verification and Quality Test Suite

## Amaç
Evidence, verification, confidence ve Quality Engine davranışlarını deterministic fixture'larla doğrulamak.

## Verification testleri
- source trust classification,
- freshness handling,
- conflicting sources,
- unsupported claim,
- partial verification,
- stale data,
- evidence lineage preservation,
- high-impact claim requirements.

## Quality testleri
- family suitability,
- toddler rest/fatigue,
- plan coherence,
- budget/route consistency,
- alternative sufficiency,
- final response disclosure,
- hard failure recognition,
- regression quality policy.

## P0 invariant'lar
```yaml
p0_invariants:
  - unsupported_high_impact_claim_not_presented_as_fact
  - missing_required_evidence_triggers_expected_gate
  - hard_failure_not_compensated_by_quality_score
  - privacy_sensitive_requirement_visible_in_review
  - blocker_disclosure_not_removed_from_final_state
```

## Gate
```yaml
suite: L5_verification_quality
p0_pass_rate: 100%
p1_target_pass_rate: >=98%
p2_thresholds: quality_rubric_defined
ui_unlock_blocking: true
```
