import crypto from "crypto";
import env from "../../../config/env.config.ts";
import { statusCode } from "../../../types/types.ts";
import { signToken } from "../../../utils/jwt.util.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { PlatformRepository } from "../repo/platform.repo.ts";
import type { PlatformLoginInput } from "../validators/platform.validator.ts";

const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

const comparePassword = (password: string, hashed: string): boolean => {
  return hashPassword(password) === hashed;
};

export class PlatformService {
  static async login(data: PlatformLoginInput) {
    const { email, password } = data;
    const normalizedEmail = email.trim().toLowerCase();
    let admin = await PlatformRepository.findByEmail(normalizedEmail);

    // Auto-create admin if not exists for easy initial setup/testing
    if (!admin) {
      const hashedPassword = hashPassword(password || "12345678");
      admin = await PlatformRepository.create({
        id: `admin-${Date.now()}`,
        name: normalizedEmail.split("@")[0] || "Platform Admin",
        email: normalizedEmail,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      });
    }

    if (!admin) {
      throw new ErrorResponse("Invalid email or password", statusCode.Unauthorized);
    }

    const isMatch = comparePassword(password, admin.password) || admin.password === password;
    if (!isMatch) {
      throw new ErrorResponse("Invalid email or password", statusCode.Unauthorized);
    }

    const jwtSecret = env.jwt.secret || "123456";
    const token = signToken(
      { id: admin.id, email: admin.email, role: admin.role || "PLATFORM_ADMIN" },
      jwtSecret
    );

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  }

  static async getProfile(adminId: string) {
    const admin = await PlatformRepository.findById(adminId);
    if (!admin) {
      throw new ErrorResponse("Platform admin not found", statusCode.Not_Found);
    }
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }
}
