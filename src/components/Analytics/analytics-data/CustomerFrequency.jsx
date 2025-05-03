import React, { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, getFirestore, Timestamp } from 'firebase/firestore';
import firebaseApp from "../../../firebaseConfig";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController, 
  BarController,  
  Title,
  Tooltip,
  Legend,
  Filler // Add this
} from 'chart.js';
import { Line } from 'react-chartjs-2'; // Change from Bar to Line

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  LineController, 
  BarController,  
  Title,
  Tooltip,
  Legend,
  Filler // Add this
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
        const customerFirstOrders = new Map();

        // First pass: Process all orders and track first orders
        snapshot.forEach((doc) => {
          const data = doc.data();
          const recipient = data.recipient || '';
          
          if (recipient) {
            const orderDate = data.order_date?.seconds ? 
              new Date(data.order_date.seconds * 1000) : 
              new Date();

            // Track order count
            const currentCount = customerOrders.get(recipient) || 0;
            customerOrders.set(recipient, currentCount + 1);

            // Track customer's first order
            if (!customerFirstOrders.has(recipient) || 
                orderDate < customerFirstOrders.get(recipient)) {
              customerFirstOrders.set(recipient, orderDate);
            }
          }
        });

        // Initialize metrics
        let newCustomersCount = 0;
        let returningCustomersCount = 0;
        let oneTimeCount = 0;
        let twoToTenCount = 0;
        let elevenPlusCount = 0;

        // Initialize monthly data
        const monthlyTotals = {
          January: 0, February: 0, March: 0, April: 0,
          May: 0, June: 0, July: 0, August: 0,
          September: 0, October: 0, November: 0, December: 0
        };
        const monthlyNewCustomers = {...monthlyTotals};
        const monthlyReturningCustomers = {...monthlyTotals};

        // Process customer segments and monthly data
        customerOrders.forEach((orderCount, recipient) => {
          // Update segment counts
          if (orderCount === 1) {
            oneTimeCount++;
            newCustomersCount++;
          } else {
            returningCustomersCount++;
            if (orderCount >= 2 && orderCount <= 10) {
              twoToTenCount++;
            } else if (orderCount > 10) {
              elevenPlusCount++;
            }
          }

          // Update monthly data
          const firstOrderDate = customerFirstOrders.get(recipient);
          const month = firstOrderDate.toLocaleString('default', { month: 'long' });
          
          if (orderCount === 1) {
            monthlyNewCustomers[month]++;
          } else {
            monthlyReturningCustomers[month]++;
          }
          monthlyTotals[month]++;
        });

        // Debug log
        console.log('Customer Metrics:', {
          newCustomers: newCustomersCount,
          returningCustomers: returningCustomersCount,
          oneTime: oneTimeCount,
          twoToTen: twoToTenCount,
          elevenPlus: elevenPlusCount,
          monthlyData: {
            total: monthlyTotals,
            new: monthlyNewCustomers,
            returning: monthlyReturningCustomers
          }
        });

        // Update state with all metrics
        setCustomerMetrics({
          newCustomers: newCustomersCount,
          returningCustomers: returningCustomersCount,
          oneTime: oneTimeCount,
          twoToTen: twoToTenCount,
          elevenPlus: elevenPlusCount,
          monthlyTotals,
          monthlyNewCustomers,
          monthlyReturningCustomers
        });

        setLoading(false);
      } catch (error) {
        console.error("Error processing customer data:", error);
        setLoading(false);
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
    <div className="bg-white rounded-2xl shadow-feat w-full mx-auto block pb-5">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="mt-4 mx-7 w-auto">
        <div className="grid grid-rows-2 grid-cols-[40%_1fr] gap-4">
          <CustomerLoyaltyMetrics metrics={customerMetrics} />
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
          <CustomerSegments metrics={customerMetrics} />
        </div>
      </div>

      {/* Add this after the grid */}
      <div className="mt-6 mx-7 bg-white rounded-xl shadow-md p-4">
        <div style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

// Update the Card component
const Card = ({ children, className = "" }) => (
  <div className={`w-full rounded-2xl p-6 ${className}`}>
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

// Update the CustomerLoyaltyMetrics component
const CustomerLoyaltyMetrics = ({ metrics }) => (
  <Card className="bg-yellowsm/20 shadow-lg">
    <div className="text-xl font-medium text-left mb-4">
      CUSTOMER LOYALTY METRICS
    </div>
    <div className="flex justify-between w-full items-center mb-3">
      <span>New Customers:</span>
      <input
        type="text"
        readOnly
        value={metrics.newCustomers || 0}
        className="bg-[#f5f4f4] px-4 py-1.5 border border-gray-300 rounded-md w-32"
      />
    </div>
    <div className="flex justify-between w-full items-center">
      <span>Returning Customers:</span>
      <input
        type="text"
        readOnly
        value={metrics.returningCustomers || 0}
        className="bg-[#f5f4f4] px-4 py-1.5 border border-gray-300 rounded-md w-32"
      />
    </div>
  </Card>
);

// Update the CustomerSegments component
const CustomerSegments = ({ metrics }) => (
  <Card className="bg-yellowsm/20 shadow-lg">
    <div className="text-xl font-medium text-left mb-4">
      CUSTOMER SEGMENTS AND AVERAGE ORDER VALUE
    </div>
    <div className="flex justify-between w-full items-center mb-3">
      <span>One Time Customer:</span>
      <input
        type="text"
        readOnly
        value={metrics.oneTime || 0}
        className="bg-[#f5f4f4] px-4 py-1.5 border border-gray-300 rounded-md w-32"
      />
    </div>
    <div className="flex justify-between w-full items-center mb-3">
      <span>2-10 Time Customers:</span>
      <input
        type="text"
        readOnly
        value={metrics.twoToTen || 0}
        className="bg-[#f5f4f4] px-4 py-1.5 border border-gray-300 rounded-md w-32"
      />
    </div>
    <div className="flex justify-between w-full items-center">
      <span>11+ Time Customers:</span>
      <input
        type="text"
        readOnly
        value={metrics.elevenPlus || 0}
        className="bg-[#f5f4f4] px-4 py-1.5 border border-gray-300 rounded-md w-32"
      />
    </div>
  </Card>
);

export default CustomerFrequency;
