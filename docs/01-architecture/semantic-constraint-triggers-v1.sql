-- Tatil Modu — Semantic Constraint Triggers v1
-- Status: architecture baseline candidate; production migration requires harness validation.

BEGIN;

-- =========================================================
-- 1. knowledge_entities subtype integrity
-- =========================================================

CREATE OR REPLACE FUNCTION assert_knowledge_entity_kind(
  p_entity_id uuid,
  p_expected_code text
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_code text;
BEGIN
  SELECT ek.code
    INTO v_code
  FROM knowledge_entities ke
  JOIN entity_kinds ek ON ek.id = ke.entity_kind_id
  WHERE ke.id = p_entity_id;

  IF v_code IS DISTINCT FROM p_expected_code THEN
    RAISE EXCEPTION 'knowledge entity % must have kind %, actual %', p_entity_id, p_expected_code, v_code
      USING ERRCODE = '23514';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION trg_assert_place_kind() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_knowledge_entity_kind(NEW.id, 'place');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION trg_assert_event_kind() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_knowledge_entity_kind(NEW.id, 'event');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION trg_assert_local_item_kind() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_knowledge_entity_kind(NEW.id, 'local_item');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION trg_assert_parking_kind() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_knowledge_entity_kind(NEW.id, 'parking_facility');
  RETURN NEW;
END; $$;

CREATE CONSTRAINT TRIGGER ct_places_kind
AFTER INSERT OR UPDATE OF id ON places
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_place_kind();

CREATE CONSTRAINT TRIGGER ct_events_kind
AFTER INSERT OR UPDATE OF id ON events
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_event_kind();

CREATE CONSTRAINT TRIGGER ct_local_items_kind
AFTER INSERT OR UPDATE OF id ON local_items
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_local_item_kind();

CREATE CONSTRAINT TRIGGER ct_parking_facilities_kind
AFTER INSERT OR UPDATE OF id ON parking_facilities
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_parking_kind();

-- Also prevent changing a supertype kind while a subtype row exists.
CREATE OR REPLACE FUNCTION trg_assert_kind_change_compatible() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_new_code text;
BEGIN
  IF NEW.entity_kind_id = OLD.entity_kind_id THEN
    RETURN NEW;
  END IF;

  SELECT code INTO v_new_code FROM entity_kinds WHERE id = NEW.entity_kind_id;

  IF EXISTS (SELECT 1 FROM places WHERE id = NEW.id) AND v_new_code <> 'place' THEN
    RAISE EXCEPTION 'entity % is a place subtype and cannot change kind to %', NEW.id, v_new_code USING ERRCODE='23514';
  ELSIF EXISTS (SELECT 1 FROM events WHERE id = NEW.id) AND v_new_code <> 'event' THEN
    RAISE EXCEPTION 'entity % is an event subtype and cannot change kind to %', NEW.id, v_new_code USING ERRCODE='23514';
  ELSIF EXISTS (SELECT 1 FROM local_items WHERE id = NEW.id) AND v_new_code <> 'local_item' THEN
    RAISE EXCEPTION 'entity % is a local_item subtype and cannot change kind to %', NEW.id, v_new_code USING ERRCODE='23514';
  ELSIF EXISTS (SELECT 1 FROM parking_facilities WHERE id = NEW.id) AND v_new_code <> 'parking_facility' THEN
    RAISE EXCEPTION 'entity % is a parking_facility subtype and cannot change kind to %', NEW.id, v_new_code USING ERRCODE='23514';
  END IF;

  RETURN NEW;
END; $$;

CREATE CONSTRAINT TRIGGER ct_knowledge_entity_kind_change
AFTER UPDATE OF entity_kind_id ON knowledge_entities
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_kind_change_compatible();

-- =========================================================
-- 2. plan_items target semantics
-- =========================================================

CREATE OR REPLACE FUNCTION trg_assert_plan_item_target_semantics() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_allows_targetless boolean;
  v_code text;
  v_target_count integer;
BEGIN
  SELECT allows_targetless, code
    INTO v_allows_targetless, v_code
  FROM plan_item_types
  WHERE id = NEW.item_type_id;

  v_target_count := num_nonnulls(NEW.place_id, NEW.event_occurrence_id, NEW.local_item_id);

  IF v_allows_targetless IS NULL THEN
    RAISE EXCEPTION 'plan item type % not found', NEW.item_type_id USING ERRCODE='23503';
  END IF;

  IF NOT v_allows_targetless AND v_target_count <> 1 THEN
    RAISE EXCEPTION 'plan item type % requires exactly one target', v_code USING ERRCODE='23514';
  END IF;

  IF v_allows_targetless AND v_target_count > 1 THEN
    RAISE EXCEPTION 'plan item type % cannot have more than one target', v_code USING ERRCODE='23514';
  END IF;

  IF v_code = 'place_visit' AND NEW.place_id IS NULL THEN
    RAISE EXCEPTION 'place_visit requires place_id' USING ERRCODE='23514';
  ELSIF v_code = 'event_visit' AND NEW.event_occurrence_id IS NULL THEN
    RAISE EXCEPTION 'event_visit requires event_occurrence_id' USING ERRCODE='23514';
  ELSIF v_code = 'local_item_experience' AND NEW.local_item_id IS NULL THEN
    RAISE EXCEPTION 'local_item_experience requires local_item_id' USING ERRCODE='23514';
  END IF;

  RETURN NEW;
END; $$;

CREATE CONSTRAINT TRIGGER ct_plan_items_target_semantics
AFTER INSERT OR UPDATE OF item_type_id, place_id, event_occurrence_id, local_item_id ON plan_items
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_plan_item_target_semantics();

-- =========================================================
-- 3. trip day date integrity
-- =========================================================

CREATE OR REPLACE FUNCTION trg_assert_trip_day_integrity() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_starts_on date;
  v_ends_on date;
  v_expected_day integer;
BEGIN
  SELECT tr.starts_on, tr.ends_on
    INTO v_starts_on, v_ends_on
  FROM trips t
  JOIN trip_requests tr ON tr.id = t.trip_request_id
  WHERE t.id = NEW.trip_id;

  IF v_starts_on IS NULL THEN
    RAISE EXCEPTION 'trip % has no request date range', NEW.trip_id USING ERRCODE='23503';
  END IF;

  IF NEW.trip_date < v_starts_on OR NEW.trip_date > v_ends_on THEN
    RAISE EXCEPTION 'trip day % outside request date range %..%', NEW.trip_date, v_starts_on, v_ends_on USING ERRCODE='23514';
  END IF;

  v_expected_day := (NEW.trip_date - v_starts_on) + 1;
  IF NEW.day_number <> v_expected_day THEN
    RAISE EXCEPTION 'trip day_number % must equal % for date %', NEW.day_number, v_expected_day, NEW.trip_date USING ERRCODE='23514';
  END IF;

  RETURN NEW;
END; $$;

CREATE CONSTRAINT TRIGGER ct_trip_days_date_integrity
AFTER INSERT OR UPDATE OF trip_id, trip_date, day_number ON trip_days
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_trip_day_integrity();

-- Protect parent request date changes that would invalidate existing days.
CREATE OR REPLACE FUNCTION trg_assert_trip_request_date_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM trips t
    JOIN trip_days td ON td.trip_id = t.id
    WHERE t.trip_request_id = NEW.id
      AND (td.trip_date < NEW.starts_on OR td.trip_date > NEW.ends_on
           OR td.day_number <> (td.trip_date - NEW.starts_on) + 1)
  ) THEN
    RAISE EXCEPTION 'trip request date change would invalidate existing trip days' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END; $$;

