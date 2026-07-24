import { prisma } from "../../../db/prisma.ts";

export class PlatformRepository {
  static async findByEmail(email: string) {
    const res = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "platform_admins" WHERE LOWER("email") = LOWER($1) LIMIT 1`,
      email
    );
    return res && res.length > 0 ? res[0] : null;
  }

  static async findById(id: string) {
    const res = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "platform_admins" WHERE "id" = $1 LIMIT 1`,
      id
    );
    return res && res.length > 0 ? res[0] : null;
  }

  static async create(data: {
    id: string;
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "platform_admins" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT ("email") DO NOTHING`,
      data.id,
      data.name,
      data.email,
      data.password,
      data.role || "PLATFORM_ADMIN"
    );
    return this.findByEmail(data.email);
  }
}
