# Registry Versioning & Migration

## 1. Amaç

Registry değişikliklerinin persisted claim, observation, evidence, assessment ve test kayıtlarını bozmadan yönetilmesi.

## 2. Migration türleri

```text
rename_label
add_alias
replace_entry
split_entry
merge_entries
change_parent
change_value_contract
deprecate_entry
```

## 3. Split örneği

Eski:

```text
ontology.aspect.parking
```

Yeni:

```text
ontology.aspect.parking.availability
ontology.aspect.parking.capacity
ontology.aspect.parking.fee
```

Eski persisted kayıtlar otomatik ve kör biçimde tek alt node'a taşınmaz. Context-dependent migration veya `needs_reclassification` gerekir.

## 4. Merge örneği

Birden fazla duplicate node tek canonical entry altında birleşebilir.

## 5. Migration kaydı

Her migration:

- migration ID,
- source entry/version,
- target entry/version,
- type,
- transform,
- reversibility,
- effective time,
- impacted consumers,
- test refs

taşır.

## 6. Reclassification

Semantic split veya contract değişiminde eski kayıtlar:

```text
migrated
partially_migrated
needs_reclassification
unmigratable
```

durumlarından birini alır.

## 7. Rollback

Reversible migration rollback transform taşır.

## 8. Runtime compatibility

Consumer modül hangi registry major sürümlerini desteklediğini bildirir.
