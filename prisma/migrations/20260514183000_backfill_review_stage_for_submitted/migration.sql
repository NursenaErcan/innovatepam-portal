-- Backfill review pipeline entry stage for already-submitted ideas.
-- Keep drafts unassigned and avoid assigning new stages to accepted/rejected ideas.
UPDATE "Idea"
SET "reviewStage" = 'initial_screening'
WHERE "reviewStage" IS NULL
  AND "status" IN ('submitted', 'under_review');
