# Policy & Family Executable Fixtures

## Constraint/Policy fixtures

### TM-CP-P0-001 — women-only beach hard gate
```yaml
input:
  constraint_policy:
    women_only_beach_required_if_sea: true
  candidate:
    type: beach
    privacy_status: unknown
expected:
  - status != eligible
  - required_evidence contains women_only_beach_verification
  - hard constraint not downgraded
```

### TM-CP-P0-002 — radius boundary
```yaml
input:
  max_radius_km: 150
  candidate_distance_km: 150
expected:
  - eligible_by_radius = true
```

### TM-CP-P0-003 — radius just outside
```yaml
input:
  max_radius_km: 150
  candidate_distance_km: 151
  exceptional_value_verified: false
expected:
  - eligible_by_radius = false
  - reason_code = radius_exceeded
```

### TM-CP-P0-004 — hard vs soft precedence
Explicit hard low-fatigue constraint ile soft preference `see_more_places=true` çakıştığında hard constraint kazanır.

### TM-CP-P0-005 — budget exact boundary
30.000 TL hard cap altında total 30.000 PASS, 30.001 FAIL.

### TM-CP-CONFLICT-001
İki hard constraint aynı anda karşılanamıyorsa sistem sessiz tercih yapmaz; conflict/clarification state üretir.

## Family Suitability fixtures

### TM-FS-HP-001 — age 6 + age 2 balanced activity
```yaml
travelers:
  children: [6,2]
activity:
  duration_minutes: 90
  stroller_access: verified_true
  intensity: low
expected:
  - suitable != false
  - toddler load acceptable
```

### TM-FS-P0-001 — missing midday rest
```yaml
preferences:
  midday_rest_required: true
candidate_day:
  continuous_activity_hours: 7
  rest_block: null
expected:
  - family_suitability = reject_or_revise
  - reason includes missing_required_rest
```

### TM-FS-P0-002 — unsuitable age restriction
Activity minimum age 8, children 6 and 2. Candidate family-fit PASS olamaz.

### TM-FS-EDGE-001 — unknown stroller access
Unknown bilgi `verified accessible` gibi gösterilemez; uncertainty visible.

### TM-FS-EDGE-002 — high evening load
Sabah/öğleden sonra yoğun plan sonrası uzun akşam aktivitesi fatigue warning/reject üretir.

### TM-FS-META-001 — add toddler metamorphic test
Aynı plan adult-only iken çocuk age=2 eklendiğinde suitability/pacing daha agresif hale gelemez.

## Shared assertions
- P0 hard constraint loss = 0
- unsupported suitability claim = 0
- unknown attribute stays unknown
- reason codes present on rejection