CREATE CONSTRAINT TRIGGER ct_trip_requests_date_change
AFTER UPDATE OF starts_on, ends_on ON trip_requests
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_trip_request_date_change();

-- =========================================================
-- 4. geo hierarchy integrity
-- =========================================================

CREATE OR REPLACE FUNCTION trg_assert_geo_region_hierarchy() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_child_level smallint;
  v_parent_level smallint;
  v_cycle boolean;
BEGIN
  SELECT hierarchy_level INTO v_child_level
  FROM geo_region_types WHERE id = NEW.region_type_id;

  IF NEW.parent_region_id IS NULL THEN
    IF v_child_level <> 0 THEN
      RAISE EXCEPTION 'only level-0 region can be root' USING ERRCODE='23514';
    END IF;
    RETURN NEW;
  END IF;

  SELECT grt.hierarchy_level
    INTO v_parent_level
  FROM geo_regions gr
  JOIN geo_region_types grt ON grt.id = gr.region_type_id
  WHERE gr.id = NEW.parent_region_id;

  IF v_parent_level IS NULL OR v_parent_level >= v_child_level THEN
    RAISE EXCEPTION 'invalid geo hierarchy parent level % child level %', v_parent_level, v_child_level USING ERRCODE='23514';
  END IF;

  WITH RECURSIVE ancestors AS (
    SELECT gr.id, gr.parent_region_id
    FROM geo_regions gr
    WHERE gr.id = NEW.parent_region_id
    UNION ALL
    SELECT gr.id, gr.parent_region_id
    FROM geo_regions gr
    JOIN ancestors a ON gr.id = a.parent_region_id
  )
  SELECT EXISTS (SELECT 1 FROM ancestors WHERE id = NEW.id) INTO v_cycle;

  IF v_cycle THEN
    RAISE EXCEPTION 'geo hierarchy cycle detected for region %', NEW.id USING ERRCODE='23514';
  END IF;

  RETURN NEW;
END; $$;

CREATE CONSTRAINT TRIGGER ct_geo_regions_hierarchy
AFTER INSERT OR UPDATE OF parent_region_id, region_type_id ON geo_regions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_assert_geo_region_hierarchy();

-- =========================================================
-- 5. updated_at maintenance
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

CREATE TRIGGER tr_geo_regions_updated_at BEFORE UPDATE ON geo_regions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_knowledge_entities_updated_at BEFORE UPDATE ON knowledge_entities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_parking_facilities_updated_at BEFORE UPDATE ON parking_facilities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_local_items_updated_at BEFORE UPDATE ON local_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_freshness_assignments_updated_at BEFORE UPDATE ON freshness_assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
