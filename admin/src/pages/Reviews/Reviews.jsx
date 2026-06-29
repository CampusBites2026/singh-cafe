import React, { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../assets/assets";
import { toast } from "react-toastify";
import "./Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${url}/api/review/admin/all`
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reviews");
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const response = await axios.delete(
        `${url}/api/review/${reviewId}`
      );

      if (response.data.success) {
        toast.success("Review deleted");
        fetchReviews();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) =>
    review.foodId?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="reviews-page">
      <h2>Customer Reviews</h2>

      <input
        type="text"
        placeholder="Search by product name..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="review-search"
      />

      <div className="reviews-grid">
        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className="review-card"
          >
            <div className="review-header">
              <h3>
                {review.foodId?.name ||
                  "Deleted Food"}
              </h3>

              <span>
                ⭐ {review.rating}/5
              </span>
            </div>

            <p className="review-user">
              By:{" "}
              {review.userId?.name ||
                "Unknown User"}
            </p>

            <p className="review-text">
              {review.review ||
                "No review text"}
            </p>

            <small>
              {new Date(
                review.createdAt
              ).toLocaleString()}
            </small>

            <button
              className="delete-review-btn"
              onClick={() =>
                deleteReview(review._id)
              }
            >
              Delete Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;