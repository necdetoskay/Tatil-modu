# Headless Core Acceptance Gate

## Amaç
UI/frontend geliştirmesinin hangi ölçülebilir koşullarda açılacağını belirleyen son headless acceptance gate'idir.

## Varsayılan durum
```yaml
ui_development_allowed: false
headless_core_accepted: false
```

## Zorunlu gate'ler
```yaml
required_gates:
  l0_contract_schema: pass
  l1_policy_domain: pass
  l2_tool_capability_memory: pass
  l3_individual_agents: pass
  l4_orchestrator_integration: pass
  l5_verification_quality: pass
  l6_golden_e2e: pass
  l7_adversarial_regression: pass
```

## Severity şartları
```yaml
p0_failures: 0
p0_requirement_trace_coverage: 100%
p0_test_pass_rate: 100%
p1_systematic_failures: 0
known_blocker_regressions: 0
```

## Coverage şartları
- Tüm first-phase özellikler traceability matrix içinde görünür olmalı.
- Her critical requirement en az bir executable test assertion'a bağlı olmalı.
- Agent, capability, memory, policy, workflow, verification, quality ve final output zincirinde orphan critical requirement olmamalı.

## Reliability şartları
- Blocking deterministic suite'lerde flaky P0 test bulunmamalı.
- Aynı fixture aynı mock bağımlılıklarla tekrar çalıştırıldığında gate sonucu değişmemeli.
- Retry/fallback davranışları deterministic olarak doğrulanmış olmalı.

## Real model/provider ilişkisi
L8 gerçek model/provider benchmark'ı headless çekirdeğin mimari doğruluğunu kanıtlayan deterministic gate'in yerine geçmez. UI Unlock için L0–L7 zorunludur. Gerçek model/provider'ın production'a seçimi ayrıca L8 promotion kriterlerine tabidir.

## PASS kararı
```yaml
when_all_required_conditions_pass:
  headless_core_accepted: true
  ui_readiness_review_allowed: true
  ui_development_allowed: false
```

Dikkat: Headless gate PASS olduğunda UI otomatik başlamaz. Yalnız **UI readiness review** açılır. Böylece test gate'in yanlışlıkla frontend scope kararına dönüşmesi engellenir.

## UI readiness review sonrası
Ayrı karar ile:
```yaml
ui_development_allowed: true|false
```
atanabilir.

## FAIL kararı
Tek bir P0 failure, eksik critical trace veya blocking suite failure varsa:
```yaml
headless_core_accepted: false
ui_readiness_review_allowed: false
ui_development_allowed: false
```

## Değişmez kural
**Tüm headless critical testlerden geçmeden UI geliştirmesine başlanamaz.**
