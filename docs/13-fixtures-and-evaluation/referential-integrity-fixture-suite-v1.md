# Tatil Modu — Referential Integrity Fixture Suite v1

## Durum

**Canonical status:** Domain Model v1 doğrulama baseline adayı.

Amaç, physical schema + registry seed + semantic constraint trigger katmanının yalnız normal akışta değil, bilerek bozulmaya çalışıldığında da referential ve semantic integrity'yi koruduğunu kanıtlamaktır.

## 1. Test ilkeleri

- Her test izole transaction içinde çalışır ve rollback edilir.
- Başarısız olması gereken SQL gerçekten hata üretmezse test FAIL kabul edilir.
- Constraint/trigger adı mümkünse beklenen hata ile eşleştirilir.
- Seed iki kez çalıştırılır; ikinci çalıştırma veri sayısını değiştirmemelidir.
- Fixture UUID'leri deterministik olabilir; production ID üretim davranışını taklit etmek zorunlu değildir.
- Testler uygulama ORM'sine bağlı kalmamalı; en az bir saf PostgreSQL harness bulunmalıdır.

## 2. Gate seviyeleri

### L1 — Schema boot
- extension'lar yüklenir,
- physical schema temiz DB'ye uygulanır,
- registry seed uygulanır,
- semantic trigger DDL uygulanır.

### L2 — Referential integrity
- FK,
- unique,
- check,
- cascade/restrict davranışları.

### L3 — Semantic integrity
- subtype kind,
- plan target semantics,
- trip date/day number,
- geo hierarchy.

### L4 — Temporal/freshness
- current record uniqueness,
- validity order,
- duplicate freshness assignment,
- event occurrence uniqueness.

### L5 — Query/index smoke
- ana sorguların index kullanımı ve explain plan kontrolleri.

## 3. Geography testleri

### GEO-001 self-parent reddedilir
`geo_regions.parent_region_id = id` insert/update reddedilmeli.

### GEO-002 cycle reddedilir
Province -> district -> locality zincirinde locality parent olarak province'in atasını döngüye sokacak update reddedilmeli.

### GEO-003 yanlış hierarchy parent reddedilir
`district` parent'ı `neighborhood` olamaz.

### GEO-004 duplicate sibling reddedilir
Aynı parent/type/country altında aynı normalized name ikinci kez eklenememeli.

### GEO-005 parent RESTRICT
Child region varken parent hard delete reddedilmeli.

## 4. Knowledge subtype testleri

### KNO-001 place kind doğru
`knowledge_entities(kind=place)` + `places` insert PASS.

### KNO-002 yanlış subtype kind reddedilir
`knowledge_entities(kind=event)` id'si ile `places` insert COMMIT aşamasında reddedilmeli.

### KNO-003 event/local_item/parking karşılıkları
Her subtype için yanlış kind negatif testi ayrı çalışmalı.

### KNO-004 dangling subtype mümkün değil
`places` içinde olmayan knowledge entity id'si FK nedeniyle reddedilmeli.

### KNO-005 active slug uniqueness
Aynı kind altında iki aktif entity aynı slug ile oluşturulamamalı.

### KNO-006 retired slug davranışı
Retired entity varsa aynı slug yeni active entity için policy'ye göre izin verilen davranış doğrulanmalı.

## 5. Place/category/parking/local item testleri

### PLC-001 duplicate category link reddedilir
Composite PK çalışmalı.

### PLC-002 tek primary category
Bir place için iki `is_primary=true` link reddedilmeli.

### PLC-003 category delete RESTRICT
Bağlı category silinememeli.

### PLC-004 operating hour weekday check
-1 veya 7 reddedilmeli.

### PLC-005 operating exception uniqueness
Aynı place/date ikinci exception reddedilmeli.

### PLC-006 parking link reverse integrity
Olmayan parking facility id ile link eklenememeli.

### PLC-007 local item link duplicate reddedilir
Composite PK ilişki tipine göre duplicate'i engellemeli.

## 6. Event testleri

### EVT-001 occurrence time order
`ends_at <= starts_at` reddedilmeli.

### EVT-002 duplicate event/start
Aynı event için aynı starts_at ikinci occurrence reddedilmeli.

### EVT-003 event delete cascade occurrence
Event lifecycle test fixture'ında hard-delete testine izin verilen controlled fixture senaryosunda occurrences CASCADE davranışı doğrulanmalı.

### EVT-004 place delete restrict when event linked
Event-place link varsa place hard delete reddedilmeli.

## 7. Suitability/seasonality testleri

### SUIT-001 score range
0 altı / 100 üstü reddedilmeli.

### SUIT-002 confidence range
0..1 dışında reddedilmeli.

