/*
  Warnings:

  - You are about to drop the column `example` on the `SearchedWord` table. All the data in the column will be lost.
  - You are about to drop the column `phonetic` on the `SearchedWord` table. All the data in the column will be lost.
  - You are about to drop the column `translation` on the `SearchedWord` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SearchedWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "definition" TEXT,
    "userId" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL DEFAULT 1,
    "lastSearched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchedWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SearchedWord" ("createdAt", "definition", "id", "lastSearched", "searchCount", "userId", "word") SELECT "createdAt", "definition", "id", "lastSearched", "searchCount", "userId", "word" FROM "SearchedWord";
DROP TABLE "SearchedWord";
ALTER TABLE "new_SearchedWord" RENAME TO "SearchedWord";
CREATE INDEX "SearchedWord_userId_lastSearched_idx" ON "SearchedWord"("userId", "lastSearched");
CREATE UNIQUE INDEX "SearchedWord_userId_word_key" ON "SearchedWord"("userId", "word");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
