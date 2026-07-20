import crypto from "crypto";
import { EmployeeRepository } from "../repo/employee.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";

function generateEmployeeId() {
  return `EMP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export class EmployeeService {
  static async createEmployee(data: any) {
    // 1. Resolve ID (ensure unique)
    let employeeId = data.id;
    if (!employeeId) {
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
        employeeId = `EMP-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
      }
    } else {
      const existingId = await EmployeeRepository.findById(employeeId);
      if (existingId) {
        throw new ErrorResponse(`Employee with ID ${employeeId} already exists`, statusCode.Conflict);
      }
    }

    // 2. Validate email uniqueness
    const existingEmail = await EmployeeRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ErrorResponse("Employee with this email already exists", statusCode.Conflict);
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

    // Create final employee data
    const createData = {
      ...data,
      id: employeeId,
    };

    return EmployeeRepository.create(createData);
  }

  static async getEmployees(filters: {
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
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
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
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
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
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return {
      gender: employee.gender,
      dob: employee.dob,
      bloodGroup: employee.bloodGroup,
      maritalStatus: employee.maritalStatus,
      qualification: employee.qualification,
      university: employee.university,
      passingYear: employee.passingYear,
    };
  }

  static async updateEmployeePersonal(id: string, data: any) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EmployeeRepository.update(id, data);
  }
}
