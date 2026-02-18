import Order from "../../models/order.model.js";
import Product from "../../models/BussinessAdmin/product.model.js";

/* =========================================
   GET ALL ORDERS (Admin)
   GET /api/admin/orders?page=1&limit=10&status=Pending
========================================= */
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      businessId: req.user._id, // 🔥 FILTER
    };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   GET SINGLE ORDER (Admin)
   GET /api/admin/orders/:id
========================================= */
export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   UPDATE ORDER STATUS (Admin)
   PUT /api/admin/orders/:id/status
========================================= */


export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    console.log("Updating order status:", { orderId, status }); // 🔥 Debug log

    const order = await Order.findOne({
      _id: orderId,
      businessId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // AFTER declaration use it
    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be modified",
      });
    }

    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

