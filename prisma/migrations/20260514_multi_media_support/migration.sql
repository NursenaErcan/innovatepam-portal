-- Add display order for preserving submission order
ALTER TABLE "Attachment" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- Remove one-to-one attachment constraint and replace with ordered uniqueness per idea
DROP INDEX IF EXISTS "Attachment_ideaId_key";
CREATE UNIQUE INDEX "Attachment_ideaId_displayOrder_key" ON "Attachment"("ideaId", "displayOrder");
