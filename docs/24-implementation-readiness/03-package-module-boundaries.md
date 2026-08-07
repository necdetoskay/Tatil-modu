# Package and Module Boundaries

## Dependency direction
```text
contracts
  ↑
domain ← policy
  ↑       ↑
capabilities   memory
  ↑             ↑
verification   agents
      ↑        ↑
      orchestrator
          ↑
       quality
          ↑
    api / cli / test-harness
```

Bu şema kavramsaldır; circular dependency yasaktır.

## Package responsibilities
### contracts
Versioned request/response/error/evidence/confidence/policy/handoff schemas ve validators.

### domain
Trip, candidate, itinerary, family context, route load, budget gibi provider-independent business modelleri.

### policy
Hard constraints, precedence, blocker/reason codes, soft-preference eligibility. Pure/deterministic.

### capabilities
Capability registry, request envelope, gateway interface, timeout/error abstraction.

### providers-mock
Canonical fixture verisini capability sonucu olarak döndüren deterministic adapterlar.

### memory
Disclosure/read/write-candidate interfaces, conflict/staleness semantics, in-memory implementation.

### verification
Evidence validation, freshness, source conflict, unsupported claim detection. Provider seçmez.

### agents
Her agent ayrı module/class/function boundary ile; canonical spec'ten başka sorumluluk almaz.

### orchestrator
Workflow state, dependency graph, agent dispatch, gate coordination, bounded retry/fallback, terminal state.

### quality
Family suitability/evidence/coherence/final-output quality report evaluation. Hard blocker override etmez.

### observability
Structured events, trace context, metrics sinks; business karar kaynağı değildir.

### prompts
Prompt fragments/version metadata; policy logic prompt içine gömülmez.

### test-fixtures
Executable canonical scenarios. Production provider bağımlılığı yoktur.

### test-harness
Suite discovery, run orchestration, assertions, rubric evaluation, reports, model benchmark.

## Import guard önerisi
CI'da package boundary testi uygulanmalı. Örnek yasaklar:
```yaml
forbidden:
  - agents -> providers-*
  - agents -> agents
  - policy -> capabilities
  - domain -> orchestrator
  - production_packages -> test-harness
```
