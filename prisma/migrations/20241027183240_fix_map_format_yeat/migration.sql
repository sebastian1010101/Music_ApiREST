/*
  Warnings:

  - You are about to drop the column `format_year` on the `bands` table. All the data in the column will be lost.
  - Added the required column `formatYear` to the `bands` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "formatYear" INTEGER NOT NULL
);
INSERT INTO "new_bands" ("id", "name") SELECT "id", "name" FROM "bands";
DROP TABLE "bands";
ALTER TABLE "new_bands" RENAME TO "bands";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
