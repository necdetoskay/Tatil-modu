# Knowledge Platform Test Standard

## Registry Core

- ID benzersizliği,
- semantic version,
- status geçişi,
- owner zorunluluğu,
- dependency resolution,
- cycle detection,
- alias collision,
- snapshot immutability.

## Ontology Registry

- node schema,
- relation schema,
- parent/relation geçerliliği,
- duplicate semantic node,
- entity-aspect uyumu,
- locale label,
- deprecated replacement.

## Migration

- source/target refs,
- impacted consumer listesi,
- split/merge davranışı,
- reclassification,
- reversible rollback,
- migration fixture.

## Runtime

- yalnız active entry kullanımı,
- snapshot pinning,
- workflow ortasında version değişmeme,
- assessment içinde registry refs.

## Kritik başarısızlıklar

- aynı semantic kavram için duplicate active node,
- alias'ın kalıcı canonical ID olarak kullanılması,
- sahipsiz active entry,
- replacement'sız retired/deprecated kırıcı node,
- snapshot dışı runtime registry değişikliği,
- testsiz major migration.
