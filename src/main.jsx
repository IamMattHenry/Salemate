import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import InitialPinVerification from "./components/Auth/InitialPinVerification";
import WelcomeBackModal from "./components/Auth/WelcomeBackModal";
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
import CustomerFrequency from "./components/Analytics/analytics-data/CustomerFrequency.jsx";
import AnalyticsSavedHistory from "./components/Analytics/analytics-data/AnalyticsSaveHistory.jsx";
import CustomersLayout from "./layouts/CustomersLayout.jsx";
import CustomersOverview from "./components/Customers/customers-data/CustomersOverview.jsx";
import CustomersSaveHistory from "./components/Customers/customers-data/CustomersSaveHistory.jsx";
import InventoryLayout from "./layouts/InventoryLayout.jsx";
import InventoryDaily from "./components/Inventory/inventory-data/InventoryDaily.jsx";
import InventorySavedHistory from "./components/Inventory/inventory-data/InventorySavedHistory.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <SidebarProvider>
      <AuthProvider>
        <LoadingProvider>
          <InitialPinVerification />
          <WelcomeBackModal />
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
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />

          {/* Orders section route */}
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="all-transactions" replace />} />
            <Route path="all-transactions" element={<AllTransact />} />
            <Route path="cancelled-transactions" element={<CancelledTransact />} />
            <Route path="completed-transactions" element={<CompletedTransact />} />
            <Route path="pending-transactions" element={<PendingTransact />} />
            <Route path="saved-history" element={<SavedHistory />} />
          </Route>

          {/* Analytics section route - with PIN */}
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="daily-sales" replace />} />
            <Route path="daily-sales" element={<DailySales />} />
            <Route path="product-sales" element={<ProductSales />} />
            <Route path="customer-frequency" element={<CustomerFrequency />} />
            <Route path="save-history" element={<AnalyticsSavedHistory />} />
          </Route>

          {/* Customers section route - with PIN */}
          <Route path="/customer" element={
            <ProtectedRoute>
              <CustomersLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<CustomersOverview />} />
            <Route path="saved-history" element={<CustomersSaveHistory />} />
          </Route>

          {/* Inventory section route - with PIN */}
          <Route path="/inventory" element={
            <ProtectedRoute>
              <InventoryLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="daily-inventory" replace />} />
            <Route path="daily-inventory" element={<InventoryDaily />} />
            <Route path="saved-history" element={<InventorySavedHistory/>} />
          </Route>

          {/* Admin section route - admin only */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          } />
        </Routes>
        </LoadingProvider>
      </AuthProvider>
    </SidebarProvider>
  </Router>
);
