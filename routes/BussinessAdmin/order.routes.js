import express from "express";
import {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus
} from "../../controllers/BussinessAdmin/order.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { generateInvoice } from "../../controllers/BussinessAdmin/invoice.controller.js";


const router = express.Router();

router.get("/", protect, getAllOrders);
router.get("/:id", protect, getAdminOrderById);
router.put("/:id/status", protect, updateOrderStatus);
router.get("/:id/invoice", protect,  generateInvoice);


export default router;
