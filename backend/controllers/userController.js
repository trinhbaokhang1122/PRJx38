import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isAdmin =
      user.isAdmin === true ||
      user.role === "admin" ||
      user.email === "khangzz@gmail.com";

    const token = jwt.sign(
      { id: user._id, isAdmin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        isAdmin,
        avatar: user.avatar,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.full_name = req.body.full_name || user.full_name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.full_name = req.body.full_name || user.full_name;
    user.email = req.body.email || user.email;
    user.status = req.body.status || user.status;
    user.role = req.body.role || user.role;

    const updated = await user.save();
    res.json({ message: "User updated by admin", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    user.avatar = avatarPath;

    await user.save();

    res.json({
      message: "Avatar updated",
      avatar: avatarPath,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = otpCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: `"zkayexe Logistics" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Mã OTP khôi phục mật khẩu - zkayexe",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px;">
          <h2 style="color: #0F4C75; text-align: center;">Mã xác thực OTP</h2>
          <p>Chào bạn,</p>
          <p>Mã OTP để đổi mật khẩu của bạn là:</p>
          <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0F4C75;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #777; margin-top: 15px;">
            Mã có hiệu lực trong 10 phút. Không chia sẻ mã này cho ai.
          </p>
        </div>
      `,
    });

    res.json({ message: "Mã OTP đã được gửi thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi gửi mã OTP" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Mã OTP không chính xác hoặc đã hết hạn" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Mật khẩu đã được cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
