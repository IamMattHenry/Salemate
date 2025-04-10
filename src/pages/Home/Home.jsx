import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const toSignIn = (e) => {
      e.preventDefault();

      navigate("/signin");
  };

  return (
    <div>
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
        <div className="h-25 w-full bg-yellowsm mt-15">
            <div className="h-20 bg-[#FFCF50] p-10 w-full mt-20">
               <div className="flex items-center justify-center space-x-1">
                  <h1 className="font-lato text-3xl">Whatever your role is,</h1>
                  <h1 className="font-lato text-3xl font-bold">we've got you covered</h1>
               </div>
            </div>
        </div>
        
        <div className="h-140 w-full  pt-14 flex "> {/*first*/}


             <div className="h-110 w-200 bg-yellowsm rounded-3xl ml-50 flex justify-center items-center">
                  <img src="/dashboard_2.png" alt="" className="h-105 w-195 rounded-3xl" />
             </div>
          <div className="h-110 w-200  rounded-3xl ml-9 flex flex-col justify-center items-center space-y-4">
            
            <h1 className="font-bold font-lato text-4xl text-center">
                Easily manages the <br /> purchasing process
            </h1>
            <h1 className="font-normal font-lato text-2xl text-center">
                 By just using the dashboard for <br /> transactions and purchasing process, <br /> you can monitor orders, sales, and <br />analytics report of your monthly sale, <br /> and track your customers.
            </h1>
          </div>

        </div>
        
        

        
        <div className="h-140 w-full  pt-10 flex "> {/*second*/}
             <div className="h-110 w-200  rounded-3xl ml-10 flex flex-col justify-center items-center space-y-4">
                <h1 className="font-bold font-lato text-4xl text-center">
                    Monitor real time orders
                </h1>
                <h1 className="font-normal font-lato text-2xl text-center">
                Easily track, record, and monitor customer <br /> orders with the Order History Dashboard. <br /> Stay updated on order status and ensure <br />successful deliveries every time.
                </h1>
             </div>
             <div className="h-110 w-200 bg-yellowsm rounded-3xl ml-9 flex flex-col justify-center items-center space-y-4">
                <img src="/orderhisto_2.png" alt="" className="h-105 w-195 rounded-3xl" />
             </div>

        </div>


        <div className="h-140 w-full pt-10 flex "> {/*third*/}
             <div className="h-110 w-200 bg-yellowsm rounded-3xl ml-50 flex justify-center items-center">
                  <img src="/analytic_2.png" alt="" className="h-105 w-195 rounded-3xl" />
             </div>
          <div className="h-110 w-200  rounded-3xl ml-9 flex flex-col justify-center items-center space-y-4">
            <h1 className="font-bold font-lato text-4xl text-center">
               Provides necessary <br />business information
            </h1>
            <h1 className="font-normal font-lato text-2xl text-center">
                Analytic report page summarizes the overall <br /> performance of your business and see the <br /> effectiveness of your business operation.
            </h1>
          </div>

        </div>

     
        
        <div className="h-140 w-full  pt-10 flex "> {/*fourth*/}
             <div className="h-110 w-200 rounded-3xl ml-10 flex flex-col justify-center items-center space-y-4">
                 <h1 className="font-bold font-lato text-4xl text-center">
                    Tracking the <br /> frequency of orders
                 </h1>
                 <h1 className="font-normal font-lato text-2xl text-center">
                 With Salemate, you can track your customer <br /> This system will allow you to if your customers <br /> are active or not actively ordering, and even <br /> the overall number of orders, average amount <br /> of their purchase, last date ordered, and <br /> further purchasing information.
                 </h1>
             </div>
             <div className="h-110 w-200 bg-yellowsm rounded-3xl ml-9 flex flex-col justify-center items-center space-y-4">
                   <img src="/customer_@.png" alt="" className="h-105 w-195 rounded-3xl" />
            
             </div>

        </div>

        
        
        <div className="h-140 w-full  pt-10 flex "> {/*fifth*/}
             <div className="h-110 w-200 bg-yellowsm rounded-3xl ml-50 flex justify-center items-center">
                  <img src="/inventory_2.png" alt="" className="h-105 w-195 rounded-3xl" />
             </div>
          <div className="h-110 w-200 rounded-3xl ml-9 flex flex-col justify-center items-center space-y-4">
            <h1 className="font-bold font-lato text-4xl text-center">
                 Manage inventory <br />  seamlessly
            </h1>
            <h1 className="font-normal font-lato text-2xl text-center">
                 tay informed on stock levels, monitor item <br /> availability, and make data-driven decisions <br /> to optimize your inventory management.s.
            </h1>
          </div>

        </div>


    </div>
    
  );
}

export default Home; 
