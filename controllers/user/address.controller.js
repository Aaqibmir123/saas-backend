import Address from "../../models/user/address.model.js";

/**
 * GET ADDRESS
 */
export const getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ user: req.user._id }).lean();

    if (!address) {
      return res.status(404).json({ message: "No address found" });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch address" });
  }
};

/**
 * SAVE / UPDATE ADDRESS (UPSERT)
 */

/**
 * SAVE / UPDATE ADDRESS
 */
export const saveAddress = async (req, res) => {
  try {
    const { name, phone, address, city, pincode } = req.body;

    if (!name || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingAddress = await Address.findOne({
      user: req.user._id,
    });

    console.log("Existing Address:", existingAddress); // Debug log

    // 🔥 UPDATE CASE
    if (existingAddress) {
      existingAddress.name = name;
      existingAddress.phone = phone;
      existingAddress.address = address;
      existingAddress.city = city;
      existingAddress.pincode = pincode;

      await existingAddress.save();

      return res.json({
        success: true,
        type: "update",
        message: "Address updated successfully",
        address: existingAddress,
      });
    }

    // 🔥 CREATE CASE
    const newAddress = await Address.create({
      user: req.user._id,
      name,
      phone,
      address,
      city,
      pincode,
    });

    return res.status(201).json({
      success: true,
      type: "create",
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save address",
    });
  }
};

