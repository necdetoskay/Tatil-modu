# Tatil Modu — ER Diagram v1

## Durum

**Canonical status:** Domain Model v1 baseline adayı ile birlikte değerlendirilir.

Bu doküman ilişkisel modeli bounded-context bazında görselleştirir. Tek bir dev diyagram yerine okunabilir alt diyagramlar kullanılır.

## 1. Geography

```mermaid
erDiagram
  GEO_REGION_TYPES ||--o{ GEO_REGIONS : classifies
  GEO_REGIONS ||--o{ GEO_REGIONS : parent_of

  GEO_REGION_TYPES {
    uuid id PK
    text code UK
    smallint hierarchy_level
  }

  GEO_REGIONS {
    uuid id PK
    uuid parent_region_id FK
    uuid region_type_id FK
    char2 country_code
    text normalized_name
    geography geometry
    text status
  }
```

## 2. Knowledge supertype and subtype ownership

```mermaid
erDiagram
  ENTITY_KINDS ||--o{ KNOWLEDGE_ENTITIES : classifies
  KNOWLEDGE_ENTITIES ||--o| PLACES : subtype
  KNOWLEDGE_ENTITIES ||--o| EVENTS : subtype
  KNOWLEDGE_ENTITIES ||--o| LOCAL_ITEMS : subtype
  KNOWLEDGE_ENTITIES ||--o| PARKING_FACILITIES : subtype

  ENTITY_KINDS {
    uuid id PK
    text code UK
  }

  KNOWLEDGE_ENTITIES {
    uuid id PK
    uuid entity_kind_id FK
    text canonical_name
    text slug
    text status
  }

  PLACES { uuid id PK,FK }
  EVENTS { uuid id PK,FK }
  LOCAL_ITEMS { uuid id PK,FK }
  PARKING_FACILITIES { uuid id PK,FK }
```

## 3. Places and local experience

```mermaid
erDiagram
  GEO_REGIONS ||--o{ PLACES : contains
  PLACE_CATEGORIES ||--o{ PLACE_CATEGORIES : parent_of
  PLACES ||--o{ PLACE_CATEGORY_LINKS : categorized_by
  PLACE_CATEGORIES ||--o{ PLACE_CATEGORY_LINKS : links
  PLACES ||--o{ OPERATING_HOURS : has
  PLACES ||--o{ OPERATING_EXCEPTIONS : has
  GEO_REGIONS ||--o{ PARKING_FACILITIES : contains
  PLACES ||--o{ PLACE_PARKING_LINKS : served_by
  PARKING_FACILITIES ||--o{ PLACE_PARKING_LINKS : serves
  GEO_REGIONS ||--o{ LOCAL_ITEMS : origin
  PLACES ||--o{ PLACE_LOCAL_ITEM_LINKS : offers
  LOCAL_ITEMS ||--o{ PLACE_LOCAL_ITEM_LINKS : available_at
  PLACES ||--o{ PLACE_SUITABILITY_ASSESSMENTS : assessed
  SUITABILITY_DIMENSIONS ||--o{ PLACE_SUITABILITY_ASSESSMENTS : dimension
  PLACES ||--o{ SEASONAL_SUITABILITY : seasonal_score
```

## 4. Events

```mermaid
erDiagram
  GEO_REGIONS ||--o{ EVENTS : contains
  EVENT_TYPES ||--o{ EVENTS : classifies
  EVENTS ||--o{ EVENT_OCCURRENCES : occurs_as
  EVENTS ||--o{ EVENT_PLACE_LINKS : linked_to
  PLACES ||--o{ EVENT_PLACE_LINKS : hosts_or_impacted
  EVENT_PLACE_ROLE_TYPES ||--o{ EVENT_PLACE_LINKS : role
```

## 5. Evidence, provenance, verification and freshness

