/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClaimRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeedPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HelpTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Holiday` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvestmentDeclaration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IssuedLetter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobRequisition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KraGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeaveRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MusterRollRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollLoan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payslip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PerformanceFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PunchLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegularizationRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RosterShift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Timesheet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transfer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VaultDoc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_jobRequisitionId_fkey";

-- DropForeignKey
ALTER TABLE "ClaimRequest" DROP CONSTRAINT "ClaimRequest_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_managerId_fkey";

-- DropForeignKey
ALTER TABLE "FeedPost" DROP CONSTRAINT "FeedPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "HelpTicket" DROP CONSTRAINT "HelpTicket_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "InvestmentDeclaration" DROP CONSTRAINT "InvestmentDeclaration_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "IssuedLetter" DROP CONSTRAINT "IssuedLetter_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "KraGoal" DROP CONSTRAINT "KraGoal_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveRequest" DROP CONSTRAINT "LeaveRequest_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "MusterRollRecord" DROP CONSTRAINT "MusterRollRecord_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollLoan" DROP CONSTRAINT "PayrollLoan_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceFeedback" DROP CONSTRAINT "PerformanceFeedback_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceFeedback" DROP CONSTRAINT "PerformanceFeedback_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PunchLog" DROP CONSTRAINT "PunchLog_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_postId_fkey";

-- DropForeignKey
ALTER TABLE "RegularizationRequest" DROP CONSTRAINT "RegularizationRequest_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "RosterShift" DROP CONSTRAINT "RosterShift_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Timesheet" DROP CONSTRAINT "Timesheet_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "VaultDoc" DROP CONSTRAINT "VaultDoc_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "WorkHistory" DROP CONSTRAINT "WorkHistory_employeeId_fkey";

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Candidate";

-- DropTable
DROP TABLE "ClaimRequest";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Employee";

-- DropTable
DROP TABLE "FeedPost";

-- DropTable
DROP TABLE "HelpTicket";

-- DropTable
DROP TABLE "Holiday";

-- DropTable
DROP TABLE "InvestmentDeclaration";

-- DropTable
DROP TABLE "IssuedLetter";

-- DropTable
DROP TABLE "JobRequisition";

-- DropTable
DROP TABLE "KraGoal";

-- DropTable
DROP TABLE "LeaveRequest";

-- DropTable
DROP TABLE "MusterRollRecord";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "PayrollLoan";

-- DropTable
DROP TABLE "Payslip";

-- DropTable
DROP TABLE "PerformanceFeedback";

-- DropTable
DROP TABLE "Promotion";

-- DropTable
DROP TABLE "PunchLog";

-- DropTable
DROP TABLE "Reaction";

-- DropTable
DROP TABLE "RegularizationRequest";

-- DropTable
DROP TABLE "RosterShift";

-- DropTable
DROP TABLE "Timesheet";

-- DropTable
DROP TABLE "Transfer";

-- DropTable
DROP TABLE "VaultDoc";

-- DropTable
DROP TABLE "WorkHistory";

-- DropEnum
DROP TYPE "AssetStatus";

-- DropEnum
DROP TYPE "AssetType";

-- DropEnum
DROP TYPE "CandidateStage";

-- DropEnum
DROP TYPE "ClaimStatus";

-- DropEnum
DROP TYPE "ClaimType";

-- DropEnum
DROP TYPE "DocumentCategory";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "LeaveStatus";

-- DropEnum
DROP TYPE "LetterTemplate";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "RosterShiftType";

-- DropEnum
DROP TYPE "TicketCategory";

-- DropEnum
DROP TYPE "TicketStatus";

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "managerId" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'PROBATION',
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "designation" TEXT,
    "userId" TEXT,
    "departmentId" TEXT,
    "managerId" TEXT,
    "basic" DOUBLE PRECISION,
    "hra" DOUBLE PRECISION,
    "allowance" DOUBLE PRECISION,
    "deductions" DOUBLE PRECISION,
    "netSalary" DOUBLE PRECISION,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "ifsc" TEXT,
    "pan" TEXT,
    "aadhaar" TEXT,
    "uan" TEXT,
    "pfNumber" TEXT,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "bloodGroup" TEXT,
    "maritalStatus" TEXT,
    "qualification" TEXT,
    "university" TEXT,
    "passingYear" TEXT,
    "probationDuration" TEXT,
    "probationEnd" TIMESTAMP(3),
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING',
    "exitDate" TIMESTAMP(3),
    "clearanceStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "roleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE INDEX "employees_managerId_idx" ON "employees"("managerId");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_departmentId_idx" ON "employees"("departmentId");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
