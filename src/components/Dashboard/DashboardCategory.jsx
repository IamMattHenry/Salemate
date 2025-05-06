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
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setSelectedCategory(name)}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all
            ${activeCategory === name 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105' 
              : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-100'}
          `}
        >
          <Icon className={`text-xl ${activeCategory === name ? 'text-white' : 'text-amber-500'}`} />
          <span className="whitespace-nowrap">{name}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardCategory;