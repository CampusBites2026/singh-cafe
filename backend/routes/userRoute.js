import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  loginUser,
  registerUser,
  getNotifications,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/userController.js";
import googleLoginUser from "../controllers/googleLoginController.js";

const userRouter = express.Router();

// NORMAL LOGIN / REGISTER
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// GOOGLE LOGIN
userRouter.post("/google-login", googleLoginUser);

// NOTIFICATIONS
userRouter.get(
  "/notifications",
  authMiddleware,
  getNotifications
);

userRouter.delete(
  "/notification/:notificationId",
  authMiddleware,
  deleteNotification
);

userRouter.delete(
  "/notifications/clear-all",
  authMiddleware,
  clearAllNotifications
);

export default userRouter;