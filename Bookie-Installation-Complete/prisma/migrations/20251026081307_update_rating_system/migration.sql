/*
  Warnings:

  - You are about to alter the column `rating` on the `UserBook` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'to_read',
    "rating" REAL,
    "ratingAnswers" TEXT,
    "ratingComments" TEXT,
    "aiRating" REAL,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "review" TEXT,
    "favoriteQuotes" TEXT,
    "dateRead" DATETIME,
    "plannedReadDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserBook" ("bookId", "createdAt", "dateRead", "favoriteQuotes", "id", "notes", "plannedReadDate", "rating", "review", "status", "updatedAt", "userId") SELECT "bookId", "createdAt", "dateRead", "favoriteQuotes", "id", "notes", "plannedReadDate", "rating", "review", "status", "updatedAt", "userId" FROM "UserBook";
DROP TABLE "UserBook";
ALTER TABLE "new_UserBook" RENAME TO "UserBook";
CREATE UNIQUE INDEX "UserBook_userId_bookId_key" ON "UserBook"("userId", "bookId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
