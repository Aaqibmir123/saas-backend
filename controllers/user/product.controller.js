import Product from "../../models/BussinessAdmin/product.model.js";

export const getProductsByCategory = async (req, res) => {
  try {
    console.log("Get Products By Category - Query:", req.query);
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const products = await Product.find({ category });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
