import express from "express";
import { getProductsByCategory } from "../../controllers/user/product.controller.js";

const router = express.Router();

router.get("/", getProductsByCategory);

export default router;
