// ==============================
// GET ALL REVIEWS (ADMIN)
// ==============================
export const getAllReviews = async (req, res) => {
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