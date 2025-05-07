import React from "react";
import {
  GiCakeSlice,
  GiBowlOfRice,
  GiFrenchFries,
  GiCoffeeMug,
  GiForkKnifeSpoon,
} from "react-icons/gi";

const categories = [
  { id: 'all', name: 'All', icon: GiForkKnifeSpoon },
  { id: 'drinks', name: 'Drinks', icon: GiCoffeeMug },
  { id: 'dessert', name: 'Dessert', icon: GiCakeSlice },
  { id: 'meal', name: 'Meal', icon: GiBowlOfRice },
  { id: 'snacks', name: 'Snacks', icon: GiFrenchFries },
];

const DashboardCategory = ({ setSelectedCategory, activeCategory = "All" }) => {
  return (
    <div className="flex justify-center gap-6 pb-6 h-[70px]">
      {categories.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setSelectedCategory(name)}
          className={`
            flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium transition-all h-[56px] text-lg
            ${activeCategory === name
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
              : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-100'}
          `}
        >
          <Icon className={`text-2xl ${activeCategory === name ? 'text-white' : 'text-amber-500'}`} />
          <span className="whitespace-nowrap">{name}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardCategory;