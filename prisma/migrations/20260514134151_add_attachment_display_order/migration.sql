-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attachment" ("createdAt", "displayOrder", "fileName", "id", "ideaId", "mimeType", "size", "storagePath") SELECT "createdAt", "displayOrder", "fileName", "id", "ideaId", "mimeType", "size", "storagePath" FROM "Attachment";
DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";
CREATE UNIQUE INDEX "Attachment_ideaId_displayOrder_key" ON "Attachment"("ideaId", "displayOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
