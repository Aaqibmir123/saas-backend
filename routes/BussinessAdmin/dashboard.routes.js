import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { getAdminDashboard } from "../../controllers/BussinessAdmin/dashboard.controller.js";

const router = express.Router();

router.get("/", protect, getAdminDashboard);

export default router;
