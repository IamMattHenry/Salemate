import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import firebaseApp from '../firebaseConfig';

// Initialize Firestore
const db = getFirestore(firebaseApp);
const productsCollection = collection(db, 'product');

/**
 * Fetch all products from Firestore
 * @returns {Promise<Array>} Array of product objects
 */
export const fetchProducts = async () => {
  try {
    const q = query(productsCollection, orderBy('title'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id, // Use Firestore document ID as product ID
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Add a new product to Firestore
 * @param {Object} product - Product object to add
 * @returns {Promise<Object>} Added product with ID
 */
export const addProduct = async (product) => {
  try {
    // Create a copy of the product to modify if needed
    const productToSave = { ...product };

    // Add timestamp fields
    const productWithTimestamp = {
      ...productToSave,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const docRef = await addDoc(productsCollection, productWithTimestamp);

    return {
      id: docRef.id,
      ...product // Return the original product with URL for client-side use
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Update an existing product in Firestore
 * @param {string} id - Product ID to update
 * @param {Object} updatedProduct - Updated product data
 * @returns {Promise<void>}
 */
export const updateProduct = async (id, updatedProduct) => {
  try {
    const productRef = doc(db, 'product', id);

    // Create a copy of the product to modify if needed
    const productToSave = { ...updatedProduct };

    // Add updated timestamp
    const productWithTimestamp = {
      ...productToSave,
      updated_at: serverTimestamp()
    };

    await updateDoc(productRef, productWithTimestamp);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product from Firestore
 * @param {string} id - Product ID to delete
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, 'product', id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
