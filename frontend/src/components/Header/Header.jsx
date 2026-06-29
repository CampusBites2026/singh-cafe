import React, { useContext, useState } from "react";
import "./Header.css";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const Header = () => {
  const {
    user,
    notifications = [],
    setNotifications,
  } = useContext(StoreContext);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const firstName =
    user?.name?.split(" ")[0] || "Guest";

  const unreadCount =
    notifications.filter((n) => !n.read).length;

  const handleSwipeDelete = async (
    notificationId
  ) => {
    try {
      await axios.delete(
        `/api/user/notification/${notificationId}`
      );

      setNotifications((prev) =>
        prev.filter(
          (item) => item._id !== notificationId
        )
      );
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error.response?.data || error
      );
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(
        "/api/user/notifications/clear-all"
      );

      setNotifications([]);
    } catch (error) {
      console.error(
        "CLEAR ALL ERROR:",
        error.response?.data || error
      );
    }
  };

  return (
    <div className="mobile-header">
      <div className="header-top">
        <div className="location">
          <span>👋</span>

          <div>
            <small>Hello</small>
            <p>{firstName}</p>
          </div>
        </div>

        <div className="notification-wrapper">
          <div
            className="notification-icon"
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>📌 Notifications</h4>

                {notifications.length > 0 && (
                  <button
                    className="clear-all-btn"
                    onClick={
                      clearAllNotifications
                    }
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="empty-notification">
                  No notifications yet
                </p>
              ) : (
                <AnimatePresence>
                  {notifications.map(
                    (notification) => (
                      <motion.div
  key={notification._id || notification.createdAt}
  className="notification-item"
  drag="x"
  dragDirectionLock
  dragElastic={0.15}
  dragMomentum={false}
                        whileDrag={{
                          scale: 1.02,
                        }}
                        exit={{
                          opacity: 0,
                          x: -300,
                        }}
                        onDragEnd={(
                          event,
                          info
                        ) => {
                          if (info.offset.x < -60) {
                            handleSwipeDelete(
                              notification._id
                            );
                          }
                        }}
                      >
                        <div className="notification-content">
                          <p>
                            {
                              notification.message
                            }
                          </p>

                          <small>
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </small>
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hero-content">
        <span className="welcome-text">
          Fresh & Fast Delivery 🚀
        </span>

        <h1>
          Discover Your
          <span> Favorite Food</span>
        </h1>

        <p>
          Fresh meals, snacks and drinks
          delivered directly from your
          campus cafeteria.
        </p>
      </div>
    </div>
  );
};

export default Header;