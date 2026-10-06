-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Step" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "taskId" INTEGER NOT NULL,
    CONSTRAINT "Step_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Step" ("description", "dueDate", "id", "name", "taskId") SELECT "description", "dueDate", "id", "name", "taskId" FROM "Step";
DROP TABLE "Step";
ALTER TABLE "new_Step" RENAME TO "Step";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
