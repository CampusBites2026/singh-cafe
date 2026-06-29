import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../Context/StoreContext";
import { showNotification } from "../../utils/showNotification";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [bill, setBill] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    url,
    token,
    currency,
    submitReview,
  } = useContext(StoreContext);

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${url}/api/order/userorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const sorted = response.data.data.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

        setData(sorted);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(
        "ORDER FETCH ERROR:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // =========================
  // BILL
  // =========================
  const viewBill = async (order) => {
    if (order.status !== "delivered") {
      showNotification(
  "Invoice Unavailable",
  "Bill is available after delivery"
);
      return;
    }

    try {
      const res = await axios.get(
        `${url}/api/order/bill/${order._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success && res.data.bill) {
        setBill(res.data.bill);
      } else {
        showNotification(
  "Invoice Not Found",
  "Unable to locate your bill"
);
      }
    } catch (err) {
      console.error(
        "BILL FETCH ERROR:",
        err.response?.data || err.message
      );

      showNotification(
  "Invoice Error",
  "Please try again later"
);
    }
  };

  // =========================
  // OPEN RATING
  // =========================
const openRatingModal = (foodItem, orderId) => {
  setSelectedFood({
    ...foodItem,
    orderId,
  });

  setRating(0);
  setReviewText("");
  setShowRatingModal(true);
};

  // =========================
  // SUBMIT REVIEW
  // =========================
  const handleSubmitReview = async () => {
    if (!selectedFood) return;

    if (rating < 1) {
      showNotification(
  "Rating Required",
  "Select at least one star"
);
      return;
    }

    try {
      setSubmitting(true);

      const response = await submitReview(
  selectedFood._id,
  selectedFood.orderId,
  rating,
  reviewText
);

      if (response.success) {
        showNotification(
  "Review Submitted",
  "Thank you for your feedback ⭐"
);

        setShowRatingModal(false);
        setSelectedFood(null);
        setRating(0);
        setReviewText("");

        fetchOrders();
      } else {
        showNotification(
  "Review Failed",
  response.message
);
      }
    } catch (error) {
     showNotification(
  "Review Failed",
  "Please try again"
);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-orders">
      <h2>My Orders</h2>

      <div className="container">
        {data.map((order, index) => (
          <div
            key={index}
            className="my-orders-order"
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                background: "#fff5ec",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🍔
            </div>

            <p className="order-id">
              <b>Order ID:</b>{" "}
              {order.orderNumber}
            </p>

            <div>
              {order.items.map(
                (item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      {item.name} x{" "}
                      {item.quantity}
                    </span>

                    {order.status ===
                      "delivered" && (
                      <button
                        onClick={() =>
  openRatingModal(
    item,
    order._id
  )
}
                        style={{
                          border: "none",
                          padding:
                            "6px 12px",
                          borderRadius:
                            "10px",
                          background:
                            "#fff5ec",
                          color:
                            "#ff7a00",
                          fontWeight:
                            "600",
                          cursor:
                            "pointer",
                        }}
                      >
                        ⭐ Rate
                      </button>
                    )}
                  </div>
                )
              )}
            </div>

            <p>
              {currency}
              {order.amount}.00
            </p>

            <p>
              Items:{" "}
              {order.items.length}
            </p>

            <p>
              <span>
                &#x25cf;
              </span>{" "}
              <b>{order.status}</b>
            </p>

            <button
              className="view-bill-btn"
              disabled={
                order.status !==
                "delivered"
              }
              onClick={() =>
                viewBill(order)
              }
              style={{
                opacity:
                  order.status !==
                  "delivered"
                    ? 0.5
                    : 1,
                cursor:
                  order.status !==
                  "delivered"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              View Bill
            </button>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          No orders found 😕
        </p>
      )}

      {/* BILL MODAL */}
      {bill && (
        <div className="bill-modal">
          <div className="bill-box">
            <h2 className="bill-title">
              Order Invoice
            </h2>

            <p>
              <b>Order ID:</b>{" "}
              {bill.orderId}
            </p>

            <p>
              <b>Name:</b>{" "}
              {bill.customerName}
            </p>

            <p>
              <b>Date:</b>{" "}
              {new Date(
                bill.createdAt
              ).toLocaleString()}
            </p>

            <hr />

            <h3>Items</h3>

            {bill.items.map(
              (item, i) => (
                <p key={i}>
                  {item.name} x{" "}
                  {item.quantity}
                  {" — "}₹
                  {item.price *
                    item.quantity}
                </p>
              )
            )}

            <hr />

            <p>
              <b>Subtotal:</b> ₹
              {bill.amount}
            </p>

            <p>
              <b>Delivery Fee:</b> ₹
              {bill.deliveryFee}
            </p>

            <h3>
              Total: ₹
              {bill.totalAmount}
            </h3>

            <hr />

            <p>
              <b>Status:</b>{" "}
              {bill.status}
            </p>

            <button
              className="close-bill-btn"
              onClick={() =>
                setBill(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="bill-modal">
          <div className="bill-box">
            <h2 className="bill-title">
              Rate{" "}
              {selectedFood?.name}
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                gap: "10px",
                marginBottom:
                  "20px",
                fontSize: "34px",
              }}
            >
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <span
                    key={star}
                    onClick={() =>
                      setRating(star)
                    }
                    style={{
                      cursor:
                        "pointer",
                      color:
                        star <=
                        rating
                          ? "#ff9800"
                          : "#d3d3d3",
                    }}
                  >
                    ★
                  </span>
                )
              )}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) =>
                setReviewText(
                  e.target.value
                )
              }
              placeholder="Write your review..."
              style={{
                width: "100%",
                minHeight:
                  "120px",
                borderRadius:
                  "14px",
                padding: "12px",
                border:
                  "1px solid #ddd",
                resize: "none",
              }}
            />

            <button
              className="close-bill-btn"
              onClick={
                handleSubmitReview
              }
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Review"}
            </button>

            <button
              className="close-bill-btn"
              style={{
                marginTop: "10px",
                background:
                  "#e5e5e5",
                color: "#333",
              }}
              onClick={() =>
                setShowRatingModal(
                  false
                )
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;