import { Router } from "express";
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companyDirectory.controller.ts";
import { protect } from "../../../../middlewares/auth.middleware.ts";

const router = Router();

router.use(protect);

router.get("/companies", listCompanies);
router.get("/companies/:id", getCompany);
router.post("/companies", createCompany);
router.patch("/companies/:id", updateCompany);
router.delete("/companies/:id", deleteCompany);

export default router;
