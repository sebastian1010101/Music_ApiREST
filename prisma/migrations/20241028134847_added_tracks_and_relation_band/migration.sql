-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "bandId" TEXT NOT NULL,
    CONSTRAINT "tracks_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "bands" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
