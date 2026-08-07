# 03 — Memory Type Taxonomy

**Doküman türü:** memory taxonomy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Tatil Modu memory sisteminde hangi bilgi türlerinin hangi kategori altında değerlendirileceğini tanımlar.

## Ana karar

```yaml
memory_type_taxonomy_state: drafted
canonical_memory_types_defined: true
session_vs_canonical_separation_required: true
privacy_sensitive_memory_explicitly_marked: true
implementation_allowed: false
```

## Memory türleri

```yaml
memory_types:
  family_profile_memory:
    purpose: aile yapısı ve çocuk yaşları
    sensitivity: medium
  travel_preference_memory:
    purpose: destinasyon, tempo, konaklama, aktivite tercihleri
    sensitivity: low_to_medium
  hard_constraint_memory:
    purpose: kalıcılaşmış güçlü kısıtlar
    sensitivity: medium_to_high
  privacy_sensitive_memory:
    purpose: mahremiyet, kadınlar plajı, aile hassasiyetleri
    sensitivity: high
  logistics_memory:
    purpose: çıkış noktası, araç, mola, sürüş toleransı
    sensitivity: medium
  budget_memory:
    purpose: bütçe bandı eğilimleri
    sensitivity: medium
  trip_history_memory:
    purpose: geçmiş planlar ve beğenilen/beğenilmeyen öneriler
    sensitivity: medium
  correction_memory:
    purpose: kullanıcının düzelttiği bilgi kayıtları
    sensitivity: varies
```

## Canonical olmayan context türleri

```yaml
non_canonical_context_types:
  session_context:
    canonical: false
    description: tek konuşma içinde geçici bağlam
  draft_assumption:
    canonical: false
    description: açıkça varsayım olarak işaretlenen bilgi
  candidate_memory:
    canonical: false
    description: memory'e yazılmaya aday bilgi
  provider_cache:
    canonical: false
    description: dış kaynak sonucu; kullanıcı memory'i değildir
  agent_scratchpad:
    canonical: false
    description: asla canonical memory değildir
```

## Memory confidence alanı

Her canonical memory entry şu güven sinyalini taşımalıdır:

```yaml
confidence_levels:
  explicit_user_statement: en güçlü sinyal
  repeated_user_behavior: güçlü sinyal fakat açıklama gerekir
  inferred_preference: düşük/orta güven; hard constraint olamaz
  temporary_assumption: canonical memory olamaz
```

## Memory freshness alanı

```yaml
freshness_categories:
  stable:
    examples: ailede çocuk bilgisi, çıkış şehri
    note: yine de zamanla güncellenebilir
  slowly_changing:
    examples: bütçe bandı, tatil temposu tercihi
  trip_specific:
    examples: belirli seyahat tarihi, belirli bütçe
  volatile:
    examples: fiyat, hava, müsaitlik
    canonical_memory: false
```

## Tatil Modu özel kuralı

Fiyat, hava durumu, açılış saati, otopark ve müsaitlik memory değil verification/evidence bilgisidir.

```text
Sık değişen dış dünya bilgisi canonical user memory yapılmaz.
```

## Kapanış kararı

Memory taxonomy, kişisel bağlam ile doğrulama/evidence bilgisini birbirinden ayırır.
