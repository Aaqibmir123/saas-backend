import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/* ================= HELPERS ================= */

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
  });
};

/* ================= REGISTER ================= */

const register = async (req, res, next) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔥 Role protection
    const role = businessName ? "business_admin" : "customer";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      businessName: businessName || null,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ================= LOGIN ================= */

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🔥 Store hashed refresh token
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
        businessName: user.businessName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ================= REFRESH TOKEN ================= */

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== hashToken(token)) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // 🔥 Rotate tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token expired",
    });
  }
};

/* ================= LOGOUT ================= */

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const hashed = hashToken(token);
      await User.findOneAndUpdate(
        { refreshToken: hashed },
        { refreshToken: null }
      );
    }

    res.clearCookie("refreshToken");

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

/* ================= EXPORT ================= */

const authController = {
  register,
  login,
  refreshAccessToken,
  logout,
};

export default authController;
