import express from "express";
import authMiddleware from "../middleware/auth.js";

import {
  addReview,
  getFoodReviews,
  getAllReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

/* ==========================
   ADD REVIEW
========================== */

reviewRouter.post(
  "/add",
  authMiddleware,
  addReview
);

/* ==========================
   ADMIN ALL REVIEWS
========================== */

reviewRouter.get(
  "/admin/all",
  authMiddleware,
  getAllReviews
);

/* ==========================
   DELETE REVIEW
========================== */

reviewRouter.delete(
  "/:reviewId",
  authMiddleware,
  deleteReview
);

/* ==========================
   GET REVIEWS FOR FOOD
========================== */

reviewRouter.get(
  "/food/:foodId",
  getFoodReviews
);

export default reviewRouter;