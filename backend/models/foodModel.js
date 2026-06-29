import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    productType: {
      type: String,
      required: true,
      enum: ["Packed", "Unpacked"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================
    // STOCK MANAGEMENT
    // ==========================

    quantity: {
      type: Number,
      default: null,
      min: 0,
    },

    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================
    // RATING SYSTEM
    // ==========================

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRatingPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const foodModel =
  mongoose.models.food ||
  mongoose.model("food", foodSchema);

export default foodModel;