import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./Context/StoreContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StoreContextProvider>
      <App />

      <ToastContainer
  position="top-center"
  autoClose={2500}
  hideProgressBar
  newestOnTop
  closeOnClick
  pauseOnHover={false}
  draggable={false}
  closeButton={false}
  limit={1}
  stacked
/>
    </StoreContextProvider>
  </BrowserRouter>
);