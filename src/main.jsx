import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import Home from "./pages/Home/Home";
import SignIn from "./pages/Home/SignIn";
import SignUp from "./pages/Home/SignUp";
import PrivacyPolicy from "./pages/Home/PrivacyPolicy";
import Contact from "./pages/Home/Contact";
import About from "./pages/Home/About";
import "./index.css";
import TermsAndCond from "./pages/Home/TermsAndCond";
import Features from "./pages/Home/Features";
import DashboardLayout from "./layouts/DashboardLayout";
import OrderLayout from "./layouts/OrderLayout";
import AllTransact from "./components/Orders/OrdersHistory/AllTransact.jsx";
import CancelledTransact from "./components/Orders/OrdersHistory/CancelledTransact.jsx";
import CompletedTransact from "./components/Orders/OrdersHistory/CompletedTransact.jsx";
import PendingTransact from "./components/Orders/OrdersHistory/PendingTransact.jsx";
import SavedHistory from "./components/Orders/OrdersHistory/SavedHistory.jsx";
import AnalyticsLayout from "./layouts/AnalyticsLayout.jsx";
import DailySales from "./components/Analytics/analytics-data/DailySales.jsx";
import ProductSales from "./components/Analytics/analytics-data/ProductSales.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="privacypolicy" element={<PrivacyPolicy />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<About />} />
        <Route path="terms-and-condition" element={<TermsAndCond />} />
        <Route path="features" element={<Features />} />
      </Route>

      {/* Dashboard route */}
      <Route path="/dashboard" element={<DashboardLayout />} />

      {/* Orders section route */}
      <Route path="/orders" element={<OrderLayout />}>
        <Route index element={<Navigate to="all-transactions" replace />} />
        <Route path="all-transactions" element={<AllTransact />} />
        <Route path="cancelled-transactions" element={<CancelledTransact />} />
        <Route path="completed-transactions" element={<CompletedTransact />} />
        <Route path="pending-transactions" element={<PendingTransact />} />
        <Route path="saved-history" element={<SavedHistory />} />
      </Route>

      <Route path="/analytics" element={<AnalyticsLayout />}>
        <Route index element={<Navigate to="daily-sales" replace />} />
        <Route path="daily-sales" element={<DailySales />} />
        <Route path="product-sales" element={<ProductSales />} />
      </Route>
    </Routes>
  </Router>
);
