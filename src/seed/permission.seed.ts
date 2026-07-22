import { prisma } from "../db/prisma.ts";

export interface PermissionSeed {
  name: string;
  description: string;
  module: string;
}

const MODULES = [
  { key: "employees", label: "Employee Center" },
  { key: "attendance", label: "Attendance" },
  { key: "leave", label: "Leave Management" },
  { key: "payroll", label: "Payroll Processing" },
  { key: "performance", label: "Performance (PMS)" },
  { key: "engagement", label: "Engagement & Surveys" },
  { key: "claims", label: "Travel & Claims" },
  { key: "timesheets", label: "Timesheets" },
  { key: "recruitment", label: "Recruitment & ATS" },
  { key: "documents", label: "Document Vault" },
  { key: "assets", label: "Asset Management" },
  { key: "letters", label: "Letter Generator" },
  { key: "helpdesk", label: "HR Help Desk" },
  { key: "admin", label: "Roles & System Administration" }
];

const GRANULAR_PERMISSIONS = [
  // Employee Center Sub-permissions
  { name: "VIEW_EMPLOYEE_DIRECTORY", description: "Can view employee directory list", module: "employees" },
  { name: "VIEW_EMPLOYEE_MASTER", description: "Can view detailed employee master profiles", module: "employees" },
  { name: "UPDATE_EMPLOYEE_MASTER", description: "Can edit employee master profile details", module: "employees" },
  { name: "VIEW_ORGANIZATION_CHART", description: "Can view the organization reporting chart", module: "employees" },
  { name: "VIEW_EXIT_SETTLEMENT", description: "Can view resignation and exit settlement workflows", module: "employees" },
  { name: "UPDATE_EXIT_SETTLEMENT", description: "Can process resignations and final settlements", module: "employees" },
  { name: "MANAGE_BULK_IMPORTS", description: "Can perform bulk imports and exports of employee data", module: "employees" },
  { name: "VIEW_ROLES_PERMISSIONS", description: "Can view roles and assigned permissions", module: "employees" },
  { name: "UPDATE_ROLES_PERMISSIONS", description: "Can manage and assign role permissions", module: "employees" },
  { name: "VIEW_DEPARTMENTS", description: "Can view company departments list", module: "employees" },
  { name: "UPDATE_DEPARTMENTS", description: "Can create or edit company departments", module: "employees" },

  // Attendance Sub-permissions
  { name: "VIEW_GPS_SELFIE_PUNCH", description: "Can view GPS and selfie punch logs", module: "attendance" },
  { name: "CREATE_GPS_SELFIE_PUNCH", description: "Can mark attendance using GPS / selfie punch", module: "attendance" },
  { name: "VIEW_SHIFT_ROSTER", description: "Can view shifts and rosters calendar", module: "attendance" },
  { name: "UPDATE_SHIFT_ROSTER", description: "Can assign and modify employee shift rosters", module: "attendance" },
  { name: "VIEW_ATTENDANCE_REGULARIZATION", description: "Can view attendance regularization requests", module: "attendance" },
  { name: "CREATE_ATTENDANCE_REGULARIZATION", description: "Can submit attendance regularization requests", module: "attendance" },
  { name: "UPDATE_ATTENDANCE_REGULARIZATION", description: "Can approve or reject attendance regularization requests", module: "attendance" },
  { name: "VIEW_MUSTER_ROLL", description: "Can view muster roll and attendance calendar", module: "attendance" },
  { name: "VIEW_ATTENDANCE_REPORTS", description: "Can generate and view attendance summary reports", module: "attendance" },

  // Leave Management Sub-permissions
  { name: "CREATE_LEAVE_APPLICATION", description: "Can apply for leaves", module: "leave" },
  { name: "VIEW_LEAVE_APPLICATION", description: "Can view own and team leave applications", module: "leave" },
  { name: "UPDATE_LEAVE_APPROVAL", description: "Can approve or reject pending leave requests", module: "leave" },
  { name: "VIEW_LEAVE_CALENDAR", description: "Can view leave calendar for the department/company", module: "leave" },
  { name: "VIEW_LEAVE_POLICIES", description: "Can view leave balance and policies", module: "leave" },
  { name: "UPDATE_LEAVE_POLICIES", description: "Can create or modify company leave policies", module: "leave" },

  // Payroll Processing Sub-permissions
  { name: "UPDATE_SALARY_PROCESSING", description: "Can process monthly salary payouts", module: "payroll" },
  { name: "UPDATE_SALARY_STRUCTURE", description: "Can modify employee salary structure and revisions", module: "payroll" },
  { name: "VIEW_LOANS_ADVANCES", description: "Can view loan and advance requests", module: "payroll" },
  { name: "CREATE_LOANS_ADVANCES", description: "Can apply for loans or salary advances", module: "payroll" },
  { name: "UPDATE_LOANS_ADVANCES", description: "Can approve or process loan and advance requests", module: "payroll" },
  { name: "VIEW_INVESTMENT_DECLARATIONS", description: "Can view IT investment declarations", module: "payroll" },
  { name: "CREATE_INVESTMENT_DECLARATIONS", description: "Can submit tax investment declarations", module: "payroll" },
  { name: "UPDATE_INVESTMENT_DECLARATIONS", description: "Can verify and lock tax declarations", module: "payroll" },
  { name: "VIEW_PAYSLIP_TEMPLATES", description: "Can view and configure payslip templates", module: "payroll" },
  { name: "VIEW_PAYROLL_REPORTS", description: "Can generate payroll, statutory, and ECR reports", module: "payroll" },

  // Performance Sub-permissions
  { name: "VIEW_KRA_GOALS", description: "Can view KRA and goals set for self/team", module: "performance" },
  { name: "CREATE_KRA_GOALS", description: "Can set or request KRA and goals", module: "performance" },
  { name: "UPDATE_KRA_GOALS", description: "Can approve or evaluate KRA and goals", module: "performance" },
  { name: "VIEW_FEEDBACK_360", description: "Can view 360 degree feedback requests", module: "performance" },
  { name: "CREATE_FEEDBACK_360", description: "Can submit peer/manager feedback", module: "performance" },
  { name: "VIEW_BELLCURVE_ANALYTICS", description: "Can view appraisal rating bell curve analysis", module: "performance" },

  // Engagement Sub-permissions
  { name: "VIEW_SOCIAL_FEED", description: "Can view social feed posts and company updates", module: "engagement" },
  { name: "CREATE_SOCIAL_POST", description: "Can create posts, comments, or likes on social feed", module: "engagement" },
  { name: "VIEW_MOOD_ANALYSIS", description: "Can view employee mood analytics dashboard", module: "engagement" },
  { name: "VIEW_SURVEYS", description: "Can view and participate in surveys", module: "engagement" },
  { name: "CREATE_SURVEYS", description: "Can create and publish new feedback surveys", module: "engagement" },

  // Claims Sub-permissions
  { name: "CREATE_TRAVEL_REQUEST", description: "Can submit new travel requests", module: "claims" },
  { name: "VIEW_TRAVEL_REQUEST", description: "Can view travel request logs", module: "claims" },
  { name: "CREATE_EXPENSE_REIMBURSEMENT", description: "Can file expense reimbursement claims", module: "claims" },
  { name: "VIEW_EXPENSE_REIMBURSEMENT", description: "Can view filed expense claims", module: "claims" },
  { name: "UPDATE_CLAIM_APPROVAL", description: "Can approve or reject travel and expense claims", module: "claims" },

  // Timesheets Sub-permissions
  { name: "CREATE_TIMESHEET_ENTRY", description: "Can log hours in timesheets", module: "timesheets" },
  { name: "VIEW_TIMESHEET_ENTRY", description: "Can view timesheet entries", module: "timesheets" },
  { name: "VIEW_CLIENTS_PROJECTS", description: "Can view client list and active projects", module: "timesheets" },
  { name: "UPDATE_CLIENTS_PROJECTS", description: "Can create or manage clients and projects", module: "timesheets" },

  // Recruitment Sub-permissions
  { name: "VIEW_JOB_REQUISITIONS", description: "Can view job vacancies and requisitions", module: "recruitment" },
  { name: "CREATE_JOB_REQUISITIONS", description: "Can submit new job vacancy requests", module: "recruitment" },
  { name: "VIEW_CANDIDATE_PIPELINE", description: "Can view applicants and hiring pipeline stages", module: "recruitment" },
  { name: "UPDATE_CANDIDATE_PIPELINE", description: "Can schedule interviews and update candidate stages", module: "recruitment" },
  { name: "VIEW_PRE_ONBOARDING", description: "Can view candidates pre-onboarding checklists", module: "recruitment" },
  { name: "UPDATE_PRE_ONBOARDING", description: "Can manage and complete pre-onboarding tasks", module: "recruitment" },

  // Vault / Assets / Letters / Helpdesk
  { name: "VIEW_DOCUMENT_VAULT", description: "Can view document vault shared storage", module: "documents" },
  { name: "CREATE_DOCUMENT_VAULT", description: "Can upload or share documents in the vault", module: "documents" },
  { name: "VIEW_ASSET_MANAGEMENT", description: "Can view assigned assets inventory", module: "assets" },
  { name: "UPDATE_ASSET_MANAGEMENT", description: "Can allocate, return, or edit company assets", module: "assets" },
  { name: "VIEW_LETTER_GENERATOR", description: "Can view system-generated letters", module: "letters" },
  { name: "CREATE_LETTER_GENERATOR", description: "Can generate and issue employee letters", module: "letters" },
  { name: "CREATE_HR_HELPDESK_TICKET", description: "Can raise new support tickets", module: "helpdesk" },
  { name: "VIEW_HR_HELPDESK_TICKETS", description: "Can view logged helpdesk tickets", module: "helpdesk" },
  { name: "UPDATE_HR_HELPDESK_TICKET", description: "Can resolve or assign helpdesk tickets", module: "helpdesk" }
];

