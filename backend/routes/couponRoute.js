import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createCoupon,
  listCoupons,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController.js";

const couponRouter = express.Router();

/* ================= ADMIN (no auth) ================= */
couponRouter.post("/create", createCoupon);
couponRouter.get("/list", listCoupons);
couponRouter.post("/delete", deleteCoupon);

/* ================= USER (keep auth) ================= */
couponRouter.post("/apply", authMiddleware, applyCoupon);

export default couponRouter;
