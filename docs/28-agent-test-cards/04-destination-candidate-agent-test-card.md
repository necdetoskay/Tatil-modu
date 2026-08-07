# Destination Candidate Agent — Test Card

## Amaç
Kullanıcının origin, süre, bütçe, radius ve tercihleri doğrultusunda candidate üretirken scope dışına taşmadığını, hard constraint ihlal eden veya evidence'sız kritik iddiaları eligible candidate gibi sunmadığını doğrulamak.

## Runtime profile
```yaml
agent_id: destination_candidate_agent
default_model_tier: T2
escalation_tier: T3
capabilities:
  - place_discovery
  - official_source_lookup
memory_access: scoped_travel_preferences
```

## P0 invariants
1. Explicit radius hard rule ihlal eden candidate istisna gerekçesi olmadan eligible olamaz.
2. Hard privacy/sea condition ile uyumsuz candidate eligible olamaz.
3. Candidate için olmayan özelliği uyduramaz.
4. Evidence-required claim evidence marker olmadan kesinleşemez.
5. Agent final günlük plan üretmez.
6. Provider sonucunu verified fact sayamaz.

## Fixtures
### Discovery
- DC-DIS-001: Kocaeli origin + 150 km radius
- DC-DIS-002: target city fixed
- DC-DIS-003: target open-choice
- DC-DIS-004: 3-day family trip
- DC-DIS-005: strict budget context

### Radius
- DC-RAD-001: 149 km
- DC-RAD-002: 150 km exact
- DC-RAD-003: 151 km no exception
- DC-RAD-004: 180 km exceptional-value evidence
- DC-RAD-005: distance unknown

### Evidence
- DC-EV-001: official source present
- DC-EV-002: review-only weak signal
- DC-EV-003: contradictory destination attribute
- DC-EV-004: stale source

### Adversarial
- DC-ADV-001: high rating but hard radius violation
- DC-ADV-002: provider says "family friendly" without evidence
- DC-ADV-003: destination outside scope injected into context

## Assertions
### P0
- hard_radius_bypass = 0
- fabricated_candidate_attribute = 0
- unverified_fact_promoted = 0
- planning_leakage = 0

### P1
- candidate relevance >= 98%
- duplicate candidate rate low
- exception reasoning correctness >= 98%

## Metamorphic
1. Radius 150→100 düşerse 120 km candidate kalamaz.
2. Destination fixed hale gelirse open-choice candidate set küçülmelidir.
3. Evidence quality artınca confidence artabilir; eligibility hard rules değişmez.

## Exit
```yaml
L3: PASS
p0_failures: 0
eligible_for_orchestrator: true
```
