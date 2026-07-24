import { prisma } from "./prisma.ts";
import { seedPermissions } from "../seed/permission.seed.ts";

/**
 * Automatically creates the users table and indexes if they do not exist
 */
export async function syncDatabase() {
  try {
    console.log("[DB Sync] Synchronizing database tables...");

    // 1. Create permissions table and unique index
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "module" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");
    `);

    // 2. Create roles table and unique index
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "isSystem" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
    `);

    // 3. Create implicit many-to-many join table (_PermissionToRole) and indices
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_PermissionToRole" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "_PermissionToRole_B_index" ON "_PermissionToRole"("B");
    `);

    // 3.5. Create departments table and indices
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "description" TEXT,
        "managerId" TEXT,
        "parentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "departments_name_key" ON "departments"("name");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "departments_code_key" ON "departments"("code");
    `);

    // 4. Handle "users" table creation/alteration
    try {
      await prisma.$queryRawUnsafe(`SELECT 1 FROM "users" LIMIT 1`);
      console.log("[DB Sync] Table 'users' already exists.");
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;`);
        console.log("[DB Sync] Successfully dropped NOT NULL constraint on email column.");
      } catch (alterError: any) {
        // Ignore errors if the database state is already correct
      }
    } catch (error: any) {
      console.log("[DB Sync] Table 'users' does not exist. Creating table...");
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL,
          "name" TEXT,
          "email" TEXT,
          "phone" TEXT,
          "password" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone");
      `);
      console.log("[DB Sync] Table 'users' and unique indexes created successfully!");
    }

    // 4.5. Create platform_admins table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "platform_admins" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'PLATFORM_ADMIN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "platform_admins_email_key" ON "platform_admins"("email");
    `);

    // 5. Add "roleId" column to "users" safely (handling both lowercase and camelCase scenarios)
    const userRoleColumnCheck = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'roleId'
    `);
    if (userRoleColumnCheck.length === 0) {
      const userRoleLowercaseCheck = await prisma.$queryRawUnsafe<any[]>(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'roleid'
      `);
      if (userRoleLowercaseCheck.length > 0) {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" RENAME COLUMN "roleid" TO "roleId";`);
        console.log("[DB Sync] Renamed 'roleid' to 'roleId' in 'users' table.");
      } else {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN "roleId" TEXT;`);
        console.log("[DB Sync] Added 'roleId' column to 'users' table.");
      }
    }

    // 5.5. Create employees table and indices
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "employees" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "password" TEXT,
        "avatar" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PROBATION',
        "joiningDate" TIMESTAMP(3) NOT NULL,
        "location" TEXT,
        "designation" TEXT,
        "userId" TEXT,
        "departmentId" TEXT,
        "managerId" TEXT,
        
        -- Salary details
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

        -- Personal Details
        "gender" TEXT,
        "dob" TIMESTAMP(3),
        "bloodGroup" TEXT,
        "maritalStatus" TEXT,
        "qualification" TEXT,
        "university" TEXT,
        "passingYear" TEXT,

        -- Workflows & Exit
        "probationDuration" TEXT,
        "probationEnd" TIMESTAMP(3),
        "confirmationStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "exitDate" TIMESTAMP(3),
        "clearanceStatus" TEXT,

        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
      );
    `);
    
    // Add password column safely if employees table already exists
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "password" TEXT;`);
    } catch (colErr: any) {
      // Ignore error if column already exists
    }
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "employees_email_key" ON "employees"("email");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "employees_userId_key" ON "employees"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "employees_managerId_idx" ON "employees"("managerId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "employees_departmentId_idx" ON "employees"("departmentId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "employees_status_idx" ON "employees"("status");
    `);

    // Create custom ENUM types in PostgreSQL safely if they do not exist
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeaveStatus') THEN
          CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HalfDaySession') THEN
          CREATE TYPE "HalfDaySession" AS ENUM ('FIRST_HALF', 'SECOND_HALF');
        END IF;
      END $$;
    `);

    // Drop leave_requests if the columns are text-based to rebuild them cleanly with the proper enums
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        col_type text;
      BEGIN
        SELECT data_type INTO col_type 
        FROM information_schema.columns 
        WHERE table_name = 'leave_requests' AND column_name = 'status';
        
        IF col_type = 'character varying' OR col_type = 'text' THEN
          DROP TABLE IF EXISTS "leave_requests" CASCADE;
        END IF;
      END $$;
    `);

    // 5.6. Create leave_types table and indices
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "leave_types" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "description" TEXT,
        "defaultDays" DOUBLE PRECISION NOT NULL,
        "carryForward" BOOLEAN NOT NULL DEFAULT false,
        "maxCarryForward" DOUBLE PRECISION DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "leave_types_name_key" ON "leave_types"("name");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "leave_types_code_key" ON "leave_types"("code");
    `);

    // 5.7. Create leave_allocations table and indices
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "leave_allocations" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "leaveTypeId" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "allocated" DOUBLE PRECISION NOT NULL,
        "used" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "pending" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "carriedForward" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "leave_allocations_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "leave_allocations_employeeId_leaveTypeId_year_key" ON "leave_allocations"("employeeId", "leaveTypeId", "year");
    `);

    // 5.8. Create leave_requests table and indices using custom enums
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "leave_requests" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "leaveTypeId" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "halfDay" BOOLEAN NOT NULL DEFAULT false,
        "halfDaySession" "HalfDaySession",
        "totalDays" DOUBLE PRECISION NOT NULL,
        "reason" TEXT NOT NULL,
        "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
        "attachmentUrl" TEXT,
        "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "approvedById" TEXT,
        "approvedAt" TIMESTAMP(3),
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
      );
    `);

    // 5.9. Create organizations table
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MembershipStatus') THEN
          CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');
        END IF;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id"          TEXT NOT NULL,
        "name"        TEXT NOT NULL,
        "description" TEXT,
        "logoUrl"     TEXT,
        "website"     TEXT,
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "organizations_name_key" ON "organizations"("name");
    `);

    // Create payroll tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "payroll_cycles" (
        "id" TEXT NOT NULL,
        "month" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING_ATTENDANCE_LOCK',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "payroll_cycles_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "payroll_cycles_month_year_key" ON "payroll_cycles"("month", "year");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "payroll_runs" (
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "payroll_runs_employeeId_cycleId_key" ON "payroll_runs"("employeeId", "cycleId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "payroll_exclusions" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "cycleId" TEXT NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "payroll_exclusions_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "payroll_exclusions_employeeId_cycleId_key" ON "payroll_exclusions"("employeeId", "cycleId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "loans" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "principal" DOUBLE PRECISION NOT NULL,
        "balance" DOUBLE PRECISION NOT NULL,
        "emi" DOUBLE PRECISION NOT NULL,
        "purpose" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "approvedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "loan_transactions" (
        "id" TEXT NOT NULL,
        "loanId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'REPAYMENT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "loan_transactions_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "tax_declarations" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "financialYear" TEXT NOT NULL,
        "sec80C" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "sec80D" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "declaredHra" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tax_declarations_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "tax_declarations_employeeId_financialYear_key" ON "tax_declarations"("employeeId", "financialYear");
    `);

    // Create performance tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "performance_goals" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "weight" TEXT NOT NULL,
        "kra" TEXT NOT NULL,
        "progress" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'In Progress',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "performance_goals_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "performance_feedbacks" (
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
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "performance_appraisals" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "cycle" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "performance_appraisals_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "performance_appraisals_employeeId_cycle_key" ON "performance_appraisals"("employeeId", "cycle");
    `);

    // Create engagement tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "engagement_posts" (
        "id" TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "authorRole" TEXT NOT NULL,
        "authorAvatar" TEXT,
        "content" TEXT NOT NULL,
        "image" TEXT,
        "likesCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "engagement_posts_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "engagement_comments" (
        "id" TEXT NOT NULL,
        "postId" TEXT NOT NULL,
        "userName" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "engagement_comments_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "engagement_post_likes" (
        "id" TEXT NOT NULL,
        "postId" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        CONSTRAINT "engagement_post_likes_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "engagement_post_likes_postId_employeeId_key" ON "engagement_post_likes"("postId", "employeeId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "engagement_post_reactions" (
        "id" TEXT NOT NULL,
        "postId" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        CONSTRAINT "engagement_post_reactions_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "engagement_post_reactions_postId_employeeId_type_key" ON "engagement_post_reactions"("postId", "employeeId", "type");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "engagement_moods" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "mood" TEXT NOT NULL,
        "weekKey" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "engagement_moods_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "engagement_moods_employeeId_weekKey_key" ON "engagement_moods"("employeeId", "weekKey");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "corporate_surveys" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "closesAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "corporate_surveys_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "corporate_survey_responses" (
        "id" TEXT NOT NULL,
        "surveyId" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "corporate_survey_responses_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "corporate_survey_responses_surveyId_employeeId_key" ON "corporate_survey_responses"("surveyId", "employeeId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "travel_claims" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "date" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'Pending',
        "receiptUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "travel_claims_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "timesheets" (
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "job_requisitions" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "department" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'Open',
        "applicantsCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "job_requisitions_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "candidates" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "experience" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "stage" TEXT NOT NULL DEFAULT 'Applied',
        "bgvChecked" BOOLEAN NOT NULL DEFAULT FALSE,
        "contractSigned" BOOLEAN NOT NULL DEFAULT FALSE,
        "hardwareAssigned" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "vault_documents" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "uploadedOn" TEXT NOT NULL,
        "expiresOn" TEXT,
        "status" TEXT NOT NULL DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "vault_documents_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "assets" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "serial" TEXT NOT NULL,
        "employeeId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'In Stock',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "issued_letters" (
        "id" TEXT NOT NULL,
        "templateType" TEXT NOT NULL,
        "recipientName" TEXT NOT NULL,
        "recipientRole" TEXT NOT NULL,
        "joiningDate" TEXT,
        "salaryCtc" TEXT,
        "warningReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "issued_letters_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "help_tickets" (
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "help_tickets_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "attendance_punches" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "time" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "method" TEXT NOT NULL,
        "lat" DOUBLE PRECISION NOT NULL,
        "lng" DOUBLE PRECISION NOT NULL,
        "selfiePreview" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "attendance_punches_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "attendance_regularizations" (
        "id" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "timeIn" TEXT NOT NULL,
        "timeOut" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'Pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "attendance_regularizations_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "geofence_locations" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "lat" DOUBLE PRECISION NOT NULL,
        "lng" DOUBLE PRECISION NOT NULL,
        "radius" DOUBLE PRECISION NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "geofence_locations_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "shift_rosters" (
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "shift_rosters_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "shift_rosters_employeeId_week_key" ON "shift_rosters"("employeeId", "week");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" TEXT NOT NULL,
        "user" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "module" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "holidays" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
      );
    `);

    // 5.10. Create memberships table (User 1-to-1 Membership, Membership Many-to-Many Organization)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "memberships" (
        "id"             TEXT NOT NULL,
        "userId"         TEXT NOT NULL,
        "roleId"         TEXT,
        "status"         "MembershipStatus" NOT NULL DEFAULT 'PENDING',
        "joinedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "memberships_userId_key" ON "memberships"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "memberships_userId_idx" ON "memberships"("userId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "memberships_roleId_idx" ON "memberships"("roleId");
    `);

    // Ensure memberships table has "roleId" column in case-sensitive format
    try {
      const membershipRoleColumnCheck = await prisma.$queryRawUnsafe<any[]>(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'memberships' AND column_name = 'roleId'
      `);
      if (membershipRoleColumnCheck.length === 0) {
        const membershipRoleLowercaseCheck = await prisma.$queryRawUnsafe<any[]>(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'memberships' AND column_name = 'roleid'
        `);
        if (membershipRoleLowercaseCheck.length > 0) {
          await prisma.$executeRawUnsafe(`ALTER TABLE "memberships" RENAME COLUMN "roleid" TO "roleId";`);
          console.log("[DB Sync] Renamed 'roleid' to 'roleId' in 'memberships' table.");
        } else {
          await prisma.$executeRawUnsafe(`ALTER TABLE "memberships" ADD COLUMN "roleId" TEXT;`);
          console.log("[DB Sync] Added 'roleId' column to 'memberships' table.");
        }
      }
    } catch (e) {
      // Ignore if column check fails
    }

    // 6. Setup foreign key constraints safely
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        -- users -> roles
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'users_roleId_fkey'
        ) THEN
          ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" 
          FOREIGN KEY ("roleId") REFERENCES "roles"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- join table A -> permissions
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = '_PermissionToRole_A_fkey'
        ) THEN
          ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" 
          FOREIGN KEY ("A") REFERENCES "permissions"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- join table B -> roles
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = '_PermissionToRole_B_fkey'
        ) THEN
          ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" 
          FOREIGN KEY ("B") REFERENCES "roles"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- departments -> users (managerId)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'departments_managerId_fkey'
        ) THEN
          ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" 
          FOREIGN KEY ("managerId") REFERENCES "users"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- departments -> departments (parentId self-relation)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'departments_parentId_fkey'
        ) THEN
          ALTER TABLE "departments" ADD CONSTRAINT "departments_parentId_fkey" 
          FOREIGN KEY ("parentId") REFERENCES "departments"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- employees -> users (userId)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'employees_userId_fkey'
        ) THEN
          ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "users"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- employees -> departments (departmentId)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'employees_departmentId_fkey'
        ) THEN
          ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" 
          FOREIGN KEY ("departmentId") REFERENCES "departments"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- employees -> employees (managerId self-relation)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'employees_managerId_fkey'
        ) THEN
          ALTER TABLE "employees" ADD CONSTRAINT "employees_managerId_fkey" 
          FOREIGN KEY ("managerId") REFERENCES "employees"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- leave_allocations -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'leave_allocations_employeeId_fkey'
        ) THEN
          ALTER TABLE "leave_allocations" ADD CONSTRAINT "leave_allocations_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- leave_allocations -> leave_types
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'leave_allocations_leaveTypeId_fkey'
        ) THEN
          ALTER TABLE "leave_allocations" ADD CONSTRAINT "leave_allocations_leaveTypeId_fkey" 
          FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- leave_requests -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'leave_requests_employeeId_fkey'
        ) THEN
          ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- leave_requests -> leave_types
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'leave_requests_leaveTypeId_fkey'
        ) THEN
          ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leaveTypeId_fkey" 
          FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- leave_requests -> users (approvedById)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'leave_requests_approvedById_fkey'
        ) THEN
          ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedById_fkey" 
          FOREIGN KEY ("approvedById") REFERENCES "users"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- memberships -> users
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'memberships_userId_fkey'
        ) THEN
          ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "users"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;



        -- memberships -> roles (org-level role assignment)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'memberships_roleId_fkey'
        ) THEN
          ALTER TABLE "memberships" ADD CONSTRAINT "memberships_roleId_fkey" 
          FOREIGN KEY ("roleId") REFERENCES "roles"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- payroll_runs -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'payroll_runs_employeeId_fkey'
        ) THEN
          ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- payroll_runs -> payroll_cycles
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'payroll_runs_cycleId_fkey'
        ) THEN
          ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_cycleId_fkey" 
          FOREIGN KEY ("cycleId") REFERENCES "payroll_cycles"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- payroll_exclusions -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'payroll_exclusions_employeeId_fkey'
        ) THEN
          ALTER TABLE "payroll_exclusions" ADD CONSTRAINT "payroll_exclusions_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- payroll_exclusions -> payroll_cycles
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'payroll_exclusions_cycleId_fkey'
        ) THEN
          ALTER TABLE "payroll_exclusions" ADD CONSTRAINT "payroll_exclusions_cycleId_fkey" 
          FOREIGN KEY ("cycleId") REFERENCES "payroll_cycles"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- loans -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'loans_employeeId_fkey'
        ) THEN
          ALTER TABLE "loans" ADD CONSTRAINT "loans_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- loan_transactions -> loans
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'loan_transactions_loanId_fkey'
        ) THEN
          ALTER TABLE "loan_transactions" ADD CONSTRAINT "loan_transactions_loanId_fkey" 
          FOREIGN KEY ("loanId") REFERENCES "loans"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- tax_declarations -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'tax_declarations_employeeId_fkey'
        ) THEN
          ALTER TABLE "tax_declarations" ADD CONSTRAINT "tax_declarations_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- performance_goals -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'performance_goals_employeeId_fkey'
        ) THEN
          ALTER TABLE "performance_goals" ADD CONSTRAINT "performance_goals_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- performance_feedbacks -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'performance_feedbacks_employeeId_fkey'
        ) THEN
          ALTER TABLE "performance_feedbacks" ADD CONSTRAINT "performance_feedbacks_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- performance_appraisals -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'performance_appraisals_employeeId_fkey'
        ) THEN
          ALTER TABLE "performance_appraisals" ADD CONSTRAINT "performance_appraisals_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- engagement_comments -> engagement_posts
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'engagement_comments_postId_fkey'
        ) THEN
          ALTER TABLE "engagement_comments" ADD CONSTRAINT "engagement_comments_postId_fkey" 
          FOREIGN KEY ("postId") REFERENCES "engagement_posts"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- engagement_post_likes -> engagement_posts
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'engagement_post_likes_postId_fkey'
        ) THEN
          ALTER TABLE "engagement_post_likes" ADD CONSTRAINT "engagement_post_likes_postId_fkey" 
          FOREIGN KEY ("postId") REFERENCES "engagement_posts"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- engagement_post_likes -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'engagement_post_likes_employeeId_fkey'
        ) THEN
          ALTER TABLE "engagement_post_likes" ADD CONSTRAINT "engagement_post_likes_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- engagement_post_reactions -> engagement_posts
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'engagement_post_reactions_postId_fkey'
        ) THEN
          ALTER TABLE "engagement_post_reactions" ADD CONSTRAINT "engagement_post_reactions_postId_fkey" 
          FOREIGN KEY ("postId") REFERENCES "engagement_posts"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- engagement_post_reactions -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'engagement_post_reactions_employeeId_fkey'
        ) THEN
          ALTER TABLE "engagement_post_reactions" ADD CONSTRAINT "engagement_post_reactions_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- engagement_moods -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'engagement_moods_employeeId_fkey'
        ) THEN
          ALTER TABLE "engagement_moods" ADD CONSTRAINT "engagement_moods_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- corporate_survey_responses -> corporate_surveys
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'corporate_survey_responses_surveyId_fkey'
        ) THEN
          ALTER TABLE "corporate_survey_responses" ADD CONSTRAINT "corporate_survey_responses_surveyId_fkey" 
          FOREIGN KEY ("surveyId") REFERENCES "corporate_surveys"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- corporate_survey_responses -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'corporate_survey_responses_employeeId_fkey'
        ) THEN
          ALTER TABLE "corporate_survey_responses" ADD CONSTRAINT "corporate_survey_responses_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- travel_claims -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'travel_claims_employeeId_fkey'
        ) THEN
          ALTER TABLE "travel_claims" ADD CONSTRAINT "travel_claims_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- timesheets -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'timesheets_employeeId_fkey'
        ) THEN
          ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- vault_documents -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'vault_documents_employeeId_fkey'
        ) THEN
          ALTER TABLE "vault_documents" ADD CONSTRAINT "vault_documents_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- assets -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'assets_employeeId_fkey'
        ) THEN
          ALTER TABLE "assets" ADD CONSTRAINT "assets_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        -- help_tickets -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'help_tickets_employeeId_fkey'
        ) THEN
          ALTER TABLE "help_tickets" ADD CONSTRAINT "help_tickets_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- attendance_punches -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'attendance_punches_employeeId_fkey'
        ) THEN
          ALTER TABLE "attendance_punches" ADD CONSTRAINT "attendance_punches_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        -- attendance_regularizations -> employees
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'attendance_regularizations_employeeId_fkey'
        ) THEN
          ALTER TABLE "attendance_regularizations" ADD CONSTRAINT "attendance_regularizations_employeeId_fkey" 
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

      END $$;
    `);

    // 7. Seed system-default roles if they don't exist
    const rolesToSeed = [
      { id: "role_super_admin", name: "SUPER_ADMIN", description: "System Administrator with full access" },
      { id: "role_hr_admin", name: "HR_ADMIN", description: "HR Administrator with management access" },
      { id: "role_manager", name: "MANAGER", description: "Department Manager" },
      { id: "role_employee", name: "EMPLOYEE", description: "Regular Employee" },
    ];

    for (const r of rolesToSeed) {
      const existingRole = await prisma.role.findFirst({
        where: { name: r.name },
      });

      if (!existingRole) {
        await prisma.role.create({
          data: {
            id: r.id,
            name: r.name,
            description: r.description,
            isSystem: true,
          },
        });
        console.log(`[DB Sync] Seeded system default ${r.name} role.`);
      }
    }

    // 7.5 Seed default leave types if table is empty
    const leaveTypesCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "leave_types"`);
    const countVal = Number((leaveTypesCount as any)[0]?.count || 0);
    if (countVal === 0) {
      console.log("[DB Sync] Seeding default leave types...");
      await prisma.$executeRawUnsafe(`
        INSERT INTO "leave_types" ("id", "name", "code", "description", "defaultDays", "carryForward", "maxCarryForward", "isActive") VALUES
        ('lt_sl', 'Sick Leave', 'SL', 'Paid time off for medical needs/recovery', 12, false, 0, true),
        ('lt_cl', 'Casual Leave', 'CL', 'Paid time off for personal/urgent matters', 12, false, 0, true),
        ('lt_el', 'Earned Leave', 'EL', 'Accrued annual leave balance', 18, true, 10, true),
        ('lt_lwp', 'Leave Without Pay', 'LWP', 'Unpaid leave requests', 365, false, 0, true)
      `);
      console.log("[DB Sync] Seeded default leave types successfully!");
    }

    // 7.6 Seed default holidays if table is empty
    const holidaysCountObj = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "holidays"`);
    const holidaysCountVal = Number((holidaysCountObj as any)[0]?.count || 0);
    if (holidaysCountVal === 0) {
      console.log("[DB Sync] Seeding default holidays...");
      await prisma.$executeRawUnsafe(`
        INSERT INTO "holidays" ("id", "name", "type", "date", "createdAt", "updatedAt") VALUES
        ('hol_1', 'Independence Day', 'National Holiday', '2026-08-15 00:00:00', NOW(), NOW()),
        ('hol_2', 'Ganesh Chaturthi', 'Regional Holiday', '2026-09-14 00:00:00', NOW(), NOW()),
        ('hol_3', 'New Year', 'National Holiday', '2026-01-01 00:00:00', NOW(), NOW())
      `);
      console.log("[DB Sync] Seeded default holidays successfully!");
    }

    // 7.7 Seed default audit logs if table is empty
    const auditLogsCountObj = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "audit_logs"`);
    const auditLogsCountVal = Number((auditLogsCountObj as any)[0]?.count || 0);
    if (auditLogsCountVal === 0) {
      console.log("[DB Sync] Seeding default audit logs...");
      await prisma.$executeRawUnsafe(`
        INSERT INTO "audit_logs" ("id", "user", "action", "module", "details", "createdAt", "updatedAt") VALUES
        ('log_1', 'HR Admin (Karan Johar)', 'Approved Leave Request', 'Leave Management', 'Approved 4 days of Earned Leave for Ananya Roy (EMP008)', NOW(), NOW()),
        ('log_2', 'System', 'Asset Assigned', 'Asset Management', 'Assigned Asset AST-078 (ThinkPad L14) to Ananya Roy (EMP008)', NOW(), NOW()),
        ('log_3', 'HR Admin (Karan Johar)', 'Onboarded Employee', 'Employee Master', 'Completed post-onboarding tasks for Ananya Roy', NOW(), NOW()),
        ('log_4', 'CEO (Vikram Malhotra)', 'Posted Announcement', 'Employee Engagement', 'Announced Q2 customer satisfaction record', NOW(), NOW())
      `);
      console.log("[DB Sync] Seeded default audit logs successfully!");
    }

    // 8. Auto-assign ALL role-less users to SUPER_ADMIN to ensure local testing works seamlessly
    const superAdminRoleObj = await prisma.role.findFirst({
      where: { name: "SUPER_ADMIN" },
    });

    if (superAdminRoleObj) {
      const usersWithoutRole = await prisma.user.findMany({
        where: { roleId: null },
      });

      if (usersWithoutRole.length > 0) {
        await prisma.user.updateMany({
          where: { roleId: null },
          data: { roleId: superAdminRoleObj.id },
        });
        console.log(`[DB Sync] Auto-assigned ${usersWithoutRole.length} user(s) without roles to SUPER_ADMIN role.`);
      }

      // Ensure test user with phone "6200065370" is seeded and promoted to SUPER_ADMIN
      let testUser = await prisma.user.findFirst({
        where: { phone: "6200065370" }
      });
      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            phone: "6200065370",
            name: "Test Admin User",
            email: "testadmin@symbosys.com",
            roleId: superAdminRoleObj.id,
          }
        });
        console.log("[DB Sync] Created test user 6200065370 as SUPER_ADMIN.");
      } else if (testUser.roleId !== superAdminRoleObj.id) {
        await prisma.user.update({
          where: { id: testUser.id },
          data: { roleId: superAdminRoleObj.id }
        });
        console.log("[DB Sync] Successfully promoted test user 6200065370 to SUPER_ADMIN.");
      }

      // Ensure test employee is also created and linked
      let testEmployee = await prisma.employee.findUnique({
        where: { userId: testUser.id }
      });
      if (!testEmployee) {
        const empCount = await prisma.employee.count();
        const empId = `EMP${String(empCount + 1).padStart(3, '0')}`;
        await prisma.employee.create({
          data: {
            id: empId,
            name: testUser.name || "Test Admin User",
            email: testUser.email || "testadmin@symbosys.com",
            phone: testUser.phone,
            status: "ACTIVE",
            joiningDate: new Date(),
            userId: testUser.id,
          }
        });
        console.log(`[DB Sync] Created and linked test employee ${empId} for test user 6200065370.`);
      }
    }

    // Seed/Validate permissions for CRUD operations across modules
    await seedPermissions();

    // Print current users status for debugging
    const allUsers = await prisma.user.findMany({
      include: { role: true },
    });
    console.log(
      "[DB Sync] Current users in DB:",
      allUsers.map((u) => ({
        id: u.id,
        phone: u.phone,
        email: u.email,
        role: u.role?.name || "NONE",
      }))
    );

    console.log("[DB Sync] Role, Permission, and User relationships synchronized successfully!");
  } catch (error: any) {
    console.error("[DB Sync] Database sync failed:", error.message || error);
    throw error;
  }
}
