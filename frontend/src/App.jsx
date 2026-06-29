import React, { useState, useEffect } from 'react';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import BottomNav from './components/BottomNav/BottomNav';
import Profile from './pages/Profile/Profile';

import { Route, Routes, Navigate } from 'react-router-dom';

import Cart from './pages/Cart/Cart';
import LoginPopup from './components/LoginPopup/LoginPopup';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import Verify from './pages/Verify/Verify';

import AdminDashboard from "./components/AdminDashboard";

import About from "./pages/About";
import Delivery from "./pages/Delivery";
import Privacy from "./pages/Privacy";

import OrderConfirmed from './pages/OrderConfirmed';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const [showLogin, setShowLogin] = useState(false);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setShowLogin(true);
    }
  }, []);

  return (
    <>
     

      {!isAuthenticated && (
        <LoginPopup
          showLogin={true}
          setShowLogin={setShowLogin}
        />
      )}

      {isAuthenticated && (
        <>
          <div className="app">

            <Navbar
              setShowLogin={setShowLogin}
            />

            <Routes>

              {/* Admin */}
              <Route
                path="/dashboard"
                element={<AdminDashboard />}
              />

              {/* Main */}
              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/cart"
                element={<Cart />}
              />

              <Route
                path="/order"
                element={<PlaceOrder />}
              />

              <Route
                path="/myorders"
                element={<MyOrders />}
              />
<Route
  path="/profile"
  element={<Profile />}
/>
              <Route
                path="/verify"
                element={<Verify />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/delivery"
                element={<Delivery />}
              />

              <Route
                path="/privacy"
                element={<Privacy />}
              />

              <Route
                path="/order-confirmed/:id"
                element={<OrderConfirmed />}
              />
              
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />

            </Routes>

          </div>

          {/* MOBILE APP NAVIGATION */}
          <BottomNav />

          {/* FOOTER */}
          <Footer />

        </>
      )}
    </>
  );
};

export default App;