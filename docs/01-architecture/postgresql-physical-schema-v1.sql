-- Tatil Modu — PostgreSQL/PostGIS Physical Schema v1
-- Status: architecture baseline candidate; not yet an executable production migration.
-- Target: PostgreSQL 16+ with PostGIS.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================================================
-- 0. Registry / configuration tables
-- =========================================================

CREATE TABLE entity_kinds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE geo_region_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  hierarchy_level smallint NOT NULL CHECK (hierarchy_level >= 0)
);

CREATE TABLE reservation_requirement_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE parking_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE parking_relationship_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE local_item_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE local_item_relationship_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE event_place_role_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE data_source_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE trust_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  rank smallint NOT NULL UNIQUE CHECK (rank >= 0),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE claim_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE verification_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE party_member_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE mobility_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE plan_scenario_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE plan_item_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  allows_targetless boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE travel_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE environment_context_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

-- =========================================================
-- 1. Geography
-- =========================================================

CREATE TABLE geo_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_region_id uuid NULL REFERENCES geo_regions(id) ON DELETE RESTRICT,
  region_type_id uuid NOT NULL REFERENCES geo_region_types(id) ON DELETE RESTRICT,
  country_code char(2) NOT NULL,
  name text NOT NULL,
  normalized_name text NOT NULL,
  geometry geography(MultiPolygon, 4326) NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_geo_regions_no_self_parent CHECK (parent_region_id IS NULL OR parent_region_id <> id)
);

CREATE UNIQUE INDEX uq_geo_regions_parent_type_name
  ON geo_regions ((coalesce(parent_region_id, '00000000-0000-0000-0000-000000000000'::uuid)), region_type_id, normalized_name, country_code);
CREATE INDEX ix_geo_regions_parent ON geo_regions(parent_region_id);
CREATE INDEX ix_geo_regions_type_status ON geo_regions(region_type_id, status);
CREATE INDEX ix_geo_regions_country_name ON geo_regions(country_code, normalized_name);
CREATE INDEX ix_geo_regions_geometry ON geo_regions USING gist(geometry);

-- =========================================================
-- 2. Knowledge supertype
-- =========================================================

CREATE TABLE knowledge_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_kind_id uuid NOT NULL REFERENCES entity_kinds(id) ON DELETE RESTRICT,
  canonical_name text NOT NULL,
  slug text NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz NULL
);

CREATE UNIQUE INDEX uq_knowledge_entities_active_slug
  ON knowledge_entities(entity_kind_id, slug)
  WHERE slug IS NOT NULL AND status = 'active';
CREATE INDEX ix_knowledge_entities_kind_status ON knowledge_entities(entity_kind_id, status);
CREATE INDEX ix_knowledge_entities_name_trgm ON knowledge_entities USING gin(canonical_name gin_trgm_ops);

-- =========================================================
-- 3. Places
-- =========================================================

CREATE TABLE place_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_category_id uuid NULL REFERENCES place_categories(id) ON DELETE RESTRICT,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT ck_place_categories_no_self_parent CHECK (parent_category_id IS NULL OR parent_category_id <> id)
);

CREATE TABLE places (
  id uuid PRIMARY KEY REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  primary_region_id uuid NOT NULL REFERENCES geo_regions(id) ON DELETE RESTRICT,
  address_text text NULL,
  location geography(Point, 4326) NULL,
  website_url text NULL,
  phone text NULL,
  average_visit_minutes integer NULL CHECK (average_visit_minutes IS NULL OR average_visit_minutes > 0),
  indoor_ratio numeric(5,2) NULL CHECK (indoor_ratio IS NULL OR indoor_ratio BETWEEN 0 AND 100),
  outdoor_ratio numeric(5,2) NULL CHECK (outdoor_ratio IS NULL OR outdoor_ratio BETWEEN 0 AND 100),
  reservation_requirement_id uuid NULL REFERENCES reservation_requirement_types(id) ON DELETE RESTRICT,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_places_region_status ON places(primary_region_id, status);
CREATE INDEX ix_places_location ON places USING gist(location);
CREATE INDEX ix_places_active_region ON places(primary_region_id) WHERE status = 'active';

CREATE TABLE place_category_links (
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES place_categories(id) ON DELETE RESTRICT,
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (place_id, category_id)
);
CREATE INDEX ix_place_category_links_reverse ON place_category_links(category_id, place_id);
CREATE UNIQUE INDEX uq_place_one_primary_category ON place_category_links(place_id) WHERE is_primary;

CREATE TABLE operating_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  opens_at time NULL,
  closes_at time NULL,
  is_closed boolean NOT NULL DEFAULT false,
  season_from date NULL,
  season_to date NULL,
  valid_from date NOT NULL,
  valid_to date NULL,
  CONSTRAINT ck_operating_hours_time_shape CHECK (
    (is_closed AND opens_at IS NULL AND closes_at IS NULL)
    OR
    (NOT is_closed AND opens_at IS NOT NULL AND closes_at IS NOT NULL)
  ),
  CONSTRAINT ck_operating_hours_validity CHECK (valid_to IS NULL OR valid_to >= valid_from)
);
CREATE INDEX ix_operating_hours_place_weekday_valid ON operating_hours(place_id, weekday, valid_from DESC);
CREATE INDEX ix_operating_hours_current ON operating_hours(place_id, weekday) WHERE valid_to IS NULL;

