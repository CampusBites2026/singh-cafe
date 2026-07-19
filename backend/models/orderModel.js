import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: String,
      default: null,
    },

    customerName: {
      type: String,
      default: "",
    },

    customerPhone: {
      type: String,
      default: "",
    },

    items: [
      {
        _id: String,

        name: String,

        price: Number,

        quantity: Number,

        productType: {
          type: String,
          enum: ["Packed", "Unpacked"],
          required: true,
          default: "Unpacked",
        },

        isReviewed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    receivedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    couponCode: {
      type: String,
      default: null,
    },

    address: {
      type: Object,
      default: {},
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      default: "PENDING",
      enum: [
        "PENDING",
        "PAID",
        "CONFIRMED",
        "preparing",
        "prepared",
        "delivered",
        "rejected",
        "CANCELLED",
      ],
    },

    paymentStatus: {
      type: String,
      default: "PENDING",
      enum: [
        "PENDING",
        "PAID",
        "CONFIRMED",
        "FAILED",
      ],
    },

    payment: {
      type: Boolean,
      default: false,
    },

    paymentMethod: {
      type: String,
      default: "ONLINE",
      enum: ["ONLINE", "COD", "CASH", "UPI"],
    },

    paymentSource: {
      type: String,
      default: "WEBSITE",
      enum: ["WEBSITE", "POS", "QR"],
    },

    orderType: {
      type: String,
      enum: ["dine-in", "takeaway"],
      default: "takeaway",
    },

    reservationStatus: {
      type: String,
      enum: ["ACTIVE", "RELEASED", "COMPLETED"],
      default: "ACTIVE",
    },

    reservationExpiresAt: {
      type: Date,
    },

    razorpayOrderId: String,

    razorpayPaymentId: String,

    razorpaySignature: String,

    transactionId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;
