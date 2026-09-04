-- Tatil Modu — Query / Index Smoke v1
-- Requires domain-integrity-v1.sql fixtures to have been applied first.
-- This is an index-presence/usability smoke, NOT a production performance benchmark.
-- Small fixtures may naturally prefer sequential scans; enable_seqscan=off below
-- is used only to prove the expected indexes can support the query shapes.

\set ON_ERROR_STOP on

-- -------------------------------------------------------------------------
-- 1. Canonical index presence gate
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_missing text;
BEGIN
  WITH required(index_name) AS (
    VALUES
      ('ix_places_location'),
      ('ix_places_region_status'),
      ('ix_event_occurrences_status_start'),
      ('ix_freshness_assignments_due'),
      ('uq_place_suitability_current'),
      ('ix_evidence_claims_entity_key_observed'),
      ('ix_trips_request_version_desc'),
      ('ix_knowledge_entities_name_trgm')
  )
  SELECT string_agg(r.index_name, ', ' ORDER BY r.index_name)
    INTO v_missing
  FROM required r
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_indexes i
    WHERE i.schemaname = current_schema()
      AND i.indexname = r.index_name
  );

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'missing canonical indexes: %', v_missing;
  END IF;
END;
$$;

ANALYZE;
SET enable_seqscan = off;

\echo 'QRY-001 active places within radius (GiST geography + region/status)'
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT p.id, ke.canonical_name
FROM places p
JOIN knowledge_entities ke ON ke.id = p.id
WHERE p.status = 'active'
  AND p.primary_region_id = '10000000-0000-0000-0000-000000000003'
  AND ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(29.92,40.77),4326)::geography,
    5000
  );

\echo 'QRY-002 event occurrences by status/date window'
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT id,event_id,starts_at,ends_at
FROM event_occurrences
WHERE status='active'
  AND starts_at >= '2026-09-01 00:00+03'
  AND starts_at <  '2026-10-01 00:00+03'
ORDER BY starts_at;

\echo 'QRY-003 due freshness assignments'
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT id,knowledge_entity_id,claim_type_id,next_refresh_at
FROM freshness_assignments
WHERE next_refresh_at IS NOT NULL
  AND next_refresh_at <= now()
ORDER BY next_refresh_at
LIMIT 50;

\echo 'QRY-004 current suitability lookup'
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT place_id,dimension_id,score,confidence
FROM place_suitability_assessments
WHERE place_id='20000000-0000-0000-0000-000000000001'
  AND valid_to IS NULL;

\echo 'QRY-005 evidence history by entity + claim key'
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT id,source_document_id,value_json,observed_at
FROM evidence_claims
WHERE knowledge_entity_id='20000000-0000-0000-0000-000000000001'
  AND claim_key='opening_hours.monday'
ORDER BY observed_at DESC
LIMIT 20;

\echo 'QRY-006 latest trip version'
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT id,plan_version,status,generated_at
FROM trips
WHERE trip_request_id='40000000-0000-0000-0000-000000000001'
ORDER BY plan_version DESC
LIMIT 1;

\echo 'QRY-007 fuzzy canonical name lookup (pg_trgm GIN)'
EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
SELECT id,canonical_name
FROM knowledge_entities
WHERE canonical_name % 'Domain Test Plaec'
ORDER BY similarity(canonical_name,'Domain Test Plaec') DESC
LIMIT 10;

RESET enable_seqscan;

SELECT 'query_index_smoke_v1: PASS' AS result;
