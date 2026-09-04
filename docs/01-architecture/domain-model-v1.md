# Tatil Modu — Domain Model v1

## Durum

**Canonical status:** Architecture/domain baseline adayı.

Bu doküman Tatil Modu'nun ilişkisel domain modelini, PK/FK kurallarını, cardinality'leri, silme davranışlarını ve PostgreSQL index stratejisini tanımlar. Mevcut architecture baseline ile çakışma halinde `docs/08-architecture-baseline/` kararları önceliklidir.

## 1. Tasarım hedefleri

- Referential integrity veritabanı tarafından korunur.
- Polymorphic `entity_type + entity_id` FK'siz ilişkilerden kaçınılır.
- Knowledge, evidence, freshness ve runtime plan verileri birbirinden ayrılır.
- Değişken/güncel bilgiler tarihsel olarak izlenebilir.
- Yönetilebilir kategoriler hardcoded enum listelerine dönüştürülmez.
- Coğrafi sorgular PostGIS ile desteklenir.
- Kritik sorgu yolları baştan indexlenir; rastgele her kolona index eklenmez.
- Silme yerine domain yaşam döngüsü ve tarihsel kayıt tercih edilir.

## 2. Kimlik stratejisi

Tüm domain tabloları için `uuid` PK kullanılır. Uygulama UUIDv7 üretebiliyorsa sıralı UUIDv7 tercih edilir; aksi halde PostgreSQL `gen_random_uuid()` kabul edilir.

Kurallar:

- PK adı her tabloda `id`.
- FK adı `<referenced_singular>_id`.
- Join tablolarında surrogate `id` yerine doğal composite PK tercih edilir.
- Dış provider kimlikleri internal PK olarak kullanılmaz.
- Provider kimlikleri `external_entity_refs` tablosunda saklanır.

## 3. Audit ve yaşam döngüsü kolonları

Uzun ömürlü knowledge tablolarında minimum:

- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `status text not null`

Gerekli yerlerde ayrıca:

- `valid_from timestamptz`
- `valid_to timestamptz`
- `retired_at timestamptz`

Hard delete yalnızca saf join/ephemeral tablolarda kullanılmalıdır.

## 4. Ana ilişki modeli

```text
geo_regions
   ├── places ───────────────┐
   ├── local_items           │
   └── events                │
                            │
knowledge_entities <─────────┘
   ├── evidence_claims
   ├── verification_results
   ├── freshness_assignments
   └── external_entity_refs

places
   ├── place_category_links -> place_categories
   ├── operating_hours
   ├── operating_exceptions
   ├── parking_facilities
   ├── place_suitability_assessments
   ├── seasonal_suitability
   └── place_local_item_links -> local_items

events
   ├── event_occurrences
   └── event_place_links -> places

trip_requests
   └── trips
       └── trip_days
           └── plan_options
               └── plan_items
                   ├── places
                   ├── events
                   └── local_items
```

## 5. Knowledge supertype modeli

### 5.1 `knowledge_entities`

Amaç: Evidence/freshness/doğrulama katmanlarının gerçek FK ile bütün domain entity tiplerine bağlanabilmesi.

Kolonlar:

- `id uuid pk`
- `entity_kind_id uuid not null fk -> entity_kinds.id`
- `canonical_name text not null`
- `slug text`
- `status text not null`
- audit kolonları

Indexler:

- `unique(entity_kind_id, slug) where slug is not null and status = 'active'`
- `btree(entity_kind_id, status)`
- trigram isim indexi: `gin(canonical_name gin_trgm_ops)`

### 5.2 `entity_kinds`

Yönetilebilir registry:

- `id uuid pk`
- `code text not null unique`
- `name text not null`
- `is_active boolean not null default true`

Başlangıç kodları: `place`, `event`, `local_item`, `parking_facility`.

Bu liste uygulama kodunda enum olarak kapatılmamalıdır.

### 5.3 Subtype kuralı

`places.id`, `events.id`, `local_items.id`, `parking_facilities.id` aynı zamanda `knowledge_entities.id` değeridir.

Örnek:

```text
places.id PK + FK -> knowledge_entities.id
```

Bu 1:1 subtype ilişkisi sayesinde dangling entity oluşmaz.

Silme davranışı: `ON DELETE RESTRICT`. Entity yaşam döngüsü status ile yönetilir.

## 6. Coğrafya modeli

### 6.1 `geo_regions`

Türkiye > il > ilçe > belde/mahalle gibi hiyerarşik bölgeler.

