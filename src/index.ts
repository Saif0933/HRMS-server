import express from "express";
import env from "./config/env.config";
import errorMiddleware from "./middlewares/error.middleware";
import authRoutes from "./module/user/routes/auth.routes.ts";
import adminRoutes from "./module/admin/routes/role.routes.ts";
import departmentRoutes from "./module/department/routes/department.routes.ts";
import employeeRoutes from "./module/employee/routes/employee.routes.ts";
import leaveRoutes from "./module/leave/routes/leave.routes.ts";
import organizationRoutes from "./module/organization/routes/organization.routes.ts";
import payrollRoutes from "./module/payroll/routes/payroll.routes.ts";
import performanceRoutes from "./module/performance/routes/performance.routes.ts";
import engagementRoutes from "./module/engagement/routes/engagement.routes.ts";
import travelRoutes from "./module/travel/routes/travel.routes.ts";
import timesheetRoutes from "./module/timesheet/routes/timesheet.routes.ts";
import recruitmentRoutes from "./module/recruitment/routes/recruitment.routes.ts";
import documentRoutes from "./module/document/routes/document.routes.ts";
import assetRoutes from "./module/asset/routes/asset.routes.ts";
import letterRoutes from "./module/letter/routes/letter.routes.ts";
import helpdeskRoutes from "./module/helpdesk/routes/helpdesk.routes.ts";
import attendanceRoutes from "./module/attendance/routes/attendance.routes.ts";
import dashboardRoutes from "./module/dashboard/routes/dashboard.routes.ts";
import { syncDatabase } from "./db/sync.ts";


import cors from "cors";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

import platformRoutes from "./module/platform/routes/platform.routes.ts";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/platform", platformRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leaves", leaveRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/payroll", payrollRoutes);
app.use("/api/v1/performance", performanceRoutes);
app.use("/api/v1/engagement", engagementRoutes);
app.use("/api/v1/travel", travelRoutes);
app.use("/api/v1/timesheets", timesheetRoutes);
app.use("/api/v1/recruitment", recruitmentRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/letters", letterRoutes);
app.use("/api/v1/helpdesk", helpdeskRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);




app.get("/", (req, res) => {
  res.json({
    message: "HRMS server running",
    nodeEnv: env.server.nodeEnv,
  });
});

const PORT = env.server.port;

app.use(errorMiddleware)

// Sync database and start server
syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Database sync failed, starting server anyway...", err);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});