```mermaid
erDiagram
  DATA_SOURCE_TYPES ||--o{ DATA_SOURCES : classifies
  TRUST_TIERS ||--o{ DATA_SOURCES : trust
  DATA_SOURCES ||--o{ SOURCE_DOCUMENTS : produces
  KNOWLEDGE_ENTITIES ||--o{ EVIDENCE_CLAIMS : has
  SOURCE_DOCUMENTS ||--o{ EVIDENCE_CLAIMS : supports
  CLAIM_TYPES ||--o{ EVIDENCE_CLAIMS : classifies
  KNOWLEDGE_ENTITIES ||--o{ VERIFICATION_RESULTS : verified_by
  VERIFICATION_TYPES ||--o{ VERIFICATION_RESULTS : type
  KNOWLEDGE_ENTITIES ||--o{ FRESHNESS_ASSIGNMENTS : freshness
  CLAIM_TYPES ||--o{ FRESHNESS_ASSIGNMENTS : optional_claim_scope
  FRESHNESS_POLICIES ||--o{ FRESHNESS_ASSIGNMENTS : policy
  KNOWLEDGE_ENTITIES ||--o{ EXTERNAL_ENTITY_REFS : mapped_to
  DATA_SOURCES ||--o{ EXTERNAL_ENTITY_REFS : provider
```

## 6. Trip request and planning runtime

```mermaid
erDiagram
  GEO_REGIONS ||--o{ TRIP_REQUESTS : target
  TRIP_REQUESTS ||--o{ TRIP_PARTY_MEMBERS : contains
  PARTY_MEMBER_TYPES ||--o{ TRIP_PARTY_MEMBERS : classifies
  MOBILITY_PROFILES ||--o{ TRIP_PARTY_MEMBERS : mobility
  TRIP_REQUESTS ||--o{ TRIPS : versioned_plan
  TRIPS ||--o{ TRIP_DAYS : contains
  TRIP_DAYS ||--o{ PLAN_OPTIONS : alternatives
  PLAN_SCENARIO_TYPES ||--o{ PLAN_OPTIONS : scenario
  PLAN_OPTIONS ||--o{ PLAN_ITEMS : contains
  PLAN_ITEM_TYPES ||--o{ PLAN_ITEMS : classifies
  PLACES ||--o{ PLAN_ITEMS : optional_target
  EVENT_OCCURRENCES ||--o{ PLAN_ITEMS : optional_target
  LOCAL_ITEMS ||--o{ PLAN_ITEMS : optional_target
```

## 7. Route cache and live context

```mermaid
erDiagram
  TRAVEL_MODES ||--o{ ROUTE_CACHE_ENTRIES : mode
  DATA_SOURCES ||--o{ ROUTE_CACHE_ENTRIES : provider
  GEO_REGIONS ||--o{ ENVIRONMENT_CONTEXT_SNAPSHOTS : scope
  ENVIRONMENT_CONTEXT_TYPES ||--o{ ENVIRONMENT_CONTEXT_SNAPSHOTS : type
```

## 8. Kritik cardinality ve ownership kuralları

- `knowledge_entities -> subtype` ilişkisi 1 -> 0..1 ve subtype PK aynı zamanda FK'dir.
- `place <-> category`, `place <-> parking`, `place <-> local_item`, `event <-> place` N:N join tablolarıyla modellenir.
- `event -> occurrence` 1:N'dir; tekrar eden etkinliğin gerçek tarih örnekleri ayrıdır.
- `trip_request -> trips` 1:N'dir; her plan revizyonu yeni `plan_version` üretir.
- `trip -> trip_days -> plan_options -> plan_items` composition zinciridir ve parent silinirse child'lar CASCADE ile temizlenebilir.
- evidence/source/history ilişkileri RESTRICT ağırlıklıdır; kanıt geçmişi parent lifecycle değişikliğinde sessizce silinmez.
- `plan_items` polymorphic string FK kullanmaz; hedefler nullable gerçek FK'lerdir ve semantic trigger ile tip/hedef uyumu korunur.

## 9. Bounded-context sınırları

### Geography
`geo_region_types`, `geo_regions`

### Travel Knowledge Core
`knowledge_entities`, `places`, `events`, `local_items`, `parking_facilities` ve bağlı registry/join tabloları.

### Trust & Evidence
`data_sources`, `source_documents`, `evidence_claims`, `verification_results`, `freshness_*`, `external_entity_refs`.

### Runtime Planning
`trip_requests`, `trip_party_members`, `trips`, `trip_days`, `plan_options`, `plan_items`.

### Ephemeral/Cache
`route_cache_entries`, `environment_context_snapshots`.

Bu sınırlar ileride repository/service ownership ve migration paketlerini ayırmak için kullanılmalıdır.
