import { DashboardRepository } from "../repo/dashboard.repo.ts";

export class DashboardService {
  static async getDashboardData() {
    const employees = await DashboardRepository.getEmployeesCount();
    const pendingLeaves = await DashboardRepository.getPendingLeaves();
    const pendingClaims = await DashboardRepository.getPendingClaims();
    const holidays = await DashboardRepository.getHolidays();
    const auditLogs = await DashboardRepository.getRecentAuditLogs();

    // 1. Calculate employee status counts
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;
    const probationEmployees = employees.filter(e => e.status === 'PROBATION').length;
    const leaveEmployees = employees.filter(e => e.status === 'ON_LEAVE').length;
    const resignedEmployees = employees.filter(e => e.status === 'RESIGNED' || e.status === 'TERMINATED').length;

    // 2. Pending approvals count
    const pendingApprovalsCount = pendingLeaves.length + pendingClaims.length;

    // 3. Department distribution
    const deptDistribution: Record<string, number> = {};
    employees.forEach(e => {
      const deptName = e.department?.name || 'Unassigned';
      deptDistribution[deptName] = (deptDistribution[deptName] || 0) + 1;
    });
    const deptData = Object.entries(deptDistribution).map(([name, value]) => ({ name, value }));

    // 4. Gender diversity
    const maleCount = employees.filter(e => e.gender?.toLowerCase() === 'male').length;
    const femaleCount = employees.filter(e => e.gender?.toLowerCase() === 'female').length;

    // 5. Celebrations (Birthdays & Anniversaries)
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const birthdays = employees.filter(e => {
      if (!e.dob) return false;
      const d = new Date(e.dob);
      return d.getMonth() === todayMonth && d.getDate() === todayDate;
    }).map(e => ({ id: e.id, name: e.name, type: 'Birthday' }));

    const anniversaries = employees.filter(e => {
      if (!e.joiningDate) return false;
      const d = new Date(e.joiningDate);
      return d.getMonth() === todayMonth && d.getDate() === todayDate;
    }).map(e => ({ id: e.id, name: e.name, type: 'Anniversary' }));

    // 6. Hardcoded attendance trend data for demo/operational use
    const attendanceTrendData = [
      { name: 'Mon', Present: 98, Late: 2, Absent: 0 },
      { name: 'Tue', Present: 96, Late: 4, Absent: 0 },
      { name: 'Wed', Present: 95, Late: 3, Absent: 2 },
      { name: 'Thu', Present: 97, Late: 1, Absent: 2 },
      { name: 'Fri', Present: 92, Late: 6, Absent: 2 },
      { name: 'Sat', Present: 40, Late: 5, Absent: 55 }
    ];

    return {
      kpis: {
        totalEmployees,
        activeEmployees,
        probationEmployees,
        leaveEmployees,
        resignedEmployees,
        pendingApprovalsCount
      },
      attendanceTrend: attendanceTrendData,
      departmentDistribution: deptData,
      genderDiversity: {
        male: maleCount,
        female: femaleCount
      },
      celebrations: {
        birthdays,
        anniversaries
      },
      upcomingHolidays: holidays.map(h => ({
        id: h.id,
        name: h.name,
        type: h.type,
        date: h.date.toISOString().split('T')[0]
      })),
      pendingApprovals: {
        leaves: pendingLeaves.map(l => ({
          id: l.id,
          employeeName: l.employee.name,
          type: l.leaveType.name,
          startDate: l.startDate.toISOString().split('T')[0],
          endDate: l.endDate.toISOString().split('T')[0],
          days: l.totalDays,
          reason: l.reason
        })),
        claims: pendingClaims.map(c => ({
          id: c.id,
          employeeName: c.employee.name,
          type: c.type,
          amount: c.amount,
          date: c.date,
          reason: c.reason
        }))
      },
      auditLogs: auditLogs.map(a => ({
        id: a.id,
        user: a.user,
        action: a.action,
        module: a.module,
        timestamp: a.createdAt.toISOString(),
        details: a.details
      }))
    };
  }

  static async logAction(user: string, action: string, module: string, details: string) {
    return DashboardRepository.createAuditLog({ user, action, module, details });
  }
}
