# H9 — Golden Headless E2E

**Durum:** planned  
**Requires:** L0–L5 relevant gates PASS  
**Primary gate:** L6 Golden E2E

## Amaç
Tatil Modu'nun gerçek kullanıcı isteğine benzeyen canonical senaryoları UI olmadan baştan sona çalıştırabildiğini kanıtlamak.

## Primary golden scenario — HS-001
```yaml
origin: Kocaeli
adults: 2
children:
  - age: 6
  - age: 2
transport: own_car
trip_days: 3
budget_try: 30000
daily_alternatives_required: true
midday_rest_required: true
travel_load_should_be_reasonable: true
sea_rule:
  women_only_beach_required_if_sea: true
```

## E2E path
```text
raw request
→ contract validation
→ normalization
→ policy
→ mock research/capabilities
→ memory context
→ agents
→ orchestration
→ verification
→ quality
→ final structured result
→ trace/evaluation report
```

## Assertions
Golden test birebir cümle karşılaştırmaz. Davranış assertion'ları kullanır:
- all hard constraints preserved
- no ineligible candidate in final
- daily alternative count satisfied
- toddler pacing/rest satisfied
- unsupported claims = 0
- evidence gaps disclosed
- budget semantics respected
- route/radius rules respected
- final contract valid
- trace complete

## Golden catalog expansion
HS-001 sonrası canonical fixture catalogundan farklı profiller eklenir:
- no children
- single child age boundary
- strict budget
- no-sea preference
- accommodation-heavy trip
- day trip
- longer trip
- ambiguous request requiring clarification
- partial evidence/degraded mode

## Repeatability
Her golden scenario en az N deterministic replay'de aynı policy verdict ve structural invariants üretmelidir. Exact prose equality gerekmez.

## Definition of Done
```yaml
L6: PASS
primary_HS_001: PASS
canonical_golden_catalog: PASS
p0_failures: 0
final_contract_invalid: 0
trace_incomplete: 0
```
