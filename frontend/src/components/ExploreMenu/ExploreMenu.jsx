import React, { useContext, useEffect, useState } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../Context/StoreContext";

const ExploreMenu = ({ category, setCategory }) => {
  const { searchQuery, setSearchQuery, url } = useContext(StoreContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${url}/api/categories`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [url]);

  return (
    <div className="explore-menu" id="explore-menu">

      {/* Section Heading */}
      <div className="section-heading">
        <h2>Categories</h2>
        <span>Browse food by category</span>
      </div>

      {/* Category List */}
      <div className="explore-menu-list">

        {/* All Category */}
        <div
          onClick={() => setCategory("All")}
          className={`category-pill ${
            category === "All" ? "active" : ""
          }`}
        >
          🍽️ All
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          [...Array(6)].map((_, index) => (
            <div
              key={index}
              className="category-pill skeleton-pill"
            >
              Loading...
            </div>
          ))
        ) : (
          categories.map((item) => (
            <div
              key={item._id}
              onClick={() =>
                setCategory((prev) =>
                  prev === item.name
                    ? "All"
                    : item.name
                )
              }
              className={`category-pill ${
                category === item.name
                  ? "active"
                  : ""
              }`}
            >
              <img
                src={`${url}/images/${item.image}`}
                alt={item.name}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://dummyimage.com/100x100/f5f5f5/888888&text=Food";
                }}
              />

              <span>{item.name}</span>
            </div>
          ))
        )}
      </div>

      {/* Search Bar */}
      <div className="menu-search-wrapper">
        <span className="search-icon">🔍</span>

        <input
          type="text"
          placeholder="Search food, drinks, snacks..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          className="menu-search-input"
        />
      </div>
    </div>
  );
};

export default ExploreMenu;