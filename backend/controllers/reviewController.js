import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

// ==============================
// ADD REVIEW
// ==============================
export const addReview = async (req, res) => {
try {
const userId = req.user.id;


const {
  foodId,
  orderId,
  rating,
  review,
} = req.body;

if (!foodId || !orderId || !rating) {
  return res.status(400).json({
    success: false,
    message:
      "Food ID, Order ID and rating are required",
  });
}

if (rating < 1 || rating > 5) {
  return res.status(400).json({
    success: false,
    message: "Rating must be between 1 and 5",
  });
}

// VERIFY ORDER
const order = await orderModel.findOne({
  _id: orderId,
  userId: String(userId),
  status: "delivered",
});

if (!order) {
  return res.status(403).json({
    success: false,
    message:
      "You can only review delivered orders",
  });
}

// VERIFY FOOD EXISTS IN ORDER
const foodExistsInOrder = order.items.some(
  (item) =>
    String(item._id) === String(foodId)
);

if (!foodExistsInOrder) {
  return res.status(403).json({
    success: false,
    message:
      "This food item was not purchased in this order",
  });
}

// ONE REVIEW PER FOOD PER ORDER
const existingReview =
  await reviewModel.findOne({
    orderId,
    foodId,
  });

if (existingReview) {
  return res.status(400).json({
    success: false,
    message:
      "You have already reviewed this item for this order",
  });
}

await reviewModel.create({
  orderId,
  userId,
  foodId,
  rating,
  review,
});

const food = await foodModel.findById(
  foodId
);

if (!food) {
  return res.status(404).json({
    success: false,
    message: "Food not found",
  });
}

food.ratingCount =
  Number(food.ratingCount || 0);

food.totalRatingPoints =
  Number(food.totalRatingPoints || 0);

food.ratingCount += 1;
food.totalRatingPoints += Number(rating);

food.rating = Number(
  (
    food.totalRatingPoints /
    food.ratingCount
  ).toFixed(1)
);

await food.save();

return res.json({
  success: true,
  message:
    "Review submitted successfully",
  rating: food.rating,
  ratingCount: food.ratingCount,
});


} catch (error) {
console.error(
"ADD REVIEW ERROR:",
error
);


res.status(500).json({
  success: false,
  message: error.message,
});


}
};

// ==============================
// GET REVIEWS FOR ONE FOOD
// ==============================
export const getFoodReviews = async (
req,
res
) => {
try {
const { foodId } = req.params;


const reviews = await reviewModel
  .find({ foodId })
  .populate("userId", "name")
  .sort({ createdAt: -1 });

res.json({
  success: true,
  reviews,
});


} catch (error) {
console.error(
"GET REVIEW ERROR:",
error
);


res.status(500).json({
  success: false,
  message: error.message,
});


}
};

// ==============================
// GET ALL REVIEWS
// ==============================
export const getAllReviews = async (
req,
res
) => {
try {
const reviews = await reviewModel
.find({})
.populate("userId", "name email")
.populate("foodId", "name")
.populate("orderId", "orderNumber")
.sort({ createdAt: -1 });


res.json({
  success: true,
  reviews,
});


} catch (error) {
console.error(
"GET ALL REVIEWS ERROR:",
error
);


res.status(500).json({
  success: false,
  message: error.message,
});


}
};

// ==============================
// DELETE REVIEW
// ==============================
export const deleteReview = async (
req,
res
) => {
try {
const { reviewId } = req.params;


const review =
  await reviewModel.findById(
    reviewId
  );

if (!review) {
  return res.status(404).json({
    success: false,
    message: "Review not found",
  });
}

const foodId = review.foodId;

await reviewModel.findByIdAndDelete(
  reviewId
);

const remainingReviews =
  await reviewModel.find({
    foodId,
  });

const food =
  await foodModel.findById(foodId);

if (food) {
  const ratingCount =
    remainingReviews.length;

  const totalRatingPoints =
    remainingReviews.reduce(
      (sum, item) =>
        sum + item.rating,
      0
    );

  food.ratingCount =
    ratingCount;

  food.totalRatingPoints =
    totalRatingPoints;

  food.rating =
    ratingCount > 0
      ? Number(
          (
            totalRatingPoints /
            ratingCount
          ).toFixed(1)
        )
      : 0;

  await food.save();
}

res.json({
  success: true,
  message:
    "Review deleted successfully",
});


} catch (error) {
console.error(
"DELETE REVIEW ERROR:",
error
);

res.status(500).json({
  success: false,
  message: error.message,
});


}
};
