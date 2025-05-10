import React, { useRef, useEffect } from "react";
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
  // Create refs for each button
  const allRef = useRef(null);
  const drinksRef = useRef(null);
  const dessertRef = useRef(null);
  const mealRef = useRef(null);
  const snacksRef = useRef(null);

  // Create ref for the slider
  const sliderRef = useRef(null);

  // Update slider position when active category changes
  useEffect(() => {
    if (!sliderRef.current) return;

    let targetRef;
    switch(activeCategory) {
      case "All": targetRef = allRef; break;
      case "Drinks": targetRef = drinksRef; break;
      case "Dessert": targetRef = dessertRef; break;
      case "Meal": targetRef = mealRef; break;
      case "Snacks": targetRef = snacksRef; break;
      default: targetRef = allRef;
    }

    if (targetRef.current) {
      const button = targetRef.current;
      const slider = sliderRef.current;

      // Set slider position and width to match the active button
      slider.style.width = `${button.offsetWidth}px`;
      slider.style.left = `${button.offsetLeft}px`;
      slider.style.top = `${button.offsetTop}px`;
      slider.style.height = `${button.offsetHeight}px`;
    }
  }, [activeCategory]);

  return (
    <div className="flex justify-center gap-4 py-1 overflow-x-auto no-scrollbar">
      <div className="flex relative">
        {/* Sliding indicator */}
        <div
          ref={sliderRef}
          className="absolute bg-amber-500 rounded-lg shadow-md shadow-amber-500/30 transition-all duration-300 ease-in-out z-0"
        ></div>

        {/* All Button */}
        <button
          ref={allRef}
          onClick={() => setSelectedCategory("All")}
          className={`
            flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            font-medium text-base
            w-[100px] mr-4
            relative z-10
            ${activeCategory === "All"
              ? 'text-white bg-transparent'
              : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-200'}
            transition-all duration-300
          `}
        >
          <GiForkKnifeSpoon className={`text-xl ${activeCategory === "All" ? 'text-white' : 'text-amber-500'}`} />
          <span>All</span>
        </button>

        {/* Drinks Button */}
        <button
          ref={drinksRef}
          onClick={() => setSelectedCategory("Drinks")}
          className={`
            flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            font-medium text-base
            w-[130px] mr-4
            relative z-10
            ${activeCategory === "Drinks"
              ? 'text-white bg-transparent'
              : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-200'}
            transition-all duration-300
          `}
        >
          <GiCoffeeMug className={`text-xl ${activeCategory === "Drinks" ? 'text-white' : 'text-amber-500'}`} />
          <span>Drinks</span>
        </button>

        {/* Dessert Button */}
        <button
          ref={dessertRef}
          onClick={() => setSelectedCategory("Dessert")}
          className={`
            flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            font-medium text-base
            w-[130px] mr-4
            relative z-10
            ${activeCategory === "Dessert"
              ? 'text-white bg-transparent'
              : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-200'}
            transition-all duration-300
          `}
        >
          <GiCakeSlice className={`text-xl ${activeCategory === "Dessert" ? 'text-white' : 'text-amber-500'}`} />
          <span>Dessert</span>
        </button>

        {/* Meal Button */}
        <button
          ref={mealRef}
          onClick={() => setSelectedCategory("Meal")}
          className={`
            flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            font-medium text-base
            w-[130px] mr-4
            relative z-10
            ${activeCategory === "Meal"
              ? 'text-white bg-transparent'
              : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-200'}
            transition-all duration-300
          `}
        >
          <GiBowlOfRice className={`text-xl ${activeCategory === "Meal" ? 'text-white' : 'text-amber-500'}`} />
          <span>Meal</span>
        </button>

        {/* Snacks Button */}
        <button
          ref={snacksRef}
          onClick={() => setSelectedCategory("Snacks")}
          className={`
            flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            font-medium text-base
            w-[130px]
            relative z-10
            ${activeCategory === "Snacks"
              ? 'text-white bg-transparent'
              : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 border border-gray-200'}
            transition-all duration-300
          `}
        >
          <GiFrenchFries className={`text-xl ${activeCategory === "Snacks" ? 'text-white' : 'text-amber-500'}`} />
          <span>Snacks</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardCategory;