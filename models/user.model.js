import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔥 Only for business_admin
    businessName: {
      type: String,
      trim: true,
    },

    // 🔥 For both roles
    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "business_admin"],
      default: "customer",
    },

    profileImage: {
      type: String,
    },

    refreshToken: {
      type: String,
      select: false, // 🔥 security improvement
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
