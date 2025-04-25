import React from "react";
import {
  GiCakeSlice,
  GiBowlOfRice,
  GiFrenchFries,
  GiCoffeeMug,
  GiForkKnifeSpoon,
} from "react-icons/gi";

const DashboardCategory = () => {
  return (
    <div className="grid md:grid-cols-[15%_15%_15%_15%_15%] gap-8 place-content-center mt-4">
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-feat pt-4 pb-2 w-auto hover:bg-yellowsm/20 transition cursor-pointer">
        <GiForkKnifeSpoon className="text-3xl" />
        <span className="font-lato font-semibold text-md mt-2 pt-2 ">
          All
        </span>
      </div>
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-feat pt-4 pb-2 px-4 w-auto hover:bg-yellowsm/20 transition cursor-pointer">
        <GiCoffeeMug className="text-3xl" />
        <span className="font-lato font-semibold text-md mt-2 pt-2">
          Drinks
        </span>
      </div>
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-feat pt-4 pb-2 px-4 w-auto hover:bg-yellowsm/20 transition cursor-pointer">
        <GiCakeSlice className="text-3xl" />
        <span className="font-lato font-semibold text-md mt-2 pt-2 ">
          Dessert
        </span>
      </div>
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-feat pt-4 pb-2 px-4 w-auto hover:bg-yellowsm/20 transition cursor-pointer">
        <GiBowlOfRice className="text-3xl" />
        <span className="font-lato font-semibold text-md mt-2 pt-2 ">
          Meal
        </span>
      </div>
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-feat pt-4 pb-2 px-4 w-auto hover:bg-yellowsm/20 transition cursor-pointer">
        <GiFrenchFries className="text-3xl" />
        <span className="font-lato font-semibold text-md mt-2 pt-2 ">
          Snacks
        </span>
      </div>
    </div>
  );
};

export default DashboardCategory;
