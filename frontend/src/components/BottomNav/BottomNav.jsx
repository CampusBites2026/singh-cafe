import React from "react";
import "./BottomNav.css";
import { Link, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingCart, Package, User } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const handleMenuClick = () => {
    setTimeout(() => {
      const section = document.getElementById("explore-menu");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="bottom-nav">
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        <Home size={22} strokeWidth={1.8} />
        <p>Home</p>
      </Link>
      <Link to="/" onClick={handleMenuClick}>
        <UtensilsCrossed size={22} strokeWidth={1.8} />
        <p>Menu</p>
      </Link>
      <Link to="/cart" className={location.pathname === "/cart" ? "active" : ""}>
        <ShoppingCart size={22} strokeWidth={1.8} />
        <p>Cart</p>
      </Link>
      <Link to="/myorders" className={location.pathname === "/myorders" ? "active" : ""}>
        <Package size={22} strokeWidth={1.8} />
        <p>Orders</p>
      </Link>
      <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>
        <User size={22} strokeWidth={1.8} />
        <p>Profile</p>
      </Link>
    </div>
  );
};

export default BottomNav;
