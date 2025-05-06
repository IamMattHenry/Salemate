import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp, limit, updateDoc, doc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import firebaseApp from "../../../firebaseConfig";
import { LuDownload } from "react-icons/lu"; // Add this import at the top


const SavedHistory = () => {
  const [loading, setLoading] = useState(false);
  const [savedHistories, setSavedHistories] = useState([]);
  const db = getFirestore(firebaseApp);

  const fetchSavedHistories = async () => {
    try {
      // Get saved histories
      const savedQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc")
      );

      const savedSnapshot = await getDocs(savedQuery);
      const histories = savedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateSaved: new Date(doc.data().dateSaved.seconds * 1000).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        })
      }));

      setSavedHistories(histories);
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  // Update the generatePDF function
  const generatePDF = async (monthYear, transactions) => {
    setLoading(true);
    try {
      const pdfDoc = new jsPDF();

      // Title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(20);
      pdfDoc.text('Monthly Orders Summary', 20, 30);

      // Get the current week
      const today = new Date();
      const weekNumber = Math.ceil(today.getDate() / 7);
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(107, 114, 128);
      pdfDoc.text(`Week ${weekNumber} | ${today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 20, 40);

      // Summary Box
      pdfDoc.setDrawColor(255, 191, 0);
      pdfDoc.setFillColor(255, 251, 235);
      pdfDoc.roundedRect(15, 50, 180, 60, 3, 3, 'FD');

      // Summary Content
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(0, 0, 0);
      const summaryStats = [
        `Total Orders: ${transactions.length}`,
        `Completed Orders: ${transactions.filter(t => t.order_status === "Delivered").length}`,
        `Total Sales: PHP ${transactions
          .filter(t => t.order_status === "Delivered")
          .reduce((sum, t) => sum + (parseFloat(t.order_total) || 0), 0)
          .toLocaleString()}`
      ];

      summaryStats.forEach((stat, index) => {
        pdfDoc.text(stat, 20, 70 + (index * 15));
      });

      // Orders Table
      autoTable(pdfDoc, {
        startY: 125,
        head: [['#', 'Order ID', 'Customer', 'Items', 'Total', 'Status']],
        body: transactions.map((order, index) => [
          (index + 1).toString(),
          order.order_id,
          order.recipient,
          order.order_name,
          `PHP ${parseFloat(order.order_total).toLocaleString()}`,
          order.order_status
        ]),
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
          valign: 'middle',
          minCellHeight: 14,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'left', cellWidth: 45 },
          3: { halign: 'left', cellWidth: 45 },
          4: { halign: 'right', cellWidth: 30 },
          5: { halign: 'center', cellWidth: 25 }
        },
        alternateRowStyles: {
          fillColor: [255, 251, 235]
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto'
      });

      pdfDoc.save(`${monthYear.replace(' ', '')}_Orders.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to get fresh transactions
  const getFreshTransactions = async (monthYear) => {
    try {
      const transactionQuery = query(
        collection(db, "order_transaction"),
        orderBy("order_date", "desc")
      );

      const transactionSnapshot = await getDocs(transactionQuery);
      const allTransactions = transactionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter for the specific month/year
      const [month, year] = monthYear.split(" ");
      const filteredTransactions = allTransactions.filter(t => {
        const orderDate = new Date(t.order_date.seconds * 1000);
        return orderDate.toLocaleString('en-US', { month: 'long' }) === month &&
               orderDate.getFullYear().toString() === year;
      });

      // Sort by order_id in ascending order (lowest to highest)
      return filteredTransactions.sort((a, b) => {
        // Convert order_id to numbers for proper numeric sorting
        const orderIdA = parseInt(a.order_id) || 0;
        const orderIdB = parseInt(b.order_id) || 0;
        return orderIdA - orderIdB; // Ascending order
      });
    } catch (error) {
      console.error("Error getting fresh transactions:", error);
      return [];
    }
  };

  // Update the handleRowClick function
  const handleRowClick = async (history) => {
    setLoading(true);
    try {
      // Get fresh transactions first
      const freshTransactions = await getFreshTransactions(history.monthYear);

      // Update the record with fresh transactions
      const monthCheckQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc")
      );

      const monthCheckSnapshot = await getDocs(monthCheckQuery);
      const existingRecord = monthCheckSnapshot.docs.find(doc => doc.id === history.id);

      if (existingRecord) {
        await updateDoc(doc(db, "saved_history", existingRecord.id), {
          transactions: freshTransactions,
          lastUpdated: serverTimestamp()
        });
      }

      // Generate PDF with fresh transactions
      await generatePDF(history.monthYear, freshTransactions);

      // Refresh the list
      await fetchSavedHistories();
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Error updating and generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkAndSaveCurrentMonth = async () => {
    try {
      const currentDate = new Date();
      const currentMonthYear = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      // Check if we already have a save for this month
      const monthCheckQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc"),
        limit(1)
      );

      const monthCheckSnapshot = await getDocs(monthCheckQuery);
      const lastSave = monthCheckSnapshot.docs[0]?.data();

      if (lastSave) {
        const lastSaveDate = new Date(lastSave.dateSaved.seconds * 1000);

        // If last save was in a different month, create new save
        if (lastSaveDate.getMonth() !== currentDate.getMonth() ||
            lastSaveDate.getFullYear() !== currentDate.getFullYear()) {
          await createNewMonthlySave(currentMonthYear);
        }
      } else {
        // No previous saves exist, create first save
        await createNewMonthlySave(currentMonthYear);
      }
    } catch (error) {
      console.error("Error checking monthly save:", error);
    }
  };

  const createNewMonthlySave = async (monthYear, transactions) => {
    try {
      // First check if a record for this month already exists
      const monthCheckQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc")
      );

      const monthCheckSnapshot = await getDocs(monthCheckQuery);
      const existingRecord = monthCheckSnapshot.docs.find(doc => {
        const data = doc.data();
        const savedDate = new Date(data.dateSaved.seconds * 1000);
        const currentDate = new Date();
        return savedDate.getMonth() === currentDate.getMonth() &&
               savedDate.getFullYear() === currentDate.getFullYear();
      });

      // Get current month's transactions
      const transactionQuery = query(
        collection(db, "order_transaction"),
        orderBy("order_date", "desc")
      );

      const transactionSnapshot = await getDocs(transactionQuery);
      let currentTransactions = transactionSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(t => {
          const orderDate = new Date(t.order_date.seconds * 1000);
          const currentDate = new Date();
          return orderDate.getMonth() === currentDate.getMonth() &&
                 orderDate.getFullYear() === currentDate.getFullYear();
        });

      // Sort by order_id in ascending order (lowest to highest)
      currentTransactions = currentTransactions.sort((a, b) => {
        // Convert order_id to numbers for proper numeric sorting
        const orderIdA = parseInt(a.order_id) || 0;
        const orderIdB = parseInt(b.order_id) || 0;
        return orderIdA - orderIdB; // Ascending order
      });

      if (currentTransactions.length > 0) {
        if (existingRecord) {
          // Update existing record
          await updateDoc(doc(db, "saved_history", existingRecord.id), {
            transactions: currentTransactions,
            lastUpdated: serverTimestamp()
          });
        } else {
          // Create new record only if none exists for this month
          await addDoc(collection(db, "saved_history"), {
            monthYear,
            transactions: currentTransactions,
            dateSaved: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
        }

        // Refresh the list
        await fetchSavedHistories();
      }
    } catch (error) {
      console.error("Error creating/updating monthly save:", error);
    }
  };

  // Add save button click handler
  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentMonthYear = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      // Get fresh transactions
      const freshTransactions = await getFreshTransactions(currentMonthYear);

      // Update or create record
      await createNewMonthlySave(currentMonthYear, freshTransactions);

      // Refresh the list
      await fetchSavedHistories();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving current month. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedHistories();
    checkAndSaveCurrentMonth();
  }, []);

  // Update the return section with modern UI
  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-6">
      <section className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500 mt-1">View and download monthly order reports</p>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{`${history.monthYear}.pdf`}</p>
                          <p className="text-xs text-gray-500">Order Report</p>
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
                        onClick={() => handleRowClick(history)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500">No order reports available</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-[3px] border-amber-500/30 border-t-amber-500" />
              <p className="text-sm font-medium text-gray-900">Generating order report...</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SavedHistory;
