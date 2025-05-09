/**
 * API Service for Salemate
 * This service handles all Firebase Firestore operations
 */

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification
} from 'firebase/auth';
import firebaseApp, { auth } from '../firebaseConfig';

// Initialize Firestore
const db = getFirestore(firebaseApp);

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Sign in user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        user: userCredential.user,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  /**
   * Sign up user
   * @param {Object} userData - User data (email, password, firstName, lastName, department)
   * @returns {Promise<Object>} User data
   */
  signUp: async (userData) => {
    try {
      const { email, password, firstName, lastName, department } = userData;

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user, {
        url: window.location.origin + "/signin", // Redirect URL after verification
        handleCodeInApp: false,
      });

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        department,
        emailVerified: false, // Track email verification status
        createdAt: serverTimestamp(),
      });

      return {
        user,
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  /**
   * Sign out user
   * @returns {Promise<void>}
   */
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Verify user's PIN
   * @param {string} pin - User PIN
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Verification result
   */
  verifyPin: async (pin, userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().pin === pin) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw error;
    }
  },

  /**
   * Create user PIN
   * @param {string} pin - User PIN
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  createPin: async (pin, userId) => {
    try {
      const userDocRef = doc(db, "users", userId);

      // First check if the document exists
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          pin: pin
        });
      } else {
        // Create new document if it doesn't exist
        await setDoc(userDocRef, {
          pin: pin,
          email: auth.currentUser.email,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error creating PIN:', error);
      throw error;
    }
  },
};

/**
 * Products API
 */
