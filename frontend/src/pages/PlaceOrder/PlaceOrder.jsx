import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";
import { showNotification } from "../../utils/showNotification";
/* ================= RAZORPAY PAYMENT - FIXED ✅ ================= */
const handlePayment = async (
  amount,
  address,
  items,
  token,
  orderId,
  setPaymentStatus,
  onSuccess
) => {
  try {
    const { data } = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
      { amount },
      { headers: token ? { token } : {} }
    );

    // ✅ Razorpay script check
    if (!window.Razorpay) {
      setPaymentStatus('error');
      showNotification(
  "Payment Error",
  "Please refresh and try again"
);
      return;
    }
const isMobile = () => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "Campus Bites",
      description: "Secure Checkout",
      image: "/logo.png",
      order_id: data.id,
      
      handler: async function (response) {
        setPaymentStatus('verifying');

        try {
          const verify = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/order/verify`,
  {
    ...response,
    orderId
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

          if (verify.data.success) {
  onSuccess({
    orderId
  });
} else {
  setPaymentStatus('failed');
}
        } catch (err) {
          console.error(err);
          setPaymentStatus('error');
        }
      },

      modal: {
  ondismiss: async function () {

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/order/cancel-reservation`,
        {
          orderId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "🔓 Reservation released"
      );

    } catch (error) {
      console.error(
        "Release reservation error:",
        error
      );
    }

    setPaymentStatus("cancelled");
  }
},

prefill: {
  contact: address.phone || ""
},

upi: {
  flow: isMobile() ? "intent" : "collect"
},

      theme: { color: "#ff4d4f" }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error(error);
    setPaymentStatus('error');
  }
};

/* ================= BREAK WINDOW FORMAT ================= */
const formatBreakWindow = (timeStr) => {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  const startMinutesTotal = h * 60 + m;
  const endMinutesTotal = startMinutesTotal + 10;
  const endH = Math.floor(endMinutesTotal / 60) % 24;
  const endM = endMinutesTotal % 60;

  const format12 = (hour24, minutes) => {
    const ampm = hour24 >= 12 ? "PM" : "AM";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    const minStr = minutes.toString().padStart(2, "0");
    return `${hour12}:${minStr} ${ampm}`;
  };

  return `${format12(h, m)} - ${format12(endH, endM)}`;
};

