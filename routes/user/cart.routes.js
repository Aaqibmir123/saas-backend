import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity
} from "../../controllers/user/cart.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);
router.patch("/:productId", protect, updateCartQuantity);

export default router;
