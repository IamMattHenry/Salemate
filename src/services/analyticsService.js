import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  limit,
  getFirestore,
  onSnapshot
} from 'firebase/firestore';
import firebaseApp from '../firebaseConfig';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Initialize cache from localStorage if available
const initializeCache = () => {
  try {
    const storedCache = JSON.parse(localStorage.getItem('analyticsCache') || '{}');

    return {
      monthlyData: null,
      monthlyDataTimestamp: null,
      dailyData: storedCache.dailyData || {},
      productData: null,
      productDataTimestamp: null
    };
  } catch (e) {
    console.warn('Failed to load analytics cache from localStorage', e);
    return {
      monthlyData: null,
      monthlyDataTimestamp: null,
      dailyData: {},
      productData: null,
      productDataTimestamp: null
    };
  }
};

// Cache for analytics data
const cache = initializeCache();

// Cache expiration time (15 minutes for daily data, 30 minutes for monthly data)
const CACHE_EXPIRATION = {
  DAILY: 15 * 60 * 1000,   // 15 minutes
  MONTHLY: 30 * 60 * 1000, // 30 minutes
  PRODUCT: 30 * 60 * 1000  // 30 minutes
};

/**
 * Get monthly sales data with caching
 * @param {boolean} forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns {Promise<Object>} Monthly sales data
 */
export const getMonthlyData = async (forceRefresh = false) => {
  try {
    // Check if we have cached data that's still valid and we're not forcing a refresh
    const now = Date.now();
    if (!forceRefresh &&
        cache.monthlyData &&
        cache.monthlyDataTimestamp &&
        (now - cache.monthlyDataTimestamp) < CACHE_EXPIRATION.MONTHLY) {
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Using cached monthly data');
      }
      return cache.monthlyData;
    }

    console.log(`Fetching fresh monthly data${forceRefresh ? ' (forced)' : ''}`);

    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get start and end of month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Get all delivered orders for the current month
    const ordersCollection = collection(db, 'order_transaction');
    const q = query(
      ordersCollection,
      where('order_status', '==', 'Delivered'),
      where('order_date', '>=', startOfMonth),
      where('order_date', '<=', endOfMonth),
      orderBy('order_date', 'asc')
    );

    const querySnapshot = await getDocs(q);

    // Process the data
    const dailySales = {};
    let totalRevenue = 0;
    let totalOrders = 0;

    // Initialize dailySales for each day of the month
    const daysInMonth = endOfMonth.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      dailySales[dateString] = {
        date: date,
        orders: 0,
        sales: 0
      };
    }

    // Process orders
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const orderDate = data.order_date.toDate();
      const dateString = orderDate.toISOString().split('T')[0];

      if (dailySales[dateString]) {
        dailySales[dateString].orders++;
        dailySales[dateString].sales += parseFloat(data.order_total) || 0;
        totalRevenue += parseFloat(data.order_total) || 0;
        totalOrders++;
      }
    });

    // Calculate weekly data
    const weeklyData = calculateWeeklyData(dailySales);

    // Prepare result
    const result = {
      dailySales,
      weeklyData,
      totalRevenue,
      totalOrders
    };

    // Cache the result
    cache.monthlyData = result;
    cache.monthlyDataTimestamp = now;

    return result;
  } catch (error) {
    console.error('Error getting monthly data:', error);
    throw error;
  }
};

/**
 * Calculate weekly data from daily sales
 * @param {Object} dailySales - Daily sales data
 * @returns {Array} Weekly data
 */
