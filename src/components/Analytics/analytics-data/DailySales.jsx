import React from "react";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import { BsCash } from "react-icons/bs";
import { HiMiniSignal } from "react-icons/hi2";
import { LuHeartHandshake } from "react-icons/lu";
import { RiCustomerServiceFill } from "react-icons/ri";


const DailySales = () => {
  const sectionHeader = { label: "Test", date: "test" };

  const salesData = [
    {
      id: "Classic",
      recipient: "Charles Kirby",
      amount: 780,
      time: "11:30 am",
      date: "03/16/2025",
      status: "Delivered",
    },
    {
      id: "Classic",
      recipient: "Charles Kirby",
      amount: 780,
      time: "11:30 am",
      date: "03/16/2025",
      status: "Delivered",
    },
    {
      id: "Classic",
      recipient: "Charles Kirby",
      amount: 780,
      time: "11:30 am",
      date: "03/16/2025",
      status: "Delivered",
    },
  ];

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="mt-7 mx-7 w-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
          <Card
            icon={<BsCash />}
            label="Total Sales: "
            subLabel="Cash Payment"
            amount="₱12,270"
          />
          <Card
            icon={<HiMiniSignal />}
            label="Total Sales: "
            subLabel="Online Payment"
            amount="₱12,270"
          />
          <Card icon={<LuHeartHandshake />} label="Overall Profit:" amount="₱12,270" />
          <Card
            icon={<RiCustomerServiceFill />}
            label="Customer Summary:"
            amount="₱12,270"
          />
        </div>
        <div className="overflow-x-auto rounded-sm shadow font-lato">
          <table className="min-w-full bg-yellowsm/50 text-center overflow-scroll">
            <thead>
              <tr className="text-[1rem] leading-normal border-b-[0.5px] border-b-yellowsm/50">
                <th className="py-3 px-6 text-center">Order ID</th>
                <th className="py-3 px-6 text-center">Recipient</th>
                <th className="py-3 px-6 text-center">Amount</th>
                <th className="py-3 px-6 text-center">Time</th>
                <th className="py-3 px-6 text-center">Date</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {salesData.map((sale, index) => (
                <tr
                  key={index}
                  className=" hover:bg-yellowsm/30 text-[1rem] border-b-[0.5px] border-b-yellowsm/50"
                >
                  <td className="py-3 px-6 text-center">{sale.id}</td>
                  <td className="py-3 px-6 text-center">{sale.recipient}</td>
                  <td className="py-3 px-6 text-center">₱{sale.amount}</td>
                  <td className="py-3 px-6 text-center">{sale.time}</td>
                  <td className="py-3 px-6 text-center">{sale.date}</td>
                  <td className="py-3 px-6 text-center">{sale.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const Card = ({ icon, label, subLabel, amount }) => (
  <div className="bg-yellowsm/45 h-35 w-full rounded-sm shadow-feat flex flex-row items-center justify-between font-lato px-5">
    <div>
      <div className="text-lg font-medium text-left">{label}</div>
      <div className="text-sm text-gray-600 -mt-2 mb-5 text-left">{subLabel}</div>
      <div className="text-xl font-medium">{amount}</div>
    </div>
    <div>
      <div className="text-2xl mb-2">{icon}</div>
    </div>
  </div>
);

export default DailySales;
