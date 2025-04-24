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
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="overflow-x-auto font-lato">
        <table className="w-full text-[1rem]">
          <thead>
            <tr className="leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Date Saved</th>
            </tr>
          </thead>
          <tbody>
            {savedData.map((saved, index) => (
              <tr
                key={index}
                className="hover:bg-yellowsm/30 hover:shadow-sm border-yellowsm/50 border-b-[0.5]"
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
