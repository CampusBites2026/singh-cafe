import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import "./Verify.css";

const Verify = () => {
  const { url } = useContext(StoreContext);

  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");

  const verifyPayment = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/verify`,
        {
          success,
          orderId,
        }
      );

      if (response.data.success) {
        setStatus("success");

        setTimeout(() => {
          navigate("/myorders");
        }, 2000);
      } else {
        setStatus("failed");

        setTimeout(() => {
          navigate("/");
        }, 2500);
      }
    } catch (error) {
      console.error(error);

      setStatus("failed");

      setTimeout(() => {
        navigate("/");
      }, 2500);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className="verify-page">

      <div className="verify-card">

        {status === "verifying" && (
          <>
            <div className="spinner"></div>

            <h2>Verifying Payment</h2>

            <p>
              Please wait while we confirm your order...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="verify-icon success">
              ✅
            </div>

            <h2>Payment Successful</h2>

            <p>
              Redirecting to your orders...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="verify-icon failed">
              ❌
            </div>

            <h2>Payment Failed</h2>

            <p>
              Redirecting back to home...
            </p>
          </>
        )}

      </div>

    </div>
  );
};

export default Verify;