import Order from "../../models/order.model.js";
import Product from "../../models/BussinessAdmin/product.model.js";
import mongoose from "mongoose";

export const getAdminDashboard = async (req, res) => {
  try {
    const businessId = req.user._id; // 🔥 isolate data
    const businessObjectId = new mongoose.Types.ObjectId(businessId);

    /* ================= BASIC STATS ================= */

    const totalOrders = await Order.countDocuments({
      businessId,
    });

    const deliveredOrders = await Order.countDocuments({
      businessId,
      status: "Delivered",
    });

    const totalRevenueAgg = await Order.aggregate([
      {
        $match: {
          businessId: businessObjectId,
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    /* ================= REVENUE GROWTH (30 DAYS) ================= */

    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - 30);

    const previousStart = new Date();
    previousStart.setDate(previousStart.getDate() - 60);

    const previousEnd = new Date();
    previousEnd.setDate(previousEnd.getDate() - 30);

    const currentRevenueAgg = await Order.aggregate([
      {
        $match: {
          businessId: businessObjectId,
          status: "Delivered",
          createdAt: { $gte: currentStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const previousRevenueAgg = await Order.aggregate([
      {
        $match: {
          businessId: businessObjectId,
          status: "Delivered",
          createdAt: { $gte: previousStart, $lt: previousEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const currentRevenue = currentRevenueAgg[0]?.total || 0;
    const previousRevenue = previousRevenueAgg[0]?.total || 0;

    const revenueGrowth =
      previousRevenue === 0
        ? 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    /* ================= AVERAGE ORDER VALUE ================= */

    const averageOrderValue =
      deliveredOrders === 0 ? 0 : totalRevenue / deliveredOrders;

    /* ================= LAST 7 DAYS REVENUE ================= */

    const weeklyRevenue = await Order.aggregate([
      {
        $match: {
          businessId: businessObjectId,
          status: "Delivered",
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ================= ORDER STATUS STATS ================= */

    const statusStats = await Order.aggregate([
      {
        $match: {
          businessId: businessObjectId,
        },
      },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
    ]);

    /* ================= LOW STOCK PRODUCTS ================= */

    const lowStockProducts = await Product.find({
      businessId, // 🔥 isolate products
      status: "active",
      $expr: {
        $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }],
      },
    })
      .select("name stock lowStockThreshold")
      .sort({ stock: 1 })
      .lean();

    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        totalRevenue,
        revenueGrowth: Number(revenueGrowth.toFixed(2)),
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        weeklyRevenue,
        statusStats,
        lowStockProducts,
      },
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
