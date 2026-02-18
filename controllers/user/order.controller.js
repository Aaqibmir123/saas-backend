import Order from "../../models/order.model.js";
import Cart from "../../models/user/cart.model.js";
import Product from "../../models/BussinessAdmin/product.model.js";
import Address from "../../models/user/address.model.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    /* ================= GET CART ================= */
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    /* ================= GET ADDRESS FROM ADDRESS COLLECTION ================= */

    const userAddress = await Address.findOne({ user: userId });

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address not found",
      });
    }

    /* ================= VALIDATE STOCK ================= */

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${item.product.name} is out of stock`,
        });
      }
    }

    /* ================= BUSINESS ID ================= */

    const businessId = cart.items[0].product.businessId;

    /* ================= PREPARE ITEMS ================= */

    const items = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const deliveryCharge = 50;
    const totalAmount = subtotal + deliveryCharge;

    /* ================= CREATE ORDER ================= */

    const order = new Order({
      user: userId,
      businessId,
      items,
      shippingAddress: {
        name: userAddress.name,
        phone: userAddress.phone,
        address: userAddress.address,
        city: userAddress.city,
        pincode: userAddress.pincode,
      },
      paymentMethod: "COD",
      subtotal,
      deliveryCharge,
      totalAmount,
      status: "Pending",
    });

    await order.save();

    /* ================= DEDUCT STOCK ================= */

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    /* ================= CLEAR CART ================= */

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Order failed",
    });
  }
};




export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; // 👈 from JWT

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
