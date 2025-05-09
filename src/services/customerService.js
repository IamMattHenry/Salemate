import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
  getFirestore,
  setDoc
} from 'firebase/firestore';
import firebaseApp from '../firebaseConfig';

// Initialize Firestore
const db = getFirestore(firebaseApp);
const customersCollection = collection(db, 'customers');

/**
 * Fetch all customers from the customers collection
 * @returns {Promise<Array>} Array of customers
 */
export const fetchCustomers = async () => {
  try {
    const q = query(customersCollection, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Fetch a customer by ID
 * @param {string} id - Customer ID
 * @returns {Promise<Object|null>} Customer data or null if not found
 */
export const fetchCustomerById = async (id) => {
  try {
    const docRef = doc(customersCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log(`Customer with ID ${id} not found in database`);
      return null; // Return null instead of throwing an error
    }
  } catch (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);
    return null; // Return null for any error
  }
};

/**
 * Add a new customer to Firestore
 * @param {Object} customer - Customer object to add
 * @returns {Promise<Object>} Added customer with ID
 */
export const addCustomer = async (customer) => {
  try {
    // Add timestamp fields
    const customerWithTimestamp = {
      ...customer,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      total_orders: customer.total_orders || 0,
      total_spent: customer.total_spent || 0
    };

    let docRef;

    // Check if an ID was provided
    if (customer.id) {
      // Use setDoc to create a document with the specified ID
      docRef = doc(customersCollection, customer.id);
      await setDoc(docRef, customerWithTimestamp);

      return {
        id: customer.id,
        ...customer
      };
    } else {
      // Use addDoc to create a document with an auto-generated ID
      docRef = await addDoc(customersCollection, customerWithTimestamp);

      return {
        id: docRef.id,
        ...customer
      };
    }
  } catch (error) {
    console.error('Error adding customer:', error);
    // Return the customer data anyway to prevent cascading errors
    return {
      id: customer.id || 'unknown',
      ...customer
    };
  }
};

/**
 * Update an existing customer in Firestore
 * @param {string} id - Customer ID
 * @param {Object} customer - Updated customer data
 * @returns {Promise<Object>} Updated customer
 */
export const updateCustomer = async (id, customer) => {
  try {
    const docRef = doc(customersCollection, id);

    // Check if the document exists first
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log(`Cannot update customer with ID ${id} because it doesn't exist`);
      // Create the document instead of updating it
      return await addCustomer({
        ...customer,
        id // Preserve the ID
      });
    }

    // Add updated timestamp
    const customerWithTimestamp = {
      ...customer,
      updated_at: serverTimestamp()
    };

    await updateDoc(docRef, customerWithTimestamp);

    return {
      id,
      ...customer
    };
  } catch (error) {
    console.error(`Error updating customer with ID ${id}:`, error);
    // Return the customer data anyway to prevent cascading errors
    return {
      id,
      ...customer
    };
  }
};

/**
 * Find a customer by name
 * @param {string} name - Customer name
 * @returns {Promise<Array>} Array of matching customers
 */
export const findCustomerByName = async (name) => {
  try {
    const q = query(
      customersCollection,
      where('name', '==', name),
      limit(10)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error finding customer with name ${name}:`, error);
    throw error;
  }
};

/**
 * Get the next available customer ID
 * @returns {Promise<string>} Next customer ID
 */
export const getNextCustomerId = async () => {
  try {
    // Check if we have a local counter in localStorage
    const localCounter = localStorage.getItem('lastCustomerId');
    let localCounterValue = localCounter ? parseInt(localCounter) : 500000;

    try {
      // Get the customer_counter document from Firestore
      const counterRef = doc(db, "system_counters", "customer_id_counter");
      const counterDoc = await getDoc(counterRef);

      let nextId = 500001; // Default starting value

      if (counterDoc.exists()) {
        // Get the current counter value
        nextId = counterDoc.data().next_id;

        // If the Firestore counter is less than our local counter, use the local counter
        if (nextId <= localCounterValue) {
          nextId = localCounterValue + 1;
        }
      } else {
        // If the counter doesn't exist, use the local counter + 1
        nextId = Math.max(500001, localCounterValue + 1);

        // Try to create the counter document
        try {
          await setDoc(counterRef, { next_id: nextId + 1 }, { merge: true });
        } catch (writeError) {
          console.warn("Could not create Firestore counter, but will continue with generated ID:", writeError);
        }
      }

      // Update localStorage
      localStorage.setItem('lastCustomerId', nextId.toString());

      return nextId.toString();
    } catch (firestoreError) {
      console.warn("Firestore access failed, using local counter:", firestoreError);

      // Increment the local counter
      const nextId = Math.max(500001, localCounterValue + 1);

      // Update localStorage
      localStorage.setItem('lastCustomerId', nextId.toString());

      return nextId.toString();
    }
  } catch (error) {
    console.error("Error getting next customer ID:", error);

    // Ultimate fallback - generate a random ID in the correct range
    const fallbackId = 500000 + Math.floor(Math.random() * 1000) + 1;
    localStorage.setItem('lastCustomerId', fallbackId.toString());

    return fallbackId.toString();
  }
};

/**
 * Create or update a customer in the customers collection
 * @param {Object} customerData - Customer data from order
 * @returns {Promise<string>} Customer ID
 */
export const createOrUpdateCustomer = async (customerData) => {
  try {
    const { name, customerId, isStudent } = customerData;

    // Check if customer already exists by ID
    if (customerId) {
      // Fetch the existing customer by ID
      const existingCustomer = await fetchCustomerById(customerId);

      if (existingCustomer) {
        // Customer exists, update it
        try {
          await updateCustomer(customerId, {
            ...existingCustomer,
            is_student: existingCustomer.is_student === true, // Ensure this is a boolean true/false
            last_order_date: serverTimestamp(),
            total_orders: (existingCustomer.total_orders || 0) + 1,
            total_spent: (existingCustomer.total_spent || 0) + (customerData.orderTotal || 0)
          });
          console.log(`Updated existing customer: ${name} (${customerId}), isStudent: ${existingCustomer.is_student === true}`);
          return customerId;
        } catch (updateError) {
          console.warn("Could not update existing customer, but will continue:", updateError);
          return customerId;
        }
      } else {
        // Customer not found with this ID, will create a new one
        console.log(`Customer with ID ${customerId} not found, will create a new customer record`);
      }
    }

    // Create new customer
    try {
      const newCustomer = {
        name,
        is_student: isStudent === true, // Ensure this is a boolean true/false, not undefined
        customer_id: customerId,
        last_order_date: serverTimestamp(),
        total_orders: 1,
        total_spent: customerData.orderTotal || 0
      };

      console.log(`Creating new customer with name: ${name}, isStudent: ${isStudent === true}, ID: ${customerId}`);

      const result = await addCustomer(newCustomer);
      console.log(`Created new customer: ${name} (${result.id})`);
      return result.id;
    } catch (createError) {
      console.warn("Could not create new customer record, but will continue:", createError);
      // Return the original customer ID even if we couldn't create the record
      return customerId;
    }
  } catch (error) {
    console.error("Error creating or updating customer:", error);
    // Return the original customer ID even if there was an error
    return customerData.customerId || "";
  }
};

export default {
  fetchCustomers,
  fetchCustomerById,
  addCustomer,
  updateCustomer,
  findCustomerByName,
  getNextCustomerId,
  createOrUpdateCustomer
};
