import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, query, where, Timestamp, getFirestore, onSnapshot, orderBy } from 'firebase/firestore';
import firebaseApp from "../firebaseConfig";
import { fetchProducts } from "../services/productService";

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
        console.log('AnalyticsContext: Loading products...');
        setLoading(true);

        // Fetch products from the product collection
        const productsData = await fetchProducts();
        console.log(`AnalyticsContext: Fetched ${productsData.length} products from product collection`);

        // Log product titles for debugging
        console.log('AnalyticsContext: Product titles:', productsData.map(p => p.title));

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

  // Fetch order data
  useEffect(() => {
    console.log('AnalyticsContext: Setting up Firestore listener...');
    let isSubscribed = true;

    // Get the current date
    const now = new Date();

    // Create first and last day of the current month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log(`AnalyticsContext: Current date is ${now.toLocaleDateString()}`);
    console.log(`AnalyticsContext: Fetching orders from ${firstDay.toLocaleDateString()} to ${lastDay.toLocaleDateString()}`);

    const ordersRef = collection(db, 'order_transaction');

    // Use a simpler query to avoid index requirements
    const monthQuery = query(
      ordersRef
    );

    const unsubscribe = onSnapshot(monthQuery, (snapshot) => {
      if (!isSubscribed) return;

      try {
        console.log('AnalyticsContext: Processing snapshot data...');
        const sales = [];
        let totalMonthSales = 0;
        const weekTotals = [0, 0, 0, 0];

        // Create dynamic product sales and quantities objects based on all products
        const productSales = {};
        const productQty = {};

        // Initialize product week sales
        const productWeekSales = [{}, {}, {}, {}];

        // First, initialize with products from the product collection
        allProducts.forEach(product => {
          if (product.title) {
            productSales[product.title] = 0;
            productQty[product.title] = 0;

            // Initialize in weekly sales tracking
            for (let i = 0; i < 4; i++) {
              productWeekSales[i][product.title] = 0;
            }
          }
        });

        console.log(`AnalyticsContext: Initialized ${Object.keys(productSales).length} products from product collection`);

        // Filter orders for the current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        console.log(`AnalyticsContext: Current month: ${firstDay.toLocaleDateString()} to ${lastDay.toLocaleDateString()}`);

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Skip if no items or no order_date or not delivered
          if (!data.items || !data.order_date || data.order_status !== "Delivered") {
            return;
          }

          // Convert Firestore timestamp to Date
          const orderDate = data.order_date.toDate ? data.order_date.toDate() : new Date(data.order_date);

          // Check if order is in the current month
          if (orderDate < firstDay || orderDate > lastDay) {
            return;
          }

          console.log(`AnalyticsContext: Processing delivered order from ${orderDate.toLocaleDateString()}`);

          const weekNum = getWeekNumber(orderDate);

          // Only include delivered orders
          weekTotals[weekNum] += data.order_total || 0;
          totalMonthSales += data.order_total || 0;

          // Process all items dynamically
          data.items.forEach(item => {
            // Get the item title, checking for different property names
            const itemTitle = item.title || item.name || '';

            if (!itemTitle) {
              return;
            }

            // Calculate the total for this item
            // Make sure we're using the correct price calculation
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemTotal = parseFloat(item.subtotal) || (itemPrice * itemQuantity);

            // If this is a new product we haven't seen before, add it to our tracking
            if (!productSales.hasOwnProperty(itemTitle)) {
              productSales[itemTitle] = 0;
              productQty[itemTitle] = 0;

              // Add to all week sales tracking
              for (let i = 0; i < 4; i++) {
                productWeekSales[i][itemTitle] = 0;
              }
            }

            // Update product sales
            productSales[itemTitle] += itemTotal;

            // Update product quantities
            productQty[itemTitle] += itemQuantity;

            // Update weekly product sales
            productWeekSales[weekNum][itemTitle] += itemTotal;
          });
        });

        // Sort products by quantity sold (not by sales volume)
        const sortedByQuantity = Object.entries(productQty)
          .sort(([,a], [,b]) => b - a);

        // Convert to object format with price values for display
        const sortedProducts = sortedByQuantity.reduce((obj, [key]) => ({
          ...obj,
          [key]: productSales[key]
        }), {});

        // Prepare chart data dynamically
        const chartData = [
          { name: 'Week 1', sales: weekTotals[0], ...productWeekSales[0] },
          { name: 'Week 2', sales: weekTotals[1], ...productWeekSales[1] },
          { name: 'Week 3', sales: weekTotals[2], ...productWeekSales[2] },
          { name: 'Week 4', sales: weekTotals[3], ...productWeekSales[3] }
        ];

        setWeeklyTotals(weekTotals);
        setMonthlyTotal(totalMonthSales);
        setTopSellingProducts(sortedProducts);
        setProductQuantities(productQty);
        setChartData(chartData);
        setDataFetched(true);
        setLoading(false);

        console.log('AnalyticsContext: Data processing complete');

      } catch (error) {
        console.error("AnalyticsContext: Error processing sales data:", error);
        setLoading(false);
      }
    }, (error) => {
      if (!isSubscribed) return;
      console.error("AnalyticsContext: Error fetching monthly sales:", error);
      setLoading(false);
    });

    return () => {
      console.log('AnalyticsContext: Cleaning up Firestore listener...');
      isSubscribed = false;
      unsubscribe();
    };
  }, [db, allProducts, getWeekNumber]);

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
