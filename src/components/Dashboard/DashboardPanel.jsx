import React, { useState, useEffect } from "react";
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
        // If product already exists, increase quantity
        const updatedList = [...prevOrderList];
        updatedList[existingItemIndex] = {
          ...updatedList[existingItemIndex],
          quantity: (updatedList[existingItemIndex].quantity || 1) + 1
        };
        return updatedList;
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
    <div className="bg-white/50 w-auto shadow-feat h-auto grid grid-cols-[60%_1fr] mx-5 my-4">
      <div className="pt-5 px-5 pb-5">
        <h3 className="font-lato font-semibold text-2xl ml-6">MENU CATEGORIES</h3>
        <div>
          <DashboardCategory setSelectedCategory={setSelectedCategory} />
        </div>
        <ProductList 
          products={filteredProducts} 
          addToOrderList={addToOrderList} 
          updateProducts={updateProducts}
        />
      </div>
      <div>
        {/* Pass orderList and setOrderList to DashboardOrder */}
        <DashboardOrder orderList={orderList} setOrderList={setOrderList} />
      </div>
    </div>
  );
};

export default DashboardPanel;