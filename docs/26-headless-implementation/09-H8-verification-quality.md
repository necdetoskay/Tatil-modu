# H8 — Verification & Quality

**Durum:** planned  
**Requires:** contracts/evidence model + relevant orchestration integration  
**Primary gate:** L5 Verification / Quality

## Amaç
Bir planın yalnız contract-valid değil, evidence bakımından dürüst, hard constraints bakımından güvenli ve aile tatili kalitesi bakımından kabul edilebilir olduğunu executable değerlendirmelerle kanıtlamak.

## Verification responsibilities
- claim extraction/registration
- evidence linkage
- source status
- freshness
- contradiction
- unsupported claim detection
- verified/unverified/unknown ayrımı
- confidence derivation inputs

## Quality dimensions
- hard constraint integrity
- family suitability
- logistics feasibility
- daily pacing
- alternative diversity
- evidence completeness
- uncertainty honesty
- budget coherence
- plan coherence
- excessive travel load
- user preference alignment

## Critical rule
Quality score P0 ihlalini telafi edemez.
```text
P0 failure → REJECT
```
Ortalama kalite skoru ne kadar yüksek olursa olsun.

## Test patterns
- unsupported price presented as fact
- stale opening hours
- contradictory parking evidence
- women-only beach unknown
- impossible daily route
- missing toddler rest
- duplicate alternatives
- over-budget itinerary
- high-quality but hard-constraint-violating plan

## Evaluation output
```yaml
verdict: pass | revise | reject
p0_failures: []
quality_scores: {}
evidence_gaps: []
revision_targets: []
```

## Definition of Done
```yaml
L5: PASS
p0_failures: 0
unsupported_fact_detection: pass
hard_constraint_override_by_score: impossible
revision_routing_data: valid
quality_fixture_catalog: executable
```
