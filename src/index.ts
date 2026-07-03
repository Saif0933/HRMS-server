import express from "express";
import env from "./config/env.config";
import errorMiddleware from "./middlewares/error.middleware";
import authRoutes from "./module/user/routes/auth.routes.ts";
import adminRoutes from "./module/admin/routes/role.routes.ts";
import departmentRoutes from "./module/department/routes/department.routes.ts";
import { syncDatabase } from "./db/sync.ts";

import cors from "cors";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/departments", departmentRoutes);

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