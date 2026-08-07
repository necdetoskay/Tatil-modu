# Implementation Principles and Guardrails

## Ana strateji
İlk implementation fazı **Headless Core First** yaklaşımıyla yürütülür. UI, frontend component, production UX implementation ve kullanıcı ekranları bu fazın kapsamı dışındadır.

## Zorunlu ilkeler
1. Canonical design `11–23` değiştirilecekse önce ADR/design amendment gerekir.
2. Her modül contract-first uygulanır.
3. Her capability önce mock ile çalışır; live provider daha sonra ayrı gate ile açılır.
4. Her agent bağımsız test edilebilir olmalıdır.
5. Orchestrator agent logic sahiplenmez; yalnız routing/state/gate koordinasyonu yapar.
6. Decision Policy Engine deterministic olmalıdır; LLM hard constraint kararını override edemez.
7. Memory katmanı test double/in-memory store ile başlayabilir; production persistence daha sonra açılır.
8. Quality ve evaluation testleri implementation'ın parçasıdır, sonradan eklenen kalite katmanı değildir.
9. P0 failure varsa ilgili sprint tamamlanmış sayılmaz.
10. UI geliştirme `docs/25-headless-test-architecture/15-headless-core-acceptance-gate.md` PASS olmadan başlayamaz.

## Yasak erken işler
- frontend/UI implementation
- gerçek booking/payment
- live provider zorunluluğu
- production persistent memory
- production deployment
- test bypass
- hard-coded provider dependency
- agent-to-agent direct call

## Definition of Done
Bir backend capability yalnız kodu çalıştığı için tamamlanmış sayılmaz. DoD:
```yaml
required:
  - canonical_contract_implemented
  - unit_tests_pass
  - relevant_p0_tests_pass
  - fixture_coverage_present
  - observability_events_present
  - failure_behavior_tested
  - no_cross_boundary_violation
```
