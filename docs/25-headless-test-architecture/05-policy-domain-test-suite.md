# Policy and Domain Test Suite

## Amaç
LLM veya provider bağımlılığı olmadan pure domain ve Decision Policy Engine davranışlarını deterministic olarak doğrulamak.

## Kapsam
- hard vs soft constraint classification output handling,
- precedence rules,
- candidate rejection before ranking,
- budget hard limit,
- travel radius rule and exception reason,
- child age/rest/fatigue rules,
- privacy-sensitive beach requirement,
- fallback cannot weaken hard constraints,
- conflicting constraint behavior,
- conditional pass and disclosure rules.

## P0 örnekleri
```yaml
p0_policy_invariants:
  - hard_constraint_never_overridden_by_score
  - women_only_beach_requirement_cannot_be_satisfied_by_generic_beach
  - privacy_requirement_survives_routing_and_finalization
  - quality_score_cannot_override_policy_blocker
  - fallback_cannot_relax_hard_constraint
```

## Property / table-driven yaklaşım
Policy kuralları mümkün olduğunda tekil örnek yerine tablo ve kombinasyon testleriyle doğrulanır. Örneğin budget x distance x child_age x privacy_requirement kombinasyonlarında precedence korunmalıdır.

## Gate
```yaml
suite: L1_policy_domain
required_p0_pass_rate: 100%
core_target_pass_rate: 100%
ui_unlock_blocking: true
```
