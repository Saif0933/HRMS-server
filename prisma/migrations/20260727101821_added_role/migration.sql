/*
  Warnings:

  - A unique constraint covering the columns `[name,organizationId]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,organizationId]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organizationId]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "departments_code_key";

-- DropIndex
DROP INDEX "departments_name_key";

-- DropIndex
DROP INDEX "roles_name_key";

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "languagesSpoken" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "permanentAddress" TEXT;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "employeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'In Stock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_punches" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "selfiePreview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_punches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_regularizations" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timeIn" TEXT NOT NULL,
    "timeOut" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_regularizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofence_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geofence_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_rosters" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "mon" TEXT NOT NULL DEFAULT 'General',
    "tue" TEXT NOT NULL DEFAULT 'General',
    "wed" TEXT NOT NULL DEFAULT 'General',
    "thu" TEXT NOT NULL DEFAULT 'General',
    "fri" TEXT NOT NULL DEFAULT 'General',
    "sat" TEXT NOT NULL DEFAULT 'Week Off',
    "sun" TEXT NOT NULL DEFAULT 'Week Off',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_rosters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_documents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "uploadedOn" TEXT NOT NULL,
    "expiresOn" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_family" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "contact" TEXT,
    "bloodGroup" TEXT,
    "isNominee" BOOLEAN NOT NULL DEFAULT false,
    "isInsuranceCovered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_exits" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "resignationDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDay" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "noticeDays" INTEGER NOT NULL DEFAULT 30,
    "leaveEncashDays" INTEGER NOT NULL DEFAULT 0,
    "penaltyDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itClearance" BOOLEAN NOT NULL DEFAULT false,
    "financeClearance" BOOLEAN NOT NULL DEFAULT false,
    "adminClearance" BOOLEAN NOT NULL DEFAULT false,
    "hrClearance" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING_CLEARANCE',
    "settledDate" TIMESTAMP(3),
    "netPayable" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_exits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_posts" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "engagement_post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_post_reactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "engagement_post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_moods" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_moods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_surveys" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_survey_responses" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_tickets" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "slaHoursLeft" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_letters" (
    "id" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientRole" TEXT NOT NULL,
    "joiningDate" TEXT,
    "salaryCtc" TEXT,
    "warningReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issued_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_cycles" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_ATTENDANCE_LOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "basic" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "allowance" DOUBLE PRECISION NOT NULL,
    "pf" DOUBLE PRECISION NOT NULL,
    "pt" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "tds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "arrear" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_exclusions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "emi" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "approvedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_transactions" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REPAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_declarations" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "sec80C" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sec80D" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "declaredHra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_goals" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "kra" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_feedbacks" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_appraisals" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "cycle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_appraisals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_ratings" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EXCEEDS EXPECTATIONS',
    "tasks" TEXT NOT NULL DEFAULT '95%',
    "quality" TEXT NOT NULL DEFAULT '4.5/5',
    "teamwork" TEXT NOT NULL DEFAULT '4.5/5',
    "feedback" TEXT,
    "givenBy" TEXT NOT NULL DEFAULT 'Super Admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLATFORM_ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "licenseTier" TEXT NOT NULL DEFAULT 'Starter',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "contactEmail" TEXT NOT NULL,
    "onboardedDate" TEXT NOT NULL,
    "organizationId" TEXT,
    "iconName" TEXT DEFAULT 'LightningIcon',
    "iconColor" TEXT DEFAULT '#4f46e5',
    "iconBg" TEXT DEFAULT '#ede9fe',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requisitions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "applicantsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'Applied',
    "bgvChecked" BOOLEAN NOT NULL DEFAULT false,
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "hardwareAssigned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "icon" TEXT DEFAULT 'Send',
    "iconBg" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "billing" TEXT NOT NULL DEFAULT 'Billed annually',
    "btnText" TEXT NOT NULL DEFAULT 'Get Started',
    "btnStyle" TEXT,
    "checkColor" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT[],
    "maxEmployees" INTEGER NOT NULL DEFAULT 25,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "billingCycle" TEXT NOT NULL DEFAULT 'ANNUAL',
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_feature_comparisons" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "basic" TEXT NOT NULL,
    "pro" TEXT NOT NULL,
    "ent" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_feature_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheets" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "monHours" DOUBLE PRECISION NOT NULL,
    "tueHours" DOUBLE PRECISION NOT NULL,
    "wedHours" DOUBLE PRECISION NOT NULL,
    "thuHours" DOUBLE PRECISION NOT NULL,
    "friHours" DOUBLE PRECISION NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "week" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_claims" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shift_rosters_employeeId_week_key" ON "shift_rosters"("employeeId", "week");

-- CreateIndex
CREATE INDEX "employee_family_employeeId_idx" ON "employee_family"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_exits_employeeId_key" ON "employee_exits"("employeeId");

-- CreateIndex
CREATE INDEX "employee_exits_employeeId_idx" ON "employee_exits"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_post_likes_postId_employeeId_key" ON "engagement_post_likes"("postId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_post_reactions_postId_employeeId_type_key" ON "engagement_post_reactions"("postId", "employeeId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_moods_employeeId_weekKey_key" ON "engagement_moods"("employeeId", "weekKey");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_survey_responses_surveyId_employeeId_key" ON "corporate_survey_responses"("surveyId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_cycles_month_year_key" ON "payroll_cycles"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_employeeId_cycleId_key" ON "payroll_runs"("employeeId", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_exclusions_employeeId_cycleId_key" ON "payroll_exclusions"("employeeId", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_declarations_employeeId_financialYear_key" ON "tax_declarations"("employeeId", "financialYear");

-- CreateIndex
CREATE UNIQUE INDEX "performance_appraisals_employeeId_cycle_key" ON "performance_appraisals"("employeeId", "cycle");

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "platform_companies_organizationId_key" ON "platform_companies"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "organization_subscriptions_organizationId_idx" ON "organization_subscriptions"("organizationId");

-- CreateIndex
CREATE INDEX "organization_subscriptions_planId_idx" ON "organization_subscriptions"("planId");

-- CreateIndex
CREATE INDEX "departments_organizationId_idx" ON "departments"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_organizationId_key" ON "departments"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_organizationId_key" ON "departments"("code", "organizationId");

-- CreateIndex
CREATE INDEX "employees_organizationId_idx" ON "employees"("organizationId");

-- CreateIndex
CREATE INDEX "roles_organizationId_idx" ON "roles"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_organizationId_key" ON "roles"("name", "organizationId");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_punches" ADD CONSTRAINT "attendance_punches_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_regularizations" ADD CONSTRAINT "attendance_regularizations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_rosters" ADD CONSTRAINT "shift_rosters_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_documents" ADD CONSTRAINT "vault_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_family" ADD CONSTRAINT "employee_family_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_exits" ADD CONSTRAINT "employee_exits_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_comments" ADD CONSTRAINT "engagement_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "engagement_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_post_likes" ADD CONSTRAINT "engagement_post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "engagement_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_post_likes" ADD CONSTRAINT "engagement_post_likes_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_post_reactions" ADD CONSTRAINT "engagement_post_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "engagement_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_post_reactions" ADD CONSTRAINT "engagement_post_reactions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_moods" ADD CONSTRAINT "engagement_moods_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_survey_responses" ADD CONSTRAINT "corporate_survey_responses_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "corporate_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_survey_responses" ADD CONSTRAINT "corporate_survey_responses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_tickets" ADD CONSTRAINT "help_tickets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "payroll_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_exclusions" ADD CONSTRAINT "payroll_exclusions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_exclusions" ADD CONSTRAINT "payroll_exclusions_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "payroll_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_transactions" ADD CONSTRAINT "loan_transactions_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_declarations" ADD CONSTRAINT "tax_declarations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_goals" ADD CONSTRAINT "performance_goals_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_feedbacks" ADD CONSTRAINT "performance_feedbacks_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_appraisals" ADD CONSTRAINT "performance_appraisals_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_ratings" ADD CONSTRAINT "performance_ratings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_companies" ADD CONSTRAINT "platform_companies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_claims" ADD CONSTRAINT "travel_claims_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
