import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

// ================= CREATE JWT TOKEN =================
const createToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
  email: email.toLowerCase().trim(),
});

    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = createToken(user._id);

const safeUser = {
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  image: user.image,
};

res.json({
  success: true,
  token,
  user: safeUser,
});
  } catch (error) {
    console.log("LOGIN ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({
      email,
    });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(newUser._id);

    const safeUser = {
  _id: newUser._id,
  name: newUser.name,
  email: newUser.email,
  phone: newUser.phone,
  image: newUser.image,
};

res.json({
  success: true,
  token,
  user: safeUser,
});
  } catch (error) {
    console.log(
      "REGISTER ERROR:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ================= GET NOTIFICATIONS =================
const getNotifications = async (req, res) => {
  try {
    const user = await userModel.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      notifications:
        user.notifications || [],
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
    });
  }
};
// ================= DELETE NOTIFICATION =================
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const user = await userModel.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.notifications =
      user.notifications.filter(
        (notification) =>
          notification._id.toString() !==
          notificationId
      );

    await user.save();

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error(
      "DELETE NOTIFICATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete notification",
    });
  }
};
// ================= CLEAR ALL NOTIFICATIONS =================
const clearAllNotifications = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.notifications = [];

    await user.save();

    res.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error(
      "CLEAR NOTIFICATIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};
export {
  loginUser,
  registerUser,
  getNotifications,
  deleteNotification,
  clearAllNotifications,
};