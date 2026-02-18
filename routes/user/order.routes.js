import express from "express";
import { createOrder ,getUserOrders} from "../../controllers/user/order.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);

export default router;
