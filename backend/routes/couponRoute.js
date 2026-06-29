import express from "express";
import authMiddleware from "../middleware/auth.js";

import {
  createCoupon,
  listCoupons,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController.js";

const couponRouter = express.Router();

/* CREATE COUPON */
couponRouter.post(
  "/create",
  authMiddleware,
  createCoupon
);

/* GET ALL COUPONS */
couponRouter.get(
  "/list",
  authMiddleware,
  listCoupons
);

/* DELETE COUPON */
couponRouter.post(
  "/delete",
  authMiddleware,
  deleteCoupon
);

/* APPLY COUPON */
couponRouter.post(
  "/apply",
  authMiddleware,
  applyCoupon
);

export default couponRouter;