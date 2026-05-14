-- CreateTable
CREATE TABLE "IdeaScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "reviewedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IdeaScore_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdeaScore_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "IdeaScore_ideaId_idx" ON "IdeaScore"("ideaId");

-- CreateIndex
CREATE INDEX "IdeaScore_ideaId_dimension_idx" ON "IdeaScore"("ideaId", "dimension");

-- CreateIndex
CREATE INDEX "IdeaScore_reviewedBy_idx" ON "IdeaScore"("reviewedBy");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaScore_ideaId_dimension_reviewedBy_key" ON "IdeaScore"("ideaId", "dimension", "reviewedBy");
