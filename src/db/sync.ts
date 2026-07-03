import { prisma } from "./prisma.ts";

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

    // 5. Add "roleId" column to "users" if not exists
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roleId" TEXT;
    `);

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
      END $$;
    `);

    // 7. Seed system-default SUPER_ADMIN role if it doesn't exist
    const superAdminRole = await prisma.role.findFirst({
      where: { name: "SUPER_ADMIN" },
    });

    if (!superAdminRole) {
      await prisma.role.create({
        data: {
          name: "SUPER_ADMIN",
          description: "System Administrator with full access",
          isSystem: true,
        },
      });
      console.log("[DB Sync] Seeded system default SUPER_ADMIN role.");
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

      // Ensure test user with phone "6200065370" is SUPER_ADMIN
      const testUser = await prisma.user.findFirst({
        where: { phone: "6200065370" }
      });
      if (testUser && testUser.roleId !== superAdminRoleObj.id) {
        await prisma.user.update({
          where: { id: testUser.id },
          data: { roleId: superAdminRoleObj.id }
        });
        console.log("[DB Sync] Successfully promoted test user 6200065370 to SUPER_ADMIN.");
      }
    }

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
