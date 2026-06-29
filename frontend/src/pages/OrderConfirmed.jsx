import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderConfirmed.css";

const OrderConfirmed = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="order-confirmed-page">

      <div className="order-confirmed-card">

        <div className="success-icon">
          ✅
        </div>

        <h1>Order Confirmed</h1>

        <p className="success-text">
          Your order has been placed successfully.
        </p>

        <div className="order-id-box">
          <span>Order ID</span>
          <strong>{id}</strong>
        </div>

        <div className="order-info">
          <div>
            <span>Status</span>
            <strong>Preparing</strong>
          </div>

          <div>
            <span>Payment</span>
            <strong>Success</strong>
          </div>
        </div>

        <button
          className="home-btn"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>

    </div>
  );
};

export default OrderConfirmed;