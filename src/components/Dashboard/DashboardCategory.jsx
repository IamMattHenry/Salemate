import React from "react";
import {
  GiCakeSlice,
  GiBowlOfRice,
  GiFrenchFries,
  GiCoffeeMug,
  GiForkKnifeSpoon,
} from "react-icons/gi";

const categories = [
  { id: "all", name: "All", icon: GiForkKnifeSpoon },
  { id: "drinks", name: "Drinks", icon: GiCoffeeMug },
  { id: "dessert", name: "Dessert", icon: GiCakeSlice },
  { id: "meal", name: "Meal", icon: GiBowlOfRice },
  { id: "snacks", name: "Snacks", icon: GiFrenchFries },
];

const DashboardCategory = ({ setSelectedCategory, activeCategory = "All" }) => {
  return (
    <div className="flex flex-nowrap justify-around px-4 font-latrue">
      {categories.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setSelectedCategory(name)}
          className={`
        flex items-center gap-3 px-4 py-2 shrink rounded-lg font-medium transition-all text-sm sm:text-lg
        ${
          activeCategory === name
            ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
            : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-100"
        }
      `}
        >
          <Icon
            className={`text-base sm:text-2xl ${
              activeCategory === name ? "text-white" : "text-black"
            }`}
          />
          <span className="whitespace-nowrap">{name}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardCategory;
