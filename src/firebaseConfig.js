// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWE_d3k6Zs9P1XQL-bI2Ywmrkx_DdYKQ8",
  authDomain: "salemate-a0395.firebaseapp.com",
  projectId: "salemate-a0395",
  storageBucket: "salemate-a0395.firebasestorage.app",
  messagingSenderId: "458235183729",
  appId: "1:458235183729:web:60e22b41774e0d81dd51d0",
  measurementId: "G-JXHZMKNJWS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;