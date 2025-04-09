import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import About from "./pages/About";
import "./index.css";
import TermsAndCond from "./pages/TermsAndCond";
import Features from "./pages/Features";
import DashboardLayout from "./layouts/DashboardLayout";
import OrderLayout from "./layouts/OrderLayout";
import AllTransact from "./components/Orders/OrdersHistory/AllTransact.jsx";
import CancelledTransact from "./components/Orders/OrdersHistory/CancelledTransact.jsx";
import CompletedTransact from "./components/Orders/OrdersHistory/CompletedTransact.jsx"
import PendingTransact from "./components/Orders/OrdersHistory/PendingTransact.jsx";
import SavedHistory from './components/Orders/OrdersHistory/SavedHistory.jsx'

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
        <Route path="all-transactions" element={<AllTransact />} />
        <Route path="cancelled-transactions" element={<CancelledTransact />} />
        <Route path="completed-transactions" element={<CompletedTransact />} />
        <Route path="pending-transactions" element={<PendingTransact />} />
        <Route path="saved-history" element={<SavedHistory />} />
      </Route>
    </Routes>
  </Router>
);