Kolonlar:

- `id uuid pk`
- `parent_region_id uuid null fk -> geo_regions.id`
- `region_type_id uuid not null fk -> geo_region_types.id`
- `country_code char(2) not null`
- `name text not null`
- `normalized_name text not null`
- `geometry geography/multipolygon null`
- `status text not null`

Constraint:

- `check(parent_region_id <> id)`
- `unique(parent_region_id, region_type_id, normalized_name)` uygun null semantiğiyle uygulanmalı.

Indexler:

- `btree(parent_region_id)`
- `btree(region_type_id, status)`
- `btree(country_code, normalized_name)`
- `gist(geometry)`

### 6.2 `geo_region_types`

- `id uuid pk`
- `code text unique not null`
- `name text not null`
- `hierarchy_level smallint not null`

Örn. country/province/district/neighborhood.

## 7. Places

### 7.1 `places`

Kolonlar:

- `id uuid pk fk -> knowledge_entities.id`
- `primary_region_id uuid not null fk -> geo_regions.id`
- `address_text text`
- `location geography(point, 4326)`
- `website_url text`
- `phone text`
- `average_visit_minutes integer`
- `indoor_ratio numeric(5,2)`
- `outdoor_ratio numeric(5,2)`
- `reservation_requirement_id uuid null fk -> reservation_requirement_types.id`
- `status text not null`

Constraintler:

- visit süresi > 0 ise positive check
- indoor/outdoor oranları 0..100

Indexler:

- `btree(primary_region_id, status)`
- `gist(location)`
- partial: `btree(primary_region_id) where status='active'`

### 7.2 `place_categories`

Yönetilebilir kategori ağacı:

- `id uuid pk`
- `parent_category_id uuid null fk -> place_categories.id`
- `code text unique not null`
- `name text not null`
- `is_active boolean not null`

### 7.3 `place_category_links`

- `place_id uuid fk -> places.id on delete cascade`
- `category_id uuid fk -> place_categories.id on delete restrict`
- `is_primary boolean not null default false`
- PK `(place_id, category_id)`

Index:

- reverse lookup için `btree(category_id, place_id)`
- her place için tek primary kategori: partial unique `(place_id) where is_primary`

## 8. Çalışma saatleri ve istisnalar

### 8.1 `operating_hours`

Recurring weekly schedule:

- `id uuid pk`
- `place_id uuid not null fk -> places.id on delete cascade`
- `weekday smallint not null check 0..6`
- `opens_at time null`
- `closes_at time null`
- `is_closed boolean not null default false`
- `season_from date null`
- `season_to date null`
- `valid_from date not null`
- `valid_to date null`

Indexler:

- `btree(place_id, weekday, valid_from desc)`
- partial active schedule: `btree(place_id, weekday) where valid_to is null`

### 8.2 `operating_exceptions`

Resmî tatil/özel gün/tekil kapanma:

- `id uuid pk`
- `place_id uuid not null fk -> places.id on delete cascade`
- `exception_date date not null`
- `opens_at time null`
- `closes_at time null`
- `is_closed boolean not null`
- `reason text`
- unique `(place_id, exception_date)`

Index: `btree(exception_date, place_id)`.

## 9. Parking

### 9.1 `parking_facilities`

Subtype entity:

- `id uuid pk fk -> knowledge_entities.id`
- `region_id uuid not null fk -> geo_regions.id`
- `location geography(point,4326)`
- `capacity integer null`
- `parking_type_id uuid fk -> parking_types.id`
- `paid boolean null`
- `status text not null`

Indexler: `gist(location)`, `btree(region_id,status)`.

### 9.2 `place_parking_links`

- `place_id uuid fk -> places.id on delete cascade`
- `parking_facility_id uuid fk -> parking_facilities.id on delete restrict`
- `walk_minutes integer null`
- `relationship_type_id uuid fk -> parking_relationship_types.id`
- PK `(place_id, parking_facility_id)`

Reverse index: `(parking_facility_id, place_id)`.

## 10. Yerel lezzet ve ürünler

### 10.1 `local_items`

Tek modelle yemek + yerel ürün + hediyelik gibi yönetilebilir tipler:

- `id uuid pk fk -> knowledge_entities.id`
- `item_type_id uuid not null fk -> local_item_types.id`
- `origin_region_id uuid not null fk -> geo_regions.id`
- `description text`
- `seasonal boolean not null default false`
- `status text not null`

Indexler:

