// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
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

// Set local persistence (user will stay logged in even when browser is closed)
// We're using an IIFE to ensure this runs immediately and doesn't block other code
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("Firebase auth persistence set to local storage");
  } catch (error) {
    console.error("Error setting auth persistence:", error);
  }
})();

// Export both the app and auth instances
export default app;
export { auth };