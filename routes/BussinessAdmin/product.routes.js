import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
} from "../../controllers/BussinessAdmin/product.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";
import upload from "../../middleware/BussinessAdmin/upload.middleware.js";

const router = express.Router();

/* PUBLIC */
router.get(
  "/",
  protect,
  authorizeRoles("admin", "business_admin"),
  getProducts
);
router.get("/:id", getSingleProduct);

/* ADMIN + BUSINESS ADMIN ONLY */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "business_admin"),
  upload.single("image"),
  createProduct,
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "business_admin"),
  upload.single("image"),
  updateProduct,
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "business_admin"),
  deleteProduct,
);

export default router;
