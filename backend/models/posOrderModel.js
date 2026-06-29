import mongoose from "mongoose";

const PosOrderSchema = new mongoose.Schema(
  {
    /* ================= ORDER NUMBER ================= */
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /* ================= ORDER ITEMS ================= */
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "food",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        productType: {
          type: String,
          enum: ["Packed", "Unpacked"],
          default: "Unpacked",
        },
      },
    ],

    /* ================= TOTAL AMOUNT ================= */
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ================= ORDER TYPE ================= */
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway"],
      default: "dine-in",
    },

    /* ================= CUSTOMER INFO ================= */
    customerName: {
      type: String,
      default: "Walk-in",
      trim: true,
    },

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    /* ================= PAYMENT ================= */
    paymentMethod: {
      type: String,
      enum: ["cash", "upi"],
      default: "cash",
    },

    /* ================= ORDER STATUS ================= */
    status: {
      type: String,
      enum: [
        "CONFIRMED",
        "preparing",
        "prepared",
        "delivered",
        "rejected",
      ],
      default: "CONFIRMED",
    },

    /* ================= PAYMENT STATUS ================= */
    isPaid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PosOrder =
  mongoose.models.PosOrder ||
  mongoose.model(
    "PosOrder",
    PosOrderSchema
  );

export default PosOrder;