-- Fix review stage initialization bug: assign initial_screening to any submitted/under_review ideas that still have reviewStage = NULL.
-- This handles ideas that were submitted before the reviewStage assignment was added to the create/submit API routes.
UPDATE "Idea"
SET "reviewStage" = 'initial_screening'
WHERE "reviewStage" IS NULL
  AND "status" IN ('submitted', 'under_review');
