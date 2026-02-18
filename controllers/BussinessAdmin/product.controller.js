import Product from "../../models/BussinessAdmin/product.model.js";
import { asyncHandler } from "../../middleware/async.middleware.js";

/* ================= CREATE PRODUCT ================= */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, stock, category, description, status } = req.body;

  if (!name || price === undefined || stock === undefined) {
    const error = new Error("Name, Price and Stock are required");
    error.statusCode = 400;
    throw error;
  }

  if (Number(stock) < 0) {
    const error = new Error("Stock cannot be negative");
    error.statusCode = 400;
    throw error;
  }

  const imagePath = req.file ? req.file.filename : null;

  const product = await Product.create({
    name,
    price: Number(price),
    stock: Number(stock),
    category,
    description,
    status,
    image: imagePath,
    createdBy: req.user._id,
    businessId: req.user.businessId || req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

export const getProducts = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { page = 1, limit = 10, search = "" } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  let query = {
    name: { $regex: search, $options: "i" },
  };

  if (req.user.role !== "admin") {
    query.createdBy = req.user._id;
  }

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  res.json({
    success: true,
    total,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    data: products,
  });
});

/* ================= GET SINGLE PRODUCT ================= */
export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  // 🔥 Ownership check
  if (
    req.user.role !== "admin" &&
    product.createdBy.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  // 🔥 Ownership check
  if (
    req.user.role !== "admin" &&
    product.createdBy.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const updateData = {
    name: req.body.name,
    price: Number(req.body.price),
    category: req.body.category,
    description: req.body.description,
    status: req.body.status,
  };

  if (req.body.stock !== undefined) {
    if (Number(req.body.stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }
    updateData.stock = Number(req.body.stock);
  }

  if (req.file) {
    updateData.image = req.file.filename;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true },
  );

  res.json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  // 🔥 Ownership check
  if (
    req.user.role !== "admin" &&
    product.createdBy.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});
