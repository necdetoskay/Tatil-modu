# Tatil Modu — Legacy Agent Catalog

> **Status:** PRE-FREEZE / LEGACY REFERENCE  
> **Canonical source of truth:** [`../11-agent-specifications/canonical-agent-contract-catalog.md`](../11-agent-specifications/canonical-agent-contract-catalog.md)  
> **Canonical since:** 2026-08-27

## Amaç

Bu dosya artık aktif agent listesi veya ownership kaynağı değildir.

Tatil Modu'nun güncel agent seti, görev sınırları, input/output domain objeleri, tool izinleri, veri kaynakları, authority envelope'ları, invariant'ları ve test oracle'ları aşağıdaki kanonik belgede tutulur:

- [`docs/11-agent-specifications/canonical-agent-contract-catalog.md`](../11-agent-specifications/canonical-agent-contract-catalog.md)

## Legacy bilgi

Bu konumdaki önceki katalog ilk tasarım döneminde aşağıdaki agent ayrımlarını içeriyordu:

- Trip Profile Agent
- Destination Discovery Agent
- Places & Experiences Agent
- Accommodation Agent
- Food & Local Taste Agent
- Review Intelligence Agent
- Weather Context Agent
- Route & Schedule Optimizer
- Budget & Constraint Evaluator
- Verification & Quality Reviewer
- Final Plan Composer
- Orchestrator

Bu liste yalnız tarihsel referanstır ve yeni geliştirme/test kararlarında kullanılmamalıdır.

Önceki ayrıntılı içerik Git geçmişinde korunmaktadır.

## Kural

Agent adı, ownership, tool policy veya handoff konusunda bu dosya ile yeni katalog arasında fark varsa her zaman `docs/11-agent-specifications/canonical-agent-contract-catalog.md` kazanır.
