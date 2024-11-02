-- CreateTable
CREATE TABLE "Playlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Playlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PlaylistsToTracks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PlaylistsToTracks_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlaylistsToTracks_B_fkey" FOREIGN KEY ("B") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlaylistsToTracks_AB_unique" ON "_PlaylistsToTracks"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaylistsToTracks_B_index" ON "_PlaylistsToTracks"("B");
