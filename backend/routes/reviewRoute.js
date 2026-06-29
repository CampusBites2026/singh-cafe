import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  addReview,
  getFoodReviews,
  getAllReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

/* ================= ADMIN (no auth) ================= */
reviewRouter.get("/admin/all", getAllReviews);
reviewRouter.delete("/:reviewId", deleteReview);

/* ================= USER (keep auth) ================= */
reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/food/:foodId", getFoodReviews);

export default reviewRouter;
