import User from "../../models/user.model.js";

/* ================= GET PROFILE ================= */

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("Fetched user profile:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ================= UPDATE PROFILE ================= */

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Basic fields
    user.name = req.body.name || user.name;

    // 🔥 Only for business admin
    if (req.body.businessName !== undefined) {
      user.businessName = req.body.businessName;
    }

    // 🔥 Phone
    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    // 🔥 Address (future safe)
    if (req.body.address !== undefined) {
      user.address = req.body.address;
    }

    // 🔥 Profile image
    if (req.file) {
      user.profileImage = req.file.filename;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
