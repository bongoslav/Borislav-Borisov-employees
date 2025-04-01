-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "EmpID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Project" (
    "ProjectID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "EmployeeProject" (
    "EmpID" INTEGER NOT NULL,
    "ProjectID" INTEGER NOT NULL,
    "DateFrom" DATETIME NOT NULL,
    "DateTo" DATETIME,

    PRIMARY KEY ("EmpID", "ProjectID"),
    CONSTRAINT "EmployeeProject_EmpID_fkey" FOREIGN KEY ("EmpID") REFERENCES "Employee" ("EmpID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeeProject_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES "Project" ("ProjectID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
