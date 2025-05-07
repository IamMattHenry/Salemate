import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp, getFirestore, orderBy, limit } from 'firebase/firestore';
import firebaseApp from "../../../firebaseConfig";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import { BsCash } from "react-icons/bs";
import { HiMiniSignal } from "react-icons/hi2";
import { LuHeartHandshake } from "react-icons/lu";
import { RiCustomerServiceFill } from "react-icons/ri";

const DailySales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCash, setTotalCash] = useState(0);
  const [totalOnline, setTotalOnline] = useState(0);
  const db = getFirestore(firebaseApp);
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDay = days[today.getDay()];

  const formattedDate = today.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  });

  const sectionHeader = {
    label: `${currentDay} Sale Summary:`,
    date: formattedDate
  };

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const ordersRef = collection(db, 'order_transaction');
        // Get all orders for today first
        const dailyQuery = query(
          ordersRef,
          where('order_date', '>=', Timestamp.fromDate(startOfDay)),
          where('order_date', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('order_date', 'desc')
        );

        const querySnapshot = await getDocs(dailyQuery);
        const sales = [];
        let totalCashSales = 0;
        let totalOnlineSales = 0;

        // Only process delivered orders
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include if status is "Delivered"
          if (data.order_status === "Delivered") {
            if (data.mop === "Online") {
              totalOnlineSales += data.order_total;
            } else {
              totalCashSales += data.order_total;
            }

            sales.push({
              quantity: data.no_order,
              recipient: data.recipient,
              amount: data.order_total,
              time: new Date(data.order_date.toDate()).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }),
              mop: data.mop,
              status: data.order_status
            });
          }
        });

        // Get only the 3 most recent delivered orders
        const recentSales = sales.slice(0, 3);

        setSalesData(recentSales);
        setTotalOnline(totalOnlineSales);
        setTotalCash(totalCashSales);

      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailySales();
  }, [today, db]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block pb-5">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="mt-7 mx-7 w-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card
            icon={<BsCash />}
            label="Total Sales: "
            subLabel="Cash Payment"
            amount={`₱${totalCash.toLocaleString()}`}
          />
          <Card
            icon={<HiMiniSignal />}
            label="Total Sales: "
            subLabel="Online Payment"
            amount={`₱${totalOnline.toLocaleString()}`}
          />
          <Card
            icon={<LuHeartHandshake />}
            label="Overall Profit:"
            amount={`₱${(totalCash + totalOnline).toLocaleString()}`}
          />
          <Card
            icon={<RiCustomerServiceFill />}
            label="Customer Summary:"
            amount={salesData.length}
            subLabel="Showing top 3 orders"
          />
        </div>
        <div className="rounded-xl shadow-lg overflow-hidden border border-yellowsm/20">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-yellowsm/20">
              <thead className="bg-gradient-to-r from-amber-50/80 to-yellowsm/20">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">Quantity</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">Recipient</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">Time</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">MOP</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-800 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-yellowsm/10">
                {salesData.map((sale, index) => (
                  <tr
                    key={index}
                    className="hover:bg-amber-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 text-center w-24">
                      {sale.quantity}x
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center w-64">
                      {sale.recipient}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-amber-700 text-center w-32">
                      ₱{sale.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center w-32">
                      {sale.time}
                    </td>
                    <td className="px-6 py-4 text-center w-32">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[80px]
                        ${sale.mop === 'Online'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'}`}>
                        {sale.mop}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center w-32">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[80px] bg-amber-100 text-amber-800">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

const Card = ({ icon, label, subLabel, amount }) => (
  <div className="bg-gradient-to-br from-amber-50 to-yellowsm/20 w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">{label}</h3>
          {subLabel && (
            <p className="text-sm text-gray-600 mt-0.5">{subLabel}</p>
          )}
        </div>
        <div className="text-2xl font-bold text-amber-700">
          {amount}
        </div>
      </div>
      <div className="bg-yellowsm/20 p-3 rounded-xl">
        <span className="text-2xl text-amber-700">
          {icon}
        </span>
      </div>
    </div>
  </div>
);

export default DailySales;
