# H4 — Memory Core

**Durum:** planned  
**Requires:** contracts/domain PASS  
**Primary gate:** L2 Memory

## Amaç
Production persistence'a geçmeden memory lifecycle, privacy, consent, staleness, conflict ve correction davranışlarını deterministic in-memory implementation ile kanıtlamak.

## Memory lifecycle
```text
candidate observation
→ write candidate
→ policy/consent evaluation
→ canonical write
→ later read
→ disclosure
→ correction/expiry/delete
```

Canonical write ownership Memory Platform'dadır; agent doğrudan kalıcı memory yazamaz.

## Scope
- memory record schema usage
- in-memory repository
- read API
- write-candidate API
- consent state
- source/provenance
- confidence
- staleness/TTL
- conflict representation
- correction/supersession
- delete/forget semantics
- disclosure metadata
- traceability

## Memory categories
Implementation canonical memory architecture'daki kategorileri birebir kullanır; yeni kategori gerektiğinde design amendment zorunludur.

## P0 privacy invariants
1. Consent gerektiren memory consent olmadan canonical write olamaz.
2. Deleted/expired memory active read sonucu olamaz.
3. Agent memory store'a doğrudan yazamaz.
4. Memory kaynağı/provenance kaybolamaz.
5. Sensitive/private data yanlış scope'a sızamaz.
6. Conflict sessizce tek doğruya indirgenemez.

## Staleness tests
- fresh
- approaching expiry
- expired
- explicitly invalidated
- superseded

## Conflict tests
Örneğin eski preference ile yeni explicit request çelişirse current request precedence kazanır; memory kaydı sessizce kullanıcı talebini override edemez.

## Determinism
Her test başlangıç memory snapshot'ını fixture olarak tanımlar. Test sonunda expected snapshot karşılaştırılır.

## Definition of Done
```yaml
memory_L2: PASS
privacy_p0_failures: 0
unauthorized_writes: 0
stale_active_reads: 0
conflict_tests: pass
correction_delete_tests: pass
production_database_required: false
```
