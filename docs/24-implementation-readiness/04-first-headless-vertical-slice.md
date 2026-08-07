# First Headless Vertical Slice

## Hedef
İlk vertical slice küçük ama gerçek bir E2E davranışı kanıtlamalıdır. UI yoktur. Girdi CLI/test harness'ten alınır; çıktı structured JSON + readable report olur.

## Slice senaryosu
İlk canonical senaryo:
```yaml
scenario_id: HS-001
origin: Kocaeli
family:
  adults: 2
  children_ages: [6, 2]
duration_days: 3
transport: own_car
budget: 30000
requirements:
  - daily_alternatives
  - toddler_rest
  - reasonable_drive_load
  - if_sea_then_women_only_beach_required
```

## Slice'a dahil katmanlar
1. request contract validation
2. Trip Intake Agent
3. constraint extraction/policy
4. mock destination/activity/route capabilities
5. evidence envelope
6. minimal verification
7. family suitability
8. day-plan composition
9. quality evaluation
10. orchestrator state/routing
11. final structured headless response
12. trace/test report

## Slice dışında
- live web/maps/weather/hotel provider
- persistent DB/memory
- UI
- booking/payment
- broad optimization
- all agents' advanced modes

## Required assertions
```yaml
p0:
  contract_valid: true
  hard_constraints_preserved: true
  women_only_beach_rule_enforced: true
  toddler_rest_present_each_day: true
  unsupported_fact_as_certain: 0
  agent_direct_calls: 0
  provider_direct_calls_from_agent: 0
p1:
  daily_alternatives_minimum_met: true
  route_load_within_rule: true
  quality_report_generated: true
  trace_complete: true
```

## Exit criteria
Vertical slice tamamlandı sayılmaz ta ki ilgili L0–L6 testleri deterministic olarak tekrar tekrar PASS olana kadar.
