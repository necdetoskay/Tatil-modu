# Knowledge Platform

## Amaç

Tatil Modu içinde kullanılan ontoloji, claim, rule, formula, threshold, policy, prompt, schema ve evaluation tanımlarını sürümlü, merkezi ve izlenebilir biçimde yönetmek.

Knowledge Platform çalışma zamanı kararlarını kendisi üretmez. Travel Intelligence, Capability Platform, agentlar ve evaluator bileşenlerinin kullanacağı kanonik bilgi tanımlarını sağlar.

## Mimari konum

```text
Knowledge Platform
        ↓
Capability Platform
        ↓
Data Source & Trust
        ↓
Travel Intelligence
        ↓
Agents & Orchestration
```

Bu gösterim veri akışı değil, bağımlılık yönünü ifade eder.

## İlk belgeler

- [KP-001 — Knowledge Platform Architecture](KP-001-KNOWLEDGE-PLATFORM-ARCHITECTURE.md)
- [Registry Standard](registry-standard.md)
- [Ontology Registry](ontology-registry.md)
- [Ontology Governance](ontology-governance.md)
- [Registry Versioning & Migration](registry-versioning-and-migration.md)
- [Knowledge Platform Test Standard](knowledge-platform-test-standard.md)

## İlk şemalar

- `registry-entry.schema.json`
- `ontology-node.schema.json`
- `ontology-relation.schema.json`
- `registry-migration.schema.json`

## Planlanan registry'ler

```text
Ontology Registry
Claim Registry
Rule Registry
Formula Registry
Threshold Registry
Policy Registry
Prompt Registry
Capability Registry
Tool Registry
Schema Registry
Feature Registry
Evaluation Registry
Test Registry
Version Registry
Migration Registry
```

Mevcut Capability Registry ve Tool Catalog, ileride kontrollü migration ile Knowledge Platform registry yaklaşımına bağlanacaktır; hemen taşınmayacaktır.
