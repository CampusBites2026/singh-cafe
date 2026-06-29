import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
{
orderId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Order",
required: true,
},


foodId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "food",
  required: true,
},

userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "user",
  required: true,
},

rating: {
  type: Number,
  required: true,
  min: 1,
  max: 5,
},

review: {
  type: String,
  default: "",
  trim: true,
  maxlength: 1000,
},


},
{
timestamps: true,
}
);

// One review per food per order
reviewSchema.index(
  {
    orderId: 1,
    foodId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

const reviewModel =
mongoose.models.review ||
mongoose.model("review", reviewSchema);

export default reviewModel;
