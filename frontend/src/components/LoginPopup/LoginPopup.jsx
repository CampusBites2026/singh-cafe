import React, { useContext, useEffect, useRef } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

import { showNotification } from "../../utils/showNotification";

const LoginPopup = ({ showLogin = true, setShowLogin }) => {
  const { setToken, setUser, url } = useContext(StoreContext);
  const googleDivRef = useRef(null);

  const handleGoogleResponse = async (response) => {
    const googleToken = response.credential;

    try {
      const res = await axios.post(`${url}/api/user/google-login`, {
        token: googleToken,
      });

      if (res.data.success) {
        const newToken = res.data.token;
        const userData = res.data.user;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);

        const guestCart =
          JSON.parse(localStorage.getItem("guestCart")) || {};

        if (Object.keys(guestCart).length > 0) {
          await axios.post(
            `${url}/api/cart/merge`,
            { guestCart },
            {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            }
          );

          localStorage.removeItem("guestCart");
        }

        showNotification(
  "Welcome",
  "Successfully signed in",
  "Enjoy your meal 🍔"
);

        if (setShowLogin) setShowLogin(false);

        window.location.reload();
      } else {
        showNotification(
  "Login Failed",
  res.data.message || "Unable to sign in"
);
      }
    } catch (err) {
      console.log(err);
      showNotification(
  "Google Login Failed",
  "Please try again"
);
    }
  };

  useEffect(() => {
    if (!window.google || !googleDivRef.current) return;

    googleDivRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id:
        "850316169928-4mc3q9944ucpvsjuo19o4nl8f4alvn78.apps.googleusercontent.com",
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.renderButton(
      googleDivRef.current,
      {
        theme: "outline",
        size: "large",
        width: 320,
      }
    );
  }, []);

  return (
    <div className="login-popup">

      <div className="login-popup-container">

        <button
          className="login-close"
          onClick={() => setShowLogin(false)}
        >
          ✕
        </button>

        <div className="login-header">
          <div className="login-icon">
            🍔
          </div>

          <h2>Campus Bites</h2>

          <p>
            Fresh food delivered from your campus cafeteria
          </p>
        </div>

        <div
          ref={googleDivRef}
          className="google-login-btn"
        />

        <span className="login-note">
          Continue with Google to place orders,
          track deliveries and save favourites.
        </span>

      </div>
    </div>
  );
};

export default LoginPopup;