/*
  Warnings:

  - The primary key for the `EmployeeProject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `DateTo` on table `EmployeeProject` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmployeeProject" (
    "EmpID" INTEGER NOT NULL,
    "ProjectID" INTEGER NOT NULL,
    "DateFrom" DATETIME NOT NULL,
    "DateTo" DATETIME NOT NULL,

    PRIMARY KEY ("EmpID", "ProjectID", "DateFrom", "DateTo"),
    CONSTRAINT "EmployeeProject_EmpID_fkey" FOREIGN KEY ("EmpID") REFERENCES "Employee" ("EmpID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeeProject_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project" ("ProjectID") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmployeeProject" ("DateFrom", "DateTo", "EmpID", "ProjectID") SELECT "DateFrom", "DateTo", "EmpID", "ProjectID" FROM "EmployeeProject";
DROP TABLE "EmployeeProject";
ALTER TABLE "new_EmployeeProject" RENAME TO "EmployeeProject";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