export const productsAPI = {
  /**
   * Get all products
   * @returns {Promise<Array>} Array of products
   */
  getAll: async () => {
    try {
      const productsCollection = collection(db, 'product');
      const q = query(productsCollection, orderBy('title'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  getById: async (id) => {
    try {
      const productRef = doc(db, 'product', id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        throw new Error(`Product with ID ${id} not found`);
      }

      return {
        id: productDoc.id,
        ...productDoc.data(),
      };
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new product
   * @param {Object} product - Product data
   * @returns {Promise<Object>} Created product
   */
  create: async (product) => {
    try {
      // Add timestamp fields
      const productWithTimestamp = {
        ...product,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'product'), productWithTimestamp);

      return {
        id: docRef.id,
        ...product
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} product - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  update: async (id, product) => {
    try {
      const productRef = doc(db, 'product', id);

      // Add updated timestamp
      const productWithTimestamp = {
        ...product,
        updated_at: serverTimestamp()
      };

      await updateDoc(productRef, productWithTimestamp);

      return {
        id,
        ...product
      };
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const productRef = doc(db, 'product', id);
      await deleteDoc(productRef);
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  },
};

/**
 * Orders API
 */
export const ordersAPI = {
  /**
   * Get all orders
   * @returns {Promise<Array>} Array of orders
   */
  getAll: async () => {
    try {
      const ordersCollection = collection(db, 'order_transaction');
      const q = query(ordersCollection, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  getById: async (id) => {
    try {
      const orderRef = doc(db, 'order_transaction', id);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error(`Order with ID ${id} not found`);
      }

      return {
        id: orderDoc.id,
        ...orderDoc.data(),
      };
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new order
   * @param {Object} order - Order data
   * @returns {Promise<Object>} Created order
   */
  create: async (order) => {
    try {
      // Add timestamp fields
      const orderWithTimestamp = {
        ...order,
        created_at: serverTimestamp(),
        order_date: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'order_transaction'), orderWithTimestamp);

      return {
        id: docRef.id,
        ...order
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} order - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  update: async (id, order) => {
    try {
      const orderRef = doc(db, 'order_transaction', id);

      // Add updated timestamp
      const orderWithTimestamp = {
        ...order,
        updated_at: serverTimestamp()
      };

      await updateDoc(orderRef, orderWithTimestamp);

      return {
        id,
        ...order
      };
    } catch (error) {
      console.error(`Error updating order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete order
   * @param {string} id - Order ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const orderRef = doc(db, 'order_transaction', id);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error(`Error deleting order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get orders by status
   * @param {string} status - Order status
   * @returns {Promise<Array>} Array of orders
   */
  getByStatus: async (status) => {
    try {
      const ordersCollection = collection(db, 'order_transaction');
      const q = query(
        ordersCollection,
        where('order_status', '==', status),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error);
      throw error;
    }
  },

  /**
   * Get orders by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise<Array>} Array of orders
   */
  getByDateRange: async (startDate, endDate) => {
    try {
      // Convert ISO strings to Date objects
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      const ordersCollection = collection(db, 'order_transaction');
      const q = query(
        ordersCollection,
        where('created_at', '>=', Timestamp.fromDate(startDateTime)),
        where('created_at', '<=', Timestamp.fromDate(endDateTime)),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error fetching orders by date range:`, error);
      throw error;
    }
  },

  /**
   * Get order history
   * @returns {Promise<Array>} Order history data
   */
  getHistory: async () => {
    try {
      const historyCollection = collection(db, 'saved_history');
      const q = query(historyCollection, orderBy('dateSaved', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  },
};

/**
 * Inventory API
 */
export const inventoryAPI = {
  /**
   * Get all inventory items
   * @returns {Promise<Array>} Array of inventory items
   */
  getAll: async () => {
    try {
      const inventoryCollection = collection(db, 'inventory');
      const q = query(inventoryCollection, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  /**
   * Get inventory item by ID
   * @param {string} id - Inventory item ID
   * @returns {Promise<Object>} Inventory item data
   */
  getById: async (id) => {
    try {
      const inventoryRef = doc(db, 'inventory', id);
      const inventoryDoc = await getDoc(inventoryRef);

      if (!inventoryDoc.exists()) {
        throw new Error(`Inventory item with ID ${id} not found`);
      }

      return {
        id: inventoryDoc.id,
        ...inventoryDoc.data(),
      };
    } catch (error) {
      console.error(`Error fetching inventory item with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new inventory item
   * @param {Object} item - Inventory item data
   * @returns {Promise<Object>} Created inventory item
   */
  create: async (item) => {
    try {
      // Format the item data
      const formattedItem = {
        ...item,
        timestamp: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };

      // Calculate beginning and ending inventory if not provided
      if (!formattedItem.begin_inv && formattedItem.purchased) {
        formattedItem.begin_inv = Number(formattedItem.purchased);
      }

      if (!formattedItem.ending_inv && formattedItem.begin_inv !== undefined && formattedItem.used !== undefined) {
        formattedItem.ending_inv = Number(formattedItem.begin_inv) - Number(formattedItem.used);
      }

      const docRef = await addDoc(collection(db, 'inventory'), formattedItem);

      return {
        id: docRef.id,
        ...formattedItem
      };
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  /**
   * Update inventory item
   * @param {string} id - Inventory item ID
   * @param {Object} item - Updated inventory item data
   * @returns {Promise<Object>} Updated inventory item
   */
  update: async (id, item) => {
    try {
      const inventoryRef = doc(db, 'inventory', id);

      // Format the item data
      const formattedItem = {
        ...item,
        last_updated: new Date().toISOString(),
      };

      // Recalculate ending inventory if begin_inv or used has changed
      if ((formattedItem.begin_inv !== undefined || formattedItem.used !== undefined) &&
          formattedItem.begin_inv !== undefined && formattedItem.used !== undefined) {
        formattedItem.ending_inv = Number(formattedItem.begin_inv) - Number(formattedItem.used);
      }

      await updateDoc(inventoryRef, formattedItem);

      return {
        id,
        ...formattedItem
      };
    } catch (error) {
      console.error(`Error updating inventory item with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete inventory item
   * @param {string} id - Inventory item ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const inventoryRef = doc(db, 'inventory', id);
      await deleteDoc(inventoryRef);
    } catch (error) {
      console.error(`Error deleting inventory item with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get inventory history
   * @returns {Promise<Array>} Array of inventory history items
   */
  getHistory: async () => {
    try {
      const historyCollection = collection(db, 'inventory_saved');
      const q = query(historyCollection, orderBy('dateSaved', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching inventory history:', error);
      throw error;
    }
  },

  /**
   * Save current inventory to history
   * @param {string} dateString - Date string in format YYYY-MM-DD
   * @returns {Promise<Object>} Saved inventory history
   */
  saveToHistory: async (dateString) => {
    try {
      // Get all inventory items
      const items = await inventoryAPI.getAll();

      // Format the date
      const date = new Date(dateString || new Date());
      const formattedDate = date.toISOString().split('T')[0];
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

      // Create the history data
      const historyData = {
        dateString: formattedDate,
        monthYear,
        dateSaved: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        inventoryItems: items,
        totalItems: items.length,
        fileName: `Inventory_${formattedDate}.pdf`
      };

      // Check if a report for this date already exists
      const historyCollection = collection(db, 'inventory_saved');
      const q = query(historyCollection, where('dateString', '==', formattedDate));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Create new report
        const docRef = await addDoc(historyCollection, historyData);
        return {
          id: docRef.id,
          ...historyData
        };
      } else {
        // Update existing report
        const docRef = doc(db, 'inventory_saved', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          inventoryItems: items,
          lastUpdated: serverTimestamp(),
          totalItems: items.length
        });

        return {
          id: querySnapshot.docs[0].id,
          ...historyData
        };
      }
    } catch (error) {
      console.error('Error saving inventory to history:', error);
      throw error;
    }
  }
};

/**
 * Customers API
 */
export const customersAPI = {
  /**
   * Get all customers
   * @returns {Promise<Array>} Array of customers
   */
  getAll: async () => {
    try {
      // First try to get customers from the dedicated customers collection
      const customersCollection = collection(db, 'customers');
      const q = query(customersCollection, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // If no dedicated customers collection, extract from order_transaction
      const ordersCollection = collection(db, 'order_transaction');
      const ordersQuery = query(ordersCollection, orderBy('created_at', 'desc'));
      const ordersSnapshot = await getDocs(ordersQuery);

      // Create a map to deduplicate customers
      const customersMap = new Map();

      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (order.customer_id && order.recipient) {
          const customerId = order.customer_id.toString();

          if (!customersMap.has(customerId)) {
            customersMap.set(customerId, {
              id: customerId,
              name: order.recipient,
              is_student: order.is_student || false,
              total_orders: 1,
              total_spent: Number(order.order_total) || 0,
              last_order_date: order.created_at,
              created_at: order.created_at
            });
          } else {
            // Update existing customer
            const customer = customersMap.get(customerId);
            customer.total_orders++;
            customer.total_spent += Number(order.order_total) || 0;

            // Update last order date if newer
            if (order.created_at && (!customer.last_order_date ||
                order.created_at.seconds > customer.last_order_date.seconds)) {
              customer.last_order_date = order.created_at;
            }
          }
        }
      });

      return Array.from(customersMap.values());
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  getById: async (id) => {
    try {
      // First try to get from dedicated customers collection
      const customerRef = doc(db, 'customers', id);
      const customerDoc = await getDoc(customerRef);

      if (customerDoc.exists()) {
        return {
          id: customerDoc.id,
          ...customerDoc.data(),
        };
      }

      // If not found, try to extract from order_transaction
      const ordersCollection = collection(db, 'order_transaction');
      const q = query(
        ordersCollection,
        where('customer_id', '==', id),
        orderBy('created_at', 'desc')
      );
      const ordersSnapshot = await getDocs(q);

      if (ordersSnapshot.empty) {
        throw new Error(`Customer with ID ${id} not found`);
      }

      // Create customer object from orders
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const firstOrder = orders[0];

      return {
        id,
        name: firstOrder.recipient,
        is_student: firstOrder.is_student || false,
        total_orders: orders.length,
        total_spent: orders.reduce((sum, order) => sum + (Number(order.order_total) || 0), 0),
        last_order_date: firstOrder.created_at,
        orders
      };
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new customer
   * @param {Object} customer - Customer data
   * @returns {Promise<Object>} Created customer
   */
  create: async (customer) => {
    try {
      // Add timestamp fields
      const customerWithTimestamp = {
        ...customer,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        total_orders: 0,
        total_spent: 0
      };

      const docRef = await addDoc(collection(db, 'customers'), customerWithTimestamp);

      return {
        id: docRef.id,
        ...customerWithTimestamp
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} customer - Updated customer data
   * @returns {Promise<Object>} Updated customer
   */
  update: async (id, customer) => {
    try {
      const customerRef = doc(db, 'customers', id);

      // Add updated timestamp
      const customerWithTimestamp = {
        ...customer,
        updated_at: serverTimestamp()
      };

      await updateDoc(customerRef, customerWithTimestamp);

      return {
        id,
        ...customerWithTimestamp
      };
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const customerRef = doc(db, 'customers', id);
      await deleteDoc(customerRef);
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get customer history
   * @returns {Promise<Array>} Array of customer history items
   */
  getHistory: async () => {
    try {
      const historyCollection = collection(db, 'customer_history');
      const q = query(historyCollection, orderBy('dateSaved', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching customer history:', error);
      throw error;
    }
  },

  /**
   * Get next customer ID
   * @returns {Promise<string>} Next customer ID
   */
  getNextCustomerId: async () => {
    try {
      // Get all customers
      const customers = await customersAPI.getAll();

      // Find the highest customer ID
      let maxId = 500000; // Start from 500001

      customers.forEach(customer => {
        if (customer.id) {
          const customerId = parseInt(customer.id);
          if (!isNaN(customerId) && customerId >= 500000 && customerId > maxId) {
            maxId = customerId;
          }
        }
      });

      // Return the next ID
      return (maxId + 1).toString();
    } catch (error) {
      console.error('Error getting next customer ID:', error);
      throw error;
    }
  }
};

/**
 * Analytics API
 */
export const analyticsAPI = {
  /**
   * Get daily sales
   * @returns {Promise<Object>} Daily sales data
   */
  getDailySales: async () => {
    try {
      // Get current date
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Get start and end of month
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

      // Get all orders for the current month
      const ordersCollection = collection(db, 'order_transaction');
      const q = query(
        ordersCollection,
        where('created_at', '>=', Timestamp.fromDate(startOfMonth)),
        where('created_at', '<=', Timestamp.fromDate(endOfMonth)),
        orderBy('created_at', 'asc')
      );
      const querySnapshot = await getDocs(q);

      // Group orders by day
      const dailySales = {};

      querySnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (order.created_at && order.order_status !== 'Cancelled') {
          const date = new Date(order.created_at.seconds * 1000);
          const day = date.getDate();

          if (!dailySales[day]) {
            dailySales[day] = {
              day,
              date: date.toISOString().split('T')[0],
              total: 0,
              orders: 0
            };
          }

          dailySales[day].total += Number(order.order_total) || 0;
          dailySales[day].orders++;
        }
      });

      // Convert to array and sort by day
      const result = Object.values(dailySales).sort((a, b) => a.day - b.day);

      return {
        month: today.toLocaleString('default', { month: 'long' }),
        year: currentYear,
        dailySales: result
      };
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      throw error;
    }
  },

  /**
   * Get product sales
   * @returns {Promise<Object>} Product sales data
   */
  getProductSales: async () => {
    try {
      // Get current date
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Get start and end of month
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

      // Get all orders for the current month
      const ordersCollection = collection(db, 'order_transaction');
      const q = query(
        ordersCollection,
        where('created_at', '>=', Timestamp.fromDate(startOfMonth)),
        where('created_at', '<=', Timestamp.fromDate(endOfMonth)),
        where('order_status', '==', 'Delivered'), // Only count delivered orders
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      // Get all products
      const productsCollection = collection(db, 'product');
      const productsQuery = query(productsCollection);
      const productsSnapshot = await getDocs(productsQuery);

      // Create a map of product IDs to products
      const productsMap = {};
      productsSnapshot.docs.forEach(doc => {
        const product = doc.data();
        productsMap[doc.id] = product;
      });

      // Track product sales
      const productSales = {};
      const productQuantities = {};

      // Process orders
      querySnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productName = item.title;

            if (!productSales[productName]) {
              productSales[productName] = 0;
            }
            if (!productQuantities[productName]) {
              productQuantities[productName] = 0;
            }

            productSales[productName] += (Number(item.price) * (item.quantity || 1));
            productQuantities[productName] += (item.quantity || 1);
          });
        }
      });

      return {
        month: today.toLocaleString('default', { month: 'long' }),
        year: currentYear,
        productSales,
        productQuantities
      };
    } catch (error) {
      console.error('Error fetching product sales:', error);
      throw error;
    }
  },

  /**
   * Get customer frequency
   * @returns {Promise<Object>} Customer frequency data
   */
  getCustomerFrequency: async () => {
    try {
      // Get current date
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Get start and end of month
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

      // Get all orders for the current month
      const ordersCollection = collection(db, 'order_transaction');
      const q = query(
        ordersCollection,
        where('created_at', '>=', Timestamp.fromDate(startOfMonth)),
        where('created_at', '<=', Timestamp.fromDate(endOfMonth)),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      // Track customer frequency
      const customerFrequency = {};

      // Process orders
      querySnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (order.customer_id && order.recipient && order.order_status !== 'Cancelled') {
          const customerId = order.customer_id.toString();

          if (!customerFrequency[customerId]) {
            customerFrequency[customerId] = {
              id: customerId,
              name: order.recipient,
              is_student: order.is_student || false,
              visits: 0,
              total_spent: 0
            };
          }

          customerFrequency[customerId].visits++;
          customerFrequency[customerId].total_spent += Number(order.order_total) || 0;
        }
      });

      // Convert to array and sort by visits
      const result = Object.values(customerFrequency).sort((a, b) => b.visits - a.visits);

      return {
        month: today.toLocaleString('default', { month: 'long' }),
        year: currentYear,
        customers: result
      };
    } catch (error) {
      console.error('Error fetching customer frequency:', error);
      throw error;
    }
  },

  /**
   * Get analytics history
   * @returns {Promise<Array>} Analytics history data
   */
  getHistory: async () => {
    try {
      const historyCollection = collection(db, 'analyticReportSaved');
      const q = query(historyCollection, orderBy('dateSaved', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching analytics history:', error);
      throw error;
    }
  },

  /**
   * Get weekly sales data
   * @returns {Promise<Object>} Weekly sales data
   */
  getWeeklySales: async () => {
    try {
      // Get current date
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Get start and end of month
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

      // Get all orders for the current month
      const ordersCollection = collection(db, 'order_transaction');
      const q = query(
        ordersCollection,
        where('created_at', '>=', Timestamp.fromDate(startOfMonth)),
        where('created_at', '<=', Timestamp.fromDate(endOfMonth)),
        orderBy('created_at', 'asc')
      );
      const querySnapshot = await getDocs(q);

      // Initialize weekly totals
      const weeklySales = [0, 0, 0, 0, 0]; // 5 weeks max in a month

      // Process orders
      querySnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (order.created_at && order.order_status !== 'Cancelled') {
          const date = new Date(order.created_at.seconds * 1000);
          const day = date.getDate();

          // Calculate week number (1-indexed)
          const weekNumber = Math.ceil(day / 7) - 1; // 0-indexed for array

          if (weekNumber >= 0 && weekNumber < 5) {
            weeklySales[weekNumber] += Number(order.order_total) || 0;
          }
        }
      });

      return {
        month: today.toLocaleString('default', { month: 'long' }),
        year: currentYear,
        weeklySales
      };
    } catch (error) {
      console.error('Error fetching weekly sales:', error);
      throw error;
    }
  },

  /**
   * Save analytics report
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Saved report
   */
  saveReport: async (reportData) => {
    try {
      // Add timestamp fields
      const reportWithTimestamp = {
        ...reportData,
        dateSaved: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'analyticReportSaved'), reportWithTimestamp);

      return {
        id: docRef.id,
        ...reportWithTimestamp
      };
    } catch (error) {
      console.error('Error saving analytics report:', error);
      throw error;
    }
  }
};

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  inventory: inventoryAPI,
  customers: customersAPI,
  analytics: analyticsAPI,
};
