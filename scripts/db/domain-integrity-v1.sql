-- Tatil Modu — Executable Domain Integrity Harness v1
-- Prerequisites, in order:
--   1) docs/01-architecture/postgresql-physical-schema-v1.sql
--   2) docs/01-architecture/registry-seed-v1.sql (safe to run repeatedly)
--   3) docs/01-architecture/plan-item-target-contract-v1.sql
--   4) docs/01-architecture/semantic-constraint-triggers-v1.sql
--
-- Run with: psql -v ON_ERROR_STOP=1 -f scripts/db/domain-integrity-v1.sql

\set ON_ERROR_STOP on

-- Force DEFERRABLE semantic constraint triggers to fire at statement end so
-- negative cases can be asserted inside PL/pgSQL subtransactions.
SET CONSTRAINTS ALL IMMEDIATE;

CREATE OR REPLACE FUNCTION pg_temp.expect_failure(
  p_label text,
  p_sql text,
  p_expected_state text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_state text;
  v_message text;
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS
      v_state = RETURNED_SQLSTATE,
      v_message = MESSAGE_TEXT;

    IF p_expected_state IS NOT NULL AND v_state <> p_expected_state THEN
      RAISE EXCEPTION '[%] expected SQLSTATE %, got %: %',
        p_label, p_expected_state, v_state, v_message;
    END IF;

    RAISE NOTICE 'PASS negative: % -> SQLSTATE %', p_label, v_state;
    RETURN;
  END;

  RAISE EXCEPTION '[%] expected failure, statement succeeded', p_label;
END;
$$;

-- -------------------------------------------------------------------------
-- Stable fixture IDs
-- -------------------------------------------------------------------------
-- geo
-- country  10000000-0000-0000-0000-000000000001
-- province 10000000-0000-0000-0000-000000000002
-- district 10000000-0000-0000-0000-000000000003
-- neighb.   10000000-0000-0000-0000-000000000004
-- entities
-- place     20000000-0000-0000-0000-000000000001
-- wrong KE  20000000-0000-0000-0000-000000000002
-- event     20000000-0000-0000-0000-000000000003

-- -------------------------------------------------------------------------
-- L1: seed sanity / required registry codes
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_missing integer;
BEGIN
  SELECT count(*) INTO v_missing
  FROM (VALUES
    ('place'),('event'),('local_item'),('parking_facility')
  ) AS required(code)
  WHERE NOT EXISTS (SELECT 1 FROM entity_kinds e WHERE e.code = required.code);

  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'missing required entity_kinds: %', v_missing;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM plan_item_types WHERE code='place_visit' AND allows_targetless=false) THEN
    RAISE EXCEPTION 'plan_item_types.place_visit seed missing or semantically invalid';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM plan_item_type_allowed_targets a
    JOIN plan_item_types pit ON pit.id=a.plan_item_type_id AND pit.code='event_visit'
    JOIN plan_target_types ptt ON ptt.id=a.plan_target_type_id AND ptt.code='event_occurrence'
  ) THEN
    RAISE EXCEPTION 'event_visit -> event_occurrence target contract missing';
  END IF;
END;
$$;

-- -------------------------------------------------------------------------
-- L2/L3: Geography
-- -------------------------------------------------------------------------
INSERT INTO geo_regions(id,parent_region_id,region_type_id,country_code,name,normalized_name,status)
SELECT '10000000-0000-0000-0000-000000000001',NULL,id,'TR','Türkiye','turkiye','active'
FROM geo_region_types WHERE code='country';

INSERT INTO geo_regions(id,parent_region_id,region_type_id,country_code,name,normalized_name,status)
SELECT '10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',id,'TR','Kocaeli','kocaeli','active'
FROM geo_region_types WHERE code='province';

INSERT INTO geo_regions(id,parent_region_id,region_type_id,country_code,name,normalized_name,status)
SELECT '10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',id,'TR','İzmit','izmit','active'
FROM geo_region_types WHERE code='district';

INSERT INTO geo_regions(id,parent_region_id,region_type_id,country_code,name,normalized_name,status)
SELECT '10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000003',id,'TR','Merkez','merkez','active'
FROM geo_region_types WHERE code='neighborhood';