### SUIT-003 current uniqueness
Aynı place+dimension için iki `valid_to is null` kayıt reddedilmeli.

### SUIT-004 history allowed
Önceki kayıt kapatıldıktan sonra yeni current kayıt PASS.

### SUIT-005 season month range
0/13 reddedilmeli.

## 8. Evidence/freshness testleri

### EVD-001 evidence without source reddedilir
FK enforcement.

### EVD-002 source delete restrict
Evidence bağlı source document silinemez.

### EVD-003 confidence range
Geçersiz confidence reddedilir.

### EVD-004 freshness null-safe uniqueness
Aynı entity için `claim_type_id NULL` iki assignment oluşturulamaz.

### EVD-005 claim-scoped freshness
Aynı entity için farklı claim type assignment'ları PASS.

### EVD-006 provider external id uniqueness
Aynı source içinde duplicate external id reddedilir.

## 9. Trip/runtime testleri

### TRIP-001 request date order
`ends_on < starts_on` reddedilir.

### TRIP-002 duplicate plan version
Aynı request/version iki kez oluşturulamaz.

### TRIP-003 day date outside request reddedilir
Semantic trigger.

### TRIP-004 day number mismatch reddedilir
Örn. starts_on 2026-09-10, trip_date 2026-09-12 iken day_number=2 reddedilir; 3 PASS.

### TRIP-005 duplicate day date/rank/sequence
İlgili unique constraint'ler ayrı test edilir.

### TRIP-006 target-required item targetless reddedilir
`place_visit` + sıfır target FAIL.

### TRIP-007 targetless item targetless geçer
`meal_break` + sıfır target PASS.

### TRIP-008 multiple target reddedilir
place + event occurrence aynı item'da FAIL.

### TRIP-009 target kind coherence
`event_visit` için place target verilmesi semantic policy varsa FAIL; bu kural trigger v2'de item-type allowed-target metadata ile genişletilmelidir.

## 10. Delete behavior matrix tests

En az şu davranışlar otomatik doğrulanır:

| Parent | Child | Beklenen |
|---|---|---|
| trip | trip_day | CASCADE |
| trip_day | plan_option | CASCADE |
| plan_option | plan_item | CASCADE |
| place | operating_hours | CASCADE |
| event | event_occurrence | CASCADE |
| place_category | place_category_link | RESTRICT parent delete |
| knowledge_entity | evidence_claim | RESTRICT |
| source_document | evidence_claim | RESTRICT |
| geo_region | place | RESTRICT |

## 11. Seed idempotency tests

### SEED-001 first apply
Seed clean schema'da PASS.

### SEED-002 second apply
Aynı seed ikinci kez PASS; row count ve canonical code set değişmez.

### SEED-003 repo-owned semantic field repair
Örn. `plan_item_types.allows_targetless` canonical değerden sapmışsa seed'in policy'ye uygun onarım davranışı doğrulanır.

### SEED-004 managed display text preservation
Admin tarafından değiştirilen `name` seed rerun ile ezilmemeli.

## 12. Index/query smoke testleri

Minimum sorgular:

1. radius içindeki active places → GiST location.
2. date range event occurrences → starts_at/status composite.
3. due freshness assignments → partial due index.
4. current suitability lookup → partial unique/current index.
5. evidence entity+claim history → composite index.
6. latest trip version → `(trip_request_id, plan_version desc)`.
7. canonical name fuzzy search → trigram GIN.

`EXPLAIN (ANALYZE, BUFFERS)` çıktısı fixture raporuna eklenir.

## 13. Test veri seti minimumu

- 2 ülke/province zinciri gerekmiyor; Türkiye fixture'ı yeterli.
- 2 province, her birinde 2 district.
- 20 place.
- 5 event, 10 occurrence.
- 10 local item.
- 5 parking facility.
- 100 evidence claim.
- 20 freshness assignment.
- 3 trip request, her biri 2-3 version.
- Her trip için 2-5 day, 3 option/day, 4-8 item/option.

Bu küçük dataset correctness içindir; benchmark fixture daha büyük olmalıdır.

## 14. PASS kriteri

Suite PASS için:

- tüm positive case'ler başarılı,
- tüm negative case'ler beklenen DB katmanında reddedilmiş,
- hiçbir dangling FK oluşmamış,
- seed idempotent,
- delete matrix beklenen sonucu vermiş,
- semantic trigger testleri commit/deferred aşamada çalışmış,
- query smoke'larda beklenen index ailesi gözlemlenmiş olmalıdır.

## 15. Sonraki adım

Bu dokümanın executable karşılığı SQL/pgTAP veya repo'nun mevcut test harness'ine bağlanarak oluşturulmalıdır. Ardından query benchmark fixture ve migration upgrade/downgrade smoke testleri eklenir.
