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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div class="vertical-divider absolute top-0 bottom-0 left-50%"></div>
            <div class="left-column">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Available through a web browser or mobile app</h3>
                <p class="text-gray-600 text-lg">Access your Salemate POS system in the most convenient way whether you're using a classroom computer, your Android tablet, or smartphone. Our platform adapts seamlessly to any device.</p>
            </div>
            <div class="right-column">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Manage from everywhere</h3>
                <p class="text-gray-600 text-lg">Update inventory, process sales, and check analytics whether you're at your campus store, home, or supplier meetings. All you need is an internet connection.</p>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Customer insights</h3>
                <p class="text-gray-600 text-lg">Rate and categorize your regular customers based on purchase frequency, order size, and loyalty. Build relationships that help grow your student business.</p>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Visual product layout</h3>
                <p class="text-gray-600 text-lg">We've designed Salemate to work flawlessly on the devices QCU students use most – especially Android tablets and Chrome browsers for the smoothest experience.</p>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Smart Inventory Overview</h3>
                <p class="text-gray-600 text-lg">See your entire inventory at a glance with our intuitive shelf-style display. Zoom in to check stock details or out to view your full product range.</p>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Role-based access control</h3>
                <p class="text-gray-600 text-lg">Assign different access levels for team members from owners who need full analytics to cashiers who only require transaction functions.</p>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">Smart client database</h3>
                <p class="text-gray-600 text-lg">Build and maintain a searchable customer directory that automatically tracks order history, contact details, and purchase patterns.</p>
            </div>
          </div>
        </section>
      </HomePanel>

      {/* Inline custom styles */}
      <style>{`
        body {
          font-family: 'Lato', sans-serif;
          background: linear-gradient(to bottom, #fefae0 60%, #ffcf50 75%);
        }
        .header {
          font-family: 'League Spartan', sans-serif;
        }
        .intro {
          display: flex;
          flex-direction: column;
          padding: 4rem 2.5rem;
        }
        @media (min-width: 768px) {
          .intro {
            flex-direction: row;
            align-items: center;
          }
        }
        .intro-text {
          flex: 2;
          margin-left: 70px;
        }
        .intro-img img {
          margin-right: 70px;
          width: 386px;
        }
        .intro-text h1 {
          font-family: 'League Spartan', sans-serif;
          font-size: 80px;
        }
        .grid h3 {
          font-family: 'League Spartan', sans-serif;
          font-size: 35px;
          text-align: center;
          padding-bottom: 1rem;
        }
        .grid p {
          font-family: 'Lato', sans-serif;
          font-size: 22px;
          text-align: justify;
          margin-right: 5rem;
          margin-left: 5rem;
          padding-bottom: 3rem;
        }
        .vertical-divider {
          border-left: 2px solid #ccc;
          height: 100%;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>

    </div>
  );
};

export default Features;