CREATE TABLE operating_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  opens_at time NULL,
  closes_at time NULL,
  is_closed boolean NOT NULL,
  reason text NULL,
  CONSTRAINT uq_operating_exceptions_place_date UNIQUE(place_id, exception_date),
  CONSTRAINT ck_operating_exceptions_time_shape CHECK (
    (is_closed AND opens_at IS NULL AND closes_at IS NULL)
    OR
    (NOT is_closed AND opens_at IS NOT NULL AND closes_at IS NOT NULL)
  )
);
CREATE INDEX ix_operating_exceptions_date_place ON operating_exceptions(exception_date, place_id);

-- =========================================================
-- 4. Parking
-- =========================================================

CREATE TABLE parking_facilities (
  id uuid PRIMARY KEY REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  region_id uuid NOT NULL REFERENCES geo_regions(id) ON DELETE RESTRICT,
  location geography(Point, 4326) NULL,
  capacity integer NULL CHECK (capacity IS NULL OR capacity >= 0),
  parking_type_id uuid NULL REFERENCES parking_types(id) ON DELETE RESTRICT,
  paid boolean NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_parking_facilities_location ON parking_facilities USING gist(location);
CREATE INDEX ix_parking_facilities_region_status ON parking_facilities(region_id, status);

CREATE TABLE place_parking_links (
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  parking_facility_id uuid NOT NULL REFERENCES parking_facilities(id) ON DELETE RESTRICT,
  walk_minutes integer NULL CHECK (walk_minutes IS NULL OR walk_minutes >= 0),
  relationship_type_id uuid NOT NULL REFERENCES parking_relationship_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (place_id, parking_facility_id)
);
CREATE INDEX ix_place_parking_links_reverse ON place_parking_links(parking_facility_id, place_id);

-- =========================================================
-- 5. Local items
-- =========================================================

CREATE TABLE local_items (
  id uuid PRIMARY KEY REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  item_type_id uuid NOT NULL REFERENCES local_item_types(id) ON DELETE RESTRICT,
  origin_region_id uuid NOT NULL REFERENCES geo_regions(id) ON DELETE RESTRICT,
  description text NULL,
  seasonal boolean NOT NULL DEFAULT false,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_local_items_region_type_status ON local_items(origin_region_id, item_type_id, status);
CREATE INDEX ix_local_items_type_status ON local_items(item_type_id, status);

CREATE TABLE place_local_item_links (
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  local_item_id uuid NOT NULL REFERENCES local_items(id) ON DELETE RESTRICT,
  relationship_type_id uuid NOT NULL REFERENCES local_item_relationship_types(id) ON DELETE RESTRICT,
  quality_score numeric(5,2) NULL CHECK (quality_score IS NULL OR quality_score BETWEEN 0 AND 100),
  PRIMARY KEY (place_id, local_item_id, relationship_type_id)
);
CREATE INDEX ix_place_local_item_links_reverse ON place_local_item_links(local_item_id, place_id);

-- =========================================================
-- 6. Events
-- =========================================================

CREATE TABLE events (
  id uuid PRIMARY KEY REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  primary_region_id uuid NOT NULL REFERENCES geo_regions(id) ON DELETE RESTRICT,
  event_type_id uuid NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  recurrence_rule text NULL,
  crowd_impact_level smallint NULL CHECK (crowd_impact_level IS NULL OR crowd_impact_level BETWEEN 0 AND 5),
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_events_region_type_status ON events(primary_region_id, event_type_id, status);
CREATE INDEX ix_events_type_status ON events(event_type_id, status);

CREATE TABLE event_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL,
  expected_crowd_level smallint NULL CHECK (expected_crowd_level IS NULL OR expected_crowd_level BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_event_occurrences_time_order CHECK (ends_at > starts_at),
  CONSTRAINT uq_event_occurrences_event_start UNIQUE(event_id, starts_at)
);
CREATE INDEX ix_event_occurrences_window ON event_occurrences(starts_at, ends_at);
CREATE INDEX ix_event_occurrences_event_start ON event_occurrences(event_id, starts_at DESC);
CREATE INDEX ix_event_occurrences_status_start ON event_occurrences(status, starts_at);

CREATE TABLE event_place_links (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE RESTRICT,
  role_type_id uuid NOT NULL REFERENCES event_place_role_types(id) ON DELETE RESTRICT,
  PRIMARY KEY(event_id, place_id, role_type_id)
);
CREATE INDEX ix_event_place_links_reverse ON event_place_links(place_id, event_id);

-- =========================================================
-- 7. Suitability and seasonality
-- =========================================================

CREATE TABLE suitability_dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  value_type text NOT NULL CHECK (value_type IN ('score','boolean','number','text','json')),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE place_suitability_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  dimension_id uuid NOT NULL REFERENCES suitability_dimensions(id) ON DELETE RESTRICT,
  score numeric(5,2) NULL CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  assessment_value jsonb NULL,
  confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_place_suitability_validity CHECK (valid_to IS NULL OR valid_to > valid_from),
  CONSTRAINT ck_place_suitability_has_value CHECK (score IS NOT NULL OR assessment_value IS NOT NULL)
);
CREATE INDEX ix_place_suitability_history ON place_suitability_assessments(place_id, dimension_id, valid_from DESC);
CREATE UNIQUE INDEX uq_place_suitability_current ON place_suitability_assessments(place_id, dimension_id) WHERE valid_to IS NULL;
CREATE INDEX ix_place_suitability_dimension_score ON place_suitability_assessments(dimension_id, score DESC) WHERE valid_to IS NULL AND score IS NOT NULL;

CREATE TABLE seasonal_suitability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  month smallint NOT NULL CHECK (month BETWEEN 1 AND 12),
  score numeric(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  reason text NULL,
  CONSTRAINT uq_seasonal_suitability_place_month UNIQUE(place_id, month)
);
CREATE INDEX ix_seasonal_suitability_month_score ON seasonal_suitability(month, score DESC);

-- =========================================================
-- 8. Sources, evidence, verification, freshness
-- =========================================================

CREATE TABLE data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type_id uuid NOT NULL REFERENCES data_source_types(id) ON DELETE RESTRICT,
  name text NOT NULL,
  base_url text NULL,
  trust_tier_id uuid NOT NULL REFERENCES trust_tiers(id) ON DELETE RESTRICT,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_data_sources_type_active ON data_sources(source_type_id, is_active);

CREATE TABLE source_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid NOT NULL REFERENCES data_sources(id) ON DELETE RESTRICT,
  source_url text NOT NULL,
  retrieved_at timestamptz NOT NULL,
  content_hash text NOT NULL,
  http_etag text NULL,
  published_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_source_documents_snapshot UNIQUE(data_source_id, source_url, content_hash)
);
CREATE INDEX ix_source_documents_url_retrieved ON source_documents(source_url, retrieved_at DESC);
CREATE INDEX ix_source_documents_source_retrieved ON source_documents(data_source_id, retrieved_at DESC);

CREATE TABLE evidence_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_entity_id uuid NOT NULL REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  source_document_id uuid NOT NULL REFERENCES source_documents(id) ON DELETE RESTRICT,
  claim_type_id uuid NOT NULL REFERENCES claim_types(id) ON DELETE RESTRICT,
  claim_key text NOT NULL,
  value_json jsonb NOT NULL,
  confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  observed_at timestamptz NOT NULL,
  valid_from timestamptz NULL,
  valid_to timestamptz NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_evidence_claims_validity CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to > valid_from)
);
CREATE INDEX ix_evidence_claims_entity_key_observed ON evidence_claims(knowledge_entity_id, claim_key, observed_at DESC);
CREATE INDEX ix_evidence_claims_type_status ON evidence_claims(claim_type_id, status);
CREATE INDEX ix_evidence_claims_source ON evidence_claims(source_document_id);

