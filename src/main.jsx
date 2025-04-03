import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Contact from "./components/Contact";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} /> {/* Default route */}
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="privacypolicy" element={<PrivacyPolicy />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  </Router>
);
