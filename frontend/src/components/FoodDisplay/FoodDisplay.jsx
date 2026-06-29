import React, { useContext, useMemo } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../Context/StoreContext";

const FoodDisplay = ({ category }) => {
  const { food_list, searchQuery, url } = useContext(StoreContext);

  const filteredFoods = useMemo(() => {
    return food_list.filter((item) => {
      const itemCategory =
        typeof item.category === "object" && item.category !== null
          ? item.category.name
          : item.category;

      const matchesCategory =
        category === "All" ||
        itemCategory?.toLowerCase() === category.toLowerCase();

      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const inStock =
        (item.quantity !== undefined ? item.quantity > 0 : true) &&
        (item.status
          ? item.status.toLowerCase() !== "out of stock"
          : true);

      return matchesCategory && matchesSearch && inStock;
    });
  }, [food_list, category, searchQuery]);

  return (
    <div className="food-display" id="food-display">
      <div className="food-display-header">
        <h2>Popular Today</h2>
        <span>{filteredFoods.length} items available</span>
      </div>

      <div className="food-display-list">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item) => {
            let imageUrl =
              "https://dummyimage.com/300x200/cccccc/000000&text=No+Image";

            if (item.image) {
              if (item.image.startsWith("http")) {
                imageUrl = item.image;
              } else {
                imageUrl = `${url}/images/${item.image}`;
              }
            }

            return (
              <FoodItem
                key={item._id}
                image={imageUrl}
                name={item.name}
                desc={item.description}
                price={item.price}
                id={item._id}
                quantity={item.quantity}
                status={item.isActive ? "Active" : "Inactive"}

                // ⭐ Rating System
                rating={item.rating || 0}
                ratingCount={item.ratingCount || 0}
              />
            );
          })
        ) : (
          <div className="empty-food-state">
            <h3>No food found 🍔</h3>
            <p>Try searching for something else.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;