CREATE TABLE verification_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_entity_id uuid NOT NULL REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  verification_type_id uuid NOT NULL REFERENCES verification_types(id) ON DELETE RESTRICT,
  status text NOT NULL,
  confidence numeric(5,4) NULL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  verified_at timestamptz NOT NULL,
  expires_at timestamptz NULL,
  details_json jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_verification_results_expiry CHECK (expires_at IS NULL OR expires_at > verified_at)
);
CREATE INDEX ix_verification_results_entity_type_verified ON verification_results(knowledge_entity_id, verification_type_id, verified_at DESC);
CREATE INDEX ix_verification_results_expiring_verified ON verification_results(expires_at) WHERE status = 'verified' AND expires_at IS NOT NULL;

CREATE TABLE freshness_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  ttl_seconds bigint NOT NULL CHECK (ttl_seconds > 0),
  refresh_priority smallint NOT NULL CHECK (refresh_priority >= 0),
  requires_live_verification boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE freshness_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_entity_id uuid NOT NULL REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  claim_type_id uuid NULL REFERENCES claim_types(id) ON DELETE RESTRICT,
  freshness_policy_id uuid NOT NULL REFERENCES freshness_policies(id) ON DELETE RESTRICT,
  last_verified_at timestamptz NULL,
  next_refresh_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- PostgreSQL 15+: NULLS NOT DISTINCT gives true null-safe uniqueness.
