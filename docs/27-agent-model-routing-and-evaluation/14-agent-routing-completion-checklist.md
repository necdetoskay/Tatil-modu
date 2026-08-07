# Agent Routing Completion Checklist

## Agent requirements
- [x] 10 canonical agent için model requirement profile tanımlandı.
- [x] Varsayılan model tier'ları tanımlandı.
- [x] Escalation koşulları tanımlandı.
- [x] T0 deterministic sorumlulukları ayrıldı.

## Capability & memory
- [x] Agent × capability matrix tanımlandı.
- [x] Agent × memory disclosure sınırları tanımlandı.
- [x] Model tier değişiminin yetki genişletemeyeceği sabitlendi.
- [x] Unauthorized tool/memory davranışları P0 kabul edildi.

## Routing
- [x] Primary/fallback ladder tanımlandı.
- [x] Retry sınıfları tanımlandı.
- [x] Finite attempt budget ilkesi tanımlandı.
- [x] Degraded/failure outcome tanımlandı.

## Budgeting
- [x] Context sınıfları tanımlandı.
- [x] Agent bazlı context intent tanımlandı.
- [x] Token/output ölçüm metrikleri tanımlandı.
- [x] Latency/cost tier intent tanımlandı.

## Benchmark
- [x] Agent-specific benchmark suite tasarlandı.
- [x] Repeated-run protokolü tanımlandı.
- [x] P0 eligibility gate tanımlandı.
- [x] Weighted scoring yaklaşımı tanımlandı.
- [x] Candidate evaluation record şablonu tanımlandı.

## Lifecycle
- [x] Promotion/demotion/rollback kuralları tanımlandı.
- [x] Model+prompt profile version identity tanımlandı.
- [x] Re-evaluation triggers tanımlandı.

## Remaining runtime decisions
```yaml
production_model_names_selected: false
reason: "Model seçimi L8 benchmark evidence sonrası yapılacak."
exact_token_limits_selected: false
exact_cost_limits_selected: false
exact_latency_limits_selected: false
```

Bu açıklar design eksikliği değil; gerçek candidate model/provider benchmark verisi gerektiren runtime selection kararlarıdır.

## Completion decision
```yaml
agent_model_routing_design_state: first_phase_completed
production_model_assignment: pending_L8_benchmark
ui_development_allowed: false
```
