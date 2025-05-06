import React, { useState } from "react";
import DashboardCategory from "./DashboardCategory";
import ProductList from "./ProductList";
import DashboardOrder from "./DashboardOrder";

// Initial products data
const initialProducts = [
  {
    id: 1,
    title: "Katsu",
    description: "Katsu with rice (not spicy)",
    price: "60",
    category: "Meal",
    url: "https://static01.nyt.com/images/2021/05/23/dining/kc-chicken-katsu/merlin_185308080_a60a6563-292e-4f52-a33b-386113aca0b2-mediumSquareAt3X.jpg",
  },

  {
    id: 2,
    title: "Spicy Katsu",
    description: "Katsu with rice (spicy)",
    price: "60",
    category: "Meal",
    url: "https://i.dailymail.co.uk/i/newpix/2018/09/14/17/502C973900000578-0-image-a-1_1536943352086.jpg",
  },
];

const DashboardPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState("All"); // Track selected category
  const [orderList, setOrderList] = useState([]); // Track items in the order list
  const [products, setProducts] = useState(initialProducts); // State to store all products

  // Filter products based on the selected category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  // Add product to the order list
  const addToOrderList = (product) => {
    setOrderList((prevOrderList) => {
      // Check if the product is already in the order list
      const existingItemIndex = prevOrderList.findIndex(item => item.id === product.id);

      if (existingItemIndex !== -1) {
        // If product already exists, don't add it again or increase quantity
        // Just return the current list unchanged
        return prevOrderList;
      } else {
        // If product doesn't exist, add it with quantity 1
        return [...prevOrderList, { ...product, quantity: 1 }];
      }
    });
  };

  // Update products when a new product is added or edited
  const updateProducts = (updaterFn) => {
    // If updaterFn is a function, use it to update the products state
    if (typeof updaterFn === 'function') {
      setProducts(updaterFn);
    } else {
      // For backward compatibility, handle if a new array is passed directly
      setProducts(updaterFn);
    }
  };

  return (
    <div className="grid grid-cols-[1.5fr_1fr] gap-6 p-6 min-h-[calc(100vh-80px)]">
      {/* Menu Panel */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
            Menu Categories
          </h3>
        </div>
        
        {/* Categories Section */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-amber-50/30">
          <DashboardCategory setSelectedCategory={setSelectedCategory} />
        </div>

        {/* Products Grid */}
        <div className="p-6">
          <ProductList
            products={filteredProducts}
            addToOrderList={addToOrderList}
            updateProducts={updateProducts}
          />
        </div>
      </div>

      {/* Order Panel */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <DashboardOrder orderList={orderList} setOrderList={setOrderList} />
      </div>
    </div>
  );
};

export default DashboardPanel;