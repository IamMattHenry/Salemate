import React from "react";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import { IoIosFolderOpen } from "react-icons/io";

const InventorySaveHistory = () => {
  const sectionHeader = { label: "Monthly Saved Document", date: "test" };

  const savedData = [
    { icon: <IoIosFolderOpen />, dataName: "test", dataDate: "testDate" },
    { icon: <IoIosFolderOpen />, dataName: "test", dataDate: "testDate" },
    { icon: <IoIosFolderOpen />, dataName: "test", dataDate: "testDate" },
  ];

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
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
                className="hover:bg-yellowsm/20 hover:shadow-lg border-b-yellowsm/50 border-b-[0.5px]"
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
  );
};

export default InventorySaveHistory;
