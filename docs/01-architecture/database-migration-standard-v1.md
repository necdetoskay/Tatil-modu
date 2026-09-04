# Tatil Modu — Database Migration Standard v1

## Durum

**Canonical status:** Domain Model v1 ile birlikte değerlendirilecek architecture baseline adayı.

Bu standart, `domain-model-v1.md` ve `postgresql-physical-schema-v1.sql` şemasının production migration'larına nasıl dönüştürüleceğini tanımlar.

## 1. Temel ilkeler

1. Migration'lar immutable'dır; merge edilmiş migration dosyası sonradan değiştirilmez.
2. Her migration tek amaçlı ve geri izlenebilir olmalıdır.
3. Schema değişiklikleri uygulama deployment'ından bağımsız düşünülmelidir.
4. Expand → migrate/backfill → contract yaklaşımı varsayılandır.
5. Büyük tabloda uzun exclusive lock oluşturacak DDL doğrudan uygulanmaz.
6. Referential integrity uygulama koduna bırakılmaz.
7. Cross-table semantic integrity mümkün olduğunda constraint trigger ile DB tarafında korunur.
8. Destructive migration için veri kaybı analizi ve rollback/restore planı zorunludur.

## 2. Dosya isim standardı

Öneri:

```text
YYYYMMDDHHMM__short_description.sql
```

Örnek:

```text
202609040730__create_travel_knowledge_core.sql
202609040745__create_evidence_freshness_tables.sql
```

Her dosya header olarak şunları içermelidir:

- migration amacı,
- bağlı issue/PR,
- dependency,
- lock riski,
- rollback yaklaşımı,
- backfill gereksinimi.

## 3. Transaction standardı

Varsayılan migration transaction içinde çalışır.

Transaction dışında çalışması gerekebilecek işlemler açıkça ayrılır:

- `CREATE INDEX CONCURRENTLY`
- `DROP INDEX CONCURRENTLY`
- operasyonel olarak uzun sürebilecek bazı bakım adımları

Transaction dışına çıkmak migration framework'ünde özel olarak işaretlenmelidir.

## 4. FK oluşturma standardı

Yeni büyük tablolarda güvenli rollout için gerekirse:

```sql
ALTER TABLE child
  ADD CONSTRAINT fk_child_parent
  FOREIGN KEY (parent_id)
  REFERENCES parent(id)
  ON DELETE RESTRICT
  NOT VALID;
```

Daha sonra:

```sql
ALTER TABLE child VALIDATE CONSTRAINT fk_child_parent;
```

Bu yöntem yalnızca rollout/lock yönetimi için kullanılır; validation atlanamaz.

FK delete davranışı explicit yazılmalıdır. Varsayılan: `ON DELETE RESTRICT`.

## 5. Index standardı

- Constraint'i destekleyen unique indexler migration ile birlikte oluşturulur.
- Büyük canlı tabloda normal `CREATE INDEX` yerine gerektiğinde `CREATE INDEX CONCURRENTLY` kullanılır.
- Aynı sorgu prefix'ini tekrar eden redundant index eklenmez.
- FK kolonları otomatik indexlenmiş varsayılmaz; sorgu ve join yönüne göre ayrıca değerlendirilir.
- JSONB GIN index varsayılan değildir.
- Geo kolonlarındaki radius/intersection sorguları için GiST canonical'dır.

Her performans indexi production-benzeri fixture üzerinde `EXPLAIN (ANALYZE, BUFFERS)` ile kanıtlanmalıdır.

## 6. NOT NULL rollout

Canlı ve dolu tabloda yeni zorunlu kolon ekleme sırası:

1. nullable kolon ekle,
2. yeni write path'i kolonu dolduracak şekilde deploy et,
3. backfill et,
4. null kalan kayıt olmadığını doğrula,
5. `NOT NULL` constraint'i uygula.

Tek adımda tablo rewrite/uzun lock yaratabilecek değişikliklerden kaçınılır.

## 7. Rename / contract değişiklikleri

Kolon veya tablo rename doğrudan breaking change olarak uygulanmamalıdır.

Varsayılan:

1. yeni alanı ekle,
2. dual-read veya geçici compatibility path,
3. backfill,
4. yeni path'i canonical yap,
5. eski kullanım telemetry ile sıfırlandıktan sonra eski alanı kaldır.

Kalıcı dual-write mimarisi oluşturulmaz.

## 8. Semantic subtype integrity

`knowledge_entities` supertype yapısında yalnız FK yeterli değildir.

Zorunlu semantic kurallar:

