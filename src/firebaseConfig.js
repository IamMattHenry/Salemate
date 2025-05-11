// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo2u1X6qkJkfc9VLgrhZTx4Y-TjKiOSi0",
  authDomain: "salemate2-75450.firebaseapp.com",
  projectId: "salemate2-75450",
  storageBucket: "salemate2-75450.firebasestorage.app",
  messagingSenderId: "369889057045",
  appId: "1:369889057045:web:407e81a28ebfd64767b11c",
  measurementId: "G-KVPY3HVMVE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get Auth instance
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Set session persistence (user will be logged out when browser is closed)
// This helps prevent automatic login without proper verification
(async () => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    console.log("Firebase auth persistence set to session storage");

    // Clear any existing auth data from localStorage to prevent auto-login
    const apiKey = firebaseConfig.apiKey;
    const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Error setting auth persistence:", error);
  }
})();

// Handle unhandled promise rejections related to Firebase
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.name === 'FirebaseError') {
    console.error('Unhandled Firebase error:', event.reason);
    // You could add additional error handling here if needed
  }
});

// Export both the app, auth, and db instances
export default app;
export { auth, db };