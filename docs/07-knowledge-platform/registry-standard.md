# Registry Standard v1.0

## 1. Amaç

Bütün Knowledge Platform registry'lerinin ortak davranışını tanımlar.

## 2. Registry tipleri

```text
ontology
claim
rule
formula
threshold
policy
prompt
capability
tool
schema
feature
evaluation
test
version
migration
```

## 3. Kanonik kayıt

Her entry:

- benzersiz ID,
- semantic version,
- status,
- canonical name,
- aliases,
- owner,
- description,
- dependency listesi,
- effective dates,
- replacement,
- provenance

taşır.

## 4. ID değişmezliği

Entry ID yayınlandıktan sonra değiştirilemez.

Yanlış isim verilmişse:

- canonicalName güncellenebilir,
- alias eklenebilir,
- gerekirse yeni entry + migration oluşturulur.

## 5. Alias

Alias yalnız giriş normalizasyonu içindir.

Runtime ve kalıcı kayıtlarda canonical ID kullanılır.

## 6. Status geçişleri

```text
draft → proposed → approved → active
active → deprecated → retired
active → disabled
disabled → active
```

`retired` entry yeniden aktive edilmez; replacement gerekir.

## 7. Validation

Her registry entry:

- registry entry schema,
- registry-type-specific schema,
- dependency resolution,
- duplicate semantic check,
- owner check,
- version compatibility

kontrollerini geçer.

## 8. Effective dates

Bir entry'nin approval tarihi ile effective tarihi farklı olabilir.

Future effective entry, target-date policy tarafından seçilebilir ancak runtime current snapshot'ta otomatik aktif olmaz.

## 9. Consumer impact

Major veya deprecation değişikliğinde etkilenen:

- agentlar,
- intelligence modülleri,
- prompts,
- rules,
- schemas,
- fixtures,
- persisted records

listelenir.

## 10. Registry snapshot

Snapshot immutable'dır ve hash taşır.

## 11. Audit

Her değişiklik:

- kim yaptı,
- ne zaman,
- neden,
- önceki sürüm,
- diff ref,
- approval ref

bilgilerini taşır.
