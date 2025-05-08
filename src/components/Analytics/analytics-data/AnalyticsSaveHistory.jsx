import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  getFirestore,
  where,  // Add this
  limit,    // Add this too since it was missing
  updateDoc, // Add this
  doc, // Add this
  Timestamp // Add this
} from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig";
import { LuDownload } from "react-icons/lu";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Get Firestore instance
const db = getFirestore(firebaseApp);

// Add these helper functions at the top of the file
const getWeekDates = (date) => {
  const monday = new Date(date);
  monday.setDate(date.getDate() - date.getDay() + 1);
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    week.push(day);
  }
  return week;
};

const getWeekNumber = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
};

const AnalyticsSaveHistory = () => {
  const [loading, setLoading] = useState(false);
  const [savedHistories, setSavedHistories] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);

  // Fetch saved histories
  const fetchSavedHistories = async () => {
    try {
      const historyQuery = query(
        collection(db, "analyticReportSaved"), // Updated collection name
        orderBy("dateSaved", "desc")
      );
      const snapshot = await getDocs(historyQuery);
      const histories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateSaved: new Date(doc.data().dateSaved?.seconds * 1000).toLocaleDateString()
      }));
      setSavedHistories(histories);
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  // Generate PDF function
  const generatePDF = async (monthYear, weekData) => {
    setLoading(true);
    try {
      const pdfDoc = new jsPDF();
      const today = new Date();
      const weekNumber = getWeekNumber(today);
      const weekDates = getWeekDates(today);

      // Title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(20);
      pdfDoc.text(`Weekly Analytics Summary - Week ${weekNumber}`, 20, 30);

      // Date Range
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(107, 114, 128);
      const dateRange = `${weekDates[0].toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      })} - ${weekDates[6].toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      })}`;
      pdfDoc.text(dateRange, 20, 40);

      // Summary Box
      pdfDoc.setDrawColor(255, 191, 0);
      pdfDoc.setFillColor(255, 251, 235);
      pdfDoc.roundedRect(15, 50, 180, 60, 3, 3, 'FD');

      // Summary Content
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(0, 0, 0);
      const summaryStats = [
        `Weekly Revenue: PHP ${weekData.totalRevenue?.toLocaleString() || '0'}`,
        `Total Orders: ${weekData.totalOrders || '0'}`
      ];

      summaryStats.forEach((stat, index) => {
        pdfDoc.text(stat, 20, 70 + (index * 15));
      });

      // Daily Sales Table
      autoTable(pdfDoc, {
        startY: 125,
        head: [['Date', 'Day', 'Orders', 'Sales']],
        body: weekDates.map(date => {
          const dayData = weekData.dailySales?.[date.toISOString().split('T')[0]] || {};
          return [
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            date.toLocaleDateString('en-US', { weekday: 'long' }),
            dayData.orders || '0',
            `PHP ${dayData.sales?.toLocaleString() || '0'}`
          ];
        }),
        styles: {
          fontSize: 10,
          cellPadding: 6,
          lineColor: [255, 191, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 191, 0],
          textColor: [0, 0, 0],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 25 },
          1: { halign: 'left', cellWidth: 40 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'right', cellWidth: 40 }
        },
        alternateRowStyles: {
          fillColor: [255, 251, 235]
        }
      });

      const fileName = `${monthYear.replace(' ', '')}Week${weekNumber}_${today.getFullYear()}.pdf`;
      pdfDoc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDownload function
  const handleDownload = async (history) => {
    try {
      setLoading(true);
      
      const weekDates = getWeekDates(new Date(history.dateSaved));
      const startDate = new Date(weekDates[0]);
      const endDate = new Date(weekDates[6]);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const ordersQuery = query(
        collection(db, "order_transaction"),
        where("order_date", ">=", startTimestamp),
        where("order_date", "<=", endTimestamp),
        orderBy("order_date", "desc")
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({
        orderDate: doc.data().order_date.toDate(),
        total: doc.data().order_total || 0,
        status: doc.data().order_status || ''
      }));

      // Process orders data
      const dailySales = {};
      let totalRevenue = 0;
      let totalOrders = 0;

      // Initialize dailySales for all week dates
      weekDates.forEach(date => {
        const dateKey = date.toISOString().split('T')[0];
        dailySales[dateKey] = {
          orders: 0,
          sales: 0
        };
      });

      // Process orders
      orders.forEach(order => {
        if (order.status === 'Delivered') {
          const dateKey = order.orderDate.toISOString().split('T')[0];
          
          if (dailySales[dateKey]) {
            dailySales[dateKey].orders++;
            dailySales[dateKey].sales += parseFloat(order.total);
            totalRevenue += parseFloat(order.total);
            totalOrders++;
          }
        }
      });

      const weekData = {
        totalRevenue,
        totalOrders,
        dailySales
      };

      // Generate PDF with the fetched data
      await generatePDF(history.monthYear, weekData);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a function to create weekly reports automatically
  const createWeeklyReport = async () => {
    try {
      const today = new Date();
      const weekNumber = getWeekNumber(today);
      const monthYear = today.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      const weekData = await fetchWeeklyData();

      // Save to Firestore with correct collection name
      await addDoc(collection(db, "analyticReportSaved"), {
        monthYear,
        weekNumber,
        dateSaved: serverTimestamp(),
        ...weekData
      });

      // Generate PDF and refresh list
      await generatePDF(monthYear, weekData);
      await fetchSavedHistories();
    } catch (error) {
      console.error("Error creating weekly report:", error);
    }
  };

  // Update the fetchWeeklyData function to properly format dates for Firestore
const fetchWeeklyData = async () => {
  try {
    const weekDates = getWeekDates(new Date());
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    // Query delivered orders for the week
    const ordersQuery = query(
      collection(db, "order_transaction"),
      where("order_status", "==", "Delivered"),
      where("order_date", ">=", startTimestamp),
      where("order_date", "<=", endTimestamp),
      orderBy("order_date", "desc") // Changed to desc to match your index
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    console.log('Found orders:', ordersSnapshot.size);

    // Initialize tracking objects
    const dailySales = {};
    let totalRevenue = 0;
    let totalOrders = 0;

    // Initialize dailySales for each day
    weekDates.forEach(date => {
      const dateKey = date.toISOString().split('T')[0];
      dailySales[dateKey] = {
        orders: 0,
        sales: 0
      };
    });

    // Process each order
    ordersSnapshot.forEach(docSnapshot => {
      const orderData = docSnapshot.data();
      const orderDate = orderData.order_date.toDate();
      const dateKey = orderDate.toISOString().split('T')[0];

      if (dailySales[dateKey] && orderData.items) {
        dailySales[dateKey].orders++;
        dailySales[dateKey].sales += parseFloat(orderData.order_total || 0);
        totalRevenue += parseFloat(orderData.order_total || 0);
        totalOrders++;
      }
    });

    return {
      totalRevenue,
      totalOrders,
      dailySales
    };

  } catch (error) {
    console.error('Error fetching weekly data:', error);
    throw error;
  }
};

// Update useEffect to only create/update report without downloading
useEffect(() => {
  const checkAndUpdateWeeklyReport = async () => {
    try {
      const today = new Date();
      const weekNumber = getWeekNumber(today);
      const monthYear = today.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      // Query for existing report for current week
      const weeklyReportQuery = query(
        collection(db, "analyticReportSaved"),
        where("weekNumber", "==", weekNumber),
        where("monthYear", "==", monthYear),
        limit(1)
      );

      const snapshot = await getDocs(weeklyReportQuery);
      const weekData = await fetchWeeklyData();

      if (!snapshot.empty) {
        // Update existing report
        const docRef = doc(db, "analyticReportSaved", snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...weekData,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create new report
        await addDoc(collection(db, "analyticReportSaved"), {
          monthYear,
          weekNumber,
          dateSaved: serverTimestamp(),
          ...weekData
        });
      }

      await fetchSavedHistories();
    } catch (error) {
      console.error("Error checking/updating weekly report:", error);
    }
  };

  fetchSavedHistories();
  checkAndUpdateWeeklyReport();
}, []);

  return (
    <div className="w-full overflow-auto h-9/12 bg-gray-50/50 py-6">
      <section className="w-[94.5%] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics History</h1>
          <p className="text-gray-500 mt-1">View and download monthly analytics reports</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Report Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Generated Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {savedHistories.map((history, index) => (
                  <tr key={index} className="group hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{`${history.monthYear}.pdf`}</p>
                          <p className="text-xs text-gray-500">Analytics Report</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{history.dateSaved}</p>
                        <p className="text-xs text-gray-500">Last generated</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(history)}
                        className="inline-flex items-center justify-center p-2 text-amber-600 hover:text-amber-700 
                                 hover:bg-amber-50 rounded-lg transition-colors group-hover:bg-amber-100/50"
                        title="Download Report"
                      >
                        <LuDownload className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {savedHistories.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500">No analytics reports available</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-[3px] border-amber-500/30 border-t-amber-500" />
              <p className="text-sm font-medium text-gray-900">Generating analytics report...</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsSaveHistory;
