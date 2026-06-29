import mongoose from "mongoose";

const orderCounterSchema =
  new mongoose.Schema(
    {
      date: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      sequence: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      timestamps: true,
    }
  );

const OrderCounter =
  mongoose.models.OrderCounter ||
  mongoose.model(
    "OrderCounter",
    orderCounterSchema
  );

export default OrderCounter;