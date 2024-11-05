-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tracks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "bandId" TEXT NOT NULL,
    CONSTRAINT "tracks_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "bands" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tracks" ("bandId", "id", "length", "title") SELECT "bandId", "id", "length", "title" FROM "tracks";
DROP TABLE "tracks";
ALTER TABLE "new_tracks" RENAME TO "tracks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
