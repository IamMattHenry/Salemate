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
  const [error, setError] = useState(null);

  // Fetch saved histories
  const fetchSavedHistories = async () => {
    try {
      console.log("Fetching saved histories...");
      setLoading(true);
      setError(null);

      // Set a timeout to prevent getting stuck in loading state
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout fetching histories")), 10000)
      );

      const fetchPromise = async () => {
        const historyQuery = query(
          collection(db, "analyticReportSaved"), // Updated collection name
          orderBy("dateSaved", "desc")
        );
        const snapshot = await getDocs(historyQuery);
        console.log(`Found ${snapshot.size} saved histories`);

        const histories = snapshot.docs.map(doc => {
          const data = doc.data();
          // Handle case where dateSaved might be missing or invalid
          let formattedDate = "Unknown date";
          if (data.dateSaved) {
            if (data.dateSaved.seconds) {
              formattedDate = new Date(data.dateSaved.seconds * 1000).toLocaleDateString();
            } else if (data.dateSaved instanceof Date) {
              formattedDate = data.dateSaved.toLocaleDateString();
            }
          }

          return {
            id: doc.id,
            ...data,
            dateSaved: formattedDate
          };
        });

        return histories;
      };

      // Race between the fetch and the timeout
      const histories = await Promise.race([fetchPromise(), timeoutPromise]);
      setSavedHistories(Array.isArray(histories) ? histories : []);
      console.log("Histories fetched successfully");
    } catch (err) {
      console.error("Error fetching histories:", err);
      setError(`Failed to load analytics history: ${err.message}`);
      // Set empty array to avoid undefined errors
      setSavedHistories([]);
    } finally {
      setLoading(false);
    }
  };

  // Optimized PDF generation function
  const generatePDF = async (monthYear, weekData) => {
    setLoading(true);
    try {
      console.log("Starting PDF generation...");
      const startTime = performance.now();

      // Create PDF document with compression
      const pdfDoc = new jsPDF({
        compress: true,
        precision: 2 // Lower precision for faster generation
      });

      const today = new Date();
      const weekNumber = getWeekNumber(today);
      const weekDates = getWeekDates(today);

      // Title - use a smaller font size
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(18);
      pdfDoc.text(`Weekly Analytics Summary - Week ${weekNumber}`, 20, 30);

      // Date Range - simplified
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(107, 114, 128);
      const dateRange = `${weekDates[0].toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${weekDates[6].toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`;
      pdfDoc.text(dateRange, 20, 40);

      // Summary Box - simplified
      pdfDoc.setDrawColor(255, 191, 0);
      pdfDoc.setFillColor(255, 251, 235);
      pdfDoc.roundedRect(15, 50, 180, 40, 3, 3, 'FD');

      // Summary Content - combined for fewer operations
      pdfDoc.setFontSize(11);
      pdfDoc.setTextColor(0, 0, 0);
      pdfDoc.text(`Weekly Revenue: PHP ${weekData.totalRevenue?.toLocaleString() || '0'}`, 20, 65);
      pdfDoc.text(`Total Orders: ${weekData.totalOrders || '0'}`, 20, 80);

      // Daily Sales Table - optimized
      autoTable(pdfDoc, {
        startY: 105, // Reduced spacing
        head: [['Date', 'Day', 'Orders', 'Sales']],
        body: weekDates.map(date => {
          const dayData = weekData.dailySales?.[date.toISOString().split('T')[0]] || {};
          return [
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            date.toLocaleDateString('en-US', { weekday: 'short' }), // Use short weekday names
            dayData.orders || '0',
            `₱${dayData.sales?.toLocaleString() || '0'}`
          ];
        }),
        styles: {
          fontSize: 9, // Smaller font
          cellPadding: 4, // Reduced padding
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 191, 0],
          textColor: [0, 0, 0],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 }, // Reduced widths
          1: { halign: 'left', cellWidth: 30 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'right', cellWidth: 30 }
        },
        alternateRowStyles: {
          fillColor: [255, 251, 235]
        },
        didDrawPage: () => {
          // Add footer with timestamp
          const pageCount = pdfDoc.internal.getNumberOfPages();
          pdfDoc.setFontSize(8);
          pdfDoc.setTextColor(150, 150, 150);
          pdfDoc.text(`Generated on ${new Date().toLocaleString()} | Page ${pageCount}`, 20, pdfDoc.internal.pageSize.height - 10);
        }
      });

      const fileName = `${monthYear.replace(' ', '')}Week${weekNumber}_${today.getFullYear()}.pdf`;
      pdfDoc.save(fileName);

      const endTime = performance.now();
      console.log(`PDF generated in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Optimized handleDownload function for faster performance
  const handleDownload = async (history) => {
    try {
      console.log("Starting download process for history:", history.id);
      const startTime = performance.now();

      setLoading(true);
      setError(null);

      // Check if we already have the data in the history object
      if (history.totalRevenue !== undefined && history.dailySales) {
        console.log("Using cached data from history object");
        // Use the data directly from the history object
        const weekData = {
          totalRevenue: history.totalRevenue,
          totalOrders: history.totalOrders,
          dailySales: history.dailySales
        };

        // Generate PDF with the cached data
        await generatePDF(history.monthYear, weekData);

        const endTime = performance.now();
        console.log(`Download completed in ${(endTime - startTime).toFixed(2)}ms using cached data`);
        return;
      }

      // If we don't have cached data, fetch it from Firestore
      console.log("No cached data found, fetching from Firestore");

      // Set a timeout to prevent getting stuck
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout fetching order data")), 10000)
      );

      const fetchDataPromise = async () => {
        const weekDates = getWeekDates(new Date(history.dateSaved));
        const startDate = new Date(weekDates[0]);
        const endDate = new Date(weekDates[6]);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Optimize query to fetch only necessary fields and limit results
        const ordersQuery = query(
          collection(db, "order_transaction"),
          where("order_status", "==", "Delivered"),
          limit(100) // Limit to 100 orders for faster processing
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        console.log(`Fetched ${ordersSnapshot.size} orders`);

        // Process orders data more efficiently
        const dailySales = {};
        let totalRevenue = 0;
        let totalOrders = 0;

        // Initialize dailySales for all week dates
        weekDates.forEach(date => {
          const dateKey = date.toISOString().split('T')[0];
          dailySales[dateKey] = { orders: 0, sales: 0 };
        });

        // Process orders in a single loop
        ordersSnapshot.forEach(doc => {
          const data = doc.data();

          // Skip if no order_date or not delivered
          if (!data.order_date || data.order_status !== 'Delivered') return;

          // Convert Firestore timestamp to Date
          const orderDate = data.order_date.toDate ? data.order_date.toDate() : new Date(data.order_date);

          // Check if the order is within our date range
          if (orderDate < startDate || orderDate > endDate) return;

          const dateKey = orderDate.toISOString().split('T')[0];
          const orderTotal = parseFloat(data.order_total || 0);

          if (dailySales[dateKey]) {
            dailySales[dateKey].orders++;
            dailySales[dateKey].sales += orderTotal;
            totalRevenue += orderTotal;
            totalOrders++;
          }
        });

        return {
          totalRevenue,
          totalOrders,
          dailySales
        };
      };

      // Race between the fetch and the timeout
      const weekData = await Promise.race([fetchDataPromise(), timeoutPromise]);

      // Generate PDF with the fetched data
      await generatePDF(history.monthYear, weekData);

      const endTime = performance.now();
      console.log(`Download completed in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error("Error generating report:", error);
      setError(`Error generating report: ${error.message}`);
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

  // Optimized fetchWeeklyData function for faster performance
const fetchWeeklyData = async () => {
  try {
    console.log("Starting fetchWeeklyData...");
    const startTime = performance.now();

    // Get the current date
    const today = new Date();

    // Get the dates for the current week
    const weekDates = getWeekDates(today);

    // Set the start and end dates for the query
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Use a more efficient query with caching
    const ordersQuery = query(
      collection(db, "order_transaction"),
      where("order_status", "==", "Delivered"),
      limit(100) // Limit to 100 orders for faster processing
    );

    // Set a timeout to prevent getting stuck
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout fetching weekly data")), 5000)
    );

    const fetchPromise = async () => {
      const ordersSnapshot = await getDocs(ordersQuery);
      console.log(`Fetched ${ordersSnapshot.size} orders in fetchWeeklyData`);

      // Initialize tracking objects
      const dailySales = {};
      let totalRevenue = 0;
      let totalOrders = 0;

      // Initialize dailySales for each day (more efficiently)
      const dateKeys = weekDates.map(date => date.toISOString().split('T')[0]);
      dateKeys.forEach(dateKey => {
        dailySales[dateKey] = { orders: 0, sales: 0 };
      });

      // Process each order (more efficiently)
      ordersSnapshot.forEach(docSnapshot => {
        const orderData = docSnapshot.data();

        // Skip if no order_date
        if (!orderData.order_date) return;

        // Convert Firestore timestamp to Date
        const orderDate = orderData.order_date.toDate ? orderData.order_date.toDate() : new Date(orderData.order_date);

        // Check if the order is within our date range
        if (orderDate < startDate || orderDate > endDate) return;

        const dateKey = orderDate.toISOString().split('T')[0];
        const orderTotal = parseFloat(orderData.order_total || 0);

        if (dailySales[dateKey]) {
          dailySales[dateKey].orders++;
          dailySales[dateKey].sales += orderTotal;
          totalRevenue += orderTotal;
          totalOrders++;
        }
      });

      return {
        totalRevenue,
        totalOrders,
        dailySales
      };
    };

    // Race between the fetch and the timeout
    const result = await Promise.race([fetchPromise(), timeoutPromise]);

    const endTime = performance.now();
    console.log(`fetchWeeklyData completed in ${(endTime - startTime).toFixed(2)}ms`);

    return result;
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    throw error;
  }
};

