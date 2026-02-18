import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";

import productRoutes from "./routes/BussinessAdmin/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userProductRoutes from "./routes/user/product.routes.js";
import cartRoutes from "./routes/user/cart.routes.js";
import addressRoutes from "./routes/user/address.routes.js";
import orderRoutes from "./routes/user/order.routes.js";
import profileRoutes from "./routes/user/profile.routes.js";
import adminOrderRoutes from "./routes/BussinessAdmin/order.routes.js";
import dashboardRoutes from "./routes/BussinessAdmin/dashboard.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();
connectDB();

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user/products", userProductRoutes);
app.use("/api/user/cart", cartRoutes);
app.use("/api/user/address", addressRoutes);
app.use("/api/user/orders", orderRoutes);
app.use("/api/user/profile", profileRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

/* ================= 404 ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
