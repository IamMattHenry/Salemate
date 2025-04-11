import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  
  const navigate = useNavigate();

  const toSignIn = (e) => {
      e.preventDefault();

      navigate("/signin");
  };

  return (
    <div className="h-[3000px]">
      <div className="heading-quote min-w-auto md:w-3xl flex justify-center mx-auto flex-col text-center mt-10">
        <h1 className="font-league font-bold text-3xl md:text-5xl text-yellowsm">
          Your Partner for Efficient
          <br />
        </h1>
        <span className="font-league font-bold text-3xl md:text-5xl">
          Sales Management
        </span>
        <br />
        <div className="start-btn bg-yellowsm w-48 mx-auto flex flex-row items-center justify-center rounded-4xl hover:scale-105 transition shadow-xl">
          <button
            className="text-whitesm font-league font-bold text-2xl mt-1 mr-2 drop-shadow-xl py-2 cursor-pointer"
            onClick={toSignIn}
          >
            START NOW
          </button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="bi bi-arrow-right-circle-fill text-whitesm"
            viewBox="0 0 16 16"
          >
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-4 space-x-8 mt-10">
        {/* First Image */}
        <div className="flex flex-col items-center">
          <div className="bg-yellowsm p-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.6)] h-auto w-[334px] max-w-full">
            <img
              src="./1.jpg"
              alt="Customer Relation Management"
              className="rounded-xl w-full h-[448px] object-cover brightness-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
            />
          </div>
          <p className="text-center mt-3 font-lato font-bold text-xl">
            Customer Relation Management
          </p>
          <p className="text-md font-lato">
            Manages and compiles your loyal customers.
          </p>
        </div>

        {/* Second Image */}
        <div className="flex flex-col items-center">
          <div className="bg-yellowsm p-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.6)] transform md:translate-y-6 h-auto w-[334px] max-w-full">
            <img
              src="./3.jpg"
              alt="Analytics & Finance Report"
              className="rounded-xl w-full h-[448px] object-cover brightness-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
            />
          </div>
          <p className="text-center mt-7.5 font-lato font-bold text-xl">
            Analytics & Finance Report
          </p>
          <p className="text-md font-lato">
            Easier way to generate sales and finance report.
          </p>
        </div>

        {/* Third Image */}
        <div className="flex flex-col items-center">
          <div className="bg-yellowsm p-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.6)] h-auto w-[334px] max-w-full">
            <img
              src="./2.jpg"
              alt="Inventory Management"
              className="rounded-xl w-full h-[448px] object-cover brightness-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
            />
          </div>
          <p className="text-center mt-3 font-lato font-bold text-xl">
            Inventory Management
          </p>
          <p className="text-md font-lato">
            Inventory of materials and corresponding information.
          </p>
        </div>
      </div>

      <div className="h-26 bg-[#FFCF50] p-10 w-full mt-20">
          <div className="flex items-center justify-center space-x-1">
             <h1 className="font-lato text-5xl font-light">Whatever your role is, </h1>
             <h1 className="font-lato text-5xl font-bold">we've got you covered</h1> 
          </div>
      </div>

      <div>

     
      <div className="flex flex-col items-center bg-yellowsm p-4 rounded-3xl h-110 w-205 mt-12 ml-50">
          <img src="/land_1.png" alt="contact-image" className="rounded-3xl h-100 w-195" />
      </div>

      <div className="flex flex-col items-center h-110 w-175 ml-260 border-solid bg-white" >
        
          <h1 className="font-bold text-3xl font-lato">
            <span>
            Easily manages the purchasing process 
            </span>
          </h1>
          <h1 className="text-center">
            <span>
            By just using the dashboard for <br />transactions and purchasing process, <br />
            you can monitor orders, sales, and <br /> analytics report of your monthly 
            sale, <br /> and track your customers. 
            </span>
          </h1>
      </div>

      </div>

      
    </div>
  );
}

export default Home;
