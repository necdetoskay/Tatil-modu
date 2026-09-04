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
9. Registry/config seed'leri `registry-seed-baseline-v1.md` ve `registry-seed-v1.sql` sözleşmesine uyar; hard delete veya code rename yapmaz.

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

Validation atlanamaz. FK delete davranışı explicit yazılır. Varsayılan `ON DELETE RESTRICT`.

## 5. Index standardı

- Constraint'i destekleyen unique indexler migration ile birlikte oluşturulur.
- Büyük canlı tabloda gerektiğinde `CREATE INDEX CONCURRENTLY` kullanılır.
- Redundant prefix index eklenmez.
- FK kolonları otomatik indexlenmiş varsayılmaz.
- JSONB GIN varsayılan değildir.
- Geo radius/intersection sorgularında GiST canonical'dır.

Her performans indexi production-benzeri fixture üzerinde `EXPLAIN (ANALYZE, BUFFERS)` ile kanıtlanmalıdır.

## 6. NOT NULL rollout

1. nullable kolon ekle,
2. write path'i dolduracak şekilde deploy et,
3. backfill et,
4. null kalmadığını doğrula,
5. `NOT NULL` uygula.

## 7. Rename / contract değişiklikleri

1. yeni alanı ekle,
2. geçici compatibility path,
3. backfill,
4. yeni path'i canonical yap,
5. eski kullanım sıfırlanınca eski alanı kaldır.

Kalıcı dual-write oluşturulmaz.

## 8. Semantic subtype integrity

`knowledge_entities` için zorunlu semantic kurallar:

- `places.id` → `entity_kind = place`
- `events.id` → `entity_kind = event`
- `local_items.id` → `entity_kind = local_item`
- `parking_facilities.id` → `entity_kind = parking_facility`

Bu kural application convention değildir. Production migration'da **DEFERRABLE CONSTRAINT TRIGGER** veya eşdeğer güvenilir DB mekanizması kullanılır.

## 9. Plan item semantic integrity

- `plan_item_types.allows_targetless = true` ise sıfır target kabul edilebilir,
- aksi halde tam olarak bir target zorunludur.

Cross-table kural constraint trigger ile doğrulanır.

## 10. Trip date integrity

`trip_days.trip_date`, bağlı request tarih aralığı dışında olamaz.

```text
day_number = (trip_date - starts_on) + 1
```

DB tarafında korunur.

## 11. Geo hierarchy integrity

- cycle oluşamaz,
- parent hierarchy child seviyesinden yukarıda olmalıdır,
- izin verilen parent-child tipleri policy ile tanımlanmalıdır.

## 12. Temporal integrity

- `valid_to > valid_from`,
- business key başına bir current kayıt,
- gerekli alanlarda temporal overlap engeli.

`operating_hours` için exclusion constraint production öncesi değerlendirilir.

## 13. Freshness scheduler concurrency

```sql
SELECT ...
FROM freshness_assignments
WHERE next_refresh_at <= now()
ORDER BY next_refresh_at
FOR UPDATE SKIP LOCKED;
```

Aynı entity/claim refresh işinin paralel çalışması engellenir.

## 14. Registry seed rollout

Registry seed şema migration'ından sonra, domain business data yüklenmeden önce uygulanır.

Kurallar:

- seed idempotent olmalıdır,
- canonical `code` rename edilmez,
- seed hard delete yapmaz,
- semantic repo-owned alanlar düzeltilebilir,
- yönetilebilir display metadata körlemesine overwrite edilmez,
- parent category ilişkileri child seed'den önce root seed ile hazırlanır,
- seed ikinci kez çalıştırılarak idempotency testi yapılır.

## 15. Data backfill standardı

Backfill:

- idempotent,
- batch'li,
- resumable,
- progress ölçülebilir,
- production yükü kontrollü

olmalıdır.

## 16. Destructive migration gate

Aşağıdakiler destructive kabul edilir:

- `DROP TABLE`
- `DROP COLUMN`
- veri kaybettirecek type conversion
- geniş kapsamlı cascade delete değişikliği
- unique eklenirken duplicate cleanup
- registry code hard delete/rename

PR'da etkilenen veri, backup/restore, rollback, cleanup ve validation sorguları bulunur.

## 17. Migration validation checklist

- [ ] DDL temiz DB üzerinde uygulanıyor.
- [ ] Önceki canonical schema'dan upgrade uygulanıyor.
- [ ] FK hedefleri mevcut.
- [ ] FK delete davranışları explicit.
- [ ] Unique/check constraint testleri var.
- [ ] Semantic constraint trigger testleri var.
- [ ] Invalid insert/update reddediliyor.
- [ ] Registry seed iki kez uygulanabiliyor.
- [ ] Seed/config dependency sırası doğrulanıyor.
- [ ] Rollback/forward-fix tanımlı.
- [ ] Index planı ölçülmüş.
- [ ] Lock/table rewrite riski değerlendirilmiş.

## 18. Production schema gate

`postgresql-physical-schema-v1.sql` doğrudan production migration değildir.

Production'a geçiş için:

1. registry seed baseline + executable seed SQL,
2. migration slice planı,
3. semantic constraint trigger DDL,
4. migration test harness,
5. referential-integrity fixture suite,
6. query benchmark fixture,
7. `EXPLAIN (ANALYZE, BUFFERS)` raporu,
8. rollback/restore smoke testi

tamamlanmalıdır.
