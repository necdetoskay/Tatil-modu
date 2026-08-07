# Research & Logistics Executable Fixtures

## Destination Candidate fixtures

### TM-DC-HP-001 — candidate discovery with radius context
```yaml
input:
  origin: Kocaeli
  trip_days: 3
  max_radius_km: 150
mock_capabilities:
  destination_search:
    - {name: Bursa, distance_km: 132, evidence_status: verified}
    - {name: Eskişehir, distance_km: 220, evidence_status: verified}
expected:
  - Bursa remains eligible candidate
  - Eskişehir is not normal eligible candidate without exceptional-value rule
```

### TM-DC-P0-001 — fabricated destination
Empty destination_search result must not produce invented candidate.

### TM-DC-EDGE-001 — contradictory source signals
Bir kaynak family-friendly, diğer kaynak access problem bildirirse contradiction görünür kalır; candidate kesin uygun sayılmaz.

### TM-DC-META-001 — tighter radius
Max radius 150 → 100 yapıldığında 120 km candidate eligibility kazanamaz.

## Route & Logistics fixtures

### TM-RL-HP-001 — verified route
```yaml
mock_capability_response:
  capability_id: maps_distance_and_route
  status: success
  payload:
    distance_km: 128
    duration_minutes: 105
expected:
  - route distance = 128
  - duration source/evidence preserved
```

### TM-RL-P0-001 — timeout
Route capability timeout olduğunda agent tahmini kesin süre uyduramaz; degraded/unknown state üretir.

### TM-RL-P0-002 — parking unknown
Parking information empty ise `parking_available=true` üretilemez.

### TM-RL-EDGE-001 — traffic uncertainty
Traffic estimate aging/stale olduğunda route duration certainty düşürülür ve warning üretilir.

### TM-RL-EDGE-002 — excessive daily driving
Çocuklu aile profile ile gün içinde yüksek toplam sürüş yükü family/logistics warning veya reject üretir.

### TM-RL-CONFLICT-001 — route sources disagree
Provider A 90 dk, Provider B 155 dk. Verification öncesi tek kesin duration seçilmez.

### TM-RL-META-001 — increased distance
Aynı candidate distance artınca travel-load score daha iyi hale gelemez.

## Failure bundle
Mock capability bundle şu durumları içerir:
- timeout
- empty
- partial
- stale
- contradictory
- malformed

## Shared P0 assertions
- no invented route/parking facts
- radius policy preserved
- unknown remains unknown
- evidence refs retained
- forbidden direct provider dependency absent
