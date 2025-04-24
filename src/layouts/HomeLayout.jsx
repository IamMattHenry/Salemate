import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/Home/NavBar";
import Footer from "../components/Home/Footer";

function HomeLayout() {
  return (
    <main className="bg-gradient-to-b from-whitesm from-15% via-yellowf via-60% to-yellowsm to-90% min-h-screen bg-no-repeat bg-fixed max-w-auto overflow-hidden">
      <NavBar />
      <Outlet /> {/*children*/}
      <Footer />
    </main>
  );
}

export default HomeLayout;
