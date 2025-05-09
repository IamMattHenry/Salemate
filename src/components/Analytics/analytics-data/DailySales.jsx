import React, { useState, useEffect } from "react";
import { getFirestore } from 'firebase/firestore';
import firebaseApp from "../../../firebaseConfig";
import analyticsService from "../../../services/analyticsService";
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
  // Use a date object that updates each time the component renders
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDay = days[today.getDay()];

  // Format the date for display
  const formattedDate = today.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  });

  const sectionHeader = {
    label: `${currentDay} Sale Summary:`,
    date: formattedDate
  };

  // Function to fetch daily sales data
  const fetchDailySales = async () => {
    try {
      setLoading(true);

      // Only log in development to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching daily sales data...');
      }

      // Force refresh of daily data by passing true as the second parameter
      const dailyData = await analyticsService.getDailyData(new Date(), true);

      // Extract the data we need
      const { sales, totalCashSales, totalOnlineSales } = dailyData;

      // Double-check that we only have "Delivered" orders
      const deliveredSales = sales.filter(sale => sale.status === 'Delivered');

      // Log the totals for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`DailySales component received totals - Cash: ₱${totalCashSales}, Online: ₱${totalOnlineSales}`);
      }

      // Log any non-delivered orders that might have slipped through
      if (process.env.NODE_ENV === 'development' && deliveredSales.length !== sales.length) {
        console.warn(`Filtered out ${sales.length - deliveredSales.length} non-delivered orders`);
      }

      // Get only the 3 most recent orders (already filtered for "Delivered" status)
      // Make sure they're properly sorted by time first
      const sortedSales = [...deliveredSales].sort((a, b) => {
        // Convert time strings to Date objects for comparison
        const timeA = new Date(`${new Date().toDateString()} ${a.time}`);
        const timeB = new Date(`${new Date().toDateString()} ${b.time}`);
        return timeB - timeA; // Most recent first
      });

      // Log the sorted sales for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log("All sales data:", sortedSales);
      }

      const recentSales = sortedSales.slice(0, 3);

      // Update state
      setSalesData(recentSales);
      setTotalOnline(totalOnlineSales);
      setTotalCash(totalCashSales);

      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log("Daily sales data fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;

    // Initial fetch when component mounts
    fetchDailySales();

    // Set up a listener for new delivered orders
    const unsubscribe = analyticsService.subscribeToNewDeliveredOrders(() => {
      // When a new delivered order is detected, refresh the data
      if (isMounted) {
        fetchDailySales();

        // Also trigger a refresh of the monthly data by dispatching a custom event
        // This will ensure the monthly data is updated when daily data changes
        const refreshEvent = new CustomEvent('refreshAnalyticsData');
        window.dispatchEvent(refreshEvent);

        console.log("Triggered analytics data refresh event");
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block pb-5">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="mt-7 mx-7 w-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Only delivered orders are included in these totals */}
          <Card
            icon={<BsCash />}
            label="Total Sales: "
            subLabel="Cash Payment (Delivered)"
            amount={`₱${totalCash.toLocaleString()}`}
          />
          <Card
            icon={<HiMiniSignal />}
            label="Total Sales: "
            subLabel="Online Payment (Delivered)"
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
            subLabel="Showing delivered orders"
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
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[80px] bg-green-100 text-green-800">
                        Delivered
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