SELECT pg_temp.expect_failure(
  'GEO-001 self-parent',
  $$UPDATE geo_regions SET parent_region_id=id WHERE id='10000000-0000-0000-0000-000000000003'$$,
  '23514'
);

SELECT pg_temp.expect_failure(
  'GEO-003 invalid parent hierarchy',
  $$UPDATE geo_regions SET parent_region_id='10000000-0000-0000-0000-000000000004' WHERE id='10000000-0000-0000-0000-000000000003'$$,
  '23514'
);

SELECT pg_temp.expect_failure(
  'GEO-004 duplicate sibling',
  $$INSERT INTO geo_regions(parent_region_id,region_type_id,country_code,name,normalized_name,status)
    SELECT '10000000-0000-0000-0000-000000000002',id,'TR','İzmit Duplicate','izmit','active'
    FROM geo_region_types WHERE code='district'$$,
  '23505'
);

SELECT pg_temp.expect_failure(
  'GEO-005 parent delete RESTRICT',
  $$DELETE FROM geo_regions WHERE id='10000000-0000-0000-0000-000000000002'$$,
  '23503'
);

-- -------------------------------------------------------------------------
-- L2/L3: knowledge supertype/subtype
-- -------------------------------------------------------------------------
INSERT INTO knowledge_entities(id,entity_kind_id,canonical_name,slug,status)
SELECT '20000000-0000-0000-0000-000000000001',id,'Domain Test Place','domain-test-place','active'
FROM entity_kinds WHERE code='place';

INSERT INTO places(id,primary_region_id,address_text,location,status)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  'İzmit, Kocaeli',
  ST_SetSRID(ST_MakePoint(29.92,40.77),4326)::geography,
  'active'
);

-- KNO-001 positive subtype is implicitly proven by successful insert above.
INSERT INTO knowledge_entities(id,entity_kind_id,canonical_name,slug,status)
SELECT '20000000-0000-0000-0000-000000000002',id,'Wrong Kind Fixture','wrong-kind-fixture','active'
FROM entity_kinds WHERE code='event';

SELECT pg_temp.expect_failure(
  'KNO-002 wrong subtype kind',
  $$INSERT INTO places(id,primary_region_id,status)
    VALUES ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','active')$$,
  '23514'
);

SELECT pg_temp.expect_failure(
  'KNO-004 dangling subtype FK',
  $$INSERT INTO places(id,primary_region_id,status)
    VALUES ('29999999-0000-0000-0000-000000000999','10000000-0000-0000-0000-000000000003','active')$$,
  '23503'
);

SELECT pg_temp.expect_failure(
  'KNO-005 active slug uniqueness',
  $$INSERT INTO knowledge_entities(entity_kind_id,canonical_name,slug,status)
    SELECT id,'Duplicate Active Slug','domain-test-place','active' FROM entity_kinds WHERE code='place'$$,
  '23505'
);

-- Retired rows do not participate in active partial unique index.
INSERT INTO knowledge_entities(entity_kind_id,canonical_name,slug,status,retired_at)
SELECT id,'Retired Same Slug','domain-test-place','retired',now()
FROM entity_kinds WHERE code='place';

-- -------------------------------------------------------------------------
-- Place/category and temporal constraints
-- -------------------------------------------------------------------------
INSERT INTO place_category_links(place_id,category_id,is_primary)
SELECT '20000000-0000-0000-0000-000000000001',id,true
FROM place_categories WHERE code='museum';

SELECT pg_temp.expect_failure(
  'PLC-001 duplicate category link',
  $$INSERT INTO place_category_links(place_id,category_id,is_primary)
    SELECT '20000000-0000-0000-0000-000000000001',id,false FROM place_categories WHERE code='museum'$$,
  '23505'
);

SELECT pg_temp.expect_failure(
  'PLC-002 second primary category',
  $$INSERT INTO place_category_links(place_id,category_id,is_primary)
    SELECT '20000000-0000-0000-0000-000000000001',id,true FROM place_categories WHERE code='historical_site'$$,
  '23505'
);