- `places.id` → `knowledge_entities.entity_kind = place`
- `events.id` → `entity_kind = event`
- `local_items.id` → `entity_kind = local_item`
- `parking_facilities.id` → `entity_kind = parking_facility`

Bu kural application convention olarak bırakılmaz.

Implementation migration'da **DEFERRABLE CONSTRAINT TRIGGER** veya eşdeğer güvenilir DB mekanizması kullanılmalıdır. Deferrable olması, knowledge entity + subtype satırının aynı transaction içinde güvenli oluşturulabilmesini sağlar.

## 9. Plan item semantic integrity

`plan_items` basit constraint ile aynı anda birden fazla target seçilmesini engeller.

Ek semantic kural:

- `plan_item_types.allows_targetless = true` ise sıfır target kabul edilebilir,
- aksi halde tam olarak bir target zorunludur.

Bu cross-table kural constraint trigger ile doğrulanmalıdır.

## 10. Trip date integrity

`trip_days.trip_date`, bağlı `trip_request.starts_on..ends_on` aralığının dışında olamaz.

Ayrıca `day_number`, tarihle mantıksal olarak uyuşmalıdır.

Önerilen doğrulama:

```text
day_number = (trip_date - starts_on) + 1
```

Bu kural publish transaction'ında DB tarafında korunmalıdır.

## 11. Geo hierarchy integrity

`parent_region_id <> id` tek başına yeterli değildir.

Production migration öncesinde şu kurallar eklenmelidir:

- cycle oluşamaz,
- parent hierarchy level child seviyesinden yukarıda olmalıdır,
- izin verilen parent-child tipleri registry/config ile tanımlanmalıdır.

Cycle kontrolü recursive CTE kullanan constraint trigger veya kontrollü repository write path + DB guard ile uygulanmalıdır.

## 12. Temporal integrity

Temporal tablolar için:

- `valid_to > valid_from`,
- aynı business key için birden fazla current kayıt olmaması,
- gerekli alanlarda temporal overlap engeli

değerlendirilmelidir.

Özellikle `operating_hours` için aynı place/weekday/season aralığında çakışan active validity kayıtları production öncesinde exclusion constraint adayıdır.

## 13. Freshness scheduler concurrency

Due kayıt seçimi:

```sql
SELECT ...
FROM freshness_assignments
WHERE next_refresh_at <= now()
ORDER BY next_refresh_at, ...
FOR UPDATE SKIP LOCKED;
```

Aynı entity/claim refresh işinin paralel iki worker tarafından çalıştırılması engellenmelidir.

## 14. Data backfill standardı

Backfill:

- idempotent,
- batch'li,
- resumable,
- progress ölçülebilir,
- production yükünü sınırlayan
şekilde tasarlanmalıdır.

Tek transaction içinde milyonlarca kayıt güncellemek yasaktır.

## 15. Destructive migration gate

Aşağıdakiler destructive kabul edilir:

- `DROP TABLE`
- `DROP COLUMN`
- veri kaybettirecek type conversion
- geniş kapsamlı cascade delete değişikliği
- unique constraint eklenirken duplicate temizliği

Bu değişiklikler için PR'da açıkça:

- etkilenen veri,
- backup/restore yolu,
- rollback imkânı,
- cleanup sorgusu,
- doğrulama sorgusu
bulunmalıdır.

## 16. Migration validation checklist

Her migration için minimum kontrol:

- [ ] DDL temiz DB üzerinde uygulanıyor.
- [ ] Bir önceki canonical schema'dan upgrade uygulanıyor.
- [ ] FK hedefleri mevcut.
- [ ] FK delete davranışları explicit.
- [ ] Unique/check constraint testleri var.
- [ ] Semantic constraint trigger testleri var.
- [ ] Invalid insert/update gerçekten reddediliyor.
- [ ] Rollback/forward-fix stratejisi tanımlı.
- [ ] Index kullanım planı ölçülmüş.
- [ ] Lock ve table rewrite riski değerlendirilmiş.
- [ ] Seed/config dependency sırası doğrulanmış.

## 17. Production schema gate

`postgresql-physical-schema-v1.sql` doğrudan production migration olarak çalıştırılmaz.

Production'a geçiş için sırasıyla:

1. registry seed dokümanı,
2. migration slice planı,
3. semantic constraint trigger DDL,
4. migration test harness,
5. referential-integrity fixture suite,
6. query benchmark fixture,
7. `EXPLAIN (ANALYZE, BUFFERS)` raporu,
8. rollback/restore smoke testi

tamamlanmalıdır.
