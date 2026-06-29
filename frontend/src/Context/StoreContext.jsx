import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

// ============================
// AXIOS CONFIG — runs at module load, before any component mounts.
// Guarantees interceptor is attached before loadData fires.
// ============================
const APP_URL = import.meta.env.VITE_API_URL || "https://singh-cafe-4pum.onrender.com";
axios.defaults.baseURL = APP_URL;

// Attach token to every outgoing request
axios.interceptors.request.use((config) => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
  }
  return config;
});

// If any request returns 401, the stored token is invalid/expired — wipe it
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

const STOCK_TOAST_ID = "stock-limit-toast";

const StoreContextProvider = (props) => {
  const url = APP_URL;

  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const currency = "₹";
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [kitchenOpen, setKitchenOpen] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // ============================
  // FETCH NOTIFICATIONS
  // Reads token from localStorage directly — avoids stale closure.
  // Silently skips if no token. 401s handled by response interceptor above.
  // ============================
  const fetchNotifications = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    try {
      const response = await axios.get("/api/user/notifications");
      if (response.data.success) {
        setNotifications([...response.data.notifications].reverse());
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("NOTIFICATION FETCH ERROR:", error);
      }
    }
  };

  // ============================
  // FETCH SETTINGS
  // ============================
  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/settings");
      if (res.data?.deliveryFee !== undefined) {
        setDeliveryFee(res.data.deliveryFee);
      }
      if (res.data?.kitchenOpen !== undefined) {
        setKitchenOpen(res.data.kitchenOpen);
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
    }
  };

  // ============================
  // LIVE KITCHEN STATUS SYNC
  // ============================
  useEffect(() => {
    const socket = io(url, {
      transports: ["websocket", "polling"],
    });

    socket.on("kitchenStatusUpdated", (status) => {
      setKitchenOpen(status);
    });

    return () => {
      socket.disconnect();
    };
  }, [url]);

  // ============================
  // FETCH FOOD LIST
  // ============================
  const fetchFoodList = async () => {
    try {
      const response = await axios.get("/api/food/list");

      const updatedData = response.data.data.map((item) => {
        let imageUrl = item.image;

        if (!imageUrl) {
          imageUrl = null;
        } else if (!imageUrl.startsWith("http")) {
          imageUrl = `${url}/images/${imageUrl}`;
        }

        return { ...item, image: imageUrl };
      });

      setFoodList(updatedData);
    } catch (error) {
      console.error("FETCH FOOD ERROR:", error);
    }
  };

  // ============================
  // SUBMIT REVIEW
  // ============================
  const submitReview = async (foodId, orderId, rating, review = "") => {
    try {
      const response = await axios.post("/api/review/add", {
        foodId,
        orderId,
        rating,
        review,
      });

      if (response.data.success) {
        await fetchFoodList();
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to submit review",
      };
    }
  };

  // ============================
  // GET FOOD REVIEWS
  // ============================
  const getFoodReviews = async (foodId) => {
    try {
      const response = await axios.get(`/api/review/${foodId}`);
      return response.data;
    } catch (error) {
      return { success: false, reviews: [] };
    }
  };

  // ============================
  // ADD TO CART (with stock check)
  // ============================
  const addToCart = async (itemId) => {
    const item = food_list.find((p) => p._id === itemId);
    if (!item) return;

    const currentQty = cartItems[itemId] || 0;
    const stock = item.availableQuantity ?? item.quantity ?? 0;

    if (currentQty >= stock) {
      if (!toast.isActive(STOCK_TOAST_ID)) {
        toast(
          <div className="cb-toast">
            <div className="cb-toast-title">📦 CampusBites</div>
            <div className="cb-toast-message">Maximum quantity reached</div>
            <div className="cb-toast-subtitle">
              Only {stock} item{stock > 1 ? "s" : ""} available
            </div>
          </div>,
          {
            toastId: STOCK_TOAST_ID,
            className: "cb-toast-wrapper",
            icon: false,
          }
        );
      }
      return;
    }

    const updatedCart = {
      ...cartItems,
      [itemId]: currentQty + 1,
    };

    setCartItems(updatedCart);

    if (localStorage.getItem("token")) {
      await axios.post("/api/cart/add", { itemId });
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // ============================
  // REMOVE FROM CART
  // ============================
  const removeFromCart = async (itemId) => {
    const updatedCart = { ...cartItems };

    if (updatedCart[itemId] > 1) {
      updatedCart[itemId] -= 1;
    } else {
      delete updatedCart[itemId];
    }

    setCartItems(updatedCart);

    if (localStorage.getItem("token")) {
      await axios.post("/api/cart/remove", { itemId });
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    }
  };

  // ============================
  // GET TOTAL CART AMOUNT
  // ============================
  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      const itemInfo = food_list.find((p) => p._id === item);
      if (itemInfo) {
        totalAmount += itemInfo.price * cartItems[item];
      }
    }

    return totalAmount;
  };

  // ============================
  // PLACE ORDER
  // ============================
  const placeOrder = async ({ address, paymentMethod, couponCode, items }) => {
    try {
      if (!items || items.length === 0) {
        return { success: false, message: "Cart is empty" };
      }

      const subtotal = getTotalCartAmount();

      const endpoint =
        paymentMethod === "COD" ? "/api/order/placecod" : "/api/order/place";

      const response = await axios.post(endpoint, {
        items,
        amount: subtotal - discount,
        discount,
        couponCode,
        deliveryFee,
        totalAmount: subtotal + deliveryFee - discount,
        address,
        paymentMethod,
      });

      if (response.data.success && paymentMethod === "COD") {
        setCartItems({});
        localStorage.removeItem("guestCart");
      }

      return response.data;
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Order failed",
      };
    }
  };

  // ============================
  // INITIAL LOAD
  // ============================
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      await fetchSettings();

      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
        await fetchNotifications();
        // Sync React state if interceptor wiped an invalid token
        if (!localStorage.getItem("token")) {
          setToken("");
          setUser(null);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
        setCartItems(guestCart);
      }
    }

    loadData();
  }, [url]);

  // ============================
  // AUTO REFRESH (every 10s)
  // Reads token from localStorage directly — avoids stale closure
  // ============================
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFoodList();
      fetchSettings();

      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        fetchNotifications();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ============================
  // CONTEXT VALUE
  // ============================
  const contextValue = {
    notifications,
    setNotifications,
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    user,
    setUser,
    currency,
    deliveryFee,
    placeOrder,
    searchQuery,
    setSearchQuery,
    discount,
    setDiscount,
    couponCode,
    setCouponCode,
    kitchenOpen,
    setKitchenOpen,
    submitReview,
    getFoodReviews,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
