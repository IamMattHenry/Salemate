import React from "react";
import { IoIosFolderOpen } from "react-icons/io";
import CustomersNav from "../CustomersNav";

const CustomersSaveHistory = () => {

  const savedData = [
    { icon: <IoIosFolderOpen />, dataName: "test", dataDate: "testDate" },
    { icon: <IoIosFolderOpen />, dataName: "test", dataDate: "testDate" },
    { icon: <IoIosFolderOpen />, dataName: "test", dataDate: "testDate" },
  ];

  return (
    <div className="w-full">
        <CustomersNav />
        <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block">
      <div className="overflow-x-auto font-latrue">
        <table className="w-full text-[1rem]">
          <thead>
            <tr className="leading-normal font-bold text-[1rem] border-b-[0.5px] border-b-gray-600/50">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Date Saved</th>
            </tr>
          </thead>
          <tbody>
            {savedData.map((saved, index) => (
              <tr
                key={index}
                className="hover:bg-yellowsm/20 hover:shadow-sm border-b-yellowsm/50 border-b-[0.5px]"
              >
                <td className="py-3 px-6 text-left">
                  <div className="flex items-center space-x-3">
                    <span>{saved.icon}</span>
                    <span>{saved.dataName}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-left">{saved.dataDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    </div>
    
  );
};

export default CustomersSaveHistory;
