import React from "react";
import DashboardCategory from "./DashboardCategory";
import ProductList from "./ProductList";
import DashboardOrder from "./DashboardOrder";

const product = {
  title: "Katsu",
  description: "Katsu with rice (not spicy)",
  price: "350",
  url: "https://static01.nyt.com/images/2021/05/23/dining/kc-chicken-katsu/merlin_185308080_a60a6563-292e-4f52-a33b-386113aca0b2-mediumSquareAt3X.jpg",
};

const DashboardPanel = () => {
  return (
    <div className="bg-white/50 w-auto rounded-xl shadow-feat h-auto grid grid-cols-[60%_1fr] ml-5 mr-5">
      <div className="pt-5 px-5 pb-5">
        <h3 className="font-lato font-semibold text-xl">MENU CATEGORIES</h3>
        <div>
          <DashboardCategory />
        </div>
        <ProductList product={product}/>
      </div>
      <div>
        <DashboardOrder product={product}/>
      </div>
    </div>
  );
};

export default DashboardPanel;