- `(origin_region_id, item_type_id, status)`
- `(item_type_id, status)`

### 10.2 `place_local_item_links`

Bir ürün/yemek nerede deneyimlenebilir/satın alınabilir:

- `place_id uuid fk -> places.id on delete cascade`
- `local_item_id uuid fk -> local_items.id on delete restrict`
- `relationship_type_id uuid fk -> local_item_relationship_types.id`
- `quality_score numeric null`
- PK `(place_id, local_item_id, relationship_type_id)`

Index: `(local_item_id, place_id)`.

## 11. Etkinlikler ve festivaller

### 11.1 `events`

- `id uuid pk fk -> knowledge_entities.id`
- `primary_region_id uuid not null fk -> geo_regions.id`
- `event_type_id uuid not null fk -> event_types.id`
- `recurrence_rule text null`
- `crowd_impact_level smallint null`
- `status text not null`

Indexler:

- `(primary_region_id, event_type_id, status)`
- `(event_type_id, status)`

### 11.2 `event_occurrences`

Etkinlik tanımı ile gerçek tarihleri ayırır.

- `id uuid pk`
- `event_id uuid not null fk -> events.id on delete cascade`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `status text not null`
- `expected_crowd_level smallint null`

Constraint: `ends_at > starts_at`.

Indexler:

- `(starts_at, ends_at)`
- `(event_id, starts_at desc)`
- `(status, starts_at)`

### 11.3 `event_place_links`

- `event_id uuid fk -> events.id on delete cascade`
- `place_id uuid fk -> places.id on delete restrict`
- `role_type_id uuid fk -> event_place_role_types.id`
- PK `(event_id, place_id, role_type_id)`

## 12. Suitability modeli

Tek bir sürekli değişen skor yerine boyut bazlı assessment tutulur.

### 12.1 `suitability_dimensions`

Yönetilebilir kriterler:

- stroller_access
- toddler_interest
- school_age_interest
- elderly_access
- wheelchair_access
- rain_fit
- heat_fit
- winter_fit
- crowd_sensitivity

Kolonlar:

- `id uuid pk`
- `code text unique not null`
- `name text not null`
- `value_type text not null`
- `is_active boolean not null`

### 12.2 `place_suitability_assessments`

- `id uuid pk`
- `place_id uuid not null fk -> places.id on delete cascade`
- `dimension_id uuid not null fk -> suitability_dimensions.id on delete restrict`
- `score numeric(5,2) null`
- `assessment_value jsonb null`
- `confidence numeric(5,4) not null`
- `valid_from timestamptz not null`
- `valid_to timestamptz null`

Indexler:

- `(place_id, dimension_id, valid_from desc)`
- partial unique current record: `(place_id, dimension_id) where valid_to is null`
- reverse query: `(dimension_id, score desc) where valid_to is null`

## 13. Mevsimsellik

### `seasonal_suitability`

- `id uuid pk`
- `place_id uuid not null fk -> places.id on delete cascade`
- `month smallint not null check 1..12`
- `score numeric(5,2) not null`
- `reason text`
- unique `(place_id, month)`

Index: `(month, score desc)`.

Event ve local item için ileride aynı pattern ayrı subtype-specific tablolarla uygulanmalı; polymorphic FK kullanılmamalıdır.

## 14. Kaynak, kanıt ve doğrulama

### 14.1 `data_sources`

- `id uuid pk`
- `source_type_id uuid fk -> data_source_types.id`
- `name text not null`
- `base_url text null`
- `trust_tier_id uuid fk -> trust_tiers.id`
- `is_active boolean not null`

Index: `(source_type_id, is_active)`.

### 14.2 `source_documents`

Her fetch/snapshot ayrı kayıt:

- `id uuid pk`
- `data_source_id uuid not null fk -> data_sources.id`
- `source_url text not null`
- `retrieved_at timestamptz not null`
- `content_hash text not null`
- `http_etag text null`
- `published_at timestamptz null`

Constraint/index:

- `unique(data_source_id, source_url, content_hash)`
- `(source_url, retrieved_at desc)`

### 14.3 `evidence_claims`

Gerçek FK ile entity'ye bağlanır:

- `id uuid pk`
- `knowledge_entity_id uuid not null fk -> knowledge_entities.id on delete restrict`
- `source_document_id uuid not null fk -> source_documents.id on delete restrict`
- `claim_type_id uuid not null fk -> claim_types.id`
- `claim_key text not null`
- `value_json jsonb not null`
- `confidence numeric(5,4) not null`
- `observed_at timestamptz not null`
- `valid_from timestamptz null`
- `valid_to timestamptz null`
- `status text not null`