const calculateWeeklyData = (dailySales) => {
  const weeks = [
    { name: 'Week 1', sales: 0, orders: 0 },
    { name: 'Week 2', sales: 0, orders: 0 },
    { name: 'Week 3', sales: 0, orders: 0 },
    { name: 'Week 4', sales: 0, orders: 0 }
  ];

  Object.values(dailySales).forEach(day => {
    const date = day.date;
    const dayOfMonth = date.getDate();

    // Determine which week this day belongs to
    let weekIndex;
    if (dayOfMonth <= 7) {
      weekIndex = 0; // Week 1
    } else if (dayOfMonth <= 14) {
      weekIndex = 1; // Week 2
    } else if (dayOfMonth <= 21) {
      weekIndex = 2; // Week 3
    } else {
      weekIndex = 3; // Week 4
    }

    // Add to weekly totals
    weeks[weekIndex].sales += day.sales;
    weeks[weekIndex].orders += day.orders;
  });

  return weeks;
};

/**
 * Get daily sales data with caching
 * @param {Date} date - Date to get sales for
 * @param {boolean} forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns {Promise<Object>} Daily sales data
 */
export const getDailyData = async (date = new Date(), forceRefresh = false) => {
  try {
    const dateString = date.toISOString().split('T')[0];

    // Check if we have cached data that's still valid and we're not forcing a refresh
    const now = Date.now();
    if (!forceRefresh &&
        cache.dailyData[dateString] &&
        cache.dailyData[dateString].timestamp &&
        (now - cache.dailyData[dateString].timestamp) < CACHE_EXPIRATION.DAILY) {
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using cached daily data for ${dateString}`);
      }
      return cache.dailyData[dateString].data;
    }

    // If we're forcing a refresh, clear any existing fetch flag
    if (forceRefresh && cache.dailyData[dateString]) {
      cache.dailyData[dateString].fetching = false;
    }

    // Check if we're already fetching this data and not forcing a refresh
    if (!forceRefresh &&
        cache.dailyData[dateString] &&
        cache.dailyData[dateString].fetching) {
      // Wait for the existing fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      return getDailyData(date, forceRefresh); // Recursively try again
    }

    // Mark that we're fetching this data
    cache.dailyData[dateString] = {
      ...(cache.dailyData[dateString] || {}),
      fetching: true
    };

    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching fresh daily data for ${dateString}${forceRefresh ? ' (forced)' : ''}`);
    }

    // Get start and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Convert to Firestore Timestamp objects for accurate comparison
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    // Log the date range we're querying for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Querying orders between: ${startOfDay.toLocaleString()} and ${endOfDay.toLocaleString()}`);
    }

    // Get only delivered orders for the day
    const ordersCollection = collection(db, 'order_transaction');

    // Create query for delivered orders only
    const deliveredQuery = query(
      ordersCollection,
      where('order_status', '==', 'Delivered'),
      where('order_date', '>=', startTimestamp),
      where('order_date', '<=', endTimestamp),
      orderBy('order_date', 'desc')
    );

    // Execute the query
    const deliveredSnapshot = await getDocs(deliveredQuery);

    // Log the results for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${deliveredSnapshot.size} delivered orders`);

      // Log the first few orders for inspection
      if (deliveredSnapshot.size > 0) {
        console.log('Sample delivered orders:');
        let count = 0;
        deliveredSnapshot.forEach(doc => {
          if (count < 3) { // Only log the first 3 for brevity
            const data = doc.data();
            console.log(`- Order ${doc.id}: ${data.recipient}, Status: ${data.order_status}, Date: ${data.order_date?.toDate?.().toLocaleString() || 'Unknown'}`);
            count++;
          }
        });
      } else {
        console.log('No delivered orders found for today');
      }
    }

    // Process the data
    const sales = [];
    let totalCashSales = 0;
    let totalOnlineSales = 0;

    // Helper function to process documents
    const processDoc = (doc) => {
      const data = doc.data();

      // Skip documents without required fields
      if (!data.order_date || !data.order_status) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Skipping document ${doc.id} - missing required fields`);
        }
        return;
      }

      // Double-check that we only process "Delivered" orders
      if (data.order_status !== 'Delivered') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Skipping document ${doc.id} - not a delivered order (status: ${data.order_status})`);
        }
        return;
      }

      // Get the formatted time
      let formattedTime;
      try {
        formattedTime = new Date(data.order_date.toDate()).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } catch (error) {
        console.error(`Error formatting time for document ${doc.id}:`, error);
        formattedTime = 'Unknown';
      }

      // Add to the appropriate total - only for Delivered orders
      // This check is redundant since we already filter above, but adding for extra safety
      if (data.order_status === 'Delivered') {
        if (data.mop === 'Online') {
          totalOnlineSales += parseFloat(data.order_total) || 0;
        } else {
          totalCashSales += parseFloat(data.order_total) || 0;
        }
      }

      // Create the sale object
      const saleObject = {
        id: doc.id,
        quantity: data.no_order || 0,
        recipient: data.recipient || 'Unknown',
        amount: data.order_total || '0',
        time: formattedTime,
        mop: data.mop || 'Cash',
        status: data.order_status
      };

      // Add to sales array
      sales.push(saleObject);

      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Processed order ${doc.id}: ${data.recipient}, ${data.order_status}, ${formattedTime}`);
      }
    };

    // Process only delivered orders
    deliveredSnapshot.forEach(processDoc);

    // Sort combined results by time (most recent first)
    sales.sort((a, b) => {
      try {
        // Convert time strings to Date objects for comparison
        const timeA = new Date(`${date.toDateString()} ${a.time}`);
        const timeB = new Date(`${date.toDateString()} ${b.time}`);

        // Check if dates are valid
        if (isNaN(timeA.getTime()) || isNaN(timeB.getTime())) {
          console.warn('Invalid date encountered during sorting');
          return 0; // Keep original order if dates are invalid
        }

        return timeB - timeA;
      } catch (error) {
        console.error('Error during sort:', error);
        return 0; // Keep original order on error
      }
    });

    // Log the sorted results for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Sorted sales data:', sales.map(s => `${s.recipient} (${s.status}) at ${s.time}`));
      console.log(`Total sales summary - Cash: ₱${totalCashSales}, Online: ₱${totalOnlineSales}, Total: ₱${totalCashSales + totalOnlineSales}`);
    }

    // Prepare result
    const result = {
      sales,
      totalCashSales,
      totalOnlineSales,
      totalSales: totalCashSales + totalOnlineSales
    };

    // Cache the result
    cache.dailyData[dateString] = {
      data: result,
      timestamp: now,
      fetching: false
    };

    // Store in localStorage for persistence across page refreshes
    try {
      // Get existing cache or initialize empty object
      const storedCache = JSON.parse(localStorage.getItem('analyticsCache') || '{}');

      // Update with new data
      storedCache.dailyData = storedCache.dailyData || {};
      storedCache.dailyData[dateString] = {
        data: result,
        timestamp: now
      };

      // Store back in localStorage (with size limit protection)
      const cacheString = JSON.stringify(storedCache);
      if (cacheString.length < 2000000) { // ~2MB limit
        localStorage.setItem('analyticsCache', cacheString);
      }
    } catch (e) {
      // Ignore localStorage errors
      console.warn('Failed to store analytics cache in localStorage', e);
    }

    return result;
  } catch (error) {
    console.error('Error getting daily data:', error);
    throw error;
  }
};

/**
 * Get product sales data with caching
 * @param {boolean} forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns {Promise<Object>} Product sales data
 */
export const getProductData = async (forceRefresh = false) => {
  try {
    // Check if we have cached data that's still valid and we're not forcing a refresh
    const now = Date.now();
    if (!forceRefresh &&
        cache.productData &&
        cache.productDataTimestamp &&
        (now - cache.productDataTimestamp) < CACHE_EXPIRATION.PRODUCT) {
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Using cached product data');
      }
      return cache.productData;
    }

    console.log(`Fetching fresh product data${forceRefresh ? ' (forced)' : ''}`);

    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get start and end of month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Get all delivered orders for the current month
    const ordersCollection = collection(db, 'order_transaction');
    const q = query(
      ordersCollection,
      where('order_status', '==', 'Delivered'),
      where('order_date', '>=', startOfMonth),
      where('order_date', '<=', endOfMonth)
    );

    const querySnapshot = await getDocs(q);

    // Process the data
    const productSales = {};
    const productQuantities = {};

    querySnapshot.forEach(doc => {
      const data = doc.data();

      if (data.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
          const title = item.title || 'Unknown';
          const quantity = parseInt(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const total = price * quantity;

          if (!productSales[title]) {
            productSales[title] = 0;
            productQuantities[title] = 0;
          }

          productSales[title] += total;
          productQuantities[title] += quantity;
        });
      }
    });

    // Prepare result
    const result = {
      productSales,
      productQuantities
    };

    // Cache the result
    cache.productData = result;
    cache.productDataTimestamp = now;

    return result;
  } catch (error) {
    console.error('Error getting product data:', error);
    throw error;
  }
};

/**
 * Subscribe to order status changes and trigger a callback when detected
 * @param {Function} callback - Function to call when an order status change is detected
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNewDeliveredOrders = (callback) => {
  try {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert to Firestore Timestamp for accurate comparison
    const todayTimestamp = Timestamp.fromDate(today);

    // Create a query for all orders from today (not filtering by status)
    // and with a larger limit to ensure we catch all new orders
    const ordersCollection = collection(db, 'order_transaction');
    const q = query(
      ordersCollection,
      where('order_date', '>=', todayTimestamp),
      orderBy('order_date', 'desc'),
      limit(50) // Increased limit to catch more orders
    );

    // Set up a real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Check if there are any document changes
      if (!snapshot.empty && snapshot.docChanges().length > 0) {
        // Check if any of the changes are relevant (new, modified, or status changes)
        let statusChanged = false;

        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();

          // Check if this is a status change to "Delivered"
          if (change.type === 'modified') {
            const status = data.order_status;
            if (status === 'Delivered') {
              statusChanged = true;
              // Only log in development environment
              if (process.env.NODE_ENV === 'development') {
                console.log(`Order status changed to Delivered, refreshing analytics data`);
              }
            }
          }

          // Also detect new orders with "Delivered" status
          if (change.type === 'added' && data.order_status === 'Delivered') {
            statusChanged = true;
            // Only log in development environment
            if (process.env.NODE_ENV === 'development') {
              console.log(`New Delivered order detected, refreshing analytics data`);
            }
          }
        });

        if (statusChanged) {
          // Clear the cache for today's data to force a refresh
          const dateString = today.toISOString().split('T')[0];

          // Completely remove the cache entry to force a full refresh
          if (cache.dailyData[dateString]) {
            delete cache.dailyData[dateString];
          }

          // Also clear the monthly data cache to ensure consistency
          cache.monthlyData = null;
          cache.monthlyDataTimestamp = 0;

          // Clear the product data cache as well
          cache.productData = null;
          cache.productDataTimestamp = 0;

          // Also clear localStorage cache
          try {
            const storedCache = JSON.parse(localStorage.getItem('analyticsCache') || '{}');
            if (storedCache.dailyData && storedCache.dailyData[dateString]) {
              delete storedCache.dailyData[dateString];
              // Also clear monthly data in localStorage
              delete storedCache.monthlyData;
              localStorage.setItem('analyticsCache', JSON.stringify(storedCache));
            }
          } catch (e) {
            console.warn('Failed to clear analytics cache from localStorage', e);
          }

          // Call the callback function with a small delay to ensure cache is cleared
          setTimeout(() => callback(), 100);
        }
      }
    }, (error) => {
      console.error('Error listening for order status changes:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up order listener:', error);
    return () => {}; // Return a no-op function if setup fails
  }
};

export default {
  getMonthlyData,
  getDailyData,
  getProductData,
  subscribeToNewDeliveredOrders
};
