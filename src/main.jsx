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
      <Route path="/dashboard" element={<DashboardLayout/>}>
      
      </Route>
    </Routes>
  </Router>
);
