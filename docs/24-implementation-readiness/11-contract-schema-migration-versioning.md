# Contract, Schema and Migration Versioning

## Amaç
Canonical contract'ların implementation sırasında kontrolsüz kırılmasını engellemek.

## Versioning ilkeleri
1. Her public contract version taşır.
2. Backward-incompatible değişiklik explicit major version gerektirir.
3. Fixture'lar hangi contract version ile çalıştığını belirtir.
4. Agent implementation desteklediği input/output version aralığını bildirir.
5. Orchestrator unsupported contract version'ı sessizce dönüştürmez.
6. Migration code test edilmeden eski version kaldırılmaz.

## Değişiklik sınıfları
### Patch-compatible
- optional metadata ekleme
- açıklama/reason code dokümantasyon iyileştirmesi

### Minor-compatible
- yeni optional field
- yeni enum değeri yalnız consumers forward-compatible ise

### Major-breaking
- required field ekleme
- field meaning değiştirme
- field silme/rename
- hard constraint semantics değiştirme

## Contract change workflow
```text
proposal
→ canonical design impact check
→ ADR/amendment if semantic
→ schema update
→ compatibility tests
→ fixture updates
→ agent/orchestrator updates
→ golden regression
→ version release
```

## Database migration
İlk headless faz persistent DB zorunlu değildir. Persistence eklendiğinde schema migration ayrı package/tooling ile versioned olmalı; migration rollback/forward tests gereklidir.

## Golden baseline
Contract major değişikliği golden baseline'ı otomatik overwrite etmez. Beklenen davranış değişikliği explicit review gerektirir.
