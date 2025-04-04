import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import About from "./pages/About"
import "./index.css";
import TermsAndCond from "./pages/TermsAndCond";
import Features from "./pages/Features";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} /> {/* Default route */}
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="privacypolicy" element={<PrivacyPolicy />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<About />} />
        <Route path="terms-and-condition" element={<TermsAndCond />} />
        <Route path="features" element={<Features />} />
      </Route>
    </Routes>
  </Router>
);
