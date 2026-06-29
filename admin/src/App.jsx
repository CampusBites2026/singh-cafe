import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";

import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import AdminPOS from "./pages/AdminPOS/AdminPOS";
import Settings from "./pages/Settings/Settings";
import Kitchen from "./pages/Kitchen/Kitchen";
import MonthlyReport from "./pages/MonthlyReport/MonthlyReport";
import Categories from "./pages/Categories/Categories";

import KitchenProvider from "./context/KitchenContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Reviews from "./pages/Reviews/Reviews";
const App = () => {
  return (
    <KitchenProvider> {/* ✅ WRAP EVERYTHING */}

      <div className="app">
        <ToastContainer
  position="top-right"
  autoClose={2500}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="dark"
/>

        <Navbar />
        <hr />

        <div className="app-content">
          <Sidebar />

          <Routes>
            <Route path="/" element={<AdminPOS />} />
            <Route path="/add" element={<Add />} />
            <Route path="/list" element={<List />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin/pos" element={<AdminPOS />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/monthly-report" element={<MonthlyReport />} />
            <Route
  path="/reviews"
  element={<Reviews />}
/>
          </Routes>
        </div>
      </div>

    </KitchenProvider>
  );
};

export default App;