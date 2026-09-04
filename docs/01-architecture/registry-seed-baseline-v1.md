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
- registry satırları normalde hard delete edilmez.

## 2. Seed ownership ve idempotency

Repo-owned alanlar:

- canonical `code`
- kategori parent ilişkileri
- `hierarchy_level`
- `allows_targetless`
- suitability `value_type`
- freshness TTL/priority/live-verification flag

Yönetilebilir alanlar:

- display `name`
- description
- UI order
- policy izin veriyorsa aktiflik

Bu nedenle seed tekrar çalıştığında repo-owned semantic alanları düzeltir; yönetilebilir metinleri körlemesine overwrite etmez.

## 3. `entity_kinds`

- `place`
- `event`
- `local_item`
- `parking_facility`

## 4. `geo_region_types`

| code | hierarchy_level |
|---|---:|
| `country` | 0 |
| `province` | 10 |
| `district` | 20 |
| `town` | 30 |
| `neighborhood` | 40 |
| `locality` | 50 |

Hiyerarşi integer karşılaştırmasına bırakılmaz; parent-child geçişleri semantic constraint ile korunur.

## 5. `place_categories`

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

`women_beach` ayrı semantic kategori olarak korunur.

## 6. Rezervasyon

`reservation_requirement_types`:

- `none`
- `recommended`
- `required`
- `time_slot_required`
- `unknown`

## 7. Otopark

`parking_types`:

- `open_lot`
- `garage`
- `street`
- `valet`
- `park_and_ride`
- `unknown`

`parking_relationship_types`:

- `onsite`
- `official_nearby`
- `nearby_public`
- `alternative`

## 8. Yerel ürün ve lezzet

`local_item_types`:

- `food`
- `dessert`
- `beverage`
- `ingredient`
- `handicraft`
- `souvenir`
- `local_product`

`local_item_relationship_types`:

- `served_here`
- `sold_here`
- `produced_here`
- `best_known_here`
- `available_nearby`

## 9. Etkinlik

`event_types`:

- `festival`
- `fair`
- `concert`
- `cultural_event`
- `sports_event`
- `food_event`
- `local_celebration`
- `seasonal_event`
- `market_event`

`event_place_role_types`:

- `venue`
- `meeting_point`
- `route_stop`
- `nearby_impact_area`

## 10. Suitability dimensions

Aile/erişilebilirlik:

- `stroller_access`
- `toddler_interest`
- `school_age_interest`
- `elderly_access`
- `wheelchair_access`
- `restroom_access`
- `rest_area_access`

Çevresel:

- `rain_fit`
- `heat_fit`
- `cold_fit`
- `winter_fit`
- `wind_sensitivity`

Operasyonel:

- `crowd_sensitivity`
- `long_walk_burden`
- `parking_ease`
- `short_visit_fit`

V1 physical schema ile uyumlu `value_type='score'` kullanılır.

## 11. Veri kaynağı ve trust

`data_source_types`:

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

`trust_tiers`, küçük rank daha yüksek güven olacak şekilde:

- `authoritative` = 0
- `high` = 10
- `medium` = 20
- `low` = 30
- `unverified` = 40

## 12. Claim ve verification

`claim_types`:

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

`verification_types`:

- `source_check`
- `cross_source_corroboration`
- `freshness_check`
- `geo_consistency`
- `opening_hours_consistency`
- `event_date_confirmation`
- `manual_review`

## 13. Freshness policy seti

| code | TTL | priority | live verification |
|---|---:|---:|---|
| `very_static` | 180 gün | 60 | hayır |
| `static` | 90 gün | 50 | hayır |
| `slow_change` | 30 gün | 40 | hayır |
| `operational` | 7 gün | 30 | hayır |
| `event_schedule` | 3 gün | 20 | evet |
| `near_live` | 6 saat | 10 | evet |
| `live` | 30 dk | 0 | evet |

Düşük `refresh_priority` değeri scheduler açısından daha yüksek öncelik anlamına gelir.

## 14. Seyahat grubu

`party_member_types`:

- `adult`
- `child`
- `infant`
- `senior`

`mobility_profiles`:

- `standard`
- `stroller_required`
- `limited_walking`
- `wheelchair`
- `assisted_mobility`

## 15. Planlama

`plan_scenario_types`:

- `primary`
- `weather_safe`
- `low_crowd`
- `low_walking`
- `budget_friendly`
- `child_focused`
- `indoor_fallback`

Hedef gerektiren `plan_item_types`:

- `place_visit`
- `event_visit`
- `local_item_experience`

`allows_targetless=true` olanlar:

- `travel`
- `meal_break`
- `rest_break`
- `free_time`
- `buffer`

## 16. Travel modes

- `car`
- `walking`
- `public_transport`
- `taxi`
- `bicycle`

## 17. Live environment context

- `weather`
- `traffic`
- `road_closure`
- `air_quality`
- `crowd_signal`

## 18. Localization

V1 `name` alanında Türkçe başlangıç değeri kullanabilir. `code` hiçbir zaman UI etiketi değildir. Çok dillilik geldiğinde ayrı translation katmanı kullanılmalıdır.

## 19. Code yaşam döngüsü

Bir code kaldırılacaksa:

1. yeni write path'te kapatılır,
2. mevcut FK'ler korunur,
3. gerekiyorsa replacement code tanımlanır,
4. veri migrasyonu ayrı migration ile yapılır,
5. hard delete yapılmaz.

## 20. Validation checklist

- [ ] Her FK registry hedefi seedleniyor.
- [ ] Duplicate `code` yok.
- [ ] Parent category cycle yok.
- [ ] Seed iki kez çalışınca aynı semantic sonucu veriyor.
- [ ] Semantic alanlar physical schema ile birebir uyumlu.
- [ ] `allows_targetless` trigger kuralıyla uyumlu.
- [ ] Freshness TTL/priority scheduler ile uyumlu.
- [ ] UI `code` değerini display label olarak göstermiyor.

## 21. Executable baseline

İdempotent SQL karşılığı: [`registry-seed-v1.sql`](registry-seed-v1.sql).

## 22. Sonraki adım

1. semantic constraint trigger DDL,
2. ER diagram,
3. referential-integrity fixture suite,
4. query benchmark fixture.
