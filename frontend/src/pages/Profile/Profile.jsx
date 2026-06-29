import React, { useContext } from "react";
import "./Profile.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);

    window.location.reload();
  };

  const profileImage =
    user?.picture ||
    `https://ui-avatars.com/api/?name=${
      user?.name || "User"
    }&background=ff5722&color=fff&size=256`;

  return (
    <div className="profile-page">

      <div className="profile-header-card">

        <img
          src={profileImage}
          alt="profile"
          className="profile-avatar"
        />

        <h2>{user?.name || "Campus Bites User"}</h2>

        <p>
          {user?.email || "No email available"}
        </p>

      </div>

      <div className="profile-section">

        <div
          className="profile-card"
          onClick={() => navigate("/myorders")}
        >
          <div>
            <h3>📦 My Orders</h3>
            <p>View all your previous orders</p>
          </div>

          <span>›</span>
        </div>

       

        <div className="profile-card">
          <div>
            <h3>🍔 Campus Bites</h3>
            <p>Fresh food delivered fast</p>
          </div>
        </div>

      </div>

      <div className="profile-info-card">

        <h3>Account Information</h3>

        <div className="info-row">
          <span>Name</span>
          <strong>{user?.name || "User"}</strong>
        </div>

        <div className="info-row">
          <span>Email</span>
          <strong>
            {user?.email || "Not Available"}
          </strong>
        </div>

        <div className="info-row">
          <span>Status</span>
          <strong>Active</strong>
        </div>

      </div>

      <button
        className="logout-btn"
        onClick={logout}
      >
        Logout
      </button>

      <p className="profile-version">
        Campus Bites v1.0
      </p>

    </div>
  );
};

export default Profile;