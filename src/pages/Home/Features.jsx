import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";

const featuresList = [
  {
    title: "Available through a web browser or mobile app",
    description:
      "Access your Salemate POS system in the most convenient way whether you're using a classroom computer, your Android tablet, or smartphone. Our platform adapts seamlessly to any device.",
  },
  {
    title: "Customer Insights",
    description:
      "Rate and categorize your regular customers based on purchase frequency, order size, and loyalty. Build relationships that help grow your student business.",
  },
  {
    title: "Smart Inventory Overview",
    description:
      "See your entire inventory at a glance with our intuitive shelf-style display. Zoom in to check stock details or out to view your full product range.",
  },
  {
    title: "Smart Client Database",
    description:
      "Build and maintain a searchable customer directory that automatically tracks order history, contact details, and purchase patterns.",
  },
  {
    title: "Manage from everywhere",
    description:
      "Update inventory, process sales, and check analytics whether you're at your campus store, home, or supplier meetings. All you need is an internet connection.",
  },
  {
    title: "Role-based access control",
    description:
      "Assign different access levels for team members from owners who need full analytics to cashiers who only require transaction functions.",
  },
  {
    title: "Visual product layout",
    description:
      "We've designed Salemate to work flawlessly on the devices QCU students use most – especially Android tablets and Chrome browsers for the smoothest experience.",
  },
];

const Features = () => {
  return (
    <div>
      {/* Intro Section */}
      <div className="md:w-10/12 mx-auto flex flex-col md:flex-row justify-between items-center px-12 mb-30">
        <div className="w-full md:w-2/5">
          <h1 className="font-lato font-semibold text-2xl md:text-6xl">Features</h1>
          <p className="mt-5 font-lato text-[1.3rem] text-justify">
            We're proud to introduce Salemate - your web-based platform designed to simplify sales operations and make work life easier. Built for efficiency, our tools help you manage sales wisely, easily, and quickly.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex justify-end mt-10 md:mt-0">
          <img src="/light.png" alt="features" className="w-[386px]" />
        </div>
      </div>

      {/* Features Section */}
      <div className="relative">
        <div className="flex flex-col items-center">
          <HomeRoutes className="-mt-15" />
          <HomePanel>
            <div className="w-full max-w-[1600px] mx-auto py-14 px-5 md:px-24 bg-white border border-gray-100 rounded-3xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {featuresList.map((feature, index) => (
                  <div key={index} className="flex gap-5 items-start ml-5 md:ml-10">
                    <div>
                      <h2 className="text-2xl font-semibold font-lato text-black mb-5">{feature.title}</h2>
                      <hr className="h-0.5 w-80 bg-black opacity-25 border-0 rounded-lg mb-3" />
                      <p className="text-[18px] text-justify font-lato pr-5">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HomePanel>
        </div>
      </div>
    </div>
  );
};

export default Features;
