# Tatil Modu — Registry & Seed Baseline v1

## Durum

**Canonical status:** Domain Model v1 ve PostgreSQL Physical Schema v1 ile birlikte değerlendirilecek architecture baseline adayı.

Bu doküman, Tatil Modu veritabanındaki yönetilebilir registry/config tablolarının başlangıç kodlarını, seed ilkelerini, idempotency kurallarını ve yaşam döngüsünü tanımlar.

## 1. Temel ilke

Registry değerleri uygulama koduna kapalı enum olarak gömülmez. Kod tarafı semantic olarak stabil `code` alanına göre davranabilir; kullanıcıya gösterilen adlar, açıklamalar ve aktiflik durumu veritabanı/config katmanından yönetilir.

Kurallar:

- `code` immutable kabul edilir.
- display `name` değişebilir.
- seed tekrar çalıştırılabilir ve idempotent olmalıdır.
- seed hiçbir production kullanıcı verisini silmez.
- seed canonical code'u rename etmez; yeni code + migration/deprecation yaklaşımı kullanılır.
- aktiflik `is_active`/status ile yönetilir.
- registry satırları normalde hard delete edilmez.

## 2. Seed idempotency standardı

Önerilen pattern:

```sql
INSERT INTO registry_table (code, name, is_active)
VALUES (...)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    is_active = EXCLUDED.is_active;
```

Ancak production'da otomatik update yalnız repo tarafından sahip olunan alanlarla sınırlı olmalıdır. Yönetici tarafından değiştirilebilen metadata alanları seed tarafından ezilmez.

## 3. `entity_kinds`

Başlangıç canonical kodları:

- `place`
- `event`
- `local_item`
- `parking_facility`

V1'de yeni subtype eklenmedikçe başka değer açılmaz.

## 4. `geo_region_types`

Başlangıç hiyerarşisi:

| code | hierarchy_level | açıklama |
|---|---:|---|
| `country` | 0 | Ülke |
| `province` | 10 | İl |
| `district` | 20 | İlçe |
| `town` | 30 | Belde/kasaba |
| `neighborhood` | 40 | Mahalle |
| `locality` | 50 | Köy/mevki/yerleşim |

Level değerleri sıralama içindir; business kuralı yalnız integer karşılaştırmasına bırakılmaz. İzin verilen parent-child kombinasyonları ayrıca registry/policy ile doğrulanmalıdır.

## 5. `place_categories`

V1 çekirdek kategori ağacı:

### Kültür ve tarih
- `culture_history`
- `historical_site`
- `museum`
- `archaeological_site`
- `religious_site`
- `monument`
- `historic_district`

### Doğa
- `nature`
- `national_park`
- `urban_park`
- `lake`
- `waterfall`
- `cave`
- `forest`
- `viewpoint`
- `hiking_area`

### Deniz ve su
- `water_leisure`
- `beach`
- `women_beach`
- `marina`
- `thermal_spa`

### Aile ve çocuk
- `family_children`
- `zoo`
- `aquarium`
- `science_center`
- `theme_park`
- `play_activity_center`

### Şehir deneyimi
- `urban_experience`
- `bazaar_market`
- `shopping_area`
- `cultural_center`
- `promenade`

Bu ağaç başlangıç seed'idir; genişletilebilir. `women_beach` ayrı kategori olarak korunur çünkü planlama açısından semantic değeri vardır.

## 6. `reservation_requirement_types`

- `none`
- `recommended`
- `required`
- `time_slot_required`
- `unknown`

## 7. Parking registry'leri

### `parking_types`
- `open_lot`
- `garage`
- `street`
- `valet`
- `park_and_ride`
- `unknown`

### `parking_relationship_types`
- `onsite`
- `official_nearby`
- `nearby_public`
- `alternative`

## 8. Local item registry'leri

### `local_item_types`
- `food`
- `dessert`
- `beverage`
- `ingredient`
- `handicraft`
- `souvenir`
- `local_product`

### `local_item_relationship_types`
- `served_here`
- `sold_here`
- `produced_here`
- `best_known_here`
- `available_nearby`

## 9. Event registry'leri

### `event_types`
- `festival`
- `fair`
- `concert`
- `cultural_event`
- `sports_event`
- `food_event`
- `local_celebration`
- `seasonal_event`
- `market_event`

### `event_place_role_types`
- `venue`
- `meeting_point`
- `route_stop`
- `nearby_impact_area`

## 10. Suitability dimensions

V1 çekirdek boyutlar:

### Aile / erişilebilirlik
- `stroller_access`
- `toddler_interest`
- `school_age_interest`
- `elderly_access`
- `wheelchair_access`
- `restroom_access`
- `rest_area_access`

### Çevresel uygunluk
- `rain_fit`
- `heat_fit`
- `cold_fit`
- `winter_fit`
- `wind_sensitivity`

### Operasyonel uygunluk
- `crowd_sensitivity`
- `long_walk_burden`
- `parking_ease`
- `short_visit_fit`

`value_type` başlangıçta çoğunlukla `score_0_100` kullanır. Boolean veya structured value gerekiyorsa dimension metadata ile tanımlanır.

## 11. Data source registry'leri

