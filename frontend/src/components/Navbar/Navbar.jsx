import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import { io } from "socket.io-client";
import { ShoppingBag, LogOut } from "lucide-react";

import { showNotification } from "../../utils/showNotification";
const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [kitchenOpen, setKitchenOpen] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const profileRef = useRef(null);
  const { token, setToken, user, setUser } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const hideGreenBox = location.pathname === "/select";

  // Fetch Kitchen Status
  useEffect(() => {
    const fetchKitchenStatus = async () => {
      try {
        const res = await fetch(
  "https://singhcafe.onrender.com/api/settings"
);
        const data = await res.json();
        setKitchenOpen(data.kitchenOpen);
      } catch (err) {
        console.error("Failed to fetch kitchen status", err);
      }
    };
    fetchKitchenStatus();
  }, []);

  // Socket Connection
  useEffect(() => {
    const socket = io("https://singhcafe.onrender.com");

    socket.on("kitchenStatusUpdated", (status) => {
      setKitchenOpen(status);
    });

    return () => socket.disconnect();
  }, []);

  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click Outside Handler for Profile Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setShowProfileMenu(false);
    showNotification(
  "Signed Out",
  "See you again soon 👋"
);
   setTimeout(() => {
  window.location.reload();
}, 800);
  };

  const handleAdminAccess = () => {
    if (adminKey === "SRSINGHCAFE26") {
      window.location.href = "https://campusbitessinghcafeadmin.vercel.app/";
    } else {
      showNotification(
  "Access Denied",
  "Invalid admin code"
);
    }
  };

  return (
    <>
      <div className={`navbar navbar-custom ${scrolled ? "scrolled" : ""}`}>
  <div className="navbar-brand">
  <img
    src={assets.image}
    alt="logo"
    className="cookie-logo"
  />
</div>
       
        {!hideGreenBox && (
          <ul className="navbar-menu">
            <li>
              <Link
                to="/"
                onClick={() => setMenu("home")}
                className={menu === "home" ? "active" : ""}
              >
                HOME
              </Link>
            </li>
            <li>
              <span
                onClick={() => {
                  setMenu("menu");
                  navigate("/");
                  setTimeout(() => {
                    const section = document.getElementById("explore-menu");
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }}
                className={menu === "menu" ? "active" : ""}
                style={{ cursor: "pointer" }}
              >
                MENU
              </span>
            </li>
            <li>
              <a
                href="#footer"
                onClick={() => setMenu("contact")}
                className={menu === "contact" ? "active" : ""}
              >
                CONTACT US
              </a>
            </li>
            <li>
              <Link
                to="/myorders"
                onClick={() => setMenu("previous")}
                className={menu === "previous" ? "active" : ""}
              >
                PREVIOUS ORDERS
              </Link>
            </li>
          </ul>
        )}

        <div className="navbar-right">
          {!hideGreenBox && (
            <div className={`kitchen-status ${kitchenOpen ? "open" : "closed"}`}>
              {kitchenOpen ? "🟢 Open" : "🔴 Closed"}
            </div>
          )}

          {!hideGreenBox && (
            <button className="admin-btn" onClick={() => setShowAdminAuth(true)}>
              Admin
            </button>
          )}

          {!token ? (
            <button className="signin-btn" onClick={() => setShowLogin(true)}>
              Sign In
            </button>
          ) : (
            <div className="navbar-profile" ref={profileRef}>
              <img
                src={
                  user?.picture ||
                  `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=ff5722&color=fff`
                }
                alt="profile"
                onClick={() => setShowProfileMenu((prev) => !prev)}
              />

              {showProfileMenu && (
                <ul className="navbar-profile-dropdown">
                  <li>
                    <p><strong>{user?.name || "User"}</strong></p>
                  </li>
                  <hr />
                  <li
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/myorders");
                    }}
                  >
                    <ShoppingBag size={18} />
                    <p>Orders</p>
                  </li>
                  <hr />
                  <li onClick={logout}>
                    <LogOut size={18} />
                    <p>Logout</p>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {showAdminAuth && (
        <div className="admin-overlay">
          <div className="admin-modal">
            <h3>Admin Access</h3>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter access code"
            />
            <button className="admin-enter-btn" onClick={handleAdminAccess}>
              Enter
            </button>
            <button className="admin-cancel-btn" onClick={() => setShowAdminAuth(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;