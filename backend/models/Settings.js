import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    deliveryFee: {
      type: Number,
      default: 10,
      min: 0,
    },

    kitchenOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings =
  mongoose.models.Settings ||
  mongoose.model(
    "Settings",
    settingsSchema
  );

export default Settings;