Indexler:

- `(knowledge_entity_id, claim_key, observed_at desc)`
- `(claim_type_id, status)`
- `(source_document_id)`
- GIN `value_json` yalnızca gerçek sorgu ihtiyacı doğrulanırsa eklenmeli; varsayılan olarak eklenmez.

### 14.4 `verification_results`

- `id uuid pk`
- `knowledge_entity_id uuid not null fk -> knowledge_entities.id`
- `verification_type_id uuid not null fk -> verification_types.id`
- `status text not null`
- `confidence numeric(5,4)`
- `verified_at timestamptz not null`
- `expires_at timestamptz null`
- `details_json jsonb null`

Indexler:

- `(knowledge_entity_id, verification_type_id, verified_at desc)`
- `(expires_at) where status='verified'`

## 15. Freshness

### 15.1 `freshness_policies`

- `id uuid pk`
- `code text unique not null`
- `ttl_seconds bigint not null`
- `refresh_priority smallint not null`
- `requires_live_verification boolean not null`

### 15.2 `freshness_assignments`

Entity/claim düzeyindeki policy ataması:

- `id uuid pk`
- `knowledge_entity_id uuid not null fk -> knowledge_entities.id`
- `claim_type_id uuid null fk -> claim_types.id`
- `freshness_policy_id uuid not null fk -> freshness_policies.id`
- `last_verified_at timestamptz null`
- `next_refresh_at timestamptz null`

Unique:

- `(knowledge_entity_id, claim_type_id)` null-safe unique uygulanmalı.

Indexler:

- `(next_refresh_at) where next_refresh_at is not null`
- `(freshness_policy_id, next_refresh_at)`

Bu index idle research scheduler'ın ana iş kuyruğu sorgusunu destekler.

## 16. Dış provider referansları

### `external_entity_refs`

- `id uuid pk`
- `knowledge_entity_id uuid not null fk -> knowledge_entities.id on delete cascade`
- `data_source_id uuid not null fk -> data_sources.id`
- `external_id text not null`
- `external_url text null`
- unique `(data_source_id, external_id)`
- unique `(knowledge_entity_id, data_source_id, external_id)`

Index: `(knowledge_entity_id, data_source_id)`.

## 17. Seyahat talebi ve kullanıcı bağlamı

### 17.1 `trip_requests`

Immutable request snapshot yaklaşımı.

