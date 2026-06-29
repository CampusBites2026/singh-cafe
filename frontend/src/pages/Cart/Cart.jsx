import React, { useContext, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    addToCart,
    getTotalCartAmount,
    url,
    currency,
    deliveryFee,
    discount,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="cart">

      <div className="cart-items">

        <div className="cart-items-title">
          <p>Item</p>
          <p>Name</p>
          <p>Price</p>
          <p>Qty</p>
          <p>Total</p>
        </div>

        <hr />

        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>

                <div className="cart-items-title cart-items-item">

                  <img
                    src={
                      item.image
                        ? item.image.startsWith("http")
                          ? item.image
                          : `${url}/images/${item.image}`
                        : "/fallback.png"
                    }
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <p>{item.name}</p>

                  <p>
                    {currency}
                    {item.price}
                  </p>

                  <div className="cart-quantity-control">

                    <button
                      onClick={() => removeFromCart(item._id)}
                    >
                      −
                    </button>

                    <span>
                      {cartItems[item._id]}
                    </span>

                    <button
                      onClick={() => {
                        const currentQty =
                          cartItems[item._id];

                        const stock =
                          item.quantity || 0;

                        if (currentQty >= stock) {
                          toast.warning(
                            `Only ${stock} items available`
                          );
                          return;
                        }

                        addToCart(item._id);
                      }}
                      disabled={
                        cartItems[item._id] >=
                        (item.quantity || 0)
                      }
                    >
                      +
                    </button>

                  </div>

                  <p>
                    {currency}
                    {item.price *
                      cartItems[item._id]}
                  </p>

                </div>

                <hr />

              </div>
            );
          }

          return null;
        })}
      </div>

      <div className="cart-bottom">

        <div className="cart-total">

          <h2>Order Summary</h2>

          <div>

            <div className="cart-total-details">
              <p>Subtotal</p>

              <p>
                {currency}
                {getTotalCartAmount()}
              </p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>

              <p>
                {currency}
                {getTotalCartAmount() === 0
                  ? 0
                  : deliveryFee}
              </p>
            </div>

            <hr />

            {discount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount</p>

                  <p>
                    -
                    {currency}
                    {discount}
                  </p>
                </div>

                <hr />
              </>
            )}

            <div className="cart-total-details">
              <b>Total</b>

              <b>
                {currency}
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() +
                    deliveryFee -
                    discount}
              </b>
            </div>

            {discount > 0 && (
              <p
                style={{
                  color: "#ff7a00",
                  marginTop: "10px",
                  fontWeight: "600",
                }}
              >
                🎉 You saved {currency}
                {discount}
              </p>
            )}

          </div>

          <button
            onClick={() => navigate("/order")}
          >
            Continue to Checkout →
          </button>

        </div>

      </div>

    </div>
  );
};

export default Cart;