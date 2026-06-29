import React from "react";
import "./BottomNav.css";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const handleMenuClick = () => {
    setTimeout(() => {
      const section = document.getElementById("explore-menu");

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 100);
  };

  return (
    <div className="bottom-nav">

      <Link
        to="/"
        className={location.pathname === "/" ? "active" : ""}
      >
        <span>🏠</span>
        <p>Home</p>
      </Link>

      <Link
        to="/"
        onClick={handleMenuClick}
      >
        <span>🍔</span>
        <p>Menu</p>
      </Link>

      <Link
        to="/cart"
        className={location.pathname === "/cart" ? "active" : ""}
      >
        <span>🛒</span>
        <p>Cart</p>
      </Link>

      <Link
        to="/myorders"
        className={location.pathname === "/myorders" ? "active" : ""}
      >
        <span>📦</span>
        <p>Orders</p>
      </Link>

      <Link
        to="/profile"
        className={location.pathname === "/profile" ? "active" : ""}
      >
        <span>👤</span>
        <p>Profile</p>
      </Link>

    </div>
  );
};

export default BottomNav;