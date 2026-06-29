import couponModel from "../models/couponModel.js";
import userModel from "../models/userModel.js";

/* ================= CREATE COUPON ================= */

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountAmount,
      minOrderAmount,
    } = req.body;

    if (
      !code ||
      discountAmount === undefined ||
      minOrderAmount === undefined
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    if (
      Number(discountAmount) < 0 ||
      Number(minOrderAmount) < 0
    ) {
      return res.json({
        success: false,
        message: "Invalid coupon values",
      });
    }

    const existing = await couponModel.findOne({
      code: code.toUpperCase(),
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Coupon already exists",
      });
    }

    const coupon = new couponModel({
      code: code.toUpperCase(),
      discountAmount: Number(discountAmount),
      minOrderAmount: Number(minOrderAmount),
    });

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon created",
    });
  } catch (error) {
    console.error(
      "CREATE COUPON ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= LIST COUPONS (ADMIN) ================= */

const listCoupons = async (req, res) => {
  try {
    const coupons = await couponModel
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error(
      "LIST COUPONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
    });
  }
};

/* ================= DELETE COUPON ================= */

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;

    await couponModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (error) {
    console.error(
      "DELETE COUPON ERROR:",
      error
    );

    res.status(500).json({
      success: false,
    });
  }
};

/* ================= APPLY COUPON ================= */

const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const userId = req.user?.id;

    if (!code) {
      return res.json({
        success: false,
        message: "Coupon code is required",
      });
    }

    if (
      subtotal === undefined ||
      Number(subtotal) < 0
    ) {
      return res.json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    const coupon = await couponModel.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return res.json({
        success: false,
        message: "Invalid coupon",
      });
    }

    if (userId) {
      const user = await userModel.findById(
        userId
      );

      if (
        user &&
        user.usedCoupons?.includes(
          coupon.code.toUpperCase()
        )
      ) {
        return res.json({
          success: false,
          message:
            "You have already used this coupon",
        });
      }
    }

    /* CHECK MINIMUM ORDER */

    if (
      Number(subtotal) <
      coupon.minOrderAmount
    ) {
      return res.json({
        success: false,
        message: `Minimum order ₹${coupon.minOrderAmount} required`,
      });
    }

    const discount =
      coupon.discountAmount;

    const finalTotal = Math.max(
      Number(subtotal) - discount,
      0
    );

    res.json({
      success: true,
      discount,
      finalTotal,
      coupon: {
        code: coupon.code,
        minOrderAmount:
          coupon.minOrderAmount,
        discountAmount:
          coupon.discountAmount,
      },
    });
  } catch (error) {
    console.error(
      "APPLY COUPON ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  createCoupon,
  listCoupons,
  deleteCoupon,
  applyCoupon,
};