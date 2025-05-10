import React, { useState, useEffect } from "react";
import DashboardCategory from "./DashboardCategory";
import ProductList from "./ProductList";
import DashboardOrder from "./DashboardOrder";
import { fetchProducts } from "../../services/productService";

const DashboardPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState("All"); // Track selected category
  const [orderList, setOrderList] = useState([]); // Track items in the order list
  const [products, setProducts] = useState([]); // State to store all products
  const [loading, setLoading] = useState(true); // Loading state for products

  // Fetch products from Firestore on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
  const updateProducts = async () => {
    // This function now just triggers a refresh from Firestore
    // The actual updates to Firestore are handled in the ProductList component
    try {
      setLoading(true);
      const productsData = await fetchProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error refreshing products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="grid grid-cols-[1.5fr_1fr] gap-6 p-6 h-[calc(100vh-65px)]">

      {/* Menu Panel */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
        {/* Header */}

        <div className="pt-6 pl-6 pb-2 flex-shrink-0">
          <h3 className="text-[1.6rem] font-semibold font-lato uppercase">

            Menu Categories
          </h3>
        </div>

        {/* Categories Section */}
        <div className="flex-shrink-0">
          <DashboardCategory setSelectedCategory={setSelectedCategory} />
        </div>

        {/* Products Grid */}
        <div className="p-6 flex-1 overflow-y-auto">
          <ProductList
            products={filteredProducts}
            addToOrderList={addToOrderList}
            updateProducts={updateProducts}
            loading={loading}
          />
        </div>
      </div>

      {/* Order Panel */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden h-full mt-4 lg:mt-0">
        <DashboardOrder orderList={orderList} setOrderList={setOrderList} />
      </div>
    </div>
  );
};

export default DashboardPanel;