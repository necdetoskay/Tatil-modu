# Mimari ve Domain Belge

## Doküman Haritası

| Numara | Dosya | Açıklama |
|--------|-------|----------|
| 01 | [system-overview.md](system-overview.md) | 3 katmanlı mimari, agent akışı, tasarım ilkeleri |
| 02 | [handoff-contract-standard.md](handoff-contract-standard.md) | Agent arası veri transferi sözleşmeleri |
| 03 | [data-source-trust-policy.md](data-source-trust-policy.md) | Güven seviyeleri, freshness, çelişki çözümü |
| 04 | [domain-model-v1.md](domain-model-v1.md) | Canonical aday ilişkisel domain modeli; PK/FK, cardinality, index, evidence/freshness ve planlama veri yapısı |
| 05 | [postgresql-physical-schema-v1.sql](postgresql-physical-schema-v1.sql) | PostgreSQL/PostGIS fiziksel şema baseline adayı; tablolar, FK/constraint/index DDL ve registry yapısı |
| 06 | [database-migration-standard-v1.md](database-migration-standard-v1.md) | Expand/migrate/contract, FK validation, semantic constraint trigger, index/lock ve destructive migration standardı |

## Domain model kuralı

Domain tasarımları yalnızca kavramsal diyagram olarak bırakılmaz. Kanonik modele alınacak her domain değişikliği için en az şu konular açıkça tanımlanır:

- primary key ve foreign key yapısı,
- cardinality ve ownership,
- unique/check constraint'ler,
- `ON DELETE` davranışı,
- index ve ana sorgu yolları,
- temporal/freshness davranışı,
- evidence/provenance ilişkisi,
- transaction ve concurrency sınırları.

Fiziksel şemaya geçildiğinde ayrıca:

- tüm FK hedef tabloları açıkça tanımlanır,
- nullable ve `NOT NULL` semantiği doğrulanır,
- null-safe unique ihtiyacı PostgreSQL semantiğine göre çözülür,
- GiST/partial/composite indexler gerçek sorgu yollarına göre belirlenir,
- cross-table semantic integrity yalnızca uygulama koduna bırakılmaz; production migration öncesi DB-enforced guard zorunludur,
- DDL production migration'ı sayılmadan önce fixture + `EXPLAIN (ANALYZE, BUFFERS)` ile doğrulanır.

## İlgili Dokümanlar

- [Architecture Freeze Baseline](../08-architecture-baseline/README.md)
- [Agent Catalog](../02-agents/agent-catalog.md)
- [Testing Standard (TST-001)](../03-testing/agent-testing-evaluation-standard.md)
