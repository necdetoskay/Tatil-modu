# Accommodation & Activity Executable Fixtures

## Accommodation Fit

### TM-AF-HP-001 — family fit with verified amenities
```yaml
input:
  family:
    adults: 2
    children: [6,2]
  budget_cap_try: 30000
mock_capability_response:
  capability_id: accommodation_search
  payload:
    - id: hotel-a
      nightly_price_try: 4500
      family_room: true
      parking: true
      pool: true
      evidence_status: verified
expected:
  - hotel-a may be eligible
  - price source retained
  - family_room not inferred from generic room data
```

### TM-AF-P0-001 — unsupported price
Accommodation price missing/unknown cannot be emitted as exact fact.

### TM-AF-P0-002 — budget violation
Hard budget impact beyond cap cannot be hidden by high quality score.

### TM-AF-EDGE-001 — family room unknown
Unknown family-room status stays unknown; no family-fit certainty.

### TM-AF-EDGE-002 — parking stale
Stale parking data results in warning/uncertainty.

### TM-AF-CONFLICT-001
Official facility details and review signal conflict on pool availability; contradiction preserved for verification.

## Activity Fit

### TM-AT-HP-001 — child-friendly indoor activity
Verified age suitability, opening hours and access data produce eligible result if constraints match.

### TM-AT-P0-001 — women-only beach false
```yaml
constraint:
  women_only_beach_required_if_sea: true
activity:
  type: beach
mock_verification:
  women_only_beach: false
expected:
  - activity ineligible
  - hard constraint reason present
```

### TM-AT-P0-002 — women-only beach unknown
Unknown privacy status cannot PASS hard gate.

### TM-AT-P0-003 — opening hours unsupported
Unknown opening hours cannot be asserted as open at planned time.

### TM-AT-EDGE-001 — weather-sensitive activity
Adverse weather fixture should lower suitability or require indoor fallback.

### TM-AT-EDGE-002 — age restriction
Minimum age 8 activity with children 6 and 2 cannot be marked universally family-suitable.

### TM-AT-META-001 — evidence removal
Removing verification evidence cannot improve certainty or suitability confidence.

## Shared P0 assertions
- exact price only with supported evidence
- hard privacy constraint cannot be bypassed
- unknown operational facts remain unknown
- age restriction respected
- no direct provider call
