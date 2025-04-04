import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer"

function App() {
  return (
    <>
      <NavBar />
      <Outlet /> {/*children*/}
      <Footer />
    </>
  );
}

export default App;
