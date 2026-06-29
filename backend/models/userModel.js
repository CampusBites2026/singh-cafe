import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    cartData: {
      type: Object,
      default: {},
    },
    usedCoupons: {
      type: [String],
      default: [],
      set: (coupons) =>
        coupons.map((coupon) =>
          String(coupon).toUpperCase()
        ),
    },
    notifications: {
      type: [
        {
          message: {
            type: String,
            required: true,
          },
          read: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);
userSchema.index({ email: 1 });
const userModel =
  mongoose.models.user ||
  mongoose.model("user", userSchema);
export default userModel;
