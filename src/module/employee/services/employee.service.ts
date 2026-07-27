import crypto from "crypto";
import { prisma } from "../../../db/prisma.ts";
import { statusCode } from "../../../types/types.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { EmployeeRepository } from "../repo/employee.repo.ts";

function generateEmployeeId() {
  return `EMP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export class EmployeeService {
  static async createEmployee(data: any, organizationId?: string) {
    // 1. Resolve ID (ensure unique)
    let employeeId = data.id || data.employeeId;
    if (employeeId) {
      const existingId = await EmployeeRepository.findById(employeeId);
      if (existingId) {
        let uniqueId = generateEmployeeId();
        let attempts = 0;
        while (attempts < 5) {
          const existing = await EmployeeRepository.findById(uniqueId);
          if (!existing) {
            employeeId = uniqueId;
            break;
          }
          uniqueId = generateEmployeeId();
          attempts++;
        }
        if (!employeeId || (await EmployeeRepository.findById(employeeId))) {
          employeeId = `EMP-${Date.now().toString().slice(-6)}`;
        }
      }
    } else {
      let uniqueId = generateEmployeeId();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await EmployeeRepository.findById(uniqueId);
        if (!existing) {
          employeeId = uniqueId;
          break;
        }
        uniqueId = generateEmployeeId();
        attempts++;
      }
      if (!employeeId) {
        employeeId = `EMP-${Date.now().toString().slice(-6)}`;
      }
    }
    data.id = employeeId;

    // 2. Validate email uniqueness
    const existingEmail = await EmployeeRepository.findByEmail(data.email);
    if (existingEmail) {
      const parts = (data.email || 'employee@example.com').split('@');
      data.email = `${parts[0]}.${Date.now().toString().slice(-4)}@${parts[1] || 'example.com'}`;
    }

    // 3. Validate user account binding
    if (data.userId) {
      const user = await EmployeeRepository.findUserById(data.userId);
      if (!user) {
        throw new ErrorResponse("Associated User account not found", statusCode.Not_Found);
      }

      const existingUserBinding = await EmployeeRepository.findByUserId(data.userId);
      if (existingUserBinding) {
        throw new ErrorResponse("This User account is already linked to another employee", statusCode.Conflict);
      }
    }

    // 4. Validate department existence
    if (data.departmentId) {
      const dept = await EmployeeRepository.findDepartmentById(data.departmentId);
      if (!dept) {
        console.warn(`[Employee Service] Department with ID ${data.departmentId} not found. Setting departmentId to null.`);
        data.departmentId = null;
      }
    }

    // 5. Validate manager existence
    if (data.managerId) {
      if (data.managerId === employeeId) {
        throw new ErrorResponse("An employee cannot be their own manager", statusCode.Bad_Request);
      }
      
      let managerIdInDb: string | null = null;
      const managerById = await EmployeeRepository.findById(data.managerId);
      if (managerById) {
        managerIdInDb = managerById.id;
      } else {
        const managerByUserId = await EmployeeRepository.findByUserId(data.managerId);
        if (managerByUserId) {
          managerIdInDb = managerByUserId.id;
        }
      }

      if (!managerIdInDb) {
        console.warn(`[Employee Service] Manager with ID ${data.managerId} not found. Setting managerId to null.`);
        data.managerId = null;
      } else {
        data.managerId = managerIdInDb;
      }

      if (data.managerId === employeeId) {
        throw new ErrorResponse("An employee cannot be their own manager", statusCode.Bad_Request);
      }
    }

    // Handle password hashing consistently (once)
    const rawPassword = data.password || "Password@123";
    const hashedPassword = crypto.createHash("sha256").update(rawPassword).digest("hex");
    data.password = hashedPassword;

    // Sync or create associated User account for login authentication & organization binding
    if (data.email) {
      try {
        // Fetch default EMPLOYEE role if present
        const empRole = await prisma.role.findFirst({
          where: { name: "EMPLOYEE" }
        });

        let targetUser = null;

        // If data.userId was explicitly specified in request, check if it's available
        if (data.userId) {
          const userObj = await prisma.user.findUnique({ where: { id: data.userId } });
          if (userObj) {
            const alreadyBound = await prisma.employee.findUnique({ where: { userId: userObj.id } });
            if (!alreadyBound) {
              targetUser = userObj;
            }
          }
        }

        // If no targetUser resolved yet, search by email or phone
        if (!targetUser) {
          const searchConditions: any[] = [];
          if (data.email) searchConditions.push({ email: data.email });
          if (data.phone) searchConditions.push({ phone: data.phone });

          if (searchConditions.length > 0) {
            const candidateUsers = await prisma.user.findMany({
              where: { OR: searchConditions }
            });

            for (const cand of candidateUsers) {
              const alreadyBound = await prisma.employee.findUnique({
                where: { userId: cand.id }
              });
              if (!alreadyBound) {
                targetUser = cand;
                break;
              }
            }
          }
        }

        if (!targetUser) {
          // Determine unique email and phone for creating new User account
          let userEmail = data.email;
          let userPhone = data.phone || null;

          if (userEmail) {
            const existingEmailUser = await prisma.user.findUnique({ where: { email: userEmail } });
            if (existingEmailUser) {
              const parts = userEmail.split("@");
              userEmail = `${parts[0]}.${Date.now().toString().slice(-4)}@${parts[1] || "example.com"}`;
            }
          }

          if (userPhone) {
            const existingPhoneUser = await prisma.user.findUnique({ where: { phone: userPhone } });
            if (existingPhoneUser) {
              userPhone = null; // Drop phone on User account if already taken
            }
          }

          targetUser = await prisma.user.create({
            data: {
              name: data.name,
              email: userEmail,
              phone: userPhone,
              password: hashedPassword,
              roleId: empRole?.id || null,
            }
          });
        } else {
          targetUser = await prisma.user.update({
            where: { id: targetUser.id },
            data: {
              password: hashedPassword,
              name: targetUser.name || data.name,
              roleId: targetUser.roleId || empRole?.id || undefined,
            }
          });
        }

        data.userId = targetUser.id;

        // Ensure user has membership in the logged-in organization so they show up under organization filters
        if (organizationId) {
          const existingMembership = await prisma.membership.findFirst({
            where: { userId: targetUser.id, organizationId }
          });
          if (!existingMembership) {
            await prisma.membership.create({
              data: {
                userId: targetUser.id,
                organizationId,
                status: "ACTIVE",
                roleId: empRole?.id || null,
              }
            });
          }
        }
      } catch (userErr: any) {
        console.warn("[Employee Service] Could not sync User table/membership during employee creation:", userErr.message);
      }
    }

    // Create final employee data
    const createData = {
      ...data,
      id: employeeId,
      organizationId: organizationId || null,
    };

    return EmployeeRepository.create(createData);
  }

  static async getEmployees(filters: {
    organizationId?: string;
    departmentId?: string;
    managerId?: string;
    status?: any;
    search?: string;
  }) {
    return EmployeeRepository.findAll(filters);
  }

  static async getEmployeeById(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      return null;
    }
    return employee;
  }

  static async updateEmployee(id: string, data: any) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    // 1. If email changes, validate uniqueness
    if (data.email && data.email !== employee.email) {
      const existingEmail = await EmployeeRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new ErrorResponse("Email is already in use by another employee", statusCode.Conflict);
      }
    }

    // 2. If userId changes, validate existence and uniqueness
    if (data.userId && data.userId !== employee.userId) {
      const user = await EmployeeRepository.findUserById(data.userId);
      if (!user) {
        throw new ErrorResponse("Associated User account not found", statusCode.Not_Found);
      }

      const existingUserBinding = await EmployeeRepository.findByUserId(data.userId);
      if (existingUserBinding) {
        throw new ErrorResponse("This User account is already linked to another employee", statusCode.Conflict);
      }
    }

    // 3. If departmentId changes, validate existence
    if (data.departmentId && data.departmentId !== employee.departmentId) {
      const dept = await EmployeeRepository.findDepartmentById(data.departmentId);
      if (!dept) {
        console.warn(`[Employee Service] Department with ID ${data.departmentId} not found. Setting departmentId to null.`);
        data.departmentId = null;
      }
    }

    // 4. If managerId changes, validate existence and self-loop
    if (data.managerId && data.managerId !== employee.managerId) {
      if (data.managerId === id) {
        throw new ErrorResponse("An employee cannot be their own manager", statusCode.Bad_Request);
      }
      
      let managerIdInDb: string | null = null;
      const managerById = await EmployeeRepository.findById(data.managerId);
      if (managerById) {
        managerIdInDb = managerById.id;
      } else {
        const managerByUserId = await EmployeeRepository.findByUserId(data.managerId);
        if (managerByUserId) {
          managerIdInDb = managerByUserId.id;
        }
      }

      if (!managerIdInDb) {
        console.warn(`[Employee Service] Manager with ID ${data.managerId} not found. Setting managerId to null.`);
        data.managerId = null;
      } else {
        data.managerId = managerIdInDb;
      }

      if (data.managerId === id) {
        throw new ErrorResponse("An employee cannot be their own manager", statusCode.Bad_Request);
      }
    }

    if (data.password) {
      data.password = crypto.createHash("sha256").update(data.password).digest("hex");
    }

    return EmployeeRepository.update(id, data);
  }

  static async deleteEmployee(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    return EmployeeRepository.delete(id);
  }

  static async getEmployeeSalary(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      return null;
    }
    return {
      basic: employee.basic,
      hra: employee.hra,
      allowance: employee.allowance,
      deductions: employee.deductions,
      netSalary: employee.netSalary,
      bankName: employee.bankName,
      bankAccount: employee.bankAccount,
      ifsc: employee.ifsc,
      pan: employee.pan,
      aadhaar: employee.aadhaar,
      uan: employee.uan,
      pfNumber: employee.pfNumber,
    };
  }

  static async updateEmployeeSalary(id: string, data: any) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EmployeeRepository.update(id, data);
  }

  static async getEmployeePersonal(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      return null;
    }
    return {
      gender: employee.gender,
      dob: employee.dob,
      bloodGroup: employee.bloodGroup,
      maritalStatus: employee.maritalStatus,
      qualification: employee.qualification,
      university: employee.university,
      passingYear: employee.passingYear,
      fatherName: employee.fatherName,
      permanentAddress: employee.permanentAddress,
      languagesSpoken: employee.languagesSpoken,
    };
  }

  static async updateEmployeePersonal(id: string, data: any) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EmployeeRepository.update(id, data);
  }

  // Family Members & Dependents
  static async getEmployeeFamily(employeeId: string) {
    const employee = await EmployeeRepository.findById(employeeId);
    if (!employee) {
      return [];
    }
    return EmployeeRepository.findFamilyMembers(employeeId);
  }

  static async addEmployeeFamilyMember(employeeId: string, data: any) {
    const employee = await EmployeeRepository.findById(employeeId);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EmployeeRepository.createFamilyMember(employeeId, data);
  }

  static async removeEmployeeFamilyMember(familyId: string) {
    return EmployeeRepository.deleteFamilyMember(familyId);
  }

  // Employee Exit & Clearance Service Methods
  static async getEmployeeExit(employeeId: string) {
    const employee = await EmployeeRepository.findById(employeeId);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EmployeeRepository.findExitByEmployeeId(employeeId);
  }

  static async upsertEmployeeExit(employeeId: string, data: any) {
    const employee = await EmployeeRepository.findById(employeeId);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    const exitRecord = await EmployeeRepository.upsertExit(employeeId, data);
    
    // Sync employee status and exit date
    const isApproved = data.status === "CLEARANCE_APPROVED" || data.status === "SETTLED" || (data.itClearance && data.financeClearance && data.adminClearance && data.hrClearance);
    await EmployeeRepository.update(employeeId, {
      exitDate: data.lastWorkingDay,
      clearanceStatus: isApproved ? "Approved" : "Pending",
      status: isApproved ? "RESIGNED" : employee.status,
    });

    return exitRecord;
  }
}
