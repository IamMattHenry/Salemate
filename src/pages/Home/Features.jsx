import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";

const Features = () => {
  return (
    <div>
      {/* Intro */}
      <section className="flex flex-col md:flex-row items-center px-12 py-16 gap-12">
        <div className="w-full md:w-1/2">
          <h1 className="text-5xl md:text-7xl font-bold font-lato">Features</h1>
          <p className="mt-4 text-xl font-semibold">
            We're proud to introduce Salemate
          </p>
          <p className="mt-4 text-gray-600 text-justify max-w-2xl">
            Your web-based platform designed to simplify sales operations and
            make work life easier. Built for efficiency, our tools help you
            manage sales wisely, easily, and quickly.
          </p>
        </div>
        <div className="w-full md:w-1/2 text-center">
          <img src="/light.png" alt="Idea" className="w-[386px] mx-auto" />
        </div>
      </section>
      <HomeRoutes />
      <HomePanel>
        {/* Features Grid */}
        <section className="bg-white p-8 rounded-2xl shadow-2xl max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
            {[
              {
                title: "Available through a web browser or mobile app",
                desc: "Access your Salemate POS system in the most convenient way whether you're using a classroom computer, your Android tablet, or smartphone. Our platform adapts seamlessly to any device.",
              },
              {
                title: "Manage from everywhere",
                desc: "Update inventory, process sales, and check analytics whether you're at your campus store, home, or supplier meetings. All you need is an internet connection.",
              },
              {
                title: "Customer insights",
                desc: "Rate and categorize your regular customers based on purchase frequency, order size, and loyalty. Build relationships that help grow your student business.",
              },
              {
                title: "Visual product layout",
                desc: "We've designed Salemate to work flawlessly on the devices QCU students use most - especially Android tablets and Chrome browsers for the smoothest experience.",
              },
              {
                title: "Smart Inventory Overview",
                desc: "See your entire inventory at a glance with our intuitive shelf-style display. Zoom in to check stock details or out to view your full product range.",
              },
              {
                title: "Role-based access control",
                desc: "Assign different access levels for team members from owners who need full analytics to cashiers who only require transaction functions.",
              },
              {
                title: "Smart client database",
                desc: "Build and maintain a searchable customer directory that automatically tracks order history, contact details, and purchase patterns.",
              },
            ].map((feature, index) => (
              <div key={index}>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-lg text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </HomePanel>
    </div>
  );
};

export default Features;