ALTER TABLE freshness_assignments
  ADD CONSTRAINT uq_freshness_assignments_entity_claim UNIQUE NULLS NOT DISTINCT (knowledge_entity_id, claim_type_id);
CREATE INDEX ix_freshness_assignments_due ON freshness_assignments(next_refresh_at) WHERE next_refresh_at IS NOT NULL;
CREATE INDEX ix_freshness_assignments_policy_due ON freshness_assignments(freshness_policy_id, next_refresh_at);

CREATE TABLE external_entity_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_entity_id uuid NOT NULL REFERENCES knowledge_entities(id) ON DELETE RESTRICT,
  data_source_id uuid NOT NULL REFERENCES data_sources(id) ON DELETE RESTRICT,
  external_id text NOT NULL,
  external_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_external_entity_refs_source_external UNIQUE(data_source_id, external_id),
  CONSTRAINT uq_external_entity_refs_entity_source_external UNIQUE(knowledge_entity_id, data_source_id, external_id)
);
CREATE INDEX ix_external_entity_refs_entity_source ON external_entity_refs(knowledge_entity_id, data_source_id);

-- =========================================================
-- 9. Trip request and runtime planning
-- =========================================================

CREATE TABLE trip_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  origin_location geography(Point, 4326) NULL,
  target_region_id uuid NULL REFERENCES geo_regions(id) ON DELETE RESTRICT,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  max_radius_km numeric(8,2) NULL CHECK (max_radius_km IS NULL OR max_radius_km > 0),
  budget_amount numeric(14,2) NULL CHECK (budget_amount IS NULL OR budget_amount >= 0),
  budget_currency char(3) NULL,
  preference_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_trip_requests_date_order CHECK (ends_on >= starts_on)
);
CREATE INDEX ix_trip_requests_target_start ON trip_requests(target_region_id, starts_on);
CREATE INDEX ix_trip_requests_user_created ON trip_requests(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX ix_trip_requests_origin ON trip_requests USING gist(origin_location);

CREATE TABLE trip_party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_request_id uuid NOT NULL REFERENCES trip_requests(id) ON DELETE CASCADE,
  member_type_id uuid NOT NULL REFERENCES party_member_types(id) ON DELETE RESTRICT,
  age_years smallint NULL CHECK (age_years IS NULL OR age_years BETWEEN 0 AND 125),
  mobility_profile_id uuid NULL REFERENCES mobility_profiles(id) ON DELETE RESTRICT,
  needs_json jsonb NULL
);
CREATE INDEX ix_trip_party_members_request ON trip_party_members(trip_request_id);

CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_request_id uuid NOT NULL REFERENCES trip_requests(id) ON DELETE RESTRICT,
  plan_version integer NOT NULL CHECK (plan_version > 0),
  status text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_trips_request_version UNIQUE(trip_request_id, plan_version)
);
CREATE INDEX ix_trips_request_version_desc ON trips(trip_request_id, plan_version DESC);

CREATE TABLE trip_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_date date NOT NULL,
  day_number smallint NOT NULL CHECK (day_number > 0),
  CONSTRAINT uq_trip_days_trip_date UNIQUE(trip_id, trip_date),
  CONSTRAINT uq_trip_days_trip_number UNIQUE(trip_id, day_number)
);