export async function seedPermissions() {
  console.log("[Permission Seed] Starting permission seeding process...");
  
  const permissionsToSeed: PermissionSeed[] = [];

  // Generate Create, View, Update, Delete permissions for each module
  for (const mod of MODULES) {
    permissionsToSeed.push(
      {
        name: `CREATE_${mod.key.toUpperCase()}`,
        description: `Can create new records in ${mod.label}`,
        module: mod.key
      },
      {
        name: `VIEW_${mod.key.toUpperCase()}`,
        description: `Can view records in ${mod.label}`,
        module: mod.key
      },
      {
        name: `UPDATE_${mod.key.toUpperCase()}`,
        description: `Can edit and update existing records in ${mod.label}`,
        module: mod.key
      },
      {
        name: `DELETE_${mod.key.toUpperCase()}`,
        description: `Can delete records from ${mod.label}`,
        module: mod.key
      }
    );
  }

  // Push all granular permissions
  permissionsToSeed.push(...GRANULAR_PERMISSIONS);

  // Create permissions in DB if they do not exist
  const dbPermissions = [];
  for (const perm of permissionsToSeed) {
    let existingPerm = await prisma.permission.findUnique({
      where: { name: perm.name }
    });

    if (!existingPerm) {
      existingPerm = await prisma.permission.create({
        data: {
          name: perm.name,
          description: perm.description,
          module: perm.module
        }
      });
      console.log(`[Permission Seed] Created permission: ${perm.name}`);
    }
    dbPermissions.push(existingPerm);
  }

  console.log(`[Permission Seed] Total permissions validated: ${dbPermissions.length}`);

  console.log("[Permission Seed] Permission seeding process finished successfully!");
}
