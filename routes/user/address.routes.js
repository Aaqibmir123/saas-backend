import express from "express";
import {
  getAddress,
  saveAddress,
} from "../../controllers/user/address.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAddress);
router.post("/", protect, saveAddress);

export default router;
