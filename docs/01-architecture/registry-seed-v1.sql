-- Tatil Modu — Registry Seed v1
-- Status: architecture baseline candidate; executable against postgresql-physical-schema-v1.sql
-- Idempotent by canonical code. No destructive deletes. Display names are inserted only on first creation.

BEGIN;

INSERT INTO entity_kinds (code, name, is_active) VALUES
('place','Yer',true),('event','Etkinlik',true),('local_item','Yerel Ürün/Lezzet',true),('parking_facility','Otopark',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO geo_region_types (code, name, hierarchy_level) VALUES
('country','Ülke',0),('province','İl',10),('district','İlçe',20),('town','Belde/Kasaba',30),('neighborhood','Mahalle',40),('locality','Yerleşim/Mevki',50)
ON CONFLICT (code) DO UPDATE SET hierarchy_level = EXCLUDED.hierarchy_level;

INSERT INTO reservation_requirement_types (code,name,is_active) VALUES
('none','Gerekmez',true),('recommended','Önerilir',true),('required','Zorunlu',true),('time_slot_required','Saat Aralığı Zorunlu',true),('unknown','Bilinmiyor',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO parking_types (code,name,is_active) VALUES
('open_lot','Açık Otopark',true),('garage','Kapalı Otopark',true),('street','Sokak Parkı',true),('valet','Vale',true),('park_and_ride','Park Et Devam Et',true),('unknown','Bilinmiyor',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO parking_relationship_types (code,name,is_active) VALUES
('onsite','Yerinde',true),('official_nearby','Resmî Yakın Otopark',true),('nearby_public','Yakın Kamu Otoparkı',true),('alternative','Alternatif',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO local_item_types (code,name,is_active) VALUES
('food','Yemek',true),('dessert','Tatlı',true),('beverage','İçecek',true),('ingredient','Yerel İçerik/Malzeme',true),('handicraft','El Sanatı',true),('souvenir','Hediyelik',true),('local_product','Yerel Ürün',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO local_item_relationship_types (code,name,is_active) VALUES
('served_here','Burada Servis Edilir',true),('sold_here','Burada Satılır',true),('produced_here','Burada Üretilir',true),('best_known_here','Burada Özellikle Bilinir',true),('available_nearby','Yakında Bulunur',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO event_types (code,name,is_active) VALUES
('festival','Festival',true),('fair','Fuar',true),('concert','Konser',true),('cultural_event','Kültürel Etkinlik',true),('sports_event','Spor Etkinliği',true),('food_event','Yeme-İçme Etkinliği',true),('local_celebration','Yerel Kutlama',true),('seasonal_event','Mevsimsel Etkinlik',true),('market_event','Pazar/Çarşı Etkinliği',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO event_place_role_types (code,name,is_active) VALUES
('venue','Etkinlik Alanı',true),('meeting_point','Buluşma Noktası',true),('route_stop','Rota Durağı',true),('nearby_impact_area','Yakın Etki Alanı',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO data_source_types (code,name,is_active) VALUES
('official_public','Resmî Kamu Kaynağı',true),('official_business','Resmî İşletme Kaynağı',true),('map_provider','Harita Sağlayıcısı',true),('weather_provider','Hava Sağlayıcısı',true),('traffic_provider','Trafik Sağlayıcısı',true),('event_provider','Etkinlik Sağlayıcısı',true),('review_platform','Yorum Platformu',true),('editorial_source','Editoryal Kaynak',true),('community_source','Topluluk Kaynağı',true),('manual_curated','Manuel Kürasyon',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO trust_tiers (code,name,rank,is_active) VALUES
('authoritative','Otoritatif',0,true),('high','Yüksek Güven',10,true),('medium','Orta Güven',20,true),('low','Düşük Güven',30,true),('unverified','Doğrulanmamış',40,true)
ON CONFLICT (code) DO UPDATE SET rank=EXCLUDED.rank;

INSERT INTO claim_types (code,name,is_active) VALUES
('identity','Kimlik',true),('location','Konum',true),('opening_hours','Çalışma Saatleri',true),('closure_exception','Özel Kapanış/İstisna',true),('price','Fiyat',true),('reservation','Rezervasyon',true),('parking','Otopark',true),('accessibility','Erişilebilirlik',true),('family_suitability','Aile Uygunluğu',true),('seasonality','Mevsimsellik',true),('event_schedule','Etkinlik Takvimi',true),('crowd','Yoğunluk',true),('local_specialty','Yerel Özellik',true),('contact','İletişim',true),('website','Web Sitesi',true),('visit_duration','Ziyaret Süresi',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO verification_types (code,name,is_active) VALUES
('source_check','Kaynak Kontrolü',true),('cross_source_corroboration','Çapraz Kaynak Doğrulaması',true),('freshness_check','Güncellik Kontrolü',true),('geo_consistency','Coğrafi Tutarlılık',true),('opening_hours_consistency','Çalışma Saati Tutarlılığı',true),('event_date_confirmation','Etkinlik Tarihi Doğrulaması',true),('manual_review','Manuel İnceleme',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO party_member_types (code,name,is_active) VALUES
('adult','Yetişkin',true),('child','Çocuk',true),('infant','Bebek',true),('senior','Yaşlı',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO mobility_profiles (code,name,is_active) VALUES
('standard','Standart',true),('stroller_required','Bebek Arabası Gerekli',true),('limited_walking','Sınırlı Yürüme',true),('wheelchair','Tekerlekli Sandalye',true),('assisted_mobility','Destekli Hareket',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO plan_scenario_types (code,name,is_active) VALUES
('primary','Ana Plan',true),('weather_safe','Hava Güvenli Alternatif',true),('low_crowd','Düşük Kalabalık',true),('low_walking','Düşük Yürüme',true),('budget_friendly','Bütçe Dostu',true),('child_focused','Çocuk Odaklı',true),('indoor_fallback','Kapalı Alan Alternatifi',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO plan_item_types (code,name,allows_targetless,is_active) VALUES
('place_visit','Yer Ziyareti',false,true),('event_visit','Etkinlik Ziyareti',false,true),('local_item_experience','Yerel Deneyim',false,true),('travel','Ulaşım',true,true),('meal_break','Yemek Molası',true,true),('rest_break','Dinlenme Molası',true,true),('free_time','Serbest Zaman',true,true),('buffer','Zaman Tamponu',true,true)
ON CONFLICT (code) DO UPDATE SET allows_targetless=EXCLUDED.allows_targetless;

INSERT INTO travel_modes (code,name,is_active) VALUES
('car','Otomobil',true),('walking','Yürüyüş',true),('public_transport','Toplu Taşıma',true),('taxi','Taksi',true),('bicycle','Bisiklet',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO environment_context_types (code,name,is_active) VALUES
('weather','Hava Durumu',true),('traffic','Trafik',true),('road_closure','Yol Kapanması',true),('air_quality','Hava Kalitesi',true),('crowd_signal','Yoğunluk Sinyali',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO suitability_dimensions (code,name,value_type,is_active) VALUES
('stroller_access','Bebek Arabası Erişimi','score',true),('toddler_interest','Küçük Çocuk İlgisi','score',true),('school_age_interest','Okul Çağı İlgisi','score',true),('elderly_access','Yaşlı Erişimi','score',true),('wheelchair_access','Tekerlekli Sandalye Erişimi','score',true),('restroom_access','Tuvalet Erişimi','score',true),('rest_area_access','Dinlenme Alanı','score',true),('rain_fit','Yağmura Uygunluk','score',true),('heat_fit','Sıcağa Uygunluk','score',true),('cold_fit','Soğuğa Uygunluk','score',true),('winter_fit','Kışa Uygunluk','score',true),('wind_sensitivity','Rüzgâr Hassasiyeti','score',true),('crowd_sensitivity','Kalabalık Hassasiyeti','score',true),('long_walk_burden','Uzun Yürüme Yükü','score',true),('parking_ease','Park Kolaylığı','score',true),('short_visit_fit','Kısa Ziyarete Uygunluk','score',true)
ON CONFLICT (code) DO UPDATE SET value_type=EXCLUDED.value_type;

INSERT INTO freshness_policies (code,ttl_seconds,refresh_priority,requires_live_verification,is_active) VALUES
('very_static',15552000,60,false,true),('static',7776000,50,false,true),('slow_change',2592000,40,false,true),('operational',604800,30,false,true),('event_schedule',259200,20,true,true),('near_live',21600,10,true,true),('live',1800,0,true,true)
ON CONFLICT (code) DO UPDATE SET ttl_seconds=EXCLUDED.ttl_seconds,refresh_priority=EXCLUDED.refresh_priority,requires_live_verification=EXCLUDED.requires_live_verification;

INSERT INTO place_categories (code,name,is_active) VALUES
('culture_history','Kültür ve Tarih',true),('nature','Doğa',true),('water_leisure','Deniz ve Su',true),('family_children','Aile ve Çocuk',true),('urban_experience','Şehir Deneyimi',true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO place_categories (parent_category_id,code,name,is_active)
SELECT p.id,v.code,v.name,true
FROM (VALUES
('culture_history','historical_site','Tarihi Mekân'),('culture_history','museum','Müze'),('culture_history','archaeological_site','Arkeolojik Alan'),('culture_history','religious_site','Dini Mekân'),('culture_history','monument','Anıt'),('culture_history','historic_district','Tarihi Bölge'),
('nature','national_park','Milli Park'),('nature','urban_park','Kent Parkı'),('nature','lake','Göl'),('nature','waterfall','Şelale'),('nature','cave','Mağara'),('nature','forest','Orman'),('nature','viewpoint','Seyir Noktası'),('nature','hiking_area','Yürüyüş Alanı'),
('water_leisure','beach','Plaj'),('water_leisure','women_beach','Kadınlar Plajı'),('water_leisure','marina','Marina'),('water_leisure','thermal_spa','Termal/Spa'),
('family_children','zoo','Hayvanat Bahçesi'),('family_children','aquarium','Akvaryum'),('family_children','science_center','Bilim Merkezi'),('family_children','theme_park','Tema Parkı'),('family_children','play_activity_center','Oyun/Aktivite Merkezi'),
('urban_experience','bazaar_market','Çarşı/Pazar'),('urban_experience','shopping_area','Alışveriş Bölgesi'),('urban_experience','cultural_center','Kültür Merkezi'),('urban_experience','promenade','Gezinti Alanı')
) AS v(parent_code,code,name)
JOIN place_categories p ON p.code=v.parent_code
ON CONFLICT (code) DO UPDATE SET parent_category_id=EXCLUDED.parent_category_id;

COMMIT;
