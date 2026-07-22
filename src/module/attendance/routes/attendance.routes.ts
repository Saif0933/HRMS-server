import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import {
  getPunches,
  createPunch,
  getRegularizations,
  applyRegularization,
  updateRegularization,
  getGeofences,
  createGeofence,
  deleteGeofence,
  getRosters,
  saveRosters,
} from "../controllers/attendance.controller.ts";

const router = Router();

// Protect all routes
router.use(protect);

router.get("/punches/:employeeId", getPunches);
router.post("/punches", createPunch);
router.get("/regularizations", getRegularizations);
router.post("/regularizations", applyRegularization);
router.patch("/regularizations/:id", updateRegularization);
router.get("/geofences", getGeofences);
router.post("/geofences", createGeofence);
router.delete("/geofences/:id", deleteGeofence);
router.get("/rosters", getRosters);
router.post("/rosters", saveRosters);

export default router;
