import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  getProfile,
  updateProfile,
} from "../../controllers/user/profile.controller.js";
import upload from "../../middleware/BussinessAdmin/upload.middleware.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, upload.single("profileImage"), updateProfile);

export default router;
