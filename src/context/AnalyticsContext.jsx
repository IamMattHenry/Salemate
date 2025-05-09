import React, { createContext, useState, useContext, useEffect } from 'react';
import { getFirestore } from 'firebase/firestore';
import firebaseApp from "../firebaseConfig";
import { fetchProducts } from "../services/productService";
import analyticsService from "../services/analyticsService";

// Create the context
const AnalyticsContext = createContext();

// Create a provider component
export const AnalyticsProvider = ({ children }) => {
  const [weeklyTotals, setWeeklyTotals] = useState([0, 0, 0, 0]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [topSellingProducts, setTopSellingProducts] = useState({});
  const [productQuantities, setProductQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const db = getFirestore(firebaseApp);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const getWeekNumber = (date) => {
    // Get the first day of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    // Get the date being checked
    const dayOfMonth = date.getDate();

    // Calculate which week the date falls into (1-based)
    const weekNumber = Math.ceil((dayOfMonth + firstDay.getDay()) / 7);

    // Convert to 0-based index and ensure it doesn't exceed 3 (4th week)
    return Math.min(weekNumber - 1, 3);
  };

  // Fetch all products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Only log once when loading starts
        if (process.env.NODE_ENV === 'development') {
          console.log('AnalyticsContext: Loading products...');
        }
        setLoading(true);

        // Fetch products from the product collection
        const productsData = await fetchProducts();

        // Set all products in state
        setAllProducts(productsData);

        // We'll initialize the sales and quantities in the order data useEffect
        // This ensures we're only tracking products that exist in the database
      } catch (error) {
        console.error("AnalyticsContext: Error fetching products:", error);
        setAllProducts([]);
      }
    };

    loadProducts();
  }, []);

  // Fetch order data using optimized service
  useEffect(() => {
    let isSubscribed = true;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        console.log("AnalyticsContext: Fetching analytics data...");

        // Get monthly data (includes weekly breakdown)
        const monthlyData = await analyticsService.getMonthlyData();

        // Get product data
        const productData = await analyticsService.getProductData();

        if (!isSubscribed) return;

        // Extract weekly totals
        const weeklyTotals = monthlyData.weeklyData.map(week => week.sales);

        // Extract monthly total
        const monthlyTotal = monthlyData.totalRevenue;

        // Sort products by quantity sold
        const sortedByQuantity = Object.entries(productData.productQuantities)
          .sort(([,a], [,b]) => b - a);

        // Convert to object format with price values for display
        const sortedProducts = sortedByQuantity.reduce((obj, [key]) => ({
          ...obj,
          [key]: productData.productSales[key] || 0
        }), {});

        // Prepare chart data
        const chartData = monthlyData.weeklyData.map((week, index) => {
          // Create a base object with week name and sales
          const weekData = {
            name: week.name,
            sales: week.sales
          };

          // Add product data for each product
          allProducts.forEach(product => {
            if (product.title) {
              // For each product, calculate its contribution to this week
              // This is an approximation based on the product's overall percentage
              const productTotal = productData.productSales[product.title] || 0;
              const productPercentage = monthlyTotal > 0 ? productTotal / monthlyTotal : 0;
              weekData[product.title] = week.sales * productPercentage;
            }
          });

          return weekData;
        });

        // Update state with all the data
        setWeeklyTotals(weeklyTotals);
        setMonthlyTotal(monthlyTotal);
        setTopSellingProducts(sortedProducts);
        setProductQuantities(productData.productQuantities);
        setChartData(chartData);
        setDataFetched(true);
        setLoading(false);

        console.log("AnalyticsContext: Data fetching complete");
      } catch (error) {
        console.error("AnalyticsContext: Error fetching analytics data:", error);
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchAnalyticsData();

    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);

    return () => {
      isSubscribed = false;
      clearInterval(refreshInterval);
    };
  }, [db, allProducts]);

  // Value to be provided to consumers
  const value = {
    weeklyTotals,
    monthlyTotal,
    topSellingProducts,
    productQuantities,
    loading,
    chartData,
    allProducts,
    currentMonth,
    dataFetched
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Custom hook for using the analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
