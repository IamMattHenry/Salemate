import { SquareMinus } from "lucide-react";
import React from "react";

const InventoryDaily = () => {
  return (
    <section className="bg-white rounded-2xl shadow-feat w-[1180px] mx-auto my-4 px-4">
      {/* Responsive Wrapper */}
<div className="w-full overflow-x-auto">
  {/* Label */}
  <div className="flex items-center text-[1.28rem] tracking-tight font-bold py-3 px-4 font-latrue border-b-[0.5px] min-w-max justify-around">
    <div className="w-[180px] min-w-[180px]">Raw Materials</div>
    <div className="w-[100px] min-w-[100px] text-center pl-2">Purchased</div>
    <div className="w-[100px] min-w-[100px] text-center pl-2">Processed<br />/Used</div>
    <div className="w-[100px] min-w-[100px] text-center pl-2">Waste</div>
    <div className="w-[100px] min-w-[100px] pl-2 text-center">Beginning Inventory</div>
    <div className="w-[100px] min-w-[100px] pl-4 text-center">Ending Inventory</div>
    <div className="w-[140px] min-w-[140px] text-center pl-2">Status</div>
  </div>

  {/* Inventory Items */}
  {inventoryData.map((item) => (
    <div
      key={item.id}
      className="flex justify-evenly items-center text-[1.15rem] font-latrue bg-gray-100 mb-2 py-2 min-w-max font-semibold"
    >
      <div className="flex items-center w-[180px] min-w-[180px]">
        <SquareMinus className="opacity-30 mr-2" />
        <span className="truncate">{item.name}</span>
      </div>

      <div className="flex justify-center w-[100px] min-w-[100px]">
        <input
          type="text"
          className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-28 h-9 cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="flex justify-center w-[100px] min-w-[100px]">
        <input
          type="text"
          className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-28 h-9 cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="flex justify-center w-[100px] min-w-[100px]">
        <input
          type="text"
          className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-28 h-9 cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="flex justify-center w-[100px] min-w-[100px]">
        <input
          type="text"
          className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-28 h-9 cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="flex justify-center w-[100px] min-w-[100px]">
        <input
          type="text"
          className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-28 h-9 cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="flex justify-center w-[120px] min-w-[120px]">
        <h2
          className={`border text-center rounded-2xl w-full font-lato font-bold text-[15px] h-9 pt-2 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)] ${statusColors[item.status]}`}
        >
          {item.status}
        </h2>
      </div>
    </div>
  ))}
</div>
      <div className="grid grid-cols-2 pb-10 pt-5 p-5">
        <div className="flex items-center -ml-6">
          <h2 className="font-lato font-medium ml-3">Clerk Name:</h2>
          <input
            type="text"
            className="bg-gray-50 ml-2 border border-gray-500 text-sm text-gray-900 rounded-lg w-60 h-9 px-3"
            placeholder="Type name"
            required
          />
          <button
            type="button"
            className="bg-white border border-gray-300 font-medium font-lato text-sm w-28 h-9 hover:bg-gray-100 rounded-2xl ml-3 shadow-[0_5px_5px_rgba(0,0,0,0.3)] cursor-pointer"
          >
            Submit
          </button>
        </div>

        <div className="flex items-center justify-end">
          <div className="flex items-center mr-4">
            <span className="bg-[#0CD742] border border-[#067a25] rounded-full w-4 h-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)] mr-1"></span>
            <h2 className="font-lato italic opacity-60 text-sm leading-tight">
              High on
              <br /> Stocks
            </h2>
          </div>

          <div className="flex items-center mr-4">
            <span className="bg-[#FFCF50] border border-[#B3861A] rounded-full w-4 h-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)] mr-1"></span>
            <h2 className="font-lato italic opacity-60 text-sm leading-tight">
              Moderate Stock
              <br /> Level
            </h2>
          </div>

          <div className="flex items-center">
            <span className="bg-[#FF3434] border border-[#B82323] rounded-full w-4 h-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)] mr-1"></span>
            <h2 className="font-lato italic opacity-60 text-sm leading-tight">
              Low on
              <br /> Stocks
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

// Sample data for inventory items
const inventoryData = [
  { id: 1, name: "Beef", status: "High" },
  { id: 2, name: "Puso ng Saging", status: "High" },
  { id: 3, name: "Potato", status: "High" },
  { id: 4, name: "Garlic", status: "Moderate" },
  { id: 5, name: "Cucumber", status: "High" },
  { id: 6, name: "Calamansi", status: "Low" },
];

// Mapping for status colors
const statusColors = {
  High: "bg-[#0CD742] border-[#067a25]",
  Moderate: "bg-[#FFCF50] border-[#B3861A]",
  Low: "bg-[#FF3434] border-[#B82323]",
};

export default InventoryDaily;
