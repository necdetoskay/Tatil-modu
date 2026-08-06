# Tool / Capability Platform

| Alan | Değer |
|---|---|
| Document ID | TOOL-000 |
| Sürüm | 2.0 |
| Durum | Architecture Complete |
| EOS Sürümü | EOS v1.0 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Agentların dış dünya, providerlar ve deterministik servislerle provider-bağımsız, güvenli, izlenebilir ve test edilebilir biçimde iletişim kurmasını tanımlar.

Agentlar provider çağırmaz; capability talep eder.

## Ana belgeler

### Katalog ve mimari

- [Tool Catalog](tool-catalog.md)
- [Capability Platform Transition](capability-platform-transition.md)
- [Capability Registry](capability-registry.md)
- [Tool Architecture Overview](tool-architecture-overview.md)
- [Tool Adapter Contract](tool-adapter-contract.md)
- [Provider Selection Policy](provider-selection-policy.md)

### Runtime ve yönetişim

- [Cache Architecture](cache-architecture.md)
- [Rate Limit & Circuit Breaker](rate-limit-and-circuit-breaker.md)
- [Cost Accounting](cost-accounting-model.md)
- [Permission Matrix](tool-permission-matrix.md)
- [Provider Health](provider-health-model.md)
- [Batch & Concurrency](batch-and-concurrency-policy.md)
- [Execution Modes](tool-execution-modes.md)
- [Secret & Privacy](secret-and-privacy-policy.md)
- [Configuration & Versioning](tool-configuration-and-versioning.md)
- [Capability Quality Score](capability-quality-score-standard.md)
- [Provider Support Matrix](provider-capability-support-matrix.md)
- [Provider Adapter Template](_templates/provider-adapter-specification-template.md)

### Kaynak ve izlenebilirlik

- [Source Trace & Data Lineage](source-trace-and-data-lineage-standard.md)
- [Tool Observability Events](tool-observability-event-standard.md)

### Capability contract'ları

- [`geo.geocode`](capabilities/geo.geocode/specification.md)
- [`directions.matrix`](capabilities/directions.matrix/specification.md)
- [`places.search`](capabilities/places.search/specification.md)
- [`weather.forecast`](capabilities/weather.forecast/specification.md)
- [`climate.normals`](capabilities/climate.normals/specification.md)
- [`accommodation.search`](capabilities/accommodation.search/specification.md)
- [`reviews.collect`](capabilities/reviews.collect/specification.md)
- [`web.fetch_official_fact`](capabilities/web.fetch_official_fact/specification.md)

### Kapanış

- [Completion Checklist](tool-architecture-completion-checklist.md)
- [Data Source Architecture Handoff](data-source-architecture-handoff.md)
- [ADR-0004](../00-governance/adr/ADR-0004-capability-platform-architecture.md)

## Durum

```text
Architecture: complete
Implementation: not started
Provider selection: not started
Live integration: not started
```

Sıradaki ürün mimarisi bölümü Data Source & Trust Architecture'dır.
