import { prisma } from "../../../db/prisma.ts";

export class SubscriptionRepository {
  // Plan Operations
  static async findAllPlans() {
    await this.seedDefaultDataIfNeeded();
    return prisma.subscriptionPlan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async findPlanByIdOrCode(idOrCode: string) {
    return prisma.subscriptionPlan.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
    });
  }

  static async createPlan(data: any) {
    return prisma.subscriptionPlan.create({
      data,
    });
  }

  static async updatePlan(id: string, data: any) {
    return prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  static async deletePlan(id: string) {
    return prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  // Subscription Operations
  static async findActiveSubscriptionByOrgId(organizationId: string) {
    return prisma.organizationSubscription.findFirst({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createOrganizationSubscription(data: {
    organizationId: string;
    planId: string;
    billingCycle: string;
    pricePaid: number;
    startDate?: Date;
    endDate?: Date;
    autoRenew?: boolean;
    paymentStatus?: string;
  }) {
    // Deactivate previous active subscriptions for this org
    await prisma.organizationSubscription.updateMany({
      where: {
        organizationId: data.organizationId,
        status: "ACTIVE",
      },
      data: {
        status: "EXPIRED",
      },
    });

    const startDate = data.startDate || new Date();
    const endDate = data.endDate || new Date(new Date().setFullYear(startDate.getFullYear() + 1));

    return prisma.organizationSubscription.create({
      data: {
        organizationId: data.organizationId,
        planId: data.planId,
        billingCycle: data.billingCycle,
        pricePaid: data.pricePaid,
        startDate,
        endDate,
        autoRenew: data.autoRenew ?? true,
        paymentStatus: data.paymentStatus || "PAID",
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    });
  }

  static async findAllSubscriptions(organizationId?: string) {
    return prisma.organizationSubscription.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        plan: true,
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Comparison Matrix Operations
  static async findComparisonRows() {
    await this.seedDefaultDataIfNeeded();
    return prisma.subscriptionFeatureComparison.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  static async createComparisonRow(data: any) {
    return prisma.subscriptionFeatureComparison.create({
      data,
    });
  }

  // Seed default plans and comparison rows based on Subscription.tsx
  static async seedDefaultDataIfNeeded() {
    const planCount = await prisma.subscriptionPlan.count();
    if (planCount === 0) {
      console.log("[SubscriptionRepo] Seeding initial subscription plans...");
      await prisma.subscriptionPlan.createMany({
        data: [
          {
            code: "basic",
            name: "Basic",
            tagline: "Perfect for small teams",
            icon: "Send",
            iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
            price: 1499,
            billing: "Billed annually",
            btnText: "Get Started",
            btnStyle: "border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
            checkColor: "text-emerald-500",
            popular: false,
            maxEmployees: 25,
            sortOrder: 1,
            features: [
              "Up to 25 Employees",
              "Employee Database",
              "Attendance Management",
              "Leave Management",
              "Payroll Management",
              "Basic Reports",
              "Email Support",
            ],
          },
          {
            code: "pro",
            name: "Professional",
            tagline: "Ideal for growing businesses",
            icon: "Star",
            iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
            price: 2999,
            billing: "Billed annually",
            btnText: "Get Started",
            btnStyle: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20",
            checkColor: "text-indigo-600 dark:text-indigo-400",
            popular: true,
            maxEmployees: 100,
            sortOrder: 2,
            features: [
              "Up to 100 Employees",
              "All Basic Features",
              "Performance Management",
              "Recruitment Management",
              "Expense Management",
              "Advanced Reports",
              "Priority Support",
              "Data Export",
              "API Access",
            ],
          },
          {
            code: "enterprise",
            name: "Enterprise",
            tagline: "For large organizations",
            icon: "Building",
            iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
            price: 5999,
            billing: "Billed annually",
            btnText: "Get Started",
            btnStyle: "border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40",
            checkColor: "text-indigo-600 dark:text-indigo-400",
            popular: false,
            maxEmployees: -1,
            sortOrder: 3,
            features: [
              "Unlimited Employees",
              "All Professional Features",
              "Multi-Company Management",
              "Custom Workflows",
              "Advanced Security",
              "Dedicated Account Manager",
              "24/7 Phone & Email Support",
              "Custom Integrations",
              "Onboarding & Training",
            ],
          },
        ],
      });
    }

    const comparisonCount = await prisma.subscriptionFeatureComparison.count();
    if (comparisonCount === 0) {
      console.log("[SubscriptionRepo] Seeding initial comparison rows...");
      await prisma.subscriptionFeatureComparison.createMany({
        data: [
          { label: "Employee Limit", basic: "Up to 25", pro: "Up to 100", ent: "Unlimited", sortOrder: 1 },
          { label: "Attendance Management", basic: "true", pro: "true", ent: "true", sortOrder: 2 },
          { label: "Leave Management", basic: "true", pro: "true", ent: "true", sortOrder: 3 },
          { label: "Payroll Management", basic: "true", pro: "true", ent: "true", sortOrder: 4 },
          { label: "Performance Management", basic: "false", pro: "true", ent: "true", sortOrder: 5 },
          { label: "Recruitment Management", basic: "false", pro: "true", ent: "true", sortOrder: 6 },
          { label: "Advanced Reports", basic: "false", pro: "true", ent: "true", sortOrder: 7 },
          { label: "API Access", basic: "false", pro: "true", ent: "true", sortOrder: 8 },
          { label: "Dedicated Support", basic: "Email", pro: "Priority Email", ent: "24/7 Phone & Email", sortOrder: 9 },
        ],
      });
    }
  }
}
