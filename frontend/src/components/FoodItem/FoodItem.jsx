import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";

const FoodItem = ({
  image,
  name,
  price,
  desc,
  id,
  status,
  quantity,
  availableQuantity,
  rating = 0,
  ratingCount = 0,
}) => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    currency,
  } = useContext(StoreContext);

  const fallbackImage =
    "https://dummyimage.com/300x200/cccccc/000000&text=No+Image";

  const getImageUrl = () => {
    if (!image) return fallbackImage;
    if (image.startsWith("http")) return image;
    return `https://singhcafe.onrender.com/images/${image}`;
  };

 const stock =
  Number(
    availableQuantity ?? quantity ?? 0
  );

const isAvailable =
  stock > 0 &&
  (status === undefined ||
    status === "Active");

  // ==========================
  // STAR RENDERER
  // ==========================
  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= Math.round(rating)
              ? "#ff9800"
              : "#d3d3d3",
            fontSize: "16px",
            marginRight: "2px",
          }}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div className={`food-item ${!isAvailable ? "disabled" : ""}`}>
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={getImageUrl()}
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />

        {!isAvailable && (
          <>
            <div className="food-item-ribbon">
              SOLD OUT
            </div>

            <div className="food-item-overlay">
              <span>Unavailable</span>
            </div>
          </>
        )}

        {isAvailable && !cartItems?.[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="Add"
          />
        ) : isAvailable ? (
          <div className="food-item-counter">
            <img
              src={assets.remove_icon_red}
              onClick={() => removeFromCart(id)}
              alt="Remove"
            />

            <p>{cartItems?.[id]}</p>

            <img
              src={assets.add_icon_green}
              onClick={() => addToCart(id)}
              alt="Add"
            />
          </div>
        ) : null}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
        </div>

        {/* ==========================
            DYNAMIC RATING
        ========================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "4px",
            marginBottom: "8px",
          }}
        >
          <div>{renderStars()}</div>

          <span
            style={{
              fontSize: "13px",
              color: "#666",
              fontWeight: 500,
            }}
          >
            {rating.toFixed(1)}
          </span>

          <span
            style={{
              fontSize: "12px",
              color: "#999",
            }}
          >
            ({ratingCount})
          </span>
        </div>

        <p className="food-item-desc">{desc}</p>

        <div className="food-item-bottom">
          <p className="food-item-price">
            {currency}
            {price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;