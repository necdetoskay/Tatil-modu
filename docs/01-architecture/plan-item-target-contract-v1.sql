-- Tatil Modu — Plan Item Target Contract v1
-- Additive architecture baseline candidate.
-- Purpose: enforce which target kind each plan_item_type may reference.

BEGIN;

CREATE TABLE plan_target_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE plan_item_type_allowed_targets (
  plan_item_type_id uuid NOT NULL REFERENCES plan_item_types(id) ON DELETE CASCADE,
  plan_target_type_id uuid NOT NULL REFERENCES plan_target_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (plan_item_type_id, plan_target_type_id)
);

CREATE INDEX ix_plan_item_type_allowed_targets_reverse
  ON plan_item_type_allowed_targets(plan_target_type_id, plan_item_type_id);

INSERT INTO plan_target_types(code, name, is_active)
VALUES
  ('none', 'Hedefsiz', true),
  ('place', 'Mekan', true),
  ('event_occurrence', 'Etkinlik Gerçekleşmesi', true),
  ('local_item', 'Yerel Deneyim/Ürün', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO plan_item_type_allowed_targets(plan_item_type_id, plan_target_type_id)
SELECT pit.id, ptt.id
FROM plan_item_types pit
JOIN plan_target_types ptt ON
  (pit.code = 'place_visit' AND ptt.code = 'place') OR
  (pit.code = 'event_visit' AND ptt.code = 'event_occurrence') OR
  (pit.code = 'local_item_experience' AND ptt.code = 'local_item') OR
  (pit.code IN ('travel','meal_break','rest_break','free_time','buffer') AND ptt.code = 'none')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION enforce_plan_item_target_contract()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actual_target_code text;
  is_allowed boolean;
BEGIN
  IF NEW.place_id IS NOT NULL THEN
    actual_target_code := 'place';
  ELSIF NEW.event_occurrence_id IS NOT NULL THEN
    actual_target_code := 'event_occurrence';
  ELSIF NEW.local_item_id IS NOT NULL THEN
    actual_target_code := 'local_item';
  ELSE
    actual_target_code := 'none';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM plan_item_type_allowed_targets a
    JOIN plan_target_types t ON t.id = a.plan_target_type_id
    WHERE a.plan_item_type_id = NEW.item_type_id
      AND t.code = actual_target_code
      AND t.is_active = true
  ) INTO is_allowed;

  IF NOT is_allowed THEN
    RAISE EXCEPTION 'plan item type % does not allow target type %', NEW.item_type_id, actual_target_code
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_plan_item_target_contract ON plan_items;
CREATE CONSTRAINT TRIGGER trg_plan_item_target_contract
AFTER INSERT OR UPDATE OF item_type_id, place_id, event_occurrence_id, local_item_id
ON plan_items
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION enforce_plan_item_target_contract();

COMMIT;