const PlaceOrder = () => {
  const [userType, setUserType] = useState(localStorage.getItem("userType") || "student");
  const [orderType, setOrderType] = useState(
  localStorage.getItem("orderType") || "takeaway"
);
  const [data, setData] = useState({
    fullName: "",
    phone: "",
    breakTime: "",
    specialInstructions: "",
    facultyCode: ""
  });
  const [tableNumber, setTableNumber] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
const [couponInput, setCouponInput] = useState("");
const [couponLoading, setCouponLoading] = useState(false);
const {
  getTotalCartAmount,
  placeOrder,
  cartItems,
  food_list,
  token,
  deliveryFee,
  discount,
  setDiscount,
  couponCode,
  setCouponCode,
  kitchenOpen
} = useContext(StoreContext);

  const navigate = useNavigate();
  const pollingRef = useRef(null);

  /* ================= LOAD RAZORPAY SCRIPT ================= */
 useEffect(() => {
  if (window.Razorpay) return;

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;

  script.onload = () => {
      };

  script.onerror = () => {
    
  };

  document.body.appendChild(script);
}, []);

  /* ================= onChangeHandler ================= */
  const onChangeHandler = useCallback((event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  }, []);

  /* ================= BUILD ORDER ITEMS ================= */
  const buildOrderItems = useCallback(() => {
    const orderItems = [];
    Object.keys(cartItems).forEach((itemId) => {
      const item = food_list.find((f) => f._id === itemId);
      if (item && cartItems[itemId] > 0) {
        orderItems.push({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[itemId],
          productType: item.productType
        });
      }
    });
    return orderItems;
  }, [cartItems, food_list]);

  /* ================= LOAD/SAVE DATA ================= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("checkoutData"));
    if (saved) {
      setUserType(saved.userType || "student");
setOrderType(saved.orderType || "takeaway");
      setData(prev => ({ ...prev, ...saved }));
    }
  }, []);

  useEffect(() => {
    const savedOrder = localStorage.getItem("activeOrderId");
    if (savedOrder && paymentStatus === null) {
      setCurrentOrderId(savedOrder);
      setPaymentStatus('processing');
    }
  }, [paymentStatus]);
useEffect(() => {
  localStorage.setItem(
    "checkoutData",
    JSON.stringify({
      ...data,
      userType,
      orderType
    })
  );

  localStorage.setItem("orderType", orderType);
}, [data, userType, orderType]);

  /* ================= TABLE NUMBER ================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("table");
    if (t) setTableNumber(t);
  }, []);

  /* ================= PREVENT EMPTY CART ================= */
  useEffect(() => {
    if (getTotalCartAmount() === 0) navigate('/');
  }, [getTotalCartAmount, navigate]);

  /* ================= FORM VALIDATION ================= */
  const validateForm = () => {
    if (!data.fullName.trim()) {
      showNotification(
  "Full name required"
);
      return false;
    }
    if (!/^\d{10}$/.test(data.phone)) {
      showNotification(
  "Invalid phone number"
);
      return false;
    }
    if (!data.breakTime) {
      showNotification(
  "Select your break time"
);
      return false;
    }
    if (userType === "faculty" && !data.facultyCode.trim()) {
      showNotification(
  
  "Faculty code required"
);
      return false;
    }
    return true;
  };

  /* ================= POLLING ================= */
  const pollOrderStatus = useCallback((orderId) => {
    if (pollingRef.current) return;
    
    const startTime = Date.now();
    pollingRef.current = setInterval(async () => {
      try {
       const { data } = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/order/status/${orderId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

        const status = data.order?.status || data.status;

        if (status === 'CONFIRMED' || status === 'PAID') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;

          localStorage.removeItem("activeOrderId");
          localStorage.removeItem("guestCart");

setDiscount(0);
setCouponCode("");
setCouponInput("");

setPaymentStatus('success');
setTimeout(() => navigate("/"), 1500);
          return;
        }

        if (Date.now() - startTime > 30000) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setPaymentStatus('timeout');
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
  }, [token, navigate]);
const handleApplyCoupon = async () => {
  if (!couponInput.trim()) {
    showNotification(
  "Coupon",
  "Enter a coupon code"
);
    return;
  }

  try {
    setCouponLoading(true);

const response = await axios.post(
  "/api/coupon/apply",
  {
    code: couponInput,
    subtotal: getTotalCartAmount()
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

if (response.data.success) {
      setDiscount(response.data.discount || 0);
      setCouponCode(couponInput);

      showNotification(
  "Coupon Applied",
  "Discount added successfully"
);
    } else {
      showNotification(
  "Coupon Failed",
  response.data.message
);
    }
  } catch (error) {
    showNotification(
  "Coupon Failed",
  error.response?.data?.message ||
  "Invalid coupon"
);
  } finally {
    setCouponLoading(false);
  }
};

const removeCoupon = () => {
  setDiscount(0);
  setCouponCode("");
  setCouponInput("");
};
  /* ================= COD ================= */
  const handlePlaceOrderCOD = async () => {

  if (!kitchenOpen) {
    showNotification(
  "Kitchen Closed",
  "Ordering is unavailable right now"
);
    return;
  }
    if (userType === "student") {
      showNotification(
  "Payment Restriction",
  "COD is available only for faculty"
);
      return;
    }
    if (!validateForm()) return;

    const address = {
  ...data,
  userType,
  orderType,
  breakTimeWindow:
    orderType === "takeaway"
      ? formatBreakWindow(data.breakTime)
      : "",
  table: tableNumber
};

    try {
      const resp = await placeOrder({
  address,
  paymentMethod: "COD",
  couponCode,
  items: buildOrderItems()
});

      if (resp?.success) {
  setDiscount(0);
  setCouponCode("");
  setCouponInput("");

  showNotification(
  "Order Confirmed",
  "Your order has been placed"
);
  navigate('/');
}
    } catch (err) {
      console.error(err);
      showNotification(
  "Order Failed",
  "Please try again"
);
    }
  };

const handlePayOnline = async () => {

  if (!kitchenOpen) {
    showNotification(
  "Kitchen Closed",
  "Ordering is unavailable right now"
);
    return;
  }

  if (!validateForm()) return;

  const address = {
  ...data,
  userType,
  orderType,
  breakTimeWindow:
    orderType === "takeaway"
      ? formatBreakWindow(data.breakTime)
      : "",
  table: tableNumber
};

  

  try {
   localStorage.removeItem("activeOrderId");
setPaymentStatus("initiating");

/* ================= CREATE RESERVED ORDER ================= */

const pendingOrder = await placeOrder({
  address,
  paymentMethod: "ONLINE",
  couponCode,
  items: buildOrderItems()
});

if (!pendingOrder.success) {
  alert(
    pendingOrder.message ||
    "Unable to reserve stock"
  );

  setPaymentStatus(null);
  return;
}

const orderId = pendingOrder.order._id;

const subtotal = getTotalCartAmount();

const amount = Math.max(
  1,
  subtotal + deliveryFee - discount
);

await handlePayment(
  amount,
  address,
  buildOrderItems(),
  token,
  orderId,
  setPaymentStatus,
  ({ orderId }) => {
    setCurrentOrderId(orderId);

    localStorage.setItem(
      "activeOrderId",
      orderId
    );

    setPaymentStatus("processing");
  }
);

  } catch (error) {
    console.error("Payment error:", error);
    setPaymentStatus("error");
  }
};

  /* ================= CLEANUP & POLLING ================= */
  useEffect(() => {
    if (paymentStatus === 'processing' && currentOrderId) {
      pollOrderStatus(currentOrderId);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [paymentStatus, currentOrderId, pollOrderStatus]);

  /* ================= PAYMENT STATUS UI ================= */
  if (paymentStatus) {
    return (
      <div className="payment-status-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', zIndex: 9999
      }}>
        <div className="payment-status-card" style={{
          background: 'white', padding: '40px', borderRadius: '12px', 
          textAlign: 'center', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          {paymentStatus === 'initiating' && (
            <>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>🔄</div>
              <h3 style={{margin: '0 0 16px 0', color: '#333'}}>Opening Payment...</h3>
              <p style={{color: '#666'}}>Redirecting to UPI payment</p>
            </>
          )}
          
          {paymentStatus === 'verifying' && (
            <>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>🔍</div>
              <h3 style={{margin: '0 0 16px 0', color: '#333'}}>Verifying Payment...</h3>
              <p style={{color: '#666'}}>Please wait while we confirm your payment</p>
            </>
          )}
          
          {paymentStatus === 'processing' && (
            <>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>⏳</div>
              <h3 style={{margin: '0 0 16px 0', color: '#333'}}>Processing Order...</h3>
              <p style={{color: '#666'}}>
                Finalizing your order (Order ID: {currentOrderId?.slice(-6)})
              </p>
            </>
          )}
          
          {paymentStatus === 'success' && (
            <>
              <div style={{fontSize: '48px', marginBottom: '20px', color: 'green'}}>✅</div>
              <h3 style={{margin: '0 0 16px 0', color: 'green'}}>Order Confirmed!</h3>
              <p style={{color: '#666'}}>Redirecting to home...</p>
            </>
          )}
          
          {(paymentStatus === 'failed' || paymentStatus === 'cancelled' || 
            paymentStatus === 'error' || paymentStatus === 'timeout') && (
            <>
              <div style={{fontSize: '48px', marginBottom: '20px', color: 'red'}}>❌</div>
              <h3 style={{margin: '0 0 16px 0', color: '#333'}}>
                Payment {paymentStatus === 'cancelled' ? 'Cancelled' : 'Failed'}
              </h3>
              <p style={{color: '#666', margin: '0 0 24px 0'}}>
                {paymentStatus === 'cancelled' && 'You cancelled the payment.'}
                {paymentStatus === 'timeout' && 'Verification timeout. Please check your order status.'}
                {paymentStatus !== 'cancelled' && paymentStatus !== 'timeout' && 'Please try again.'}
              </p>
              <button 
                onClick={() => {
                  setPaymentStatus(null);
                  setCurrentOrderId(null);
                  localStorage.removeItem("activeOrderId");
                  if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                  }
                }}
                style={{
                  background: '#ff4d4f', color: 'white', border: 'none',
                  padding: '12px 24px', borderRadius: '8px', fontSize: '16px',
                  cursor: 'pointer', fontWeight: '600'
                }}
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ================= MAIN FORM ================= */
  return (
    <div className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="user-type-boxes">
          <div className={`type-box ${userType === "student" ? "active" : ""}`} 
               onClick={() => setUserType("student")}>
            Student
          </div>
          <div className={`type-box ${userType === "faculty" ? "active" : ""}`} 
               onClick={() => setUserType("faculty")}>
            Faculty
          </div>
        </div>
        <div className="order-type-section">

  <p className="order-type-title">
    Order Type
  </p>

  <div className="user-type-boxes">

    <div
  className={`type-box ${orderType === "dine-in" ? "active" : ""}`}
onClick={() => setOrderType("dine-in")}
    >
      🍽️ Dine In
    </div>

    <div
      className={`type-box ${orderType === "takeaway" ? "active" : ""}`}
      onClick={() => setOrderType("takeaway")}
    >
      🛍️ Takeaway
    </div>

  </div>

</div>
        {tableNumber && (
          <div style={{marginBottom: 12, padding: 8, background: "#f6f6f6", borderRadius: 6}}>
            <strong>Ordering for Table:</strong> {tableNumber}
          </div>
        )}
        
        <input 
          type="text" 
          name="fullName" 
          value={data.fullName} 
          onChange={onChangeHandler} 
          placeholder="Full Name" 
          required 
        />
        
        <input
          type="tel"
          name="phone"
          value={data.phone}
          placeholder="10-digit Phone Number"
          maxLength={10}
          required
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) setData(prev => ({ ...prev, phone: value }));
          }}
        />
        
        <div className="break-time-container">
          <label className="break-time-label">⏰ Select your break start time</label>
          <div className="time-input-box">
            <input 
              type="time" 
              name="breakTime" 
              value={data.breakTime} 
              onChange={onChangeHandler} 
              step={600} 
              required 
            />
          </div>
          {data.breakTime && (
            <p className="delivery-window">
              Delivery window: <b>{formatBreakWindow(data.breakTime)}</b>
            </p>
          )}
        </div>
        
        {userType === "faculty" && (
          <input 
            type="text" 
            name='facultyCode' 
            value={data.facultyCode} 
            onChange={onChangeHandler} 
            placeholder='Faculty Verification Code' 
          />
        )}
        
        <textarea
          name="specialInstructions"
          value={data.specialInstructions}
          onChange={onChangeHandler}
          placeholder="Any special instructions? (optional)"
          style={{width: "100%", minHeight: "80px", marginTop: "10px", padding: "10px", borderRadius: "6px"}}
        />
      </div>

      <div className="place-order-right">
        <div className="coupon-card">
  <h3>🎁 Apply Coupon</h3>

  <div className="coupon-row">
    <input
      type="text"
      placeholder="Enter coupon code"
      value={couponInput}
      onChange={(e) =>
        setCouponInput(e.target.value.toUpperCase())
      }
    />

    <button
      className="coupon-btn"
      onClick={handleApplyCoupon}
      disabled={couponLoading}
    >
      {couponLoading ? "..." : "Apply"}
    </button>
  </div>

  {couponCode && (
    <div className="coupon-success">
      Applied: <b>{couponCode}</b>

      <span
        onClick={removeCoupon}
        style={{
          cursor: "pointer",
          marginLeft: 10
        }}
      >
        ❌ Remove
      </span>
    </div>
  )}
</div>
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : deliveryFee}</p>
          </div>
          <hr />
          {discount > 0 && (
            <>
              <div className="cart-total-details">
                <p>Discount</p>
                <p>-₹{discount}</p>
              </div>
              <hr />
            </>
          )}
          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryFee - discount}</b>
          </div>
        </div>

        <div className="payment-options payment-options-fixed">
          <h2>Select Payment Method</h2>

          {userType === "faculty" && (
            <>
           <div className="payment-option">
  <p style={{ fontWeight: "600" }}>Cash On Delivery</p>
  <small style={{ color: "#888" }}>
    Pay at pickup counter
  </small>
</div>

<button 
  onClick={handlePlaceOrderCOD}
  disabled={!kitchenOpen}
  style={{
    background: !kitchenOpen ? "#ccc" : "",
    cursor: !kitchenOpen ? "not-allowed" : "pointer"
  }}
>
  {kitchenOpen ? "PLACE ORDER (COD)" : "Kitchen Closed"}
</button>
              
            </>
          )}

          <div className="payment-option">
  <p style={{ fontWeight: "600" }}>Pay Online</p>
  <small style={{ color: "#888" }}>
    UPI / Razorpay secure payment
  </small>
</div>

<button 
  onClick={handlePayOnline}
  disabled={!kitchenOpen}
  style={{
    background: !kitchenOpen ? "#ccc" : "",
    cursor: !kitchenOpen ? "not-allowed" : "pointer"
  }}
>
  {kitchenOpen ? "PAY ONLINE" : "Kitchen Closed"}
</button>
        </div>                    
      </div>   
    </div>
  );
};

export default PlaceOrder;
