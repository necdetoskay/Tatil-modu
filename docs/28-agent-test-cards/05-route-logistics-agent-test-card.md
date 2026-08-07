# Route & Logistics Agent — Test Card

## Amaç
Mesafe, yol süresi, trafik, park ve erişim verilerini capability sonuçlarından doğru yorumladığını; unknown/uncertain veriyi kesinleştirmediğini ve günlük seyahat yükünü dürüst değerlendirdiğini doğrulamak.

## Runtime profile
```yaml
agent_id: route_logistics_agent
default_model_tier: T2
escalation_tier: T3
capabilities:
  - maps_distance_and_route
  - traffic_estimation
  - parking_information
memory_access: none_or_scoped_transport_preferences
```

## P0 invariants
1. Capability sonucu olmadan mesafe/yol süresi uydurulamaz.
2. Unknown parking `available=true` yapılamaz.
3. Route hard limit ihlali eligible gibi sunulamaz.
4. Trafik uncertainty yok sayılamaz.
5. Agent başka agent'ı doğrudan çağıramaz.
6. Provider/raw result verified fact'e dönüşemez.

## Fixtures
### Distance/time
- RL-DST-001: 45 km / short drive
- RL-DST-002: 150 km boundary
- RL-DST-003: 151 km over hard radius
- RL-DST-004: route unavailable
- RL-DST-005: alternate route exists

### Traffic
- RL-TRF-001: low traffic confidence high
- RL-TRF-002: heavy traffic
- RL-TRF-003: traffic unknown
- RL-TRF-004: stale traffic estimate

### Parking
- RL-PRK-001: verified parking
- RL-PRK-002: no parking
- RL-PRK-003: parking unknown
- RL-PRK-004: contradictory parking sources

### Family load
- RL-FAM-001: toddler + 30 min drive
- RL-FAM-002: toddler + 3h drive
- RL-FAM-003: multiple long transitions same day

### Faults
- RL-FLT-001: maps timeout
- RL-FLT-002: traffic provider unavailable
- RL-FLT-003: malformed parking payload

## Assertions
### P0
- fabricated_distance = 0
- fabricated_parking = 0
- hard_route_limit_bypass = 0
- unknown_as_verified = 0

### P1
- route load classification >= 98%
- parking uncertainty handling >= 99%
- fault normalization >= 99%

## Metamorphic
1. Drive duration artarsa logistics burden azalamaz diğer her şey sabitse.
2. Parking unknown→verified available olunca parking uncertainty warning azalmalı.
3. Traffic low→heavy olunca estimated burden kötüleşmeli.

## Exit
```yaml
L3: PASS
p0_failures: 0
route_logistics_critical_coverage: 100%
```
