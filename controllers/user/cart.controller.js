import Cart from "../../models/user/cart.model.js";
import Product from "../../models/BussinessAdmin/product.model.js";

/**
 * GET CART
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price image",
    );

    if (!cart) {
      return res.json([]);
    }

    const formatted = cart.items.map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

/**
 * ADD TO CART
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    res.json({ message: "Added to cart" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

/**
 * REMOVE FROM CART
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();

    res.json({ message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};


export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;

    await cart.save();

    res.json({ message: "Quantity updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update quantity" });
  }
};

