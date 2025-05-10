import React, { useRef, useEffect } from "react";
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
    <div className="flex flex-nowrap justify-around px-4 font-latrue">
      {categories.map(({ id, name, icon: Icon }) => (
        <button
          ref={snacksRef}
          onClick={() => setSelectedCategory("Snacks")}
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
      </div>
    </div>
  );
};

export default DashboardCategory;
