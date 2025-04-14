import React from "react";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import { BsCash, BsWifi, BsHeart, BsHeadphones } from "react-icons/bs";

const DailySales = () => {
  const sectionHeader = { label: "Test", date: "test" };

  const salesData = [
    {
      id: "Classic",
      recipient: "Charles Kirby",
      amount: 780,
      time: "11:30 am",
      date: "03/16/2025",
    },
    {
      id: "Classic",
      recipient: "Charles Kirby",
      amount: 780,
      time: "11:30 am",
      date: "03/16/2025",
    },
    {
      id: "Classic",
      recipient: "Charles Kirby",
      amount: 780,
      time: "11:30 am",
      date: "03/16/2025",
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
            icon={<BsWifi />}
            label="Total Sales: "
            subLabel="Online Payment"
            amount="₱12,270"
          />
          <Card icon={<BsHeart />} label="Overall Profit:" amount="₱12,270" />
          <Card
            icon={<BsHeadphones />}
            label="Customer Summary:"
            amount="₱12,270"
          />
        </div>
        <div className="overflow-x-auto rounded-lg shadow font-lato">
          <table className="min-w-full bg-yellowsm/10 text-center">
            <thead>
              <tr className="uppercase text-[1rem] leading-normal">
                <th className="py-3 px-6 text-center">Order ID</th>
                <th className="py-3 px-6 text-center">Recipient</th>
                <th className="py-3 px-6 text-center">Amount</th>
                <th className="py-3 px-6 text-center">Time</th>
                <th className="py-3 px-6 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {salesData.map((sale, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-yellowsm/30"
                >
                  <td className="py-3 px-6 text-center">{sale.id}</td>
                  <td className="py-3 px-6 text-center">{sale.recipient}</td>
                  <td className="py-3 px-6 text-center">₱{sale.amount}</td>
                  <td className="py-3 px-6 text-center">{sale.time}</td>
                  <td className="py-3 px-6 text-center">{sale.date}</td>
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
  <div className="bg-yellowsm/10 h-35 w-full rounded-xl shadow-feat p-4 flex flex-row items-center justify-between font-lato px-5">
    <div>
      <div className="text-lg font-medium text-left">{label}</div>
      <div className="text-sm text-gray-600 mb-1 text-left">{subLabel}</div>
      <div className="text-xl font-medium">{amount}</div>
    </div>
    <div>
      <div className="text-2xl mb-2">{icon}</div>
    </div>
  </div>
);

export default DailySales;
