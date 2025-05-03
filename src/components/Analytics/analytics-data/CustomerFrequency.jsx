import React, { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, getFirestore } from 'firebase/firestore';
import firebaseApp from "../../../firebaseConfig";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController, // Add this
  BarController,  // Add this
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController, // Add this
  BarController,  // Add this
  Title,
  Tooltip,
  Legend
);

const CustomerFrequency = () => {
  const [customerMetrics, setCustomerMetrics] = useState({
    newCustomers: 0,
    returningCustomers: 0,
    oneTime: 0,
    twoToTen: 0,
    elevenPlus: 0,
    monthlyTotals: {
      January: 0, February: 0, March: 0, April: 0,
      May: 0, June: 0, July: 0, August: 0,
      September: 0, October: 0, November: 0, December: 0
    },
    monthlyNewCustomers: {},
    monthlyReturningCustomers: {}
  });
  const [loading, setLoading] = useState(true);
  const db = getFirestore(firebaseApp);

  const currentMonth = useMemo(() => 
    new Date().toLocaleString('default', { month: 'long' })
  , []);

  useEffect(() => {
    const orderRef = collection(db, 'order_transaction');
    const unsubscribe = onSnapshot(orderRef, (snapshot) => {
      try {
        const customerOrders = new Map();
        const monthlyNewCustomers = {
          January: new Set(), February: new Set(), March: new Set(),
          April: new Set(), May: new Set(), June: new Set(),
          July: new Set(), August: new Set(), September: new Set(),
          October: new Set(), November: new Set(), December: new Set()
        };
        const monthlyReturningCustomers = {
          January: new Set(), February: new Set(), March: new Set(),
          April: new Set(), May: new Set(), June: new Set(),
          July: new Set(), August: new Set(), September: new Set(),
          October: new Set(), November: new Set(), December: new Set()
        };

        // First pass to identify returning customers
        snapshot.forEach((doc) => {
          const data = doc.data();
          const customerId = data.customer_id;
          const orderDate = data.order_date.toDate();
          const month = orderDate.toLocaleString('default', { month: 'long' });
          
          const previousOrders = customerOrders.get(customerId) || 0;
          customerOrders.set(customerId, previousOrders + 1);

          if (previousOrders === 0) {
            monthlyNewCustomers[month].add(customerId);
          } else {
            monthlyReturningCustomers[month].add(customerId);
          }
        });

        // Convert Sets to counts
        const monthlyTotals = {};
        const newCustomerTotals = {};
        const returningCustomerTotals = {};

        Object.keys(monthlyNewCustomers).forEach(month => {
          newCustomerTotals[month] = monthlyNewCustomers[month].size;
          returningCustomerTotals[month] = monthlyReturningCustomers[month].size;
          monthlyTotals[month] = newCustomerTotals[month] + returningCustomerTotals[month];
        });

        // ... rest of your existing metrics calculations ...

        setCustomerMetrics(prev => ({
          ...prev,
          monthlyTotals,
          monthlyNewCustomers: newCustomerTotals,
          monthlyReturningCustomers: returningCustomerTotals
        }));

      } catch (error) {
        console.error("Error processing customer data:", error);
      }
    });

    return () => unsubscribe();
  }, [db]);

  const sectionHeader = { 
    label: "Monthly Customer Frequency", 
    date: currentMonth 
  };

  // Update the chartData object
  const chartData = {
    labels: Object.keys(customerMetrics.monthlyTotals),
    datasets: [
      {
        label: 'Total Customers',
        data: Object.values(customerMetrics.monthlyTotals || {}),
        backgroundColor: 'rgba(66, 133, 244, 0.1)', // Google blue with opacity
        borderColor: '#4285F4', // Google blue
        borderWidth: 2,
        type: 'line',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4285F4',
        pointBorderWidth: 2,
        order: 0
      },
      {
        label: 'New Customers',
        data: Object.values(customerMetrics.monthlyNewCustomers || {}),
        backgroundColor: 'rgba(234, 67, 53, 0.1)', // Google red with opacity
        borderColor: '#EA4335', // Google red
        borderWidth: 2,
        type: 'line',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#EA4335',
        pointBorderWidth: 2,
        order: 1
      },
      {
        label: 'Returning Customers',
        data: Object.values(customerMetrics.monthlyReturningCustomers || {}),
        backgroundColor: 'rgba(52, 168, 83, 0.1)', // Google green with opacity
        borderColor: '#34A853', // Google green
        borderWidth: 2,
        type: 'line',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#34A853',
        pointBorderWidth: 2,
        order: 2
      }
    ]
  };

  // Update the chartOptions
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Lato', sans-serif"
          }
        }
      },
      title: {
        display: false // Remove title as it's similar to Google Analytics style
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#666',
        bodyColor: '#666',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} customers`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#666'
        }
      },
      y: {
        beginAtZero: true,
        position: 'right', // Move Y-axis to right like Google Analytics
        grid: {
          color: '#f0f0f0',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          },
          color: '#666'
        }
      }
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block pb-5">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="mt-4 mx-7 w-auto">
        <div className="grid grid-rows-2 grid-cols-[40%_1fr] gap-4">
          <Card className="bg-yellowsm/20 shadow-lg font-latrue">
            <div className="text-xl font-medium text-left mb-2 uppercase">
              Customer Loyalty Metrics
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left font-latrue">
                <span>New Customers: </span>
              </div>
              <input
                type="text"
                disabled
                value={customerMetrics.newCustomers}
                className="bg-[#f5f4f4] px-2 border text-sm border-gray-400"
              />
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left font-latrue">
                <span>Returning Customers: </span>
              </div>
              <input
                type="text"
                disabled
                value={customerMetrics.returningCustomers}
                className="bg-[#f5f4f4] px-2 border text-sm border-gray-400"
              />
            </div>
          </Card>
          
          {/* Monthly totals section */}
          <Card className="row-span-2 bg-yellowsm/20 shadow-lg">
            <div className="text-lg font-medium text-left mb-2 uppercase">
              Total Customer (Monthly)
            </div>
            <div className="flex justify-between w-full my-4 pl-[25px]"> {/* Changed from pl-[35px] to pl-[25px] */}
              {/* Left column */}
              <div className="w-[48%] space-y-2">
                {leftColumnMonths.map((month) => (
                  <MonthInput 
                    key={month} 
                    label={month} 
                    value={customerMetrics.monthlyTotals[month]} 
                  />
                ))}
              </div>
              {/* Right column */}
              <div className="w-[48%] space-y-2">
                {rightColumnMonths.map((month) => (
                  <MonthInput 
                    key={month} 
                    label={month} 
                    value={customerMetrics.monthlyTotals[month]} 
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Customer segments section */}
          <Card className="bg-yellowsm/20 shadow-lg">
            <div className="text-lg font-medium text-left mb-2 uppercase">
              Customer Segments and average order value
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left">
                <span>One Time Customer: </span>
              </div>
              <input
                type="text"
                disabled
                value={customerMetrics.oneTime}
                className="bg-[#f5f4f4] px-2 border border-gray-400 text-sm"
              />
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left">
                <span>2-10 Time Customers: </span>
              </div>
              <input
                type="text"
                disabled
                value={customerMetrics.twoToTen}
                className="bg-[#f5f4f4] px-2 border border-gray-400 text-sm"
              />
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left">
                <span>11+ Time Customers: </span>
              </div>
              <input
                type="text"
                disabled
                value={customerMetrics.elevenPlus}
                className="bg-[#f5f4f4] px-2 border border-gray-400 text-sm"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Add this after the grid */}
      <div className="mt-6 mx-7 bg-white rounded-xl shadow-md p-4">
        <div style={{ height: '300px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </section>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`w-full rounded-xl flex flex-col items-start py-3 px-5 font-latrue ${className}`}
  >
    {children}
  </div>
);

// Update the months array to be in two separate columns
const leftColumnMonths = ['January', 'February', 'March', 'April', 'May', 'June'];
const rightColumnMonths = ['July', 'August', 'September', 'October', 'November', 'December'];

// Update the MonthInput component
const MonthInput = ({ label, value }) => (
  <div className="flex items-center w-full">
    <div className="text-sm font-medium w-28 text-left">
      <span>{label}</span>
    </div>
    <input
      type="text"
      disabled
      value={value}
      className="bg-[#f5f4f4] w-20 px-2 py-1 border border-gray-400 text-sm rounded text-center ml-auto"
    />
  </div>
);

export default CustomerFrequency;
