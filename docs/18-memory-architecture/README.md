# 18 — Memory Architecture Deep Design

**Doküman türü:** canonical memory architecture deep design alanı  
**Durum:** first phase tamamlandı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Runtime memory store:** kapalı

## Amaç

Bu klasör, Tatil Modu'nun aile, kullanıcı tercihi, geçmiş plan, doğrulama geçmişi, hassas tercih ve disclosure paketlerini nasıl yöneteceğini koddan önce kanonik şekilde tasarlamak için kullanılır.

Bu alan database schema, vector store implementation, runtime memory write, production personalization engine, embedding pipeline veya live memory retrieval değildir.

## Ana karar

```yaml
memory_architecture_design_state: first_phase_completed
memory_architecture_first_phase_completed: true
implementation_allowed: false
prototype_allowed: false
runtime_memory_store_allowed: false
database_schema_allowed: false
vector_store_allowed: false
live_memory_write_allowed: false
live_memory_retrieval_allowed: false
source_of_truth: docs/18-memory-architecture/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/14-tool-and-capability-design/
  - docs/15-prompts/
  - docs/16-workflows/
  - docs/17-decision-policy-engine/
```

## Neden bu aşama gerekli?

Tatil Modu kişisel ve aile odaklı planlama yaptığı için memory sistemi yanlış tasarlanırsa sistem ya kullanıcıyı hiç tanımaz ya da gereğinden fazla kişisel bilgi taşır.

Bu aşama şu sorulara cevap verir:

```text
Hangi bilgi canonical memory olabilir?
Hangi bilgi sadece geçici session context olarak kalır?
Çocuk yaşları, aile tercihleri ve mahremiyet tercihleri nasıl saklanır?
Expert agent memory'e doğrudan yazabilir mi?
Memory disclosure package final cevaba nasıl taşınır?
Yanlış veya eski memory nasıl düzeltilir?
Hassas tercih memory içinde nasıl korunur?
```

## Kapsam

```yaml
scope:
  - memory_platform_boundary
  - canonical_memory_ownership
  - memory_types_and_lifecycle
  - family_profile_memory
  - preference_memory
  - privacy_sensitive_memory
  - trip_history_memory
  - disclosure_package_model
  - memory_write_policy
  - memory_read_policy
  - memory_correction_and_deletion_policy
  - memory_evaluation_and_regression_policy
```

## Kapsam dışı

```yaml
out_of_scope:
  - database_schema
  - vector_database
  - embedding_pipeline
  - runtime_memory_write
  - runtime_memory_read
  - production_personalization_engine
  - storage_encryption_implementation
  - account_settings_ui
  - live_user_profile_sync
  - memory_api_client
```

## First-phase memory architecture design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Memory Architecture Overview | [`01-memory-architecture-overview.md`](01-memory-architecture-overview.md) | drafted |
| 2 | Memory Boundary and Ownership | [`02-memory-boundary-and-ownership.md`](02-memory-boundary-and-ownership.md) | drafted |
| 3 | Memory Type Taxonomy | [`03-memory-type-taxonomy.md`](03-memory-type-taxonomy.md) | drafted |
| 4 | Family Profile Memory Model | [`04-family-profile-memory-model.md`](04-family-profile-memory-model.md) | drafted |
| 5 | Preference and Constraint Memory Model | [`05-preference-constraint-memory-model.md`](05-preference-constraint-memory-model.md) | drafted |
| 6 | Privacy Sensitive Memory Policy | [`06-privacy-sensitive-memory-policy.md`](06-privacy-sensitive-memory-policy.md) | drafted |
| 7 | Memory Read and Disclosure Package Policy | [`07-memory-read-disclosure-package-policy.md`](07-memory-read-disclosure-package-policy.md) | drafted |
| 8 | Memory Write Commit Policy | [`08-memory-write-commit-policy.md`](08-memory-write-commit-policy.md) | drafted |
| 9 | Memory Correction Deletion and Staleness Policy | [`09-memory-correction-deletion-staleness-policy.md`](09-memory-correction-deletion-staleness-policy.md) | drafted |
| 10 | Trip History and Learning Memory Policy | [`10-trip-history-learning-memory-policy.md`](10-trip-history-learning-memory-policy.md) | drafted |
| 11 | Memory Evaluation and Regression Policy | [`11-memory-evaluation-regression-policy.md`](11-memory-evaluation-regression-policy.md) | drafted |
| 12 | Memory Architecture Completion Checklist | [`12-memory-architecture-completion-checklist.md`](12-memory-architecture-completion-checklist.md) | drafted |

## Memory tasarım ilkeleri

1. Expert agent'lar canonical memory'e doğrudan yazmaz.
2. Memory Platform canonical memory ownership sahibidir.
3. Memory disclosure package minimum gerekli bilgiyle oluşturulur.
4. Hassas tercih ve aile bilgisi varsayımla kalıcı memory yapılamaz.
5. Çocuk yaşları, dinlenme ihtiyacı ve mahremiyet tercihleri açık confidence ve freshness taşır.
6. Memory final response'a görünmez şekilde sızdırılamaz.
7. Eski veya çelişkili memory kararları açıkça staleness/conflict sinyali üretir.
8. Kullanıcı düzeltmesi memory üzerinde en yüksek öncelikli sinyaldir.
9. Memory mimarisi implementation değildir.
10. Memory kullanımında amaç daha iyi plan üretmektir; gereksiz kişiselleştirme değil.

## Current status

```yaml
memory_architecture_design_state: first_phase_completed
memory_architecture_first_phase_completed: true
completed_artifacts:
  - 01-memory-architecture-overview.md
  - 02-memory-boundary-and-ownership.md
  - 03-memory-type-taxonomy.md
  - 04-family-profile-memory-model.md
  - 05-preference-constraint-memory-model.md
  - 06-privacy-sensitive-memory-policy.md
  - 07-memory-read-disclosure-package-policy.md
  - 08-memory-write-commit-policy.md
  - 09-memory-correction-deletion-staleness-policy.md
  - 10-trip-history-learning-memory-policy.md
  - 11-memory-evaluation-regression-policy.md
  - 12-memory-architecture-completion-checklist.md
next_stage: docs/19-quality-engine/
implementation_allowed: false
prototype_allowed: false
runtime_memory_store_allowed: false
database_schema_allowed: false
vector_store_allowed: false
live_memory_write_allowed: false
live_memory_retrieval_allowed: false
```