SELECT pg_temp.expect_failure(
  'PLC-003 linked category delete RESTRICT',
  $$DELETE FROM place_categories WHERE code='museum'$$,
  '23503'
);

SELECT pg_temp.expect_failure(
  'PLC-004 operating weekday check',
  $$INSERT INTO operating_hours(place_id,weekday,opens_at,closes_at,is_closed,valid_from)
    VALUES ('20000000-0000-0000-0000-000000000001',7,'09:00','17:00',false,CURRENT_DATE)$$,
  '23514'
);

INSERT INTO operating_exceptions(place_id,exception_date,is_closed,reason)
VALUES ('20000000-0000-0000-0000-000000000001','2026-10-29',true,'fixture');

SELECT pg_temp.expect_failure(
  'PLC-005 operating exception uniqueness',
  $$INSERT INTO operating_exceptions(place_id,exception_date,is_closed)
    VALUES ('20000000-0000-0000-0000-000000000001','2026-10-29',true)$$,
  '23505'
);

-- -------------------------------------------------------------------------
-- Event integrity
-- -------------------------------------------------------------------------
INSERT INTO knowledge_entities(id,entity_kind_id,canonical_name,slug,status)
SELECT '20000000-0000-0000-0000-000000000003',id,'Fixture Festival','fixture-festival','active'
FROM entity_kinds WHERE code='event';

INSERT INTO events(id,primary_region_id,event_type_id,status)
SELECT '20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003',id,'active'
FROM event_types WHERE code='festival';

SELECT pg_temp.expect_failure(
  'EVT-001 occurrence time order',
  $$INSERT INTO event_occurrences(event_id,starts_at,ends_at,status)
    VALUES ('20000000-0000-0000-0000-000000000003','2026-09-10 12:00+03','2026-09-10 11:00+03','active')$$,
  '23514'
);

INSERT INTO event_occurrences(id,event_id,starts_at,ends_at,status)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003',
  '2026-09-10 12:00+03','2026-09-10 14:00+03','active'
);

SELECT pg_temp.expect_failure(
  'EVT-002 duplicate event/start',
  $$INSERT INTO event_occurrences(event_id,starts_at,ends_at,status)
    VALUES ('20000000-0000-0000-0000-000000000003','2026-09-10 12:00+03','2026-09-10 15:00+03','active')$$,
  '23505'
);

-- -------------------------------------------------------------------------
-- Suitability / freshness
-- -------------------------------------------------------------------------
INSERT INTO place_suitability_assessments(place_id,dimension_id,score,confidence,valid_from)
SELECT '20000000-0000-0000-0000-000000000001',id,85,0.9,now()
FROM suitability_dimensions WHERE code='stroller_access';

SELECT pg_temp.expect_failure(
  'SUIT-003 current uniqueness',
  $$INSERT INTO place_suitability_assessments(place_id,dimension_id,score,confidence,valid_from)
    SELECT '20000000-0000-0000-0000-000000000001',id,90,0.9,now()
    FROM suitability_dimensions WHERE code='stroller_access'$$,
  '23505'
);

INSERT INTO freshness_assignments(knowledge_entity_id,claim_type_id,freshness_policy_id,next_refresh_at)
SELECT '20000000-0000-0000-0000-000000000001',NULL,id,now()-interval '1 hour'
FROM freshness_policies WHERE code='operational';

SELECT pg_temp.expect_failure(
  'EVD-004 freshness NULL-safe uniqueness',
  $$INSERT INTO freshness_assignments(knowledge_entity_id,claim_type_id,freshness_policy_id)
    SELECT '20000000-0000-0000-0000-000000000001',NULL,id
    FROM freshness_policies WHERE code='slow_change'$$,
  '23505'
);

-- -------------------------------------------------------------------------
-- Trip/runtime semantic integrity
-- -------------------------------------------------------------------------
INSERT INTO trip_requests(id,target_region_id,starts_on,ends_on,preference_snapshot)
VALUES (
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  '2026-09-10','2026-09-12','{}'::jsonb
);

