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
    monthlyReturningCustomers: {},
    loyalCustomers: [] // Add this
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

        // Track monthly orders per customer
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthlyCustomerOrders = new Map();

        snapshot.forEach((doc) => {
          const data = doc.data();
          const orderDate = new Date(data.order_date.seconds * 1000);
          
          // Only count orders from current month
          if (orderDate.getMonth() === currentMonth && 
              orderDate.getFullYear() === currentYear) {
            const recipient = data.recipient || '';
            if (recipient) {
              const currentCount = monthlyCustomerOrders.get(recipient) || 0;
              monthlyCustomerOrders.set(recipient, currentCount + 1);
            }
          }
        });

        // Filter loyal customers (5+ orders this month)
        const loyalCustomers = Array.from(monthlyCustomerOrders.entries())
          .filter(([_, count]) => count >= 5)
          .map(([name, orderCount]) => ({
            name,
            orderCount
          }))
          .sort((a, b) => b.orderCount - a.orderCount);

        // Update state with all metrics
        setCustomerMetrics({
          newCustomers: newCustomersCount,
          returningCustomers: returningCustomersCount,
          oneTime: oneTimeCount,
          twoToTen: twoToTenCount,
          elevenPlus: elevenPlusCount,
          monthlyTotals,
          monthlyNewCustomers,
          monthlyReturningCustomers,
          loyalCustomers // Add this
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

  // Update the chart section in the return statement
  return (
    <div className="bg-white rounded-2xl shadow-feat w-full mx-auto block pb-5">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      {/* Make grid responsive */}
      <div className="mt-4 mx-3 md:mx-7 w-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomerLoyaltyMetrics metrics={customerMetrics} />
          <CustomerSegments metrics={customerMetrics} />
        </div>
      </div>

      {/* Update Loyal Customers section */}
      <div className="mt-6 mx-3 md:mx-7">
        <LoyalCustomers customers={customerMetrics.loyalCustomers || []} />
      </div>

      {/* Update Chart section */}
      <div className="mt-6 mx-3 md:mx-7 bg-white rounded-xl shadow-md p-4">
        <div className="min-w-[320px] md:min-w-[800px]">
          <div className="h-[250px] md:h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the Card component
const Card = ({ children, className = "" }) => (
  <div className={`w-full rounded-2xl p-6 md:p-8 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

// Update the CustomerLoyaltyMetrics component
const CustomerLoyaltyMetrics = ({ metrics }) => (
  <Card className="bg-gradient-to-br from-yellowsm/10 to-yellowsm/20 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span className="bg-yellowsm/20 p-2 rounded-lg">📊</span>
      CUSTOMER LOYALTY METRICS
    </div>
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-3">
        <span className="text-sm md:text-base font-medium text-gray-700">New Customers:</span>
        <input
          type="text"
          readOnly
          value={metrics.newCustomers || 0}
          className="bg-white px-4 py-2 border border-yellowsm/30 rounded-lg w-full sm:w-32 text-center text-sm md:text-base font-semibold text-yellowsm shadow-sm focus:ring-2 focus:ring-yellowsm/20 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-3">
        <span className="text-sm md:text-base font-medium text-gray-700">Returning Customers:</span>
        <input
          type="text"
          readOnly
          value={metrics.returningCustomers || 0}
          className="bg-white px-4 py-2 border border-yellowsm/30 rounded-lg w-full sm:w-32 text-center text-sm md:text-base font-semibold text-yellowsm shadow-sm focus:ring-2 focus:ring-yellowsm/20 transition-all duration-200"
        />
      </div>
    </div>
  </Card>
);

// Update the CustomerSegments component
const CustomerSegments = ({ metrics }) => (
  <Card className="bg-gradient-to-br from-yellowsm/10 to-yellowsm/20 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span className="bg-yellowsm/20 p-2 rounded-lg">👥</span>
      CUSTOMER SEGMENTS
    </div>
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-3">
        <span className="text-sm md:text-base font-medium text-gray-700">One Time Customer:</span>
        <input
          type="text"
          readOnly
          value={metrics.oneTime || 0}
          className="bg-white px-4 py-2 border border-yellowsm/30 rounded-lg w-full sm:w-32 text-center text-sm md:text-base font-semibold text-yellowsm shadow-sm focus:ring-2 focus:ring-yellowsm/20 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-3">
        <span className="text-sm md:text-base font-medium text-gray-700">2-10 Time Customers:</span>
        <input
          type="text"
          readOnly
          value={metrics.twoToTen || 0}
          className="bg-white px-4 py-2 border border-yellowsm/30 rounded-lg w-full sm:w-32 text-center text-sm md:text-base font-semibold text-yellowsm shadow-sm focus:ring-2 focus:ring-yellowsm/20 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-3">
        <span className="text-sm md:text-base font-medium text-gray-700">11+ Time Customers:</span>
        <input
          type="text"
          readOnly
          value={metrics.elevenPlus || 0}
          className="bg-white px-4 py-2 border border-yellowsm/30 rounded-lg w-full sm:w-32 text-center text-sm md:text-base font-semibold text-yellowsm shadow-sm focus:ring-2 focus:ring-yellowsm/20 transition-all duration-200"
        />
      </div>
    </div>
  </Card>
);

// Update the LoyalCustomers component
const LoyalCustomers = ({ customers }) => (
  <div className="bg-gradient-to-br from-amber-50/80 to-yellowsm/20 rounded-xl shadow-lg p-4 md:p-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 md:mb-6">
      <div className="text-lg md:text-xl font-bold text-gray-800">👑 LOYAL CUSTOMERS THIS MONTH</div>
      <div className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
        {customers.length} customers
      </div>
    </div>
    <div className="overflow-auto max-h-[250px] scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent pr-2">
      {customers.length > 0 ? (
        <div className="space-y-3">
          {customers.map((customer, index) => (
            <div 
              key={index}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-amber-100/50"
            >
              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <div className="bg-amber-100 rounded-full p-2 text-amber-700 text-sm">
                  #{index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm md:text-base">{customer.name}</div>
                  <div className="text-xs md:text-sm text-amber-600 font-medium">
                    {customer.orderCount} orders this month
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-amber-600 font-medium bg-amber-50 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                  Loyal Customer
                </div>
                <div className="text-amber-500 text-sm md:text-base">
                  ★★★★★
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6 md:py-8 bg-white/50 rounded-xl border border-dashed border-amber-200">
          <div className="text-3xl md:text-4xl mb-2">👥</div>
          <div className="font-medium text-sm md:text-base">No loyal customers this month yet</div>
          <div className="text-xs md:text-sm text-gray-400">Customers with 5+ orders will appear here</div>
        </div>
      )}
    </div>
  </div>
);

export default CustomerFrequency;
