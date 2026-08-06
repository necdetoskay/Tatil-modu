# Ontology Governance

## 1. Yeni node ekleme

Yeni node için:

- mevcut node ile ifade edilememe gerekçesi,
- canonical ID,
- parent/relation,
- definition,
- allowed entity types,
- examples,
- counter-examples,
- aliases,
- owner,
- fixture

zorunludur.

## 2. Duplicate semantic kontrol

Aynı anlama gelen yeni node yerine alias veya mevcut node kullanılır.

Örnek:

```text
car_park
parking_lot
vehicle_parking
```

canonical:

```text
ontology.aspect.parking
```

## 3. Genişletme kuralı

Yeni alt kavram gerçek karar farkı yaratıyorsa eklenir.

Örnek:

```text
parking.availability
parking.capacity
parking.fee
```

ayrı karar etkilerine sahip olduğu için ayrı node'lardır.

## 4. Deprecation

Node kaldırılmaz.

```text
status = deprecated
replacementRef = ...
```

ile işaretlenir.

## 5. Dil

Canonical ID İngilizce teknik formdadır.

Display label çok dilli olabilir:

```text
tr: Otopark kapasitesi
en: Parking capacity
```

## 6. LLM normalizasyonu

LLM yalnız candidate ontology node önerebilir.

Nihai canonical ID:

- registry lookup,
- alias match,
- schema validation,
- confidence threshold

sonrasında seçilir.

## 7. Unknown kavram

Eşleşmeyen kavram uydurulmaz.

```text
ontologyMatchStatus = unresolved
```

olarak tutulur ve yeni node önerisi oluşturulabilir.

## 8. Testler

- duplicate semantic node,
- invalid parent,
- relation cycle,
- missing replacement,
- alias collision,
- locale label eksikliği,
- unsupported entity mapping.
