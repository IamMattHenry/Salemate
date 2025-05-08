import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  where,
  limit,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig";
import { LuDownload, LuFolderClosed } from "react-icons/lu";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Get Firestore instance
const db = getFirestore(firebaseApp);

const InventorySavedHistory = () => {
  const [savedData, setSavedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedByMonth, setGroupedByMonth] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});

  // Fetch saved history data from Firestore - wrapped in useCallback
  const fetchSavedHistories = useCallback(async () => {
    try {
      setLoading(true);
      const inventoryHistoryRef = collection(db, "inventory_saved");
      const q = query(inventoryHistoryRef, orderBy("dateSaved", "desc"));
      const snapshot = await getDocs(q);

      const histories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date
        dateSaved: doc.data().dateSaved?.toDate() || new Date(),
        lastUpdated: doc.data().lastUpdated?.toDate() || doc.data().dateSaved?.toDate() || new Date()
      }));

      // Group histories by month
      const grouped = histories.reduce((acc, history) => {
        const date = history.dateSaved;
        const monthYear = format(date, 'MMMM yyyy');

        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }

        acc[monthYear].push(history);
        return acc;
      }, {});

      setSavedData(histories);
      setGroupedByMonth(grouped);

      // Initialize expanded state for all months
      const initialExpandedState = Object.keys(grouped).reduce((acc, month) => {
        acc[month] = true; // Start with all months expanded
        return acc;
      }, {});
      setExpandedMonths(initialExpandedState);

    } catch (error) {
      console.error("Error fetching inventory history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a daily inventory report - wrapped in useCallback
  const createDailyReport = useCallback(async (dateString, monthYear) => {
    try {
      // Fetch current inventory data
      const inventoryRef = collection(db, "inventory");
      const inventorySnapshot = await getDocs(inventoryRef);

      if (inventorySnapshot.empty) {
        console.log("No inventory data to save");
        return;
      }

      const inventoryItems = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create the report data
      const reportData = {
        dateString,
        monthYear,
        dateSaved: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        inventoryItems,
        totalItems: inventoryItems.length,
        fileName: `Inventory_${dateString}.pdf`
      };

      // Save to Firestore
      await addDoc(collection(db, "inventory_saved"), reportData);
      console.log(`Created daily inventory report for ${dateString}`);

      // Refresh the list
      await fetchSavedHistories();

    } catch (error) {
      console.error("Error creating daily report:", error);
    }
  }, [fetchSavedHistories]);

  // Check if we need to create a daily report - wrapped in useCallback
  const checkAndCreateDailyReport = useCallback(async () => {
    try {
      const today = new Date();
      const dateString = format(today, 'yyyy-MM-dd');
      const monthYear = format(today, 'MMMM yyyy');

      // Check if we already have a report for today
      const dailyCheckQuery = query(
        collection(db, "inventory_saved"),
        where("dateString", "==", dateString),
        limit(1)
      );

      const dailySnapshot = await getDocs(dailyCheckQuery);

      // If no report exists for today, create one
      if (dailySnapshot.empty) {
        await createDailyReport(dateString, monthYear);
      }
    } catch (error) {
      console.error("Error checking daily report:", error);
    }
  }, [createDailyReport]);

  // Update an existing report with new inventory data
  const updateInventoryReport = async (reportId, inventoryItems) => {
    try {
      const reportRef = doc(db, "inventory_saved", reportId);

      await updateDoc(reportRef, {
        inventoryItems,
        lastUpdated: serverTimestamp(),
        totalItems: inventoryItems.length
      });

      console.log(`Updated inventory report ${reportId}`);
    } catch (error) {
      console.error("Error updating inventory report:", error);
    }
  };

  // Generate PDF from inventory data
  const generatePDF = async (history) => {
    setLoading(true);
    try {
      const pdfDoc = new jsPDF();

      // Title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(20);
      pdfDoc.text('Daily Inventory Report', 20, 30);

      // Date
      const reportDate = history.dateSaved;
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(107, 114, 128);
      pdfDoc.text(`Report Date: ${format(reportDate, 'MMMM dd, yyyy')}`, 20, 40);

      if (history.lastUpdated && history.lastUpdated.getTime() !== reportDate.getTime()) {
        pdfDoc.text(`Last Updated: ${format(history.lastUpdated, 'MMMM dd, yyyy HH:mm')}`, 20, 48);
      }

      // Summary Box
      pdfDoc.setDrawColor(255, 191, 0);
      pdfDoc.setFillColor(255, 251, 235);
      pdfDoc.roundedRect(15, 55, 180, 30, 3, 3, 'FD');

      // Summary Content
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(0, 0, 0);
      pdfDoc.text(`Total Inventory Items: ${history.totalItems || history.inventoryItems.length}`, 20, 70);

      // Inventory Table
      const tableData = history.inventoryItems.map((item, index) => [
        (index + 1).toString(),
        item.raw_mats || 'N/A',
        (item.begin_inv || 0).toString(),
        (item.ending_inv || 0).toString(),
        (item.purchased || 0).toString(),
        (item.used || 0).toString(),
        (item.waste || 0).toString(),
        item.stock_status || 'N/A'
      ]);

      autoTable(pdfDoc, {
        startY: 95,
        head: [['#', 'Raw Material', 'Begin Inv', 'End Inv', 'Purchased', 'Used', 'Waste', 'Status']],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [255, 191, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 191, 0],
          textColor: [0, 0, 0],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          minCellHeight: 14,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'left', cellWidth: 40 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 20 },
          6: { halign: 'center', cellWidth: 20 },
          7: { halign: 'center', cellWidth: 25 }
        },
        alternateRowStyles: {
          fillColor: [255, 251, 235]
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto'
      });

      // Save the PDF
      const fileName = history.fileName || `Inventory_${format(reportDate, 'yyyy-MM-dd')}.pdf`;
      pdfDoc.save(fileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle month expansion toggle
  const toggleMonthExpansion = (month) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  // Handle download button click
  const handleDownload = async (history) => {
    try {
      setLoading(true);

      // Check if we need to update the report with fresh data
      const inventoryRef = collection(db, "inventory");
      const freshInventorySnapshot = await getDocs(inventoryRef);
      const freshInventoryItems = freshInventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update the report in Firestore
      await updateInventoryReport(history.id, freshInventoryItems);

      // Get the updated history
      const updatedHistory = {
        ...history,
        inventoryItems: freshInventoryItems,
        lastUpdated: new Date()
      };

      // Generate PDF with fresh data
      await generatePDF(updatedHistory);

      // Refresh the list
      await fetchSavedHistories();

    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Run once on component mount
  useEffect(() => {
    fetchSavedHistories();
    checkAndCreateDailyReport();

    // Set up a function to check for new day and create report
    const checkForNewDay = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // If it's midnight (00:00), create a new report
      if (hours === 0 && minutes === 0) {
        checkAndCreateDailyReport();
      }
    };

    // Check every minute
    const intervalId = setInterval(checkForNewDay, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [checkAndCreateDailyReport, fetchSavedHistories]);

  return (
    <div className="w-full overflow-auto h-9/12 bg-gray-50/50 py-6">
      <section className="w-[94.5%] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inventory History</h1>
          <p className="text-gray-500 mt-1">View and download daily inventory reports organized by month</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedByMonth).length > 0 ? (
              Object.entries(groupedByMonth).map(([month, reports]) => (
                <div key={month} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Month Header */}
                  <div
                    className="flex items-center justify-between px-6 py-4 bg-amber-50 cursor-pointer"
                    onClick={() => toggleMonthExpansion(month)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <LuFolderClosed className="w-5 h-5 text-amber-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">{month}</h2>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {reports.length} {reports.length === 1 ? 'report' : 'reports'}
                      </span>
                    </div>
                    <button className="text-amber-600">
                      {expandedMonths[month] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Reports Table */}
                  {expandedMonths[month] && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Report Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Generated Date</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {reports.map((report) => (
                            <tr key={report.id} className="group hover:bg-amber-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-amber-100 rounded-lg">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {report.fileName || `Inventory_${format(report.dateSaved, 'yyyy-MM-dd')}.pdf`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {report.totalItems || (report.inventoryItems && report.inventoryItems.length) || 0} items
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm text-gray-900">{format(report.dateSaved, 'MMM dd, yyyy')}</p>
                                  <p className="text-xs text-gray-500">Created</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm text-gray-900">{format(report.lastUpdated, 'MMM dd, yyyy HH:mm')}</p>
                                  <p className="text-xs text-gray-500">Last updated</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleDownload(report)}
                                  className="inline-flex items-center justify-center p-2 text-amber-600 hover:text-amber-700
                                          hover:bg-amber-50 rounded-lg transition-colors group-hover:bg-amber-100/50"
                                  title="Download Report"
                                  disabled={loading}
                                >
                                  <LuDownload className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-sm text-gray-500">No inventory reports available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default InventorySavedHistory;