- `id uuid pk`
- `user_id uuid null` (auth domain'e FK uygulama entegrasyonunda bağlanır)
- `origin_location geography(point,4326)`
- `target_region_id uuid null fk -> geo_regions.id`
- `starts_on date not null`
- `ends_on date not null`
- `max_radius_km numeric null`
- `budget_amount numeric null`
- `budget_currency char(3) null`
- `preference_snapshot jsonb not null`
- `created_at timestamptz not null`

Constraint: `ends_on >= starts_on`.

Indexler:

- `(target_region_id, starts_on)`
- `(user_id, created_at desc)` entegrasyon sonrası.

### 17.2 `trip_party_members`

- `id uuid pk`
- `trip_request_id uuid not null fk -> trip_requests.id on delete cascade`
- `member_type_id uuid fk -> party_member_types.id`
- `age_years smallint null`
- `mobility_profile_id uuid null`
- `needs_json jsonb null`

Index: `(trip_request_id)`.

## 18. Trip ve plan modeli

### 18.1 `trips`

- `id uuid pk`
- `trip_request_id uuid not null fk -> trip_requests.id on delete restrict`
- `plan_version integer not null`
- `status text not null`
- `generated_at timestamptz not null`
- unique `(trip_request_id, plan_version)`

Index: `(trip_request_id, plan_version desc)`.

### 18.2 `trip_days`

- `id uuid pk`
- `trip_id uuid not null fk -> trips.id on delete cascade`
- `trip_date date not null`
- `day_number smallint not null`
- unique `(trip_id, trip_date)`
- unique `(trip_id, day_number)`

### 18.3 `plan_options`

A/B/C alternatifleri:

- `id uuid pk`
- `trip_day_id uuid not null fk -> trip_days.id on delete cascade`
- `option_code text not null`
- `rank smallint not null`
- `scenario_type_id uuid fk -> plan_scenario_types.id`
- `score numeric(8,4) null`
- unique `(trip_day_id, option_code)`
- unique `(trip_day_id, rank)`

### 18.4 `plan_items`

Polymorphic FK kullanmamak için hedefler ayrı nullable FK'lerdir ve exactly-one check uygulanır.

- `id uuid pk`
- `plan_option_id uuid not null fk -> plan_options.id on delete cascade`
- `sequence_no smallint not null`
- `starts_at timestamptz null`
- `ends_at timestamptz null`
- `place_id uuid null fk -> places.id on delete restrict`
- `event_occurrence_id uuid null fk -> event_occurrences.id on delete restrict`
- `local_item_id uuid null fk -> local_items.id on delete restrict`
- `item_type_id uuid not null fk -> plan_item_types.id`
- `travel_minutes_from_previous integer null`
- `rationale text null`

Constraint:

```text
num_nonnulls(place_id, event_occurrence_id, local_item_id) <= 1
```

Bazı item tipleri (meal break/free time/travel) hedef entity içermeyebilir; bu yüzden `=1` değil `<=1`.

Unique/indexler:

- `unique(plan_option_id, sequence_no)`
- `(place_id) where place_id is not null`
- `(event_occurrence_id) where event_occurrence_id is not null`

## 19. Route ve seyahat süresi cache'i

`place_to_place` özel tablo yerine konum fingerprint'i kullanan cache tercih edilir.

### `route_cache_entries`

- `id uuid pk`
- `origin_hash text not null`
- `destination_hash text not null`
- `travel_mode_id uuid not null`
- `departure_bucket timestamptz null`
- `distance_meters integer not null`
- `duration_seconds integer not null`
- `provider_id uuid null fk -> data_sources.id`
- `calculated_at timestamptz not null`
- `expires_at timestamptz not null`

Unique: `(origin_hash, destination_hash, travel_mode_id, departure_bucket)`.

Index: `(expires_at)` ve lookup unique index.

## 20. Live context snapshotları

Weather/traffic geçici context verileri canonical place özelliğine yazılmamalıdır.

### `environment_context_snapshots`

- `id uuid pk`
- `region_id uuid null fk -> geo_regions.id`
- `location geography(point,4326) null`
- `context_type_id uuid not null`
- `observed_for timestamptz not null`
- `retrieved_at timestamptz not null`
- `expires_at timestamptz not null`
- `payload jsonb not null`

Indexler:

- `(region_id, context_type_id, observed_for desc)`
- `(expires_at)`
- `gist(location)`

Retention policy ile temizlenebilir.

## 21. FK delete politikası

Varsayılan politika: `ON DELETE RESTRICT`.

`ON DELETE CASCADE` yalnızca parent olmadan anlamı kalmayan composition child kayıtlarında:

- subtype dışı saf join tabloları
- trip_days -> plan_options -> plan_items
- place -> operating_hours / exceptions
- event -> event_occurrences

Knowledge/evidence/source geçmişi için cascade kullanılmaz.

`ON DELETE SET NULL` yalnızca gerçekten opsiyonel tarihsel referanslarda ve anlam korunuyorsa kullanılabilir; varsayılan değildir.

## 22. Index stratejisi

### Zorunlu index sınıfları

1. Tüm PK'ler.
2. Yüksek cardinality ve sık join edilen FK'ler.
3. Composite sorgu yolları: region+status, entity+claim, event+date.
4. PostGIS kolonlarında GiST.
5. Aktif/current kayıtlar için partial index.
6. Text search gerekiyorsa `pg_trgm` GIN.

### Kaçınılacaklar

- Her boolean kolona tek başına index.
- Düşük cardinality enum/status alanına bağlamsız tek index.
- JSONB'ye varsayılan GIN.
- Aynı prefix'i tekrar eden gereksiz indexler.

### Ölçüm kuralı

Production-benzeri fixture ile `EXPLAIN (ANALYZE, BUFFERS)` doğrulanmadan yeni performans indexi canonical kabul edilmez.

## 23. Unique ve veri bütünlüğü kuralları

- Join tablolarında duplicate ilişki composite PK ile engellenir.
- Current assessment/freshness kayıtlarında partial unique kullanılır.
- Event occurrence bitiş zamanı başlangıçtan sonra olmalıdır.
- Trip tarih aralığı ters olamaz.
- Score/confidence alanlarında check constraint uygulanır.
- Region self-parent yasaktır.
- Bir place'in en fazla bir primary kategorisi olur.
- Provider external ID kendi source'u içinde unique olur.

## 24. Transaction sınırları

Tek transaction içinde yapılması gereken örnekler:

- `knowledge_entities` + subtype `places/events/local_items` insert.
- Entity + external reference ilk kayıt.
- Trip version + trip_days + plan_options + plan_items publish.

Araştırma fetch'i ile canonical claim promotion aynı uzun transaction içinde tutulmamalıdır; önce source snapshot yazılır, sonra verification/promotion ayrı transaction ile yapılır.

## 25. Concurrency

- Güncelleme yarışları için optimistic locking gereken mutable aggregate'lere `row_version bigint` eklenebilir.
- Idle refresh job'larında `FOR UPDATE SKIP LOCKED` kullanılmalıdır.
- Aynı entity/claim için çift refresh'i engelleyen unique job key veya advisory lock uygulanmalıdır.
- Plan version publish sırasında `(trip_request_id, plan_version)` unique constraint son güvenlik kapısıdır.

## 26. Partitioning

V1'de erken partitioning yapılmaz.

Aşağıdaki tablolar çok büyürse zaman bazlı partition adayıdır:

- `source_documents`
- `evidence_claims`
- `verification_results`
- `environment_context_snapshots`

Partition kararı gerçek büyüme/retention ölçümünden sonra alınmalıdır.

## 27. Postgres extension baseline

Önerilen:

- `pgcrypto` — UUID üretimi gerektiğinde
- `postgis` — geo sorguları
- `pg_trgm` — isim/fuzzy arama

Extension olmayan özelliğe domain doğruluğu bağımlı bırakılmamalıdır; ancak PostGIS bu ürün için canonical geo altyapı adayıdır.

## 28. Ana sorgu yolları

Schema/index tasarımı en az şu sorguları hızlı desteklemelidir:

1. Hedef bölge + radius içindeki aktif place'ler.
2. Tarih aralığında gerçekleşen event occurrence'lar.
3. Çocuk yaşına/mevsime uygun place sıralaması.
4. Açık saat + exception kontrolü.
5. Entity'nin güncel claim/evidence/doğrulama durumu.
6. `next_refresh_at <= now()` olan stale kayıtlar.
7. Bir yöreye özgü yemek/ürünler ve nerede bulunabilecekleri.
8. Plan gününün A/B/C alternatifleri ve sıralı item'ları.
9. Kullanıcı talebine ait en son plan version'u.
10. Radius içindeki park noktaları ve place bağlantıları.

## 29. V1 ER cardinality özeti

- `geo_region 1 -> N geo_region`
- `geo_region 1 -> N place`
- `knowledge_entity 1 -> 0..1 place/event/local_item/parking_facility`
- `place N <-> N place_category`
- `place 1 -> N operating_hour`
- `place 1 -> N operating_exception`
- `place N <-> N parking_facility`
- `place N <-> N local_item`
- `event 1 -> N event_occurrence`
- `event N <-> N place`
- `knowledge_entity 1 -> N evidence_claim`
- `source_document 1 -> N evidence_claim`
- `knowledge_entity 1 -> N verification_result`
- `trip_request 1 -> N trip`
- `trip 1 -> N trip_day`
- `trip_day 1 -> N plan_option`
- `plan_option 1 -> N plan_item`

## 30. Mimari karar özeti

Bu modelin kritik kararları:

1. Evidence/freshness için gerçek FK sağlayan `knowledge_entities` supertype.
2. Coğrafi modelin PostGIS tabanlı olması.
3. Event tanımı ile event occurrence'ın ayrılması.
4. Weekly opening hours ile date-specific exception'ın ayrılması.
5. Local food/product bilgisinin yönetilebilir `local_items` modeli altında tutulması.
6. Kullanıcı planı ile reusable travel knowledge'ın fiziksel olarak ayrılması.
7. Live context'in canonical entity kolonlarına yazılmaması.
8. Hardcoded kategoriler yerine registry/config tabloları.
9. Delete default'unun RESTRICT, composition child'larda CASCADE olması.
10. Indexlerin gerçek sorgu yollarına göre composite/partial/GiST olarak tasarlanması.

## 31. Sonraki adım

Bu doküman onaylandıktan sonra sırasıyla:

1. PostgreSQL physical schema / DDL taslağı,
2. migration standardı,
3. seed/config registry listesi,
4. ER diagram,
5. repository/domain ownership sınırları,
6. referential-integrity test fixture'ları,
7. query-plan/index qualification testleri

hazırlanmalıdır.
