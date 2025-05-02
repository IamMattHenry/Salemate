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
        const dailyQuery = query(
          ordersRef,
          where('order_date', '>=', Timestamp.fromDate(startOfDay)),
          where('order_date', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('order_date', 'desc'), // Sort by date in descending order
          limit(5) // Limit to 5 most recent orders
        );

        const querySnapshot = await getDocs(dailyQuery);
        const sales = [];
        let totalCashSales = 0;
        let totalOnlineSales = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Calculate totals based on mode of payment
          if (data.mop === "Online") {
            totalOnlineSales += data.order_total;
          } else {
            totalCashSales += data.order_total;
          }

          sales.push({
            id: data.order_name, // Using order_name as ID
            recipient: data.recipient,
            amount: data.order_total,
            time: new Date(data.order_date.toDate()).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            date: new Date(data.order_date.toDate()).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            }),
            status: data.order_status
          });
        });

        // Update state with all the data
        setSalesData(sales);
        // You can add additional state for the totals if needed
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
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
          />
        </div>
        <div className="overflow-x-auto rounded-xl shadow-md font-lato">
          <table className="min-w-full bg-yellowsm/20 text-center overflow-scroll">
            <thead>
              <tr className="text-[1rem] leading-normal border-b-[0.5px] border-b-yellowsm/50">
                <th className="py-3 px-6 text-center">Order</th>
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
                  className="hover:bg-yellowsm/30 text-[1rem] border-b-[0.5px] border-b-yellowsm/50"
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
  <div className="bg-yellowsm/20 h-35 w-full rounded-xl shadow-lg flex flex-row items-center justify-between font-lato px-5">
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