// Update useEffect to only create/update report without downloading
useEffect(() => {
  const checkAndUpdateWeeklyReport = async () => {
    try {
      // Get the current date
      const today = new Date();
      console.log("Current date:", today.toLocaleDateString());

      const weekNumber = getWeekNumber(today);
      const monthYear = today.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      console.log("Current month/year:", monthYear);
      console.log("Current week number:", weekNumber);

      // Set a timeout to prevent getting stuck
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout updating weekly report")), 15000)
      );

      const updatePromise = async () => {
        // Query for existing report for current week
        const weeklyReportQuery = query(
          collection(db, "analyticReportSaved"),
          where("weekNumber", "==", weekNumber),
          where("monthYear", "==", monthYear),
          limit(1)
        );

        const snapshot = await getDocs(weeklyReportQuery);
        console.log("Found existing reports:", snapshot.size);

        // Fetch the weekly data
        const weekData = await fetchWeeklyData();
        console.log("Fetched week data:", weekData);

        if (!snapshot.empty) {
          // Update existing report
          const docRef = doc(db, "analyticReportSaved", snapshot.docs[0].id);
          console.log("Updating existing report:", snapshot.docs[0].id);

          await updateDoc(docRef, {
            ...weekData,
            lastUpdated: serverTimestamp()
          });

          console.log("Report updated successfully");
        } else {
          // Create new report
          console.log("Creating new report for:", monthYear, "Week:", weekNumber);

          const newDocRef = await addDoc(collection(db, "analyticReportSaved"), {
            monthYear,
            weekNumber,
            dateSaved: serverTimestamp(),
            ...weekData
          });

          console.log("New report created with ID:", newDocRef.id);
        }

        return true;
      };

      // Race between the update and the timeout
      await Promise.race([updatePromise(), timeoutPromise]);

      // Refresh the list of saved histories
      await fetchSavedHistories();
    } catch (error) {
      console.error("Error checking/updating weekly report:", error);
      setError(`Failed to update analytics report: ${error.message}`);
    } finally {
      // Ensure loading is set to false even if there's an error
      setLoading(false);
    }
  };

  // Use a more efficient approach to initialize data
  const initializeData = async () => {
    try {
      // Start with just fetching the histories (faster)
      await fetchSavedHistories();

      // Check if we need to update the weekly report
      // Only do this if there are no histories or if it's been more than a day since the last update
      const needsUpdate = savedHistories.length === 0 ||
        (savedHistories[0]?.dateSaved &&
         new Date(savedHistories[0].dateSaved).getTime() < Date.now() - 86400000);

      if (needsUpdate) {
        console.log("Weekly report needs update, running checkAndUpdateWeeklyReport");
        await checkAndUpdateWeeklyReport();
      } else {
        console.log("Weekly report is up to date, skipping update");
      }
    } catch (err) {
      console.error("Error in analytics initialization:", err);
      setError(`Failed to initialize analytics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Start the initialization process
  initializeData();

  // Cleanup function to ensure loading state is reset if component unmounts
  return () => {
    setLoading(false);
  };
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

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchSavedHistories();
              }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-amber-500/30 border-t-amber-500" />
              <p className="text-sm font-medium text-gray-900">Generating analytics report...</p>
              <button
                onClick={() => setLoading(false)}
                className="mt-2 text-xs text-amber-600 hover:text-amber-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsSaveHistory;
