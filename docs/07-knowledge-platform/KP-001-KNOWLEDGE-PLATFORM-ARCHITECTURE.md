# KP-001 — Knowledge Platform Architecture

## 1. Amaç

Projede kullanılan bütün kanonik tanımların:

- tek kimlik,
- açık sahiplik,
- semantic version,
- durum,
- dependency,
- replacement,
- migration,
- evaluation,
- lineage

bilgileriyle yönetilmesini sağlamak.

## 2. Neden gerekli?

LLM ve farklı modüller aynı kavram için farklı adlar üretebilir.

Örnek:

```text
parking
car_park
parking_lot
private_parking
vehicle_parking
```

Kanonik registry olmadan:

- duplicate kavramlar oluşur,
- rule ve promptlar farklı isimler kullanır,
- eski kayıtlar yorumlanamaz,
- migration yapılamaz,
- değerlendirme sonuçları karşılaştırılamaz.

## 3. Knowledge Platform bileşenleri

### Registry Core

Tüm registry tiplerinin ortak kimlik, version, status, owner ve dependency davranışını yönetir.

### Ontology Registry

Entity, aspect, risk, opportunity ve user-context kavramlarını yönetir.

### Claim Registry

Kullanılabilecek claim type'larını ve value contract'larını yönetir.

### Rule Registry

Deterministik karar kurallarını yönetir.

### Formula Registry

Skor ve hesaplama formüllerini yönetir.

### Threshold Registry

Risk, confidence ve kalite eşiklerini yönetir.

### Policy Registry

Permission, decision ve runtime policy tanımlarını yönetir.

### Prompt Registry

Prompt sürümleri, evaluation sonuçları ve kullanım kapsamlarını yönetir.

### Schema Registry

JSON Schema ve contract sürümlerini yönetir.

### Evaluation & Test Registry

Evaluation setleri, fixture paketleri ve regression suite'lerini yönetir.

### Migration Registry

Kırıcı değişiklik ve replacement geçişlerini yönetir.

## 4. Registry bağımlılıkları

```text
Ontology Registry
  ↓
Claim Registry
  ↓
Rule / Formula / Threshold Registry
  ↓
Policy Registry
  ↓
Travel Intelligence Modules
```

Prompt ve schema registry bu zinciri destekler.

## 5. Ortak registry kaydı

Her kayıt en az şunları taşır:

```text
registryType
entryId
canonicalName
version
status
owner
description
effectiveFrom
deprecatedAt
replacementRef
dependencies
tags
changeReason
```

## 6. Entry ID standardı

Örnekler:

```text
ontology.entity.hotel
ontology.aspect.parking.capacity
claim.parking.capacity.experience
rule.family.walking_tolerance
formula.risk.default
threshold.risk.high
policy.review.evidence.v1
prompt.review.claim_extractor
```

Kimlik değiştirilemez. İsim değişikliği canonical name veya alias ile yönetilir.

## 7. Durumlar

```text
draft
proposed
approved
active
deprecated
disabled
retired
```

`active` olmayan entry üretim değerlendirmesinde kullanılamaz; explicit test mode istisnadır.

## 8. Sahiplik

Her entry:

- owner team/module,
- approver,
- review date

taşır.

Sahipsiz aktif registry kaydı olamaz.

## 9. Dependency graph

Registry kayıtları birbirine referans verebilir.

Örnek:

```text
claim.parking.capacity.experience
→ ontology.aspect.parking.capacity
→ ontology.entity.accommodation
```

Dependency cycle yasaktır; yalnız açıkça desteklenen recursive ontology relation'ları istisnadır.

## 10. Runtime snapshot

Bir workflow başladığında kullanılan registry sürümleri snapshot olarak sabitlenir.

```text
registrySnapshotId
ontologyVersion
claimRegistryVersion
ruleRegistryVersion
formulaRegistryVersion
thresholdRegistryVersion
policyRegistryVersion
promptRegistryVersion
schemaRegistryVersion
```

Workflow ortasında registry değişikliği sonucu etkilemez.

## 11. Reproducibility

Her assessment veya recommendation şu registry referanslarını taşımalıdır:

- snapshot ID,
- kullanılan rule/formula/threshold IDs,
- ontology node IDs,
- prompt version varsa,
- policy version,
- schema version.

## 12. Change management

Değişiklik sınıfları:

### Patch

Açıklama veya geriye uyumlu metadata düzeltmesi.

### Minor

Yeni geriye uyumlu entry veya alias.

### Major

Kırıcı value contract, semantic veya relationship değişimi.

## 13. Approval gate

Aktif registry kaydı için:

- schema valid,
- duplicate kontrolü,
- dependency kontrolü,
- owner atanmış,
- test fixture,
- etkilediği consumer listesi,
- migration gereksinimi

kontrol edilir.

## 14. Knowledge Platform'un yapmayacağı işler

- Travel Intelligence assessment üretmez.
- Provider çağırmaz.
- Agent orkestrasyonu yapmaz.
- Kullanıcı profilini değiştirmez.
- Runtime source confidence hesaplamaz.
- Promptu kendiliğinden onaylamaz.

## 15. İlk uygulama sırası

1. Registry Core
2. Ontology Registry
3. Claim Registry
4. Rule Registry
5. Formula & Threshold Registry
6. Policy Registry
7. Prompt Registry
8. Schema Registry
9. Evaluation & Test Registry
10. Migration tooling