CREATE TABLE plan_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_day_id uuid NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  option_code text NOT NULL,
  rank smallint NOT NULL CHECK (rank > 0),
  scenario_type_id uuid NULL REFERENCES plan_scenario_types(id) ON DELETE RESTRICT,
  score numeric(8,4) NULL,
  CONSTRAINT uq_plan_options_day_code UNIQUE(trip_day_id, option_code),
  CONSTRAINT uq_plan_options_day_rank UNIQUE(trip_day_id, rank)
);

CREATE TABLE plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_option_id uuid NOT NULL REFERENCES plan_options(id) ON DELETE CASCADE,
  sequence_no smallint NOT NULL CHECK (sequence_no > 0),
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  place_id uuid NULL REFERENCES places(id) ON DELETE RESTRICT,
  event_occurrence_id uuid NULL REFERENCES event_occurrences(id) ON DELETE RESTRICT,
  local_item_id uuid NULL REFERENCES local_items(id) ON DELETE RESTRICT,
  item_type_id uuid NOT NULL REFERENCES plan_item_types(id) ON DELETE RESTRICT,
  travel_minutes_from_previous integer NULL CHECK (travel_minutes_from_previous IS NULL OR travel_minutes_from_previous >= 0),
  rationale text NULL,
  CONSTRAINT uq_plan_items_option_sequence UNIQUE(plan_option_id, sequence_no),
  CONSTRAINT ck_plan_items_exactly_zero_or_one_target CHECK (num_nonnulls(place_id, event_occurrence_id, local_item_id) <= 1),
  CONSTRAINT ck_plan_items_time_order CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);
CREATE INDEX ix_plan_items_place ON plan_items(place_id) WHERE place_id IS NOT NULL;
CREATE INDEX ix_plan_items_event_occurrence ON plan_items(event_occurrence_id) WHERE event_occurrence_id IS NOT NULL;
CREATE INDEX ix_plan_items_local_item ON plan_items(local_item_id) WHERE local_item_id IS NOT NULL;

-- =========================================================
-- 10. Route cache and live context
-- =========================================================

CREATE TABLE route_cache_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_hash text NOT NULL,
  destination_hash text NOT NULL,
  travel_mode_id uuid NOT NULL REFERENCES travel_modes(id) ON DELETE RESTRICT,
  departure_bucket timestamptz NULL,
  distance_meters integer NOT NULL CHECK (distance_meters >= 0),
  duration_seconds integer NOT NULL CHECK (duration_seconds >= 0),
  provider_id uuid NULL REFERENCES data_sources(id) ON DELETE RESTRICT,
  calculated_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CONSTRAINT ck_route_cache_expiry CHECK (expires_at > calculated_at)
);
CREATE UNIQUE INDEX uq_route_cache_lookup
  ON route_cache_entries(origin_hash, destination_hash, travel_mode_id, (coalesce(departure_bucket, '-infinity'::timestamptz)));
CREATE INDEX ix_route_cache_expires ON route_cache_entries(expires_at);

CREATE TABLE environment_context_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NULL REFERENCES geo_regions(id) ON DELETE RESTRICT,
  location geography(Point, 4326) NULL,
  context_type_id uuid NOT NULL REFERENCES environment_context_types(id) ON DELETE RESTRICT,
  observed_for timestamptz NOT NULL,
  retrieved_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  CONSTRAINT ck_environment_context_has_scope CHECK (region_id IS NOT NULL OR location IS NOT NULL),
  CONSTRAINT ck_environment_context_expiry CHECK (expires_at > retrieved_at)
);
CREATE INDEX ix_environment_context_region_type_observed ON environment_context_snapshots(region_id, context_type_id, observed_for DESC) WHERE region_id IS NOT NULL;
CREATE INDEX ix_environment_context_expires ON environment_context_snapshots(expires_at);
CREATE INDEX ix_environment_context_location ON environment_context_snapshots USING gist(location);

-- =========================================================
-- 11. Integrity notes intentionally enforced above
-- =========================================================
-- 1) knowledge_entities + subtype insert must be one transaction.
-- 2) subtype deletes are RESTRICT; lifecycle is status-driven.
-- 3) joins/composition children use CASCADE only where parentless rows are meaningless.
-- 4) evidence/source history never cascades away from knowledge entity deletion.
-- 5) no polymorphic entity_type/entity_id FK pattern.
-- 6) JSONB has no blanket GIN index; add only after measured query need.
-- 7) all geo lookups use GiST-backed PostGIS columns.
-- 8) current freshness uniqueness uses UNIQUE NULLS NOT DISTINCT.
-- 9) performance indexes remain provisional until EXPLAIN (ANALYZE, BUFFERS) on production-like fixtures.