### `data_source_types`
- `official_public`
- `official_business`
- `map_provider`
- `weather_provider`
- `traffic_provider`
- `event_provider`
- `review_platform`
- `editorial_source`
- `community_source`
- `manual_curated`

### `trust_tiers`
Önerilen semantic sıralama:

- `authoritative`
- `high`
- `medium`
- `low`
- `unverified`

Trust tier tek başına claim doğruluğunu belirlemez; source type, freshness ve corroboration birlikte değerlendirilir.

## 12. Claim registry

### `claim_types`
Başlangıç family'leri:

- `identity`
- `location`
- `opening_hours`
- `closure_exception`
- `price`
- `reservation`
- `parking`
- `accessibility`
- `family_suitability`
- `seasonality`
- `event_schedule`
- `crowd`
- `local_specialty`
- `contact`
- `website`
- `visit_duration`

`claim_key` bunun altında daha spesifik alanı belirtir; örn. `opening_hours.monday`, `price.adult`, `parking.capacity`.

## 13. Verification registry

### `verification_types`
- `source_check`
- `cross_source_corroboration`
- `freshness_check`
- `geo_consistency`
- `opening_hours_consistency`
- `event_date_confirmation`
- `manual_review`

## 14. Freshness policy başlangıç seti

Önerilen politikalar:

| code | TTL | canlı doğrulama | tipik kullanım |
|---|---:|---|---|
| `very_static` | 180 gün | hayır | tarihi yapı kimliği, konum |
| `static` | 90 gün | hayır | kategori, genel açıklama |
| `slow_change` | 30 gün | gerekirse | iletişim, park bilgisi |
| `operational` | 7 gün | seyahat öncesi | çalışma saatleri, ücret |
| `event_schedule` | 3 gün | seyahat öncesi | yakın tarihli festival/etkinlik |
| `near_live` | 6 saat | evet | geçici kapanma/yoğunluk sinyali |
| `live` | 30 dk | evet | trafik/hava gibi runtime context |

TTL saniye cinsinden fiziksel seed'de tutulur.

## 15. Party registry'leri

### `party_member_types`
- `adult`
- `child`
- `infant`
- `senior`

### `mobility_profiles`
- `standard`
- `stroller_required`
- `limited_walking`
- `wheelchair`
- `assisted_mobility`

## 16. Plan registry'leri

### `plan_scenario_types`
- `primary`
- `weather_safe`
- `low_crowd`
- `low_walking`
- `budget_friendly`
- `child_focused`
- `indoor_fallback`

### `plan_item_types`
Hedef gerektirenler:
- `place_visit`
- `event_visit`
- `local_item_experience`

Hedef gerektirmeyenler (`allows_targetless=true`):
- `travel`
- `meal_break`
- `rest_break`
- `free_time`
- `buffer`

## 17. Travel mode registry

### `travel_modes`
- `car`
- `walking`
- `public_transport`
- `taxi`
- `bicycle`

V1 rota optimizasyonunda `car` ana senaryodur; diğer modlar destek kabiliyetine göre aktif edilir.

## 18. Live context registry

### `environment_context_types`
- `weather`
- `traffic`
- `road_closure`
- `air_quality`
- `crowd_signal`

## 19. Localization yaklaşımı

V1 seed tablolarındaki `name` Türkçe default olabilir; ancak uzun vadede localized text registry tablosu önerilir:

```text
registry_translations
- registry_namespace
- registry_code
- locale
- display_name
- description
```

Bu yapı uygulanana kadar `code` hiçbir zaman UI etiketi olarak gösterilmez.

## 20. Code yaşam döngüsü

Bir registry code artık kullanılmayacaksa:

1. yeni kayıtlar için kapatılır (`is_active=false`),
2. mevcut FK'ler korunur,
3. gerekiyorsa replacement code metadata ile belirtilir,
4. veri migrasyonu ayrı migration olarak yapılır,
5. hard delete yapılmaz.

## 21. Seed ownership

### Repo-owned
- canonical `code`
- başlangıç parent ilişkileri
- semantic flags (`allows_targetless` gibi)
- hierarchy level

### Yönetilebilir
- display name
- açıklama
- UI sırası
- aktiflik (policy izin veriyorsa)

Repo seed'i yönetilebilir alanları körlemesine overwrite etmemelidir.

## 22. Validation checklist

- [ ] Her FK registry hedefinin seed değeri var.
- [ ] Duplicate `code` yok.
- [ ] Parent category cycle yok.
- [ ] Inactive registry code yeni write path'te seçilemiyor.
- [ ] Seed iki kez çalışınca aynı sonucu veriyor.
- [ ] Seed rollback gerektirmeden forward-fix edilebilir.
- [ ] `allows_targetless` plan-item semantic trigger ile uyumlu.
- [ ] Freshness TTL değerleri scheduler sorgularıyla uyumlu.
- [ ] UI hiçbir yerde `code` değerini display label olarak kullanmıyor.

## 23. Sonraki adım

Bu baseline'dan sonra:

1. executable idempotent seed SQL,
2. semantic constraint trigger DDL,
3. ER diagram,
4. referential-integrity fixture suite,
5. query benchmark fixture

hazırlanmalıdır.
