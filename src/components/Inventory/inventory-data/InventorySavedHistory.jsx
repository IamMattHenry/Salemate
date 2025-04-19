import React from "react";
import { IoIosFolderOpen } from "react-icons/io";

const InventorySavedHistory = () => {
  const savedData = [
      { icon: <IoIosFolderOpen />, dataName: "test.pdf", dataDate: "testDate" },
      { icon: <IoIosFolderOpen />, dataName: "test.pdf", dataDate: "testDate" },
      { icon: <IoIosFolderOpen />, dataName: "test.pdf", dataDate: "testDate" },
    ];
  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4">
          <div className="overflow-x-auto font-lato">
            <table className="w-full text-[1rem]">
              <thead>
                <tr className="leading-normal border-b border-b-gray-600/50">
                  <th className="w-[300px] font-league spartan font-medium text-[22px] py-3 px-6 pr-30">Name</th>
                  <th className="w-[300px]font-league spartan font-medium text-[22px] py-3 px-6 text-left">Date Saved</th>
                </tr>
              </thead>
              <tbody>
                {savedData.map((saved, index) => (
                  <tr
                    key={index}
                    className="hover:bg-yellowsm/30 w-200 hover:shadow-sm border-yellowsm/50 border-b-[0.5]"
                  >
                    <td className="py-3 px-6 text-left">
                      <div className="font-league spartan font-medium text-[23px] flex items-center space-x-7">
                        <span className="text-black text-[32px]">{saved.icon}</span>
                        <span className="opacity-[40%]">{saved.dataName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left font-league spartan font-medium text-[23px] opacity-[40%]">{saved.dataDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
  );
};

export default InventorySavedHistory;
