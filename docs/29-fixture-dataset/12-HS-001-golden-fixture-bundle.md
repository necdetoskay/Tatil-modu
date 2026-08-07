# HS-001 Golden Fixture Bundle

## Amaç
Kocaeli çıkışlı çocuklu aile tatili senaryosunu headless core'un bütün katmanlarından geçen canonical golden E2E fixture olarak tanımlamak.

## Fixture metadata
```yaml
fixture_id: TM-E2E-GOLD-001
fixture_version: 1.0.0
suite_id: golden_e2e
scenario_type: golden_e2e
severity: P0
clock: 2026-08-07T12:00:00+03:00
seed: 9001
```

## User request
```text
Kocaeli'den kendi aracımızla 3 günlük bir tatil planla. 2 yetişkiniz, çocuklar 6 ve 2 yaşında. Bütçemiz 30.000 TL. Her gün 2-3 alternatif olsun. Öğlen çocuklar için dinlenme istiyoruz. Deniz olacaksa kadınlar plajı mutlaka olmalı. Çok yorucu ve gereksiz uzun sürüşlü bir plan istemiyoruz.
```

## Initial memory snapshot
```yaml
snapshot_id: MEM-HS001-001
records: []
```
Bu golden fixture kişisel gerçek memory kullanmaz.

## Mock capability bundle
### Destination search
```yaml
- id: cand-bursa
  name: Bursa
  distance_km: 132
  evidence_status: verified
- id: cand-nearby-sea
  name: Example Sea Area
  distance_km: 145
  evidence_status: verified
- id: cand-far
  name: Far Example
  distance_km: 210
  evidence_status: verified
```

### Route responses
```yaml
cand-bursa:
  distance_km: 132
  duration_minutes: 115
  freshness: fresh
cand-nearby-sea:
  distance_km: 145
  duration_minutes: 135
  freshness: fresh
```

### Activities
```yaml
bursa_zoo:
  family_fit_inputs:
    age_restriction: none
    stroller_access: true
    intensity: medium
  opening_hours_status: verified
science_center:
  indoor: true
  age_fit: broad_family
  opening_hours_status: verified
women_only_beach_candidate:
  type: beach
  privacy_status: unknown
  verification_sources: []
```

### Accommodation
```yaml
hotel-a:
  nightly_price_try: 4500
  family_room: true
  parking: true
  evidence_status: verified
hotel-b:
  nightly_price_try: null
  family_room: true
  parking: unknown
  evidence_status: partial
```

### Fault/uncertainty cases intentionally embedded
- women-only beach privacy status unknown
- hotel-b exact price unknown
- one parking field unknown

## Required E2E assertions
### Intake / contracts
- origin Kocaeli preserved
- adults=2, children=[6,2]
- duration=3
- budget=30000 TRY
- own_car preserved
- midday_rest hard requirement preserved
- daily alternatives requirement preserved
- women-only beach conditional hard requirement preserved

### Policy
- far candidate 210 km cannot enter normal eligible set
- unknown privacy beach cannot pass beach hard gate
- budget cap cannot be exceeded silently

### Family/logistics
- each day containing substantial activity must include appropriate rest/pacing
- excessive transition/load must not pass quality gate
- route facts must retain evidence status

### Accommodation/activity
- hotel-b unknown price cannot become exact price
- unknown parking remains unknown
- beach with unknown privacy status cannot be selected as compliant sea option

### Verification
- unsupported claims count = 0 in approved final plan
- unknown evidence remains unknown/degraded
- no fabricated source refs

### Day plan
- 3 days present
- each day has coherent morning/afternoon structure
- midday rest present where required
- >=2 alternatives per day when meaningful and available
- no policy-ineligible candidate included

### Final response
- final contract valid
- no new facts invented
- uncertainty disclosures visible
- budget semantics preserved
- critical warnings visible

## Expected verdict
```yaml
headless_e2e_verdict: PASS_WITHOUT_SEA_OR_WITH_SEA_ONLY_IF_VERIFIED
p0_failures: 0
```
Testin amacı belirli bir destinasyon/prose beklemek değil; bütün invariant'ların korunmasını doğrulamaktır.