INSERT INTO trips(id,trip_request_id,plan_version,status)
VALUES ('40000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001',1,'draft');

INSERT INTO trip_days(id,trip_id,trip_date,day_number)
VALUES ('40000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000002','2026-09-10',1);

SELECT pg_temp.expect_failure(
  'TRIP-003 date outside request',
  $$INSERT INTO trip_days(trip_id,trip_date,day_number)
    VALUES ('40000000-0000-0000-0000-000000000002','2026-09-13',4)$$,
  '23514'
);

SELECT pg_temp.expect_failure(
  'TRIP-004 day number mismatch',
  $$INSERT INTO trip_days(trip_id,trip_date,day_number)
    VALUES ('40000000-0000-0000-0000-000000000002','2026-09-11',3)$$,
  '23514'
);

SELECT pg_temp.expect_failure(
  'TRIP-002 duplicate plan version',
  $$INSERT INTO trips(trip_request_id,plan_version,status)
    VALUES ('40000000-0000-0000-0000-000000000001',1,'draft')$$,
  '23505'
);

INSERT INTO plan_options(id,trip_day_id,option_code,rank,scenario_type_id,score)
SELECT '40000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000003','A',1,id,95
FROM plan_scenario_types WHERE code='primary';

-- Positive: targetless break is allowed.
INSERT INTO plan_items(plan_option_id,sequence_no,item_type_id,rationale)
SELECT '40000000-0000-0000-0000-000000000004',1,id,'fixture break'
FROM plan_item_types WHERE code='meal_break';

-- Positive: place_visit with a place target is allowed.
INSERT INTO plan_items(plan_option_id,sequence_no,item_type_id,place_id,rationale)
SELECT '40000000-0000-0000-0000-000000000004',2,id,
       '20000000-0000-0000-0000-000000000001','fixture place'
FROM plan_item_types WHERE code='place_visit';

SELECT pg_temp.expect_failure(
  'TRIP-006 target-required item targetless',
  $$INSERT INTO plan_items(plan_option_id,sequence_no,item_type_id)
    SELECT '40000000-0000-0000-0000-000000000004',3,id
    FROM plan_item_types WHERE code='place_visit'$$,
  '23514'
);

SELECT pg_temp.expect_failure(
  'TRIP-008 multiple targets',
  $$INSERT INTO plan_items(plan_option_id,sequence_no,item_type_id,place_id,event_occurrence_id)
    SELECT '40000000-0000-0000-0000-000000000004',4,id,
           '20000000-0000-0000-0000-000000000001',
           '30000000-0000-0000-0000-000000000001'
    FROM plan_item_types WHERE code='place_visit'$$,
  '23514'
);

SELECT pg_temp.expect_failure(
  'TRIP-009 wrong target kind event_visit -> place',
  $$INSERT INTO plan_items(plan_option_id,sequence_no,item_type_id,place_id)
    SELECT '40000000-0000-0000-0000-000000000004',5,id,
           '20000000-0000-0000-0000-000000000001'
    FROM plan_item_types WHERE code='event_visit'$$,
  '23514'
);

-- Positive: event_visit with occurrence target.
INSERT INTO plan_items(plan_option_id,sequence_no,item_type_id,event_occurrence_id)
SELECT '40000000-0000-0000-0000-000000000004',6,id,
       '30000000-0000-0000-0000-000000000001'
FROM plan_item_types WHERE code='event_visit';

-- -------------------------------------------------------------------------
-- Final invariant checks
-- -------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM places p
    JOIN knowledge_entities ke ON ke.id=p.id
    JOIN entity_kinds ek ON ek.id=ke.entity_kind_id
    WHERE ek.code <> 'place'
  ) THEN
    RAISE EXCEPTION 'dangling/wrong place subtype survived integrity harness';
  END IF;

  IF (SELECT count(*) FROM plan_items WHERE plan_option_id='40000000-0000-0000-0000-000000000004') <> 4 THEN
    RAISE EXCEPTION 'unexpected plan_items row count; negative cases may have leaked';
  END IF;
END;
$$;

ANALYZE;

SELECT 'domain_integrity_v1: PASS' AS result;
