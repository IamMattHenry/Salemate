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
    <div className="bg-white/50 w-full rounded-xl shadow-feat text-wrap h-[88%] mt-3 grid grid-cols-[60%_1fr]">
      <div className="p-3">
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
