import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer"

function App() {
  return (
    <>
      <NavBar />
      <Outlet /> {/* This will render the child routes */}
      <Footer />
    </>
  );
}

export default